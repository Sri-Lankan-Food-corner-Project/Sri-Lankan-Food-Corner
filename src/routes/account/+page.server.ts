import { desc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { orders, userAddresses } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user?.id) return { recentOrders: [], addressCount: 0 };

	const recentOrders = await db
		.select({
			id: orders.id,
			orderNumber: orders.orderNumber,
			status: orders.status,
			totalAmount: orders.totalAmount,
			createdAt: orders.createdAt
		})
		.from(orders)
		.where(eq(orders.customerId, locals.user.id))
		.orderBy(desc(orders.createdAt))
		.limit(3);

	const [addressCount] = await db
		.select({ n: userAddresses.id })
		.from(userAddresses)
		.where(eq(userAddresses.userId, locals.user.id))
		.limit(1);

	return {
		recentOrders,
		addressCount: addressCount ? 1 : 0
	};
};
