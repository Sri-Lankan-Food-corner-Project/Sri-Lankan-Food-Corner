import { and, count, desc, eq, ilike, or, type SQL } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { orders } from '$lib/server/db/schema';
import { ORDER_STATUSES, PAYMENT_STATUSES } from '$lib/schemas/orderStatus';
import type { PageServerLoad } from './$types';

const PAGE_SIZE = 20;

export const load: PageServerLoad = async ({ url }) => {
	const status = url.searchParams.get('status') ?? '';
	const paymentStatus = url.searchParams.get('payment') ?? '';
	const q = url.searchParams.get('q')?.trim() ?? '';
	const rawPage = Number(url.searchParams.get('page') ?? 1);
	const page = Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1;

	const conditions: SQL[] = [];
	if (status && (ORDER_STATUSES as readonly string[]).includes(status)) {
		conditions.push(eq(orders.status, status));
	}
	if (paymentStatus && (PAYMENT_STATUSES as readonly string[]).includes(paymentStatus)) {
		conditions.push(eq(orders.paymentStatus, paymentStatus));
	}
	if (q) {
		const like = `%${q}%`;
		conditions.push(
			or(
				ilike(orders.orderNumber, like),
				ilike(orders.customerEmail, like),
				ilike(orders.shippingFullName, like),
				ilike(orders.customerPhone, like)
			)!
		);
	}
	const where = conditions.length ? and(...conditions) : undefined;

	const offsetGuess = (page - 1) * PAGE_SIZE;
	const [countRow, rowsRaw] = await Promise.all([
		db.select({ total: count() }).from(orders).where(where),
		db
			.select({
				id: orders.id,
				orderNumber: orders.orderNumber,
				customerName: orders.shippingFullName,
				customerEmail: orders.customerEmail,
				customerPhone: orders.customerPhone,
				status: orders.status,
				paymentStatus: orders.paymentStatus,
				paymentMethod: orders.paymentMethod,
				totalAmount: orders.totalAmount,
				createdAt: orders.createdAt
			})
			.from(orders)
			.where(where)
			.orderBy(desc(orders.createdAt))
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
						id: orders.id,
						orderNumber: orders.orderNumber,
						customerName: orders.shippingFullName,
						customerEmail: orders.customerEmail,
						customerPhone: orders.customerPhone,
						status: orders.status,
						paymentStatus: orders.paymentStatus,
						paymentMethod: orders.paymentMethod,
						totalAmount: orders.totalAmount,
						createdAt: orders.createdAt
					})
					.from(orders)
					.where(where)
					.orderBy(desc(orders.createdAt))
					.limit(PAGE_SIZE)
					.offset((currentPage - 1) * PAGE_SIZE);

	return {
		orders: rows,
		filters: { status, paymentStatus, q },
		page: currentPage,
		pageSize: PAGE_SIZE,
		total,
		totalPages
	};
};
