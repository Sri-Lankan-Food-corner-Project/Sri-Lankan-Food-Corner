import { error } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { orders, orderItems } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const [order] = await db.select().from(orders).where(eq(orders.orderNumber, params.orderNumber));
	if (!order) throw error(404, 'Order not found');

	// If the order belongs to a user account, only that user may view it.
	// Guest orders (customerId=null) are viewable by anyone who has the URL —
	// order numbers are random enough that this is effectively bearer-token access.
	if (order.customerId) {
		if (!locals.user?.id || order.customerId !== locals.user.id) {
			throw error(403, 'Forbidden');
		}
	}

	const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));

	return { order, items };
};
