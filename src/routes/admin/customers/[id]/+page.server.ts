import { desc, eq, sql } from 'drizzle-orm';
import { error, fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { orders, user, userAddresses } from '$lib/server/db/schema';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const [customerRows, orderRows, addressRows, statsRow] = await Promise.all([
		db
			.select({
				id: user.id,
				name: user.name,
				email: user.email,
				phone: user.phone,
				role: user.role,
				emailVerified: user.emailVerified,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt
			})
			.from(user)
			.where(eq(user.id, params.id))
			.limit(1),
		db
			.select({
				id: orders.id,
				orderNumber: orders.orderNumber,
				status: orders.status,
				paymentStatus: orders.paymentStatus,
				totalAmount: orders.totalAmount,
				createdAt: orders.createdAt
			})
			.from(orders)
			.where(eq(orders.customerId, params.id))
			.orderBy(desc(orders.createdAt))
			.limit(20),
		db
			.select()
			.from(userAddresses)
			.where(eq(userAddresses.userId, params.id))
			.orderBy(desc(userAddresses.isDefault), desc(userAddresses.createdAt)),
		db
			.select({
				totalOrders: sql<number>`COUNT(*)::int`,
				// Lifetime spend counts only orders where money actually cleared —
				// cancelled or still-unpaid orders don't count as revenue.
				totalSpent: sql<number>`COALESCE(SUM(${orders.totalAmount}) FILTER (WHERE ${orders.paymentStatus} = 'paid'), 0)::int`,
				paidOrders: sql<number>`COUNT(*) FILTER (WHERE ${orders.paymentStatus} = 'paid')::int`
			})
			.from(orders)
			.where(eq(orders.customerId, params.id))
	]);

	const customer = customerRows[0];
	if (!customer) throw error(404, 'Customer not found');

	const stats = statsRow[0];
	// Average is over paid orders too, so it reflects "what customers actually paid"
	// rather than being dragged down by cancelled/unpaid line entries.
	const avgOrderValue =
		stats.paidOrders > 0 ? Math.round(stats.totalSpent / stats.paidOrders) : 0;

	return {
		customer,
		orders: orderRows,
		addresses: addressRows,
		stats: { ...stats, avgOrderValue }
	};
};

export const actions: Actions = {
	setRole: async ({ request, params, locals }) => {
		const form = await request.formData();
		const nextRole = String(form.get('role') ?? '');
		if (nextRole !== 'admin' && nextRole !== 'customer') {
			return fail(400, { error: 'Invalid role' });
		}
		// Safety: an admin cannot demote themselves — they'd immediately lose
		// access to the admin panel mid-request.
		if (locals.user?.id === params.id && nextRole !== 'admin') {
			return fail(400, { error: "You can't remove your own admin role." });
		}
		await db.update(user).set({ role: nextRole }).where(eq(user.id, params.id));
		return { ok: true };
	}
};
