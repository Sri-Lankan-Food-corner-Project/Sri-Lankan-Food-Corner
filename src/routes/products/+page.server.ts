import { asc, desc, eq, inArray } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { products, productImages, categories } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const rows = await db
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
			categoryName: categories.name
		})
		.from(products)
		.leftJoin(categories, eq(products.categoryId, categories.id))
		.where(eq(products.isActive, true))
		.orderBy(desc(products.createdAt));

	const ids = rows.map((r) => r.id);
	const images = ids.length
		? await db
				.select({ productId: productImages.productId, imageUrl: productImages.imageUrl })
				.from(productImages)
				.where(inArray(productImages.productId, ids))
				.orderBy(asc(productImages.sortOrder))
		: [];

	const firstImage = new Map<string, string>();
	for (const img of images) {
		if (img.productId && !firstImage.has(img.productId)) firstImage.set(img.productId, img.imageUrl);
	}

	return {
		products: rows.map((r) => ({ ...r, imageUrl: firstImage.get(r.id) }))
	};
};
