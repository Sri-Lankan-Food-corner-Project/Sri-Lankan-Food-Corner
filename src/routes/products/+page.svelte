<script lang="ts">
	import ProductListingLayout from '$lib/components/catalog/ProductListingLayout.svelte';
	import ListingLayoutSkeleton from '$lib/components/catalog/ListingLayoutSkeleton.svelte';

	let { data } = $props();
</script>

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
