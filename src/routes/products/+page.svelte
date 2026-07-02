<script lang="ts">
	import ProductCard from '$lib/components/ProductCard.svelte';

	let { data } = $props();
</script>

<section class="mx-auto max-w-7xl px-4 py-8">
	<div class="flex items-baseline justify-between">
		<h1 class="text-2xl font-bold">All Products</h1>
		<p class="text-muted-foreground text-sm">{data.products.length} items</p>
	</div>

	{#if data.products.length === 0}
		<p class="text-muted-foreground mt-12 text-center">
			No products available yet — check back soon.
		</p>
	{:else}
		<div class="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
			{#each data.products as product (product.id)}
				<ProductCard {product} imageUrl={product.imageUrl} />
			{/each}
		</div>
	{/if}
</section>
