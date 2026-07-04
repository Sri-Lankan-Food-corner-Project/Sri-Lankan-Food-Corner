<script lang="ts">
	import ProductListingLayout from '$lib/components/catalog/ProductListingLayout.svelte';

	let { data } = $props();

	const breadcrumb = $derived([
		{ label: 'Home', href: '/' },
		{ label: 'All Products', href: '/products' },
		{ label: data.category.name, href: `/category/${data.category.slug}` }
	]);
</script>

<ProductListingLayout
	title={data.category.name}
	subtitle={data.category.description}
	{breadcrumb}
	categories={data.categories}
	showCategoryChip={false}
	filters={data.filters}
	products={data.products}
	total={data.total}
	page={data.page}
	totalPages={data.totalPages}
	priceBounds={data.priceBounds}
/>
