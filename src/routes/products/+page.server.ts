import { loadProductListing } from '$lib/server/loadProductListing';
import { parseListingFilters } from '$lib/utils/productFilters';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ url }) => {
	const filters = parseListingFilters(url);
	// Stream the listing query — the page can show title + filter shell
	// immediately and swap in real products when the DB responds.
	return {
		filters,
		streamed: { listing: loadProductListing({ filters }) }
	};
};
