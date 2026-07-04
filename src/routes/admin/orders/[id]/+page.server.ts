import { asc, eq } from 'drizzle-orm';
import { error, fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { orderItems, orders, productImages } from '$lib/server/db/schema';
import {
	ORDER_STATUSES,
	PAYMENT_STATUSES,
	canTransitionStatus,
	type OrderStatus,
	type PaymentStatus
} from '$lib/schemas/orderStatus';
import { inArray } from 'drizzle-orm';
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

		await db
			.update(orders)
			.set({ status: next, updatedAt: new Date() })
			.where(eq(orders.id, params.id));
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
		if (current.status === 'cancelled') return { ok: true };

		await db
			.update(orders)
			.set({ status: 'cancelled', updatedAt: new Date() })
			.where(eq(orders.id, params.id));
		return { ok: true };
	}
};
