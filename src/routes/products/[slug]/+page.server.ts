import { and, asc, eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { products, productImages, categories } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
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

	const images = await db
		.select({ imageUrl: productImages.imageUrl })
		.from(productImages)
		.where(eq(productImages.productId, row.id))
		.orderBy(asc(productImages.sortOrder));

	return { product: row, images: images.map((i) => i.imageUrl) };
};
