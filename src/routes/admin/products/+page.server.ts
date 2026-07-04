import { and, asc, count, desc, eq, ilike, inArray, type SQL } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { products, categories, productImages } from '$lib/server/db/schema';
import { deleteProductImageByUrl } from '$lib/server/storage/productImages';
import type { PageServerLoad, Actions } from './$types';

const PAGE_SIZE = 20;

export const load: PageServerLoad = async ({ url }) => {
	const categoryFilter = url.searchParams.get('category');
	const q = url.searchParams.get('q')?.trim() ?? '';
	const rawPage = Number(url.searchParams.get('page') ?? 1);
	const page = Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1;

	const conditions: SQL[] = [];
	if (categoryFilter && categoryFilter !== 'all') {
		conditions.push(eq(products.categoryId, categoryFilter));
	}
	if (q) {
		conditions.push(ilike(products.name, `%${q}%`));
	}
	const where = conditions.length ? and(...conditions) : undefined;

	// Fire count + first-page rows + category dropdown together — they're
	// independent, so serial round-trips are pure waste.
	const offsetGuess = (page - 1) * PAGE_SIZE;
	const [countRow, rowsRaw, cats] = await Promise.all([
		db.select({ total: count() }).from(products).where(where),
		db
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
			.leftJoin(categories, eq(products.categoryId, categories.id))
			.where(where)
			.orderBy(desc(products.createdAt))
			.limit(PAGE_SIZE)
			.offset(offsetGuess),
		db
			.select({ id: categories.id, name: categories.name })
			.from(categories)
			.orderBy(asc(categories.sortOrder), asc(categories.name))
	]);

	const total = countRow[0].total;
	const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
	const currentPage = Math.min(page, totalPages);

	// Rare edge case: requested page was past the last one — refetch. Costs
	// one extra round-trip only when overshooting.
	const rows =
		currentPage === page
			? rowsRaw
			: await db
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
					.leftJoin(categories, eq(products.categoryId, categories.id))
					.where(where)
					.orderBy(desc(products.createdAt))
					.limit(PAGE_SIZE)
					.offset((currentPage - 1) * PAGE_SIZE);

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

	return {
		products: rows.map((r) => ({ ...r, imageUrl: firstImage.get(r.id) ?? null })),
		categories: cats,
		selectedCategory: categoryFilter ?? 'all',
		q,
		page: currentPage,
		pageSize: PAGE_SIZE,
		total,
		totalPages
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
