import { asc } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { categories } from '$lib/server/db/schema';
import { loadProductListing } from '$lib/server/loadProductListing';
import { parseListingFilters } from '$lib/utils/productFilters';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const filters = parseListingFilters(url);

	const [listing, cats] = await Promise.all([
		loadProductListing({ filters }),
		db
			.select({ slug: categories.slug, name: categories.name })
			.from(categories)
			.orderBy(asc(categories.sortOrder), asc(categories.name))
	]);

	return {
		filters,
		categories: cats,
		...listing
	};
};
