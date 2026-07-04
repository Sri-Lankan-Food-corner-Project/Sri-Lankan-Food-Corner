import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { productImages, products, wishlistItems } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

const PAGE_SIZE = 12;

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user?.id) {
		return { items: [], pagination: { page: 1, pageSize: PAGE_SIZE, total: 0, pageCount: 0 } };
	}

	const requestedPage = Number(url.searchParams.get('page') ?? '1');
	const page = Math.max(1, Number.isFinite(requestedPage) ? Math.floor(requestedPage) : 1);
	const offset = (page - 1) * PAGE_SIZE;

	// One round-trip for the page slice + total count
	const [rows, totalRow] = await Promise.all([
		db
			.select({
				id: products.id,
				slug: products.slug,
				name: products.name,
				price: products.price,
				compareAtPrice: products.compareAtPrice,
				stockQuantity: products.stockQuantity,
				unit: products.unit,
				addedAt: wishlistItems.createdAt
			})
			.from(wishlistItems)
			.innerJoin(products, eq(wishlistItems.productId, products.id))
			.where(and(eq(wishlistItems.userId, locals.user.id), eq(products.isActive, true)))
			.orderBy(desc(wishlistItems.createdAt))
			.limit(PAGE_SIZE)
			.offset(offset),
		db
			.select({ count: sql<number>`count(*)::int` })
			.from(wishlistItems)
			.innerJoin(products, eq(wishlistItems.productId, products.id))
			.where(and(eq(wishlistItems.userId, locals.user.id), eq(products.isActive, true)))
	]);

	const ids = rows.map((r) => r.id);
	const allImages = ids.length
		? await db
				.select({
					productId: productImages.productId,
					imageUrl: productImages.imageUrl
				})
				.from(productImages)
				.where(inArray(productImages.productId, ids))
				.orderBy(asc(productImages.sortOrder))
		: [];

	const firstImageByProduct = new Map<string, string>();
	for (const img of allImages) {
		if (img.productId && !firstImageByProduct.has(img.productId)) {
			firstImageByProduct.set(img.productId, img.imageUrl);
		}
	}

	const total = totalRow[0]?.count ?? 0;
	const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

	return {
		items: rows.map((r) => ({
			...r,
			imageUrl: firstImageByProduct.get(r.id) ?? null
		})),
		pagination: { page, pageSize: PAGE_SIZE, total, pageCount }
	};
};
