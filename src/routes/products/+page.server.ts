import { loadProductListing } from '$lib/server/loadProductListing';
import { parseListingFilters } from '$lib/utils/productFilters';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const filters = parseListingFilters(url);
	const listing = await loadProductListing({ filters });

	return {
		filters,
		...listing
	};
};
