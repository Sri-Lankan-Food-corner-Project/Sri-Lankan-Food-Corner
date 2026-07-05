import { and, asc, desc, eq, sql } from 'drizzle-orm';
import { error, fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { products, productImages, categories, productReviews, user } from '$lib/server/db/schema';
import { submitReviewSchema } from '$lib/schemas/reviewStatus';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const [row] = await db
		.select({
			id: products.id,
			categoryId: products.categoryId,
			name: products.name,
			slug: products.slug,
			description: products.description,
			price: products.price,
			compareAtPrice: products.compareAtPrice,
			unit: products.unit,
			stockQuantity: products.stockQuantity,
			isActive: products.isActive,
			createdAt: products.createdAt,
			updatedAt: products.updatedAt,
			categoryName: categories.name,
			categorySlug: categories.slug
		})
		.from(products)
		.leftJoin(categories, eq(products.categoryId, categories.id))
		.where(and(eq(products.slug, params.slug), eq(products.isActive, true)));

	if (!row) throw error(404, 'Product not found');

	const [images, approvedReviews, summaryRows, ownReviewRows] = await Promise.all([
		db
			.select({ imageUrl: productImages.imageUrl })
			.from(productImages)
			.where(eq(productImages.productId, row.id))
			.orderBy(asc(productImages.sortOrder)),
		db
			.select({
				id: productReviews.id,
				rating: productReviews.rating,
				title: productReviews.title,
				body: productReviews.body,
				createdAt: productReviews.createdAt,
				authorName: user.name
			})
			.from(productReviews)
			.innerJoin(user, eq(productReviews.userId, user.id))
			.where(and(eq(productReviews.productId, row.id), eq(productReviews.status, 'approved')))
			.orderBy(desc(productReviews.createdAt))
			.limit(50),
		db
			.select({
				count: sql<number>`count(*)::int`,
				average: sql<number>`coalesce(avg(${productReviews.rating}), 0)::float`
			})
			.from(productReviews)
			.where(and(eq(productReviews.productId, row.id), eq(productReviews.status, 'approved'))),
		locals.user
			? db
					.select({
						id: productReviews.id,
						rating: productReviews.rating,
						title: productReviews.title,
						body: productReviews.body,
						status: productReviews.status,
						adminNote: productReviews.adminNote
					})
					.from(productReviews)
					.where(
						and(eq(productReviews.productId, row.id), eq(productReviews.userId, locals.user.id))
					)
					.limit(1)
			: Promise.resolve([])
	]);

	const summary = summaryRows[0] ?? { count: 0, average: 0 };

	return {
		product: row,
		images: images.map((i) => i.imageUrl),
		reviews: approvedReviews,
		reviewSummary: { count: Number(summary.count), average: Number(summary.average) },
		ownReview: ownReviewRows[0]
			? {
					...ownReviewRows[0],
					status: ownReviewRows[0].status as 'pending' | 'approved' | 'rejected'
				}
			: null
	};
};

export const actions: Actions = {
	submitReview: async ({ request, locals, params }) => {
		if (!locals.user?.id) return fail(401, { error: 'Please sign in to leave a review.' });

		const fd = await request.formData();
		const rawRating = Number(fd.get('rating'));
		const rawTitle = String(fd.get('title') ?? '').trim();
		const rawBody = String(fd.get('body') ?? '').trim();

		const parsed = submitReviewSchema.safeParse({
			rating: rawRating,
			title: rawTitle || undefined,
			body: rawBody
		});
		if (!parsed.success) {
			return fail(400, { error: parsed.error.issues[0]?.message ?? 'Invalid input' });
		}

		const [product] = await db
			.select({ id: products.id })
			.from(products)
			.where(and(eq(products.slug, params.slug), eq(products.isActive, true)))
			.limit(1);
		if (!product) return fail(404, { error: 'Product not found' });

		// Upsert: one review per (product, user). Editing an approved review sends
		// it back to 'pending' since the content changed and needs re-approval.
		await db
			.insert(productReviews)
			.values({
				productId: product.id,
				userId: locals.user.id,
				rating: parsed.data.rating,
				title: parsed.data.title ?? null,
				body: parsed.data.body,
				status: 'pending',
				adminNote: null
			})
			.onConflictDoUpdate({
				target: [productReviews.productId, productReviews.userId],
				set: {
					rating: parsed.data.rating,
					title: parsed.data.title ?? null,
					body: parsed.data.body,
					status: 'pending',
					adminNote: null,
					updatedAt: new Date()
				}
			});

		return { ok: true };
	}
};
