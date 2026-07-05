<script lang="ts">
	import ProductListingLayout from '$lib/components/catalog/ProductListingLayout.svelte';
	import ListingLayoutSkeleton from '$lib/components/catalog/ListingLayoutSkeleton.svelte';

	let { data } = $props();

	const breadcrumb = $derived([
		{ label: 'Home', href: '/' },
		{ label: 'All Products', href: '/products' },
		{ label: data.category.name, href: `/category/${data.category.slug}` }
	]);
</script>

{#await data.streamed.listing}
	<ListingLayoutSkeleton
		title={data.category.name}
		subtitle={data.category.description}
		{breadcrumb}
	/>
{:then listing}
	<ProductListingLayout
		title={data.category.name}
		subtitle={data.category.description}
		{breadcrumb}
		categories={data.categories}
		showCategoryChip={false}
		filters={data.filters}
		products={listing.products}
		total={listing.total}
		page={listing.page}
		totalPages={listing.totalPages}
		priceBounds={listing.priceBounds}
	/>
{/await}
