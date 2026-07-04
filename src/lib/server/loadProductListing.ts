import { and, asc, count, desc, eq, gte, ilike, inArray, lte, sql, type SQL } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { categories, productImages, products } from '$lib/server/db/schema';
import { PAGE_SIZE, type ListingFilters } from '$lib/utils/productFilters';
import { timed } from './timing';

export type ListingProduct = {
	id: string;
	categoryId: string | null;
	name: string;
	slug: string;
	description: string | null;
	price: number;
	compareAtPrice: number | null;
	unit: string | null;
	stockQuantity: number;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
	imageUrl: string | null;
	hoverImageUrl: string | null;
};

export type ListingResult = {
	products: ListingProduct[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
	priceBounds: { min: number; max: number };
};

type Options = {
	filters: ListingFilters;
	/** Pin the listing to a category id (used by category pages). */
	pinnedCategoryId?: string;
};

export async function loadProductListing({
	filters,
	pinnedCategoryId
}: Options): Promise<ListingResult> {
	const conditions: SQL[] = [eq(products.isActive, true)];

	// Resolve the category filter (if any) once and keep it separately so the
	// bounds query can reuse it without a duplicate slug lookup.
	let categoryCondition: SQL | null = null;
	if (pinnedCategoryId) {
		categoryCondition = eq(products.categoryId, pinnedCategoryId);
	} else if (filters.category) {
		const [cat] = await db
			.select({ id: categories.id })
			.from(categories)
			.where(eq(categories.slug, filters.category))
			.limit(1);
		categoryCondition = cat ? eq(products.categoryId, cat.id) : sql`false`;
	}
	if (categoryCondition) conditions.push(categoryCondition);

	if (filters.q) {
		conditions.push(ilike(products.name, `%${filters.q}%`));
	}
	if (filters.min !== null) {
		conditions.push(gte(products.price, filters.min));
	}
	if (filters.max !== null) {
		conditions.push(lte(products.price, filters.max));
	}
	if (filters.instock) {
		conditions.push(sql`${products.stockQuantity} > 0`);
	}

	const where = and(...conditions);

	const orderBy = (() => {
		switch (filters.sort) {
			case 'price-asc':
				return [asc(products.price), desc(products.createdAt)];
			case 'price-desc':
				return [desc(products.price), desc(products.createdAt)];
			case 'discount':
				return [
					desc(sql`COALESCE(${products.compareAtPrice} - ${products.price}, 0)`),
					desc(products.createdAt)
				];
			case 'newest':
			default:
				return [desc(products.createdAt)];
		}
	})();

	// Bounds constraint (category only — slider range is stable across filters)
	const boundsConditions: SQL[] = [eq(products.isActive, true)];
	if (categoryCondition) boundsConditions.push(categoryCondition);

	// Estimate the row count of pending offset up-front so we know when to skip
	// the page-of-rows query entirely (offset > total).
	// We fire bounds + count + first page of rows all at once — they're
	// independent queries, so serial execution wastes 2× the network round-trips.
	const offsetGuess = (Math.max(1, filters.page) - 1) * PAGE_SIZE;
	const [boundsRow, countRow, rowsRaw] = await timed('listing: bounds+count+rows', () =>
		Promise.all([
		db
			.select({
				min: sql<number>`COALESCE(MIN(${products.price}), 0)::int`,
				max: sql<number>`COALESCE(MAX(${products.price}), 0)::int`
			})
			.from(products)
			.where(and(...boundsConditions)),
		db.select({ total: count() }).from(products).where(where),
		db
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
				updatedAt: products.updatedAt
			})
			.from(products)
			.where(where)
			.orderBy(...orderBy)
			.limit(PAGE_SIZE)
			.offset(offsetGuess)
		])
	);

	const bounds = boundsRow[0];
	const total = countRow[0].total;
	const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
	const currentPage = Math.min(filters.page, totalPages);

	// If the requested page was past the last page, refetch the last page.
	// Rare edge case; costs one extra round-trip but only when overshooting.
	const rows =
		currentPage === filters.page
			? rowsRaw
			: await db
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
						updatedAt: products.updatedAt
					})
					.from(products)
					.where(where)
					.orderBy(...orderBy)
					.limit(PAGE_SIZE)
					.offset((currentPage - 1) * PAGE_SIZE);

	const ids = rows.map((r) => r.id);
	const imgs = ids.length
		? await timed(
				'listing: images',
				db
					.select({
						productId: productImages.productId,
						imageUrl: productImages.imageUrl
					})
					.from(productImages)
					.where(inArray(productImages.productId, ids))
					.orderBy(asc(productImages.sortOrder))
			)
		: [];

	const imagesByProduct = new Map<string, string[]>();
	for (const img of imgs) {
		if (!img.productId) continue;
		const list = imagesByProduct.get(img.productId) ?? [];
		list.push(img.imageUrl);
		imagesByProduct.set(img.productId, list);
	}

	const withImages: ListingProduct[] = rows.map((r) => {
		const list = imagesByProduct.get(r.id) ?? [];
		return { ...r, imageUrl: list[0] ?? null, hoverImageUrl: list[1] ?? null };
	});

	return {
		products: withImages,
		total,
		page: currentPage,
		pageSize: PAGE_SIZE,
		totalPages,
		priceBounds: { min: Number(bounds?.min ?? 0), max: Number(bounds?.max ?? 0) }
	};
}
