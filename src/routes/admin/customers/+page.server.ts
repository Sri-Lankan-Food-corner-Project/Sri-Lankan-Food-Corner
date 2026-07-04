import { and, count, desc, eq, ilike, or, sql, type SQL } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { orders, user } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

const PAGE_SIZE = 20;

export const load: PageServerLoad = async ({ url }) => {
	const q = url.searchParams.get('q')?.trim() ?? '';
	const role = url.searchParams.get('role') ?? '';
	const rawPage = Number(url.searchParams.get('page') ?? 1);
	const page = Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1;

	const conditions: SQL[] = [];
	if (q) {
		const like = `%${q}%`;
		conditions.push(
			or(ilike(user.name, like), ilike(user.email, like), ilike(user.phone, like))!
		);
	}
	if (role === 'customer' || role === 'admin') {
		conditions.push(eq(user.role, role));
	}
	const where = conditions.length ? and(...conditions) : undefined;

	// One aggregate query joins orders per user to compute total spent + count.
	// LEFT JOIN so users with zero orders still show up.
	const offsetGuess = (page - 1) * PAGE_SIZE;
	const [countRow, rowsRaw] = await Promise.all([
		db.select({ total: count() }).from(user).where(where),
		db
			.select({
				id: user.id,
				name: user.name,
				email: user.email,
				phone: user.phone,
				role: user.role,
				createdAt: user.createdAt,
				orderCount: sql<number>`COUNT(${orders.id})::int`,
				totalSpent: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)::int`
			})
			.from(user)
			.leftJoin(orders, eq(orders.customerId, user.id))
			.where(where)
			.groupBy(user.id)
			.orderBy(desc(user.createdAt))
			.limit(PAGE_SIZE)
			.offset(offsetGuess)
	]);

	const total = countRow[0].total;
	const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
	const currentPage = Math.min(page, totalPages);

	const rows =
		currentPage === page
			? rowsRaw
			: await db
					.select({
						id: user.id,
						name: user.name,
						email: user.email,
						phone: user.phone,
						role: user.role,
						createdAt: user.createdAt,
						orderCount: sql<number>`COUNT(${orders.id})::int`,
						totalSpent: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)::int`
					})
					.from(user)
					.leftJoin(orders, eq(orders.customerId, user.id))
					.where(where)
					.groupBy(user.id)
					.orderBy(desc(user.createdAt))
					.limit(PAGE_SIZE)
					.offset((currentPage - 1) * PAGE_SIZE);

	return {
		customers: rows,
		filters: { q, role },
		page: currentPage,
		pageSize: PAGE_SIZE,
		total,
		totalPages
	};
};
