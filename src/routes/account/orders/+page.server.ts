import { desc, eq, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { orders } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

const PAGE_SIZE = 10;

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user?.id) {
		return { orders: [], pagination: { page: 1, pageSize: PAGE_SIZE, total: 0, pageCount: 0 } };
	}

	const requestedPage = Number(url.searchParams.get('page') ?? '1');
	const page = Math.max(1, Number.isFinite(requestedPage) ? Math.floor(requestedPage) : 1);
	const offset = (page - 1) * PAGE_SIZE;

	const [rows, totalRow] = await Promise.all([
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
			.where(eq(orders.customerId, locals.user.id))
			.orderBy(desc(orders.createdAt))
			.limit(PAGE_SIZE)
			.offset(offset),
		db
			.select({ count: sql<number>`count(*)::int` })
			.from(orders)
			.where(eq(orders.customerId, locals.user.id))
	]);

	const total = totalRow[0]?.count ?? 0;
	const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

	return {
		orders: rows,
		pagination: { page, pageSize: PAGE_SIZE, total, pageCount }
	};
};
