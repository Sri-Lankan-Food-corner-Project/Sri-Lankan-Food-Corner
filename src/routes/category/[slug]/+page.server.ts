import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { categories } from '$lib/server/db/schema';
import { loadProductListing } from '$lib/server/loadProductListing';
import { parseListingFilters } from '$lib/utils/productFilters';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url }) => {
	const filters = parseListingFilters(url);

	// Category record is awaited — needed for the title + 404 check + the
	// pinnedCategoryId that the listing query uses. It's a single indexed
	// lookup, ~5 ms on the pooled connection.
	const [category] = await db
		.select()
		.from(categories)
		.where(eq(categories.slug, params.slug))
		.limit(1);

	if (!category) throw error(404, 'Category not found');

	// Products / pagination / price bounds stream separately so the header
	// (breadcrumb + title + subtitle) renders instantly.
	return {
		category,
		filters,
		streamed: { listing: loadProductListing({ filters, pinnedCategoryId: category.id }) }
	};
};
