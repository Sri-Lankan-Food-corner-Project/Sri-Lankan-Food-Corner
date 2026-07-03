import { asc, eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { categories } from '$lib/server/db/schema';
import { loadProductListing } from '$lib/server/loadProductListing';
import { parseListingFilters } from '$lib/utils/productFilters';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url }) => {
	const [category] = await db
		.select()
		.from(categories)
		.where(eq(categories.slug, params.slug))
		.limit(1);

	if (!category) throw error(404, 'Category not found');

	const filters = parseListingFilters(url);

	const [listing, cats] = await Promise.all([
		loadProductListing({ filters, pinnedCategoryId: category.id }),
		db
			.select({ slug: categories.slug, name: categories.name })
			.from(categories)
			.orderBy(asc(categories.sortOrder), asc(categories.name))
	]);

	return {
		category,
		filters,
		categories: cats,
		...listing
	};
};
