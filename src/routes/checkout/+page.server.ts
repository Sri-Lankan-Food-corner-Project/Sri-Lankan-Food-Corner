import { fail, redirect, isRedirect } from '@sveltejs/kit';
import { and, desc, eq, gte, inArray, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { orders, orderItems, products, userAddresses } from '$lib/server/db/schema';
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
function bool(fd: FormData, key: string): boolean {
	const v = fd.get(key);
	return v === 'on' || v === 'true';
}

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user?.id ?? null;

	try {
		const addresses = userId
			? await db
					.select()
					.from(userAddresses)
					.where(eq(userAddresses.userId, userId))
					.orderBy(desc(userAddresses.isDefault), desc(userAddresses.updatedAt))
			: [];

		return {
			userEmail: locals.user?.email ?? null,
			userName: locals.user?.name ?? null,
			addresses
		};
	} catch (err) {
		console.error('[checkout/load]', err);
		return {
			userEmail: locals.user?.email ?? null,
			userName: locals.user?.name ?? null,
			addresses: []
		};
	}
};

export const actions: Actions = {
	saveAddress: async ({ request, locals }) => {
		if (!locals.user?.id) return fail(401, { addressError: 'You must be logged in.' });

		try {
			const fd = await request.formData();

			const id = opt(fd, 'addressId'); // present = update, absent = create
			const label = opt(fd, 'label');
			const fullName = str(fd, 'fullName');
			const phone = str(fd, 'phone');
			const street = str(fd, 'street');
			const city = str(fd, 'city');
			const postcode = str(fd, 'postcode');
			const setDefault = bool(fd, 'isDefault');

			if (!fullName || !phone || !street || !city || !postcode) {
				return fail(400, { addressError: 'Please fill in all required address fields.' });
			}

			const values = {
				userId: locals.user.id,
				label,
				fullName,
				phone,
				street,
				houseNumber: opt(fd, 'houseNumber'),
				roomNumber: opt(fd, 'roomNumber'),
				accessCode: opt(fd, 'accessCode'),
				city,
				postcode,
				country: 'KR',
				isDefault: setDefault,
				updatedAt: new Date()
			};

			await db.transaction(async (tx) => {
				if (setDefault) {
					await tx
						.update(userAddresses)
						.set({ isDefault: false })
						.where(eq(userAddresses.userId, locals.user!.id));
				}

				if (id) {
					await tx
						.update(userAddresses)
						.set(values)
						.where(and(eq(userAddresses.id, id), eq(userAddresses.userId, locals.user!.id)));
				} else {
					await tx.insert(userAddresses).values(values);
				}
			});

			return { addressSaved: true };
		} catch (err) {
			console.error('[checkout/saveAddress]', err);
			return fail(500, { addressError: 'Could not save the address. Please try again.' });
		}
	},

	deleteAddress: async ({ request, locals }) => {
		if (!locals.user?.id) return fail(401, { addressError: 'You must be logged in.' });

		try {
			const fd = await request.formData();
			const id = str(fd, 'addressId');
			if (!id) return fail(400, { addressError: 'Missing address id.' });

			await db
				.delete(userAddresses)
				.where(and(eq(userAddresses.id, id), eq(userAddresses.userId, locals.user.id)));

			return { addressDeleted: true };
		} catch (err) {
			console.error('[checkout/deleteAddress]', err);
			return fail(500, { addressError: 'Could not delete the address. Please try again.' });
		}
	},

	placeOrder: async ({ request, locals }) => {
		try {
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

			if (
				!email ||
				!phone ||
				!shippingFullName ||
				!shippingStreet ||
				!shippingCity ||
				!shippingPostcode
			) {
				return fail(400, { error: 'Please fill in all required fields.' });
			}
			if (shippingMethod !== 'weight' && shippingMethod !== 'pickup') {
				return fail(400, { error: 'Invalid shipping method.' });
			}
			if (paymentMethod !== 'bank' && paymentMethod !== 'toss') {
				return fail(400, { error: 'Invalid payment method.' });
			}

			// --- Billing (optional; only validate if 'billingDifferent' is set) ---
			const billingDifferent = bool(fd, 'billingDifferent');
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

			// --- Verify cart against DB (never trust client prices/stock) ---
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
						error: `Only ${p.stockQuantity} of "${p.name}" left in stock.`
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

			const orderNumber = generateOrderNumber();
			const saveToBook = bool(fd, 'saveAddress') && !!locals.user?.id;

			// --- Insert order, order_items, decrement stock (all atomic) ---
			const insertedOrder = await db.transaction(async (tx) => {
				// Atomic stock decrement per line: only succeeds if there's still enough.
				// This catches races between the earlier `select` and this insert.
				for (const l of verified) {
					const updated = await tx
						.update(products)
						.set({ stockQuantity: sql`${products.stockQuantity} - ${l.quantity}` })
						.where(and(eq(products.id, l.productId), gte(products.stockQuantity, l.quantity)))
						.returning({ id: products.id });
					if (updated.length === 0) {
						throw new Error(`INSUFFICIENT_STOCK:${l.name}`);
					}
				}

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

				if (saveToBook) {
					await tx.insert(userAddresses).values({
						userId: locals.user!.id,
						label: null,
						fullName: shippingFullName,
						phone,
						street: shippingStreet,
						houseNumber: opt(fd, 'houseNumber'),
						roomNumber: opt(fd, 'roomNumber'),
						accessCode: opt(fd, 'accessCode'),
						city: shippingCity,
						postcode: shippingPostcode,
						country: 'KR',
						isDefault: false
					});
				}

				return order;
			});

			if (paymentMethod === 'toss') {
				throw redirect(303, `/checkout/success/${insertedOrder.orderNumber}?pending=toss`);
			}
			throw redirect(303, `/checkout/success/${insertedOrder.orderNumber}`);
		} catch (err) {
			// SvelteKit's redirect() throws — let it propagate.
			if (isRedirect(err)) throw err;

			// Insufficient stock race — surface a friendly message.
			if (err instanceof Error && err.message.startsWith('INSUFFICIENT_STOCK:')) {
				const name = err.message.split(':', 2)[1];
				return fail(409, {
					error: `Sorry, "${name}" just sold out. Please review your cart.`
				});
			}

			console.error('[checkout/placeOrder]', err);
			return fail(500, {
				error: 'Something went wrong placing your order. Please try again, or contact us if it keeps failing.'
			});
		}
	}
};
