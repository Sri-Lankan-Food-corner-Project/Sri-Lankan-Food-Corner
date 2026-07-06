<script lang="ts">
	import ProductListingLayout from '$lib/components/catalog/ProductListingLayout.svelte';
	import ListingLayoutSkeleton from '$lib/components/catalog/ListingLayoutSkeleton.svelte';
	import SEO from '$lib/components/SEO.svelte';
	import { SITE_URL } from '$lib/config/seo';

	let { data } = $props();

	const productsListJsonLd = {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
			{ '@type': 'ListItem', position: 2, name: 'All Products', item: `${SITE_URL}/products` }
		]
	};
</script>

<SEO
	title="All Products — Sri Lankan groceries in Korea"
	description="Browse the full Sri Lankan Food Corner catalogue. Rice, spices, coconut products, snacks, curry mixes and fresh vegetables — delivered across South Korea from Dangjin."
	jsonLd={productsListJsonLd}
/>

{#await data.streamed.listing}
	<ListingLayoutSkeleton title="All Products" />
{:then listing}
	<ProductListingLayout
		title="All Products"
		categories={data.categories}
		showCategoryChip={true}
		filters={data.filters}
		products={listing.products}
		total={listing.total}
		page={listing.page}
		totalPages={listing.totalPages}
		priceBounds={listing.priceBounds}
	/>
{/await}
