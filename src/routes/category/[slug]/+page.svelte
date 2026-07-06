<script lang="ts">
	import ProductListingLayout from '$lib/components/catalog/ProductListingLayout.svelte';
	import ListingLayoutSkeleton from '$lib/components/catalog/ListingLayoutSkeleton.svelte';
	import SEO from '$lib/components/SEO.svelte';
	import { SITE_URL } from '$lib/config/seo';

	let { data } = $props();

	const breadcrumb = $derived([
		{ label: 'Home', href: '/' },
		{ label: 'All Products', href: '/products' },
		{ label: data.category.name, href: `/category/${data.category.slug}` }
	]);

	const categoryJsonLd = $derived({
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
			{ '@type': 'ListItem', position: 2, name: 'Products', item: `${SITE_URL}/products` },
			{
				'@type': 'ListItem',
				position: 3,
				name: data.category.name,
				item: `${SITE_URL}/category/${data.category.slug}`
			}
		]
	});
</script>

<SEO
	title="{data.category.name} — Sri Lankan groceries in Korea"
	description="{data.category.description ??
		`Shop ${data.category.name} online. Authentic Sri Lankan groceries delivered across South Korea from our Dangjin store.`}"
	jsonLd={categoryJsonLd}
/>

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
