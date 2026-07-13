import { and, asc, eq, inArray, isNull, ne, sql } from 'drizzle-orm';
import { error, fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { orderItems, orders, productImages, products } from '$lib/server/db/schema';
import {
	ORDER_STATUSES,
	PAYMENT_STATUSES,
	canTransitionStatus,
	type OrderStatus,
	type PaymentStatus
} from '$lib/schemas/orderStatus';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const [orderRows, items] = await Promise.all([
		db.select().from(orders).where(eq(orders.id, params.id)).limit(1),
		db
			.select()
			.from(orderItems)
			.where(eq(orderItems.orderId, params.id))
	]);

	const order = orderRows[0];
	if (!order) throw error(404, 'Order not found');

	// Attach a preview image to each line item (from the live product — if the
	// product still exists). Snapshot fields on order_items still take precedence
	// for text/price display so historical rows stay accurate.
	const productIds = items
		.map((i) => i.productId)
		.filter((id): id is string => id !== null);
	const imgs = productIds.length
		? await db
				.select({ productId: productImages.productId, imageUrl: productImages.imageUrl })
				.from(productImages)
				.where(inArray(productImages.productId, productIds))
				.orderBy(asc(productImages.sortOrder))
		: [];
	const firstImage = new Map<string, string>();
	for (const img of imgs) {
		if (img.productId && !firstImage.has(img.productId)) firstImage.set(img.productId, img.imageUrl);
	}
	const itemsWithImages = items.map((i) => ({
		...i,
		imageUrl: i.productId ? (firstImage.get(i.productId) ?? null) : null
	}));

	return { order, items: itemsWithImages };
};

/**
 * Cancel the order and return each line item's quantity back to product stock,
 * atomically. Uses a conditional update so concurrent cancel clicks can't
 * double-restore — the row is only touched (and stock only bumped) on the first
 * transition into `cancelled`.
 */
async function cancelAndRestoreStock(orderId: string): Promise<void> {
	await db.transaction(async (tx) => {
		const updated = await tx
			.update(orders)
			.set({ status: 'cancelled', updatedAt: new Date() })
			.where(and(eq(orders.id, orderId), ne(orders.status, 'cancelled')))
			.returning({ id: orders.id });
		if (updated.length === 0) return; // already cancelled — nothing to restore

		// Individually-cancelled items already had their stock handled when they
		// were cancelled — restoring them again here would double-count.
		const items = await tx
			.select({ productId: orderItems.productId, quantity: orderItems.quantity })
			.from(orderItems)
			.where(and(eq(orderItems.orderId, orderId), isNull(orderItems.cancelledAt)));

		for (const item of items) {
			if (!item.productId) continue; // product deleted since the order was placed
			await tx
				.update(products)
				.set({ stockQuantity: sql`${products.stockQuantity} + ${item.quantity}` })
				.where(eq(products.id, item.productId));
		}
	});
}

export const actions: Actions = {
	updateStatus: async ({ request, params }) => {
		const form = await request.formData();
		const nextRaw = String(form.get('status') ?? '');
		if (!(ORDER_STATUSES as readonly string[]).includes(nextRaw)) {
			return fail(400, { error: 'Invalid status' });
		}
		const next = nextRaw as OrderStatus;

		const [current] = await db
			.select({ status: orders.status })
			.from(orders)
			.where(eq(orders.id, params.id))
			.limit(1);
		if (!current) return fail(404, { error: 'Order not found' });

		if (!canTransitionStatus(current.status as OrderStatus, next)) {
			return fail(400, { error: `Cannot move from ${current.status} to ${next}` });
		}

		if (next === 'cancelled') {
			await cancelAndRestoreStock(params.id);
		} else {
			await db
				.update(orders)
				.set({ status: next, updatedAt: new Date() })
				.where(eq(orders.id, params.id));
		}
		return { ok: true };
	},

	updatePaymentStatus: async ({ request, params }) => {
		const form = await request.formData();
		const nextRaw = String(form.get('paymentStatus') ?? '');
		if (!(PAYMENT_STATUSES as readonly string[]).includes(nextRaw)) {
			return fail(400, { error: 'Invalid payment status' });
		}
		const next = nextRaw as PaymentStatus;

		await db
			.update(orders)
			.set({ paymentStatus: next, updatedAt: new Date() })
			.where(eq(orders.id, params.id));
		return { ok: true };
	},

	cancel: async ({ params }) => {
		const [current] = await db
			.select({ status: orders.status })
			.from(orders)
			.where(eq(orders.id, params.id))
			.limit(1);
		if (!current) return fail(404, { error: 'Order not found' });

		await cancelAndRestoreStock(params.id);
		return { ok: true };
	},

	/**
	 * Cancel a single line item (e.g. it turned out not to be in the store).
	 * Keeps the row for history, recomputes the order's subtotal/total from the
	 * remaining items (shipping fee stays as originally charged — it's still one
	 * delivery), and optionally zeroes the product's stock so it can't be
	 * ordered again until restocked.
	 */
	cancelItem: async ({ request, params }) => {
		const form = await request.formData();
		const itemId = String(form.get('itemId') ?? '');
		const reason = String(form.get('reason') ?? '').trim();
		const zeroStock = form.get('zeroStock') === 'on';

		if (!itemId) return fail(400, { error: 'Missing item' });
		if (!reason) {
			return fail(400, { error: 'Please give a short reason — the customer will see it.' });
		}

		const [order] = await db
			.select({ status: orders.status, shippingFee: orders.shippingFee })
			.from(orders)
			.where(eq(orders.id, params.id))
			.limit(1);
		if (!order) return fail(404, { error: 'Order not found' });
		if (order.status !== 'pending' && order.status !== 'preparing') {
			return fail(400, { error: `Items cannot be cancelled on a ${order.status} order.` });
		}

		try {
			await db.transaction(async (tx) => {
				// Conditional update doubles as a concurrency guard: only the first
				// request transitions the item into cancelled.
				const [item] = await tx
					.update(orderItems)
					.set({ cancelledAt: new Date(), cancelReason: reason })
					.where(
						and(
							eq(orderItems.id, itemId),
							eq(orderItems.orderId, params.id),
							isNull(orderItems.cancelledAt)
						)
					)
					.returning({ productId: orderItems.productId });
				if (!item) throw new Error('item:not-cancellable');

				const active = await tx
					.select({ lineTotal: orderItems.lineTotal })
					.from(orderItems)
					.where(and(eq(orderItems.orderId, params.id), isNull(orderItems.cancelledAt)));
				if (active.length === 0) throw new Error('item:last-item'); // rolls back

				const subtotal = active.reduce((sum, r) => sum + r.lineTotal, 0);
				await tx
					.update(orders)
					.set({
						subtotal,
						totalAmount: subtotal + order.shippingFee,
						updatedAt: new Date()
					})
					.where(eq(orders.id, params.id));

				if (zeroStock && item.productId) {
					await tx
						.update(products)
						.set({ stockQuantity: 0 })
						.where(eq(products.id, item.productId));
				}
			});
		} catch (e) {
			const msg = e instanceof Error ? e.message : '';
			if (msg === 'item:last-item') {
				return fail(400, {
					error: 'This is the only remaining item — use “Cancel order” instead.'
				});
			}
			if (msg === 'item:not-cancellable') {
				return fail(400, { error: 'Item not found or already cancelled.' });
			}
			throw e;
		}
		return { ok: true };
	}
};
