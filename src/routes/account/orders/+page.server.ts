import { desc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { orders } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user?.id) return { orders: [] };

	const rows = await db
		.select({
			id: orders.id,
			orderNumber: orders.orderNumber,
			status: orders.status,
			paymentStatus: orders.paymentStatus,
			totalAmount: orders.totalAmount,
			createdAt: orders.createdAt
		})
		.from(orders)
		.where(eq(orders.customerId, locals.user.id))
		.orderBy(desc(orders.createdAt));

	return { orders: rows };
};
