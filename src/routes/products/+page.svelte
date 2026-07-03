<script lang="ts">
	import ProductListingLayout from '$lib/components/catalog/ProductListingLayout.svelte';

	let { data } = $props();
</script>

<ProductListingLayout
	title="All Products"
	categories={data.categories}
	activeCategorySlug={data.filters.category}
	useCategoryLinks={false}
	showCategoryChip={true}
	filters={data.filters}
	products={data.products}
	total={data.total}
	page={data.page}
	totalPages={data.totalPages}
/>
