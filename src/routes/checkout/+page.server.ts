import { fail, redirect } from '@sveltejs/kit';
import { inArray } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { orders, orderItems, products } from '$lib/server/db/schema';
import { generateOrderNumber } from '$lib/server/orders/orderNumber';
import { site } from '$lib/config/site';
import type { PageServerLoad, Actions } from './$types';

type CartLine = {
	productId: string;
	quantity: number;
};

function str(fd: FormData, key: string): string {
	return (fd.get(key)?.toString() ?? '').trim();
}
function opt(fd: FormData, key: string): string | null {
	const v = str(fd, key);
	return v.length ? v : null;
}

export const load: PageServerLoad = async ({ locals }) => {
	return {
		userEmail: locals.user?.email ?? null,
		userName: locals.user?.name ?? null
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const fd = await request.formData();

		// --- Parse cart from hidden field ---
		let cartLines: CartLine[];
		try {
			const raw = str(fd, 'cart');
			cartLines = JSON.parse(raw);
			if (!Array.isArray(cartLines) || cartLines.length === 0) throw new Error('empty');
		} catch {
			return fail(400, { error: 'Your cart is empty.' });
		}

		// --- Required fields ---
		const email = str(fd, 'email');
		const phone = str(fd, 'phone');
		const shippingFullName = str(fd, 'fullName');
		const shippingStreet = str(fd, 'street');
		const shippingCity = str(fd, 'city');
		const shippingPostcode = str(fd, 'postcode');
		const shippingMethod = str(fd, 'shippingMethod');
		const paymentMethod = str(fd, 'paymentMethod');

		if (!email || !phone || !shippingFullName || !shippingStreet || !shippingCity || !shippingPostcode) {
			return fail(400, { error: 'Please fill in all required fields.' });
		}
		if (shippingMethod !== 'weight' && shippingMethod !== 'pickup') {
			return fail(400, { error: 'Invalid shipping method.' });
		}
		if (paymentMethod !== 'bank' && paymentMethod !== 'toss') {
			return fail(400, { error: 'Invalid payment method.' });
		}

		// --- Billing (optional; only validate if 'billingDifferent' is set) ---
		const billingDifferent = fd.get('billingDifferent') === 'on' || fd.get('billingDifferent') === 'true';
		let billing: {
			fullName: string;
			street: string;
			houseNumber: string | null;
			roomNumber: string | null;
			city: string;
			postcode: string;
			country: string;
		} | null = null;

		if (billingDifferent) {
			const bFullName = str(fd, 'billingFullName');
			const bStreet = str(fd, 'billingStreet');
			const bCity = str(fd, 'billingCity');
			const bPostcode = str(fd, 'billingPostcode');
			if (!bFullName || !bStreet || !bCity || !bPostcode) {
				return fail(400, { error: 'Please fill in all required billing address fields.' });
			}
			billing = {
				fullName: bFullName,
				street: bStreet,
				houseNumber: opt(fd, 'billingHouseNumber'),
				roomNumber: opt(fd, 'billingRoomNumber'),
				city: bCity,
				postcode: bPostcode,
				country: 'KR'
			};
		}

		// --- Verify cart against the DB (never trust client prices/stock) ---
		const productIds = cartLines.map((l) => l.productId);
		const dbProducts = await db
			.select({
				id: products.id,
				name: products.name,
				price: products.price,
				stockQuantity: products.stockQuantity,
				isActive: products.isActive
			})
			.from(products)
			.where(inArray(products.id, productIds));

		if (dbProducts.length !== productIds.length) {
			return fail(400, { error: 'One or more products in your cart are no longer available.' });
		}

		type VerifiedLine = { productId: string; name: string; unitPrice: number; quantity: number };
		const verified: VerifiedLine[] = [];
		for (const line of cartLines) {
			const p = dbProducts.find((x) => x.id === line.productId);
			if (!p || !p.isActive) {
				return fail(400, { error: `"${p?.name ?? 'A product'}" is no longer available.` });
			}
			if (!Number.isInteger(line.quantity) || line.quantity <= 0) {
				return fail(400, { error: 'Invalid quantity in cart.' });
			}
			if (p.stockQuantity < line.quantity) {
				return fail(400, {
					error: `"${p.name}" only has ${p.stockQuantity} left in stock.`
				});
			}
			verified.push({
				productId: p.id,
				name: p.name,
				unitPrice: p.price,
				quantity: line.quantity
			});
		}

		// --- Totals (server-side authoritative) ---
		const subtotal = verified.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
		const shippingFee = shippingMethod === 'pickup' ? 0 : site.shipping.weightBasedFee;
		const totalAmount = subtotal + shippingFee;

		// --- Insert order + items in a transaction ---
		const orderNumber = generateOrderNumber();

		const insertedOrder = await db.transaction(async (tx) => {
			const [order] = await tx
				.insert(orders)
				.values({
					orderNumber,
					customerId: locals.user?.id ?? null,
					customerEmail: email,
					customerPhone: phone,

					shippingFullName,
					shippingStreet,
					shippingHouseNumber: opt(fd, 'houseNumber'),
					shippingRoomNumber: opt(fd, 'roomNumber'),
					shippingAccessCode: opt(fd, 'accessCode'),
					shippingCity,
					shippingPostcode,
					shippingCountry: 'KR',
					deliveryNotes: opt(fd, 'notes'),

					billingFullName: billing?.fullName ?? null,
					billingStreet: billing?.street ?? null,
					billingHouseNumber: billing?.houseNumber ?? null,
					billingRoomNumber: billing?.roomNumber ?? null,
					billingCity: billing?.city ?? null,
					billingPostcode: billing?.postcode ?? null,
					billingCountry: billing?.country ?? null,

					shippingMethod,
					status: 'pending',

					subtotal,
					shippingFee,
					totalAmount,

					paymentMethod,
					paymentStatus: 'unpaid'
				})
				.returning({ id: orders.id, orderNumber: orders.orderNumber });

			await tx.insert(orderItems).values(
				verified.map((l) => ({
					orderId: order.id,
					productId: l.productId,
					productName: l.name,
					unitPrice: l.unitPrice,
					quantity: l.quantity,
					lineTotal: l.unitPrice * l.quantity
				}))
			);

			return order;
		});

		// --- Payment handoff ---
		// Bank transfer: order created, wait for offline transfer → success page
		// Toss: TODO redirect to Toss checkout, then verify server-side in webhook
		if (paymentMethod === 'toss') {
			// Placeholder: real integration lives in lib/server/payment/toss.ts
			throw redirect(303, `/checkout/success/${insertedOrder.orderNumber}?pending=toss`);
		}

		throw redirect(303, `/checkout/success/${insertedOrder.orderNumber}`);
	}
};
