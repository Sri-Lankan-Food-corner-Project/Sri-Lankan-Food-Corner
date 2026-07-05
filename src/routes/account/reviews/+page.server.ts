import { and, desc, eq } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { productReviews, products } from '$lib/server/db/schema';
import { submitReviewSchema } from '$lib/schemas/reviewStatus';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user?.id) {
		throw redirect(303, `/?auth=login&returnTo=${encodeURIComponent(url.pathname)}`);
	}

	const rows = await db
		.select({
			id: productReviews.id,
			productId: productReviews.productId,
			productName: products.name,
			productSlug: products.slug,
			rating: productReviews.rating,
			title: productReviews.title,
			body: productReviews.body,
			status: productReviews.status,
			adminNote: productReviews.adminNote,
			createdAt: productReviews.createdAt,
			updatedAt: productReviews.updatedAt
		})
		.from(productReviews)
		.innerJoin(products, eq(productReviews.productId, products.id))
		.where(eq(productReviews.userId, locals.user.id))
		.orderBy(desc(productReviews.updatedAt));

	return { reviews: rows };
};

export const actions: Actions = {
	update: async ({ request, locals }) => {
		if (!locals.user?.id) return fail(401, { error: 'Please sign in.' });

		const fd = await request.formData();
		const id = String(fd.get('reviewId') ?? '');
		if (!id) return fail(400, { error: 'Missing review id.' });

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

		// Ownership check + block editing of already-approved reviews.
		// Editing an approved review would silently reset status to 'pending' and
		// pull it from public view, which is confusing. The UI hides Edit for
		// approved reviews; this is the server-side guard against direct POSTs.
		const [current] = await db
			.select({ status: productReviews.status })
			.from(productReviews)
			.where(and(eq(productReviews.id, id), eq(productReviews.userId, locals.user.id)))
			.limit(1);
		if (!current) return fail(404, { error: 'Review not found' });
		if (current.status === 'approved') {
			return fail(400, {
				error: 'Approved reviews cannot be edited. Delete and write a new one instead.'
			});
		}

		await db
			.update(productReviews)
			.set({
				rating: parsed.data.rating,
				title: parsed.data.title ?? null,
				body: parsed.data.body,
				status: 'pending',
				adminNote: null,
				updatedAt: new Date()
			})
			.where(and(eq(productReviews.id, id), eq(productReviews.userId, locals.user.id)));

		return { ok: true };
	},

	delete: async ({ request, locals }) => {
		if (!locals.user?.id) return fail(401, { error: 'Please sign in.' });
		const fd = await request.formData();
		const id = String(fd.get('reviewId') ?? '');
		if (!id) return fail(400, { error: 'Missing review id.' });

		await db
			.delete(productReviews)
			.where(and(eq(productReviews.id, id), eq(productReviews.userId, locals.user.id)));
		return { ok: true };
	}
};
