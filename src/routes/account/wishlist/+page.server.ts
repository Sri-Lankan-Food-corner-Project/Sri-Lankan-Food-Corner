import { and, asc, desc, eq, inArray } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { productImages, products, wishlistItems } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user?.id) return { items: [] };

	const rows = await db
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
		.orderBy(desc(wishlistItems.createdAt));

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

	return {
		items: rows.map((r) => ({
			...r,
			imageUrl: firstImageByProduct.get(r.id) ?? null
		}))
	};
};
