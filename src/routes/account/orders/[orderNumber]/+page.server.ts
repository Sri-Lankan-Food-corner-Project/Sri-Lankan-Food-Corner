import { error } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { orderItems, orders } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user?.id) throw error(401, 'Not signed in');

	const [order] = await db
		.select()
		.from(orders)
		.where(and(eq(orders.orderNumber, params.orderNumber), eq(orders.customerId, locals.user.id)));

	if (!order) throw error(404, 'Order not found');

	const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));

	return { order, items };
};
