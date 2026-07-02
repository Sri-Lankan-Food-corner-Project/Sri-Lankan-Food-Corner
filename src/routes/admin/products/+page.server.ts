import { asc, desc, eq, inArray } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { products, categories, productImages } from '$lib/server/db/schema';
import { deleteProductImageByUrl } from '$lib/server/storage/productImages';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const categoryFilter = url.searchParams.get('category');

	const baseQuery = db
		.select({
			id: products.id,
			name: products.name,
			slug: products.slug,
			price: products.price,
			compareAtPrice: products.compareAtPrice,
			unit: products.unit,
			stockQuantity: products.stockQuantity,
			isActive: products.isActive,
			categoryId: products.categoryId,
			categoryName: categories.name
		})
		.from(products)
		.leftJoin(categories, eq(products.categoryId, categories.id));

	const rows =
		categoryFilter && categoryFilter !== 'all'
			? await baseQuery.where(eq(products.categoryId, categoryFilter)).orderBy(desc(products.createdAt))
			: await baseQuery.orderBy(desc(products.createdAt));

	// First thumbnail per product (min sort_order)
	const ids = rows.map((r) => r.id);
	const imgs = ids.length
		? await db
				.select({ productId: productImages.productId, imageUrl: productImages.imageUrl })
				.from(productImages)
				.where(inArray(productImages.productId, ids))
				.orderBy(asc(productImages.sortOrder))
		: [];
	const firstImage = new Map<string, string>();
	for (const img of imgs) {
		if (img.productId && !firstImage.has(img.productId)) firstImage.set(img.productId, img.imageUrl);
	}

	const cats = await db
		.select({ id: categories.id, name: categories.name })
		.from(categories)
		.orderBy(asc(categories.sortOrder), asc(categories.name));

	return {
		products: rows.map((r) => ({ ...r, imageUrl: firstImage.get(r.id) ?? null })),
		categories: cats,
		selectedCategory: categoryFilter ?? 'all'
	};
};

export const actions: Actions = {
	delete: async ({ request }) => {
		const form = await request.formData();
		const id = String(form.get('id') ?? '');
		if (!id) return fail(400, { error: 'Missing id' });

		const imgs = await db
			.select({ imageUrl: productImages.imageUrl })
			.from(productImages)
			.where(eq(productImages.productId, id));

		await db.delete(products).where(eq(products.id, id));

		await Promise.all(imgs.map((i) => deleteProductImageByUrl(i.imageUrl)));
		return { ok: true };
	},

	toggleActive: async ({ request }) => {
		const form = await request.formData();
		const id = String(form.get('id') ?? '');
		const nextActive = form.get('isActive') === 'true';
		if (!id) return fail(400, { error: 'Missing id' });
		await db
			.update(products)
			.set({ isActive: nextActive, updatedAt: new Date() })
			.where(eq(products.id, id));
		return { ok: true };
	}
};
