import { and, count, desc, eq, type SQL } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { productReviews, products, user } from '$lib/server/db/schema';
import { REVIEW_STATUSES, type ReviewStatus } from '$lib/schemas/reviewStatus';
import type { PageServerLoad, Actions } from './$types';

const PAGE_SIZE = 20;

export const load: PageServerLoad = async ({ url }) => {
	const statusFilter = url.searchParams.get('status');
	const rawPage = Number(url.searchParams.get('page') ?? 1);
	const page = Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1;

	const conditions: SQL[] = [];
	if (statusFilter && (REVIEW_STATUSES as readonly string[]).includes(statusFilter)) {
		conditions.push(eq(productReviews.status, statusFilter));
	}
	const where = conditions.length ? and(...conditions) : undefined;

	const offset = (page - 1) * PAGE_SIZE;
	const [countRow, rowsRaw] = await Promise.all([
		db.select({ total: count() }).from(productReviews).where(where),
		db
			.select({
				id: productReviews.id,
				productId: productReviews.productId,
				productName: products.name,
				productSlug: products.slug,
				authorName: user.name,
				authorEmail: user.email,
				rating: productReviews.rating,
				title: productReviews.title,
				body: productReviews.body,
				status: productReviews.status,
				adminNote: productReviews.adminNote,
				createdAt: productReviews.createdAt
			})
			.from(productReviews)
			.innerJoin(products, eq(productReviews.productId, products.id))
			.innerJoin(user, eq(productReviews.userId, user.id))
			.where(where)
			.orderBy(desc(productReviews.createdAt))
			.limit(PAGE_SIZE)
			.offset(offset)
	]);

	const total = countRow[0].total;
	const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
	const currentPage = Math.min(page, totalPages);

	const rows =
		currentPage === page
			? rowsRaw
			: await db
					.select({
						id: productReviews.id,
						productId: productReviews.productId,
						productName: products.name,
						productSlug: products.slug,
						authorName: user.name,
						authorEmail: user.email,
						rating: productReviews.rating,
						title: productReviews.title,
						body: productReviews.body,
						status: productReviews.status,
						adminNote: productReviews.adminNote,
						createdAt: productReviews.createdAt
					})
					.from(productReviews)
					.innerJoin(products, eq(productReviews.productId, products.id))
					.innerJoin(user, eq(productReviews.userId, user.id))
					.where(where)
					.orderBy(desc(productReviews.createdAt))
					.limit(PAGE_SIZE)
					.offset((currentPage - 1) * PAGE_SIZE);

	return {
		reviews: rows.map((r) => ({ ...r, status: r.status as ReviewStatus })),
		selectedStatus: statusFilter && (REVIEW_STATUSES as readonly string[]).includes(statusFilter)
			? (statusFilter as ReviewStatus)
			: 'all',
		page: currentPage,
		pageSize: PAGE_SIZE,
		total,
		totalPages
	};
};

async function setStatus(id: string, next: ReviewStatus, adminNote: string | null) {
	await db
		.update(productReviews)
		.set({ status: next, adminNote, updatedAt: new Date() })
		.where(eq(productReviews.id, id));
}

export const actions: Actions = {
	approve: async ({ request }) => {
		const fd = await request.formData();
		const id = String(fd.get('id') ?? '');
		if (!id) return fail(400, { error: 'Missing id' });
		await setStatus(id, 'approved', null);
		return { ok: true };
	},

	reject: async ({ request }) => {
		const fd = await request.formData();
		const id = String(fd.get('id') ?? '');
		const note = String(fd.get('adminNote') ?? '').trim();
		if (!id) return fail(400, { error: 'Missing id' });
		await setStatus(id, 'rejected', note || null);
		return { ok: true };
	},

	delete: async ({ request }) => {
		const fd = await request.formData();
		const id = String(fd.get('id') ?? '');
		if (!id) return fail(400, { error: 'Missing id' });
		await db.delete(productReviews).where(eq(productReviews.id, id));
		return { ok: true };
	}
};
