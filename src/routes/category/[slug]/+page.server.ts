import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { categories } from '$lib/server/db/schema';
import { loadProductListing } from '$lib/server/loadProductListing';
import { parseListingFilters } from '$lib/utils/productFilters';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url }) => {
	const filters = parseListingFilters(url);

	const [category] = await db
		.select()
		.from(categories)
		.where(eq(categories.slug, params.slug))
		.limit(1);

	if (!category) throw error(404, 'Category not found');

	const listing = await loadProductListing({ filters, pinnedCategoryId: category.id });

	return {
		category,
		filters,
		...listing
	};
};
