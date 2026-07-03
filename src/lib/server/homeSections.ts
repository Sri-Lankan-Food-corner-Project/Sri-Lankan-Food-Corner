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

async function attachImages<T extends { id: string }>(rows: T[]) {
	if (rows.length === 0) return rows.map((r) => ({ ...r, imageUrl: null, hoverImageUrl: null }));
	const ids = rows.map((r) => r.id);
	const imgs = await db
		.select({
			productId: productImages.productId,
			imageUrl: productImages.imageUrl,
			sortOrder: productImages.sortOrder
		})
		.from(productImages)
		.where(inArray(productImages.productId, ids))
		.orderBy(asc(productImages.sortOrder));

	const byProduct = new Map<string, string[]>();
	for (const img of imgs) {
		if (!img.productId) continue;
		const list = byProduct.get(img.productId) ?? [];
		list.push(img.imageUrl);
		byProduct.set(img.productId, list);
	}
	return rows.map((r) => {
		const list = byProduct.get(r.id) ?? [];
		return { ...r, imageUrl: list[0] ?? null, hoverImageUrl: list[1] ?? null };
	});
}

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

	const resolved: ResolvedHomeSection[] = [];

	for (const s of sections) {
		let rows: Product[] = [];

		if (s.type === 'manual') {
			rows = await db
				.select(productCols)
				.from(homeSectionProducts)
				.innerJoin(products, eq(homeSectionProducts.productId, products.id))
				.where(
					and(eq(homeSectionProducts.sectionId, s.id), eq(products.isActive, true))
				)
				.orderBy(asc(homeSectionProducts.sortOrder))
				.limit(s.limit);
		} else if (s.type === 'category' && s.categoryId) {
			rows = await db
				.select(productCols)
				.from(products)
				.where(and(eq(products.categoryId, s.categoryId), eq(products.isActive, true)))
				.orderBy(desc(products.createdAt))
				.limit(s.limit);
		} else if (s.type === 'newest') {
			rows = await db
				.select(productCols)
				.from(products)
				.where(eq(products.isActive, true))
				.orderBy(desc(products.createdAt))
				.limit(s.limit);
		} else if (s.type === 'discounted') {
			rows = await db
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

		if (rows.length === 0) continue;
		const withImages = await attachImages(rows);
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
