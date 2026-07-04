import { and, asc, desc, eq, gt, inArray, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import {
	categories,
	homeSectionProducts,
	homeSections,
	productImages,
	products
} from '$lib/server/db/schema';
import type { Product } from '$lib/types/product';

export type ResolvedHomeSection = {
	id: string;
	title: string;
	subtitle: string | null;
	viewAllHref: string;
	products: (Product & { imageUrl: string | null; hoverImageUrl: string | null })[];
};

const productCols = {
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
	updatedAt: products.updatedAt
} as const;

export async function loadHomeSections(): Promise<ResolvedHomeSection[]> {
	const sections = await db
		.select({
			id: homeSections.id,
			title: homeSections.title,
			subtitle: homeSections.subtitle,
			type: homeSections.type,
			categoryId: homeSections.categoryId,
			categorySlug: categories.slug,
			limit: homeSections.limit,
			sortOrder: homeSections.sortOrder,
			isActive: homeSections.isActive,
			createdAt: homeSections.createdAt
		})
		.from(homeSections)
		.leftJoin(categories, eq(homeSections.categoryId, categories.id))
		.where(eq(homeSections.isActive, true))
		.orderBy(asc(homeSections.sortOrder), asc(homeSections.createdAt));

	// Fetch every section's product rows in parallel — the previous
	// serial loop turned each section into another network round-trip.
	const rowsPerSection = await Promise.all(
		sections.map(async (s): Promise<Product[]> => {
			if (s.type === 'manual') {
				return db
					.select(productCols)
					.from(homeSectionProducts)
					.innerJoin(products, eq(homeSectionProducts.productId, products.id))
					.where(
						and(eq(homeSectionProducts.sectionId, s.id), eq(products.isActive, true))
					)
					.orderBy(asc(homeSectionProducts.sortOrder))
					.limit(s.limit);
			}
			if (s.type === 'category' && s.categoryId) {
				return db
					.select(productCols)
					.from(products)
					.where(and(eq(products.categoryId, s.categoryId), eq(products.isActive, true)))
					.orderBy(desc(products.createdAt))
					.limit(s.limit);
			}
			if (s.type === 'newest') {
				return db
					.select(productCols)
					.from(products)
					.where(eq(products.isActive, true))
					.orderBy(desc(products.createdAt))
					.limit(s.limit);
			}
			if (s.type === 'discounted') {
				return db
					.select(productCols)
					.from(products)
					.where(
						and(
							eq(products.isActive, true),
							sql`${products.compareAtPrice} IS NOT NULL`,
							gt(products.compareAtPrice, products.price)
						)
					)
					.orderBy(desc(products.createdAt))
					.limit(s.limit);
			}
			return [];
		})
	);

	// One image query for ALL sections combined instead of one per section.
	const allProductIds = Array.from(
		new Set(rowsPerSection.flatMap((rows) => rows.map((r) => r.id)))
	);
	const allImages = allProductIds.length
		? await db
				.select({
					productId: productImages.productId,
					imageUrl: productImages.imageUrl
				})
				.from(productImages)
				.where(inArray(productImages.productId, allProductIds))
				.orderBy(asc(productImages.sortOrder))
		: [];
	const imagesByProduct = new Map<string, string[]>();
	for (const img of allImages) {
		if (!img.productId) continue;
		const list = imagesByProduct.get(img.productId) ?? [];
		list.push(img.imageUrl);
		imagesByProduct.set(img.productId, list);
	}

	const resolved: ResolvedHomeSection[] = [];
	for (let i = 0; i < sections.length; i++) {
		const s = sections[i];
		const rows = rowsPerSection[i];
		if (rows.length === 0) continue;
		const withImages = rows.map((r) => {
			const imgs = imagesByProduct.get(r.id) ?? [];
			return { ...r, imageUrl: imgs[0] ?? null, hoverImageUrl: imgs[1] ?? null };
		});
		const viewAllHref =
			s.type === 'category' && s.categorySlug ? `/category/${s.categorySlug}` : '/products';
		resolved.push({
			id: s.id,
			title: s.title,
			subtitle: s.subtitle,
			viewAllHref,
			products: withImages
		});
	}

	return resolved;
}
