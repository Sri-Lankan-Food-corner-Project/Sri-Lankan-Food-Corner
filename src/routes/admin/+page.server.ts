import { and, desc, eq, gte, ne, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { orders, products, user } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

/**
 * Build a series of the last N days (oldest → newest) as `YYYY-MM-DD` keys.
 * The chart component fills in zero-buckets for days with no orders.
 */
function buildDaySeries(days: number): string[] {
	const out: string[] = [];
	const now = new Date();
	now.setHours(0, 0, 0, 0);
	for (let i = days - 1; i >= 0; i--) {
		const d = new Date(now);
		d.setDate(d.getDate() - i);
		out.push(d.toISOString().slice(0, 10));
	}
	return out;
}

export const load: PageServerLoad = async () => {
	const now = new Date();
	const startOfToday = new Date(now);
	startOfToday.setHours(0, 0, 0, 0);
	const startOfWeek = new Date(startOfToday);
	startOfWeek.setDate(startOfWeek.getDate() - 6); // last 7 days incl. today
	const startOf14Days = new Date(startOfToday);
	startOf14Days.setDate(startOf14Days.getDate() - 13);

	const [
		revenueRow,
		ordersCountRow,
		todayOrdersRow,
		pendingRow,
		unpaidRow,
		customersRow,
		newCustomersRow,
		productsRow,
		lowStockRow,
		chartRow,
		recent
	] = await Promise.all([
		// Total paid revenue — only paymentStatus = 'paid' counts as real money.
		db
			.select({
				total: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)::int`,
				todayTotal: sql<number>`COALESCE(SUM(${orders.totalAmount}) FILTER (WHERE ${orders.createdAt} >= ${startOfToday.toISOString()}), 0)::int`,
				weekTotal: sql<number>`COALESCE(SUM(${orders.totalAmount}) FILTER (WHERE ${orders.createdAt} >= ${startOfWeek.toISOString()}), 0)::int`
			})
			.from(orders)
			.where(eq(orders.paymentStatus, 'paid')),

		// Total orders (excluding cancelled — those didn't actually happen from a business POV)
		db
			.select({ total: sql<number>`COUNT(*)::int` })
			.from(orders)
			.where(ne(orders.status, 'cancelled')),

		db
			.select({ count: sql<number>`COUNT(*)::int` })
			.from(orders)
			.where(and(ne(orders.status, 'cancelled'), gte(orders.createdAt, startOfToday))),

		// Orders needing attention — pending (not yet processed)
		db
			.select({ count: sql<number>`COUNT(*)::int` })
			.from(orders)
			.where(eq(orders.status, 'pending')),

		// Orders where money hasn't cleared (revenue-at-risk)
		db
			.select({
				count: sql<number>`COUNT(*)::int`,
				amount: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)::int`
			})
			.from(orders)
			.where(and(eq(orders.paymentStatus, 'unpaid'), ne(orders.status, 'cancelled'))),

		db.select({ total: sql<number>`COUNT(*)::int` }).from(user),
		db
			.select({ count: sql<number>`COUNT(*)::int` })
			.from(user)
			.where(gte(user.createdAt, startOfWeek)),

		db
			.select({ total: sql<number>`COUNT(*)::int` })
			.from(products)
			.where(eq(products.isActive, true)),

		db
			.select({ count: sql<number>`COUNT(*)::int` })
			.from(products)
			.where(and(eq(products.isActive, true), sql`${products.stockQuantity} < 5`)),

		// Revenue per day for last 14 days (paid only). date_trunc on the timestamp
		// column groups by day; we convert to a JS-friendly YYYY-MM-DD string.
		db
			.select({
				day: sql<string>`to_char(date_trunc('day', ${orders.createdAt}), 'YYYY-MM-DD')`,
				revenue: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)::int`,
				orderCount: sql<number>`COUNT(*)::int`
			})
			.from(orders)
			.where(
				and(eq(orders.paymentStatus, 'paid'), gte(orders.createdAt, startOf14Days))
			)
			.groupBy(sql`date_trunc('day', ${orders.createdAt})`),

		// Recent orders (any status) for the "New orders" list
		db
			.select({
				id: orders.id,
				orderNumber: orders.orderNumber,
				customerId: orders.customerId,
				customerName: orders.shippingFullName,
				status: orders.status,
				paymentStatus: orders.paymentStatus,
				totalAmount: orders.totalAmount,
				createdAt: orders.createdAt
			})
			.from(orders)
			.orderBy(desc(orders.createdAt))
			.limit(8)
	]);

	// Fill in zeros for days with no orders so the chart shows a continuous timeline
	const chartMap = new Map<string, { revenue: number; orderCount: number }>();
	for (const row of chartRow) {
		chartMap.set(row.day, { revenue: row.revenue, orderCount: row.orderCount });
	}
	const chart = buildDaySeries(14).map((day) => ({
		day,
		revenue: chartMap.get(day)?.revenue ?? 0,
		orderCount: chartMap.get(day)?.orderCount ?? 0
	}));

	return {
		stats: {
			totalRevenue: revenueRow[0].total,
			todayRevenue: revenueRow[0].todayTotal,
			weekRevenue: revenueRow[0].weekTotal,
			totalOrders: ordersCountRow[0].total,
			todayOrders: todayOrdersRow[0].count,
			pendingOrders: pendingRow[0].count,
			unpaidOrders: unpaidRow[0].count,
			unpaidAmount: unpaidRow[0].amount,
			totalCustomers: customersRow[0].total,
			newCustomersThisWeek: newCustomersRow[0].count,
			totalProducts: productsRow[0].total,
			lowStockCount: lowStockRow[0].count
		},
		chart,
		recentOrders: recent
	};
};
