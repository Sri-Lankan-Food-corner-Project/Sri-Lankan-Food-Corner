<script lang="ts">
	import ProductCard from '$lib/components/ProductCard.svelte';

	let { data } = $props();
</script>

<section class="mx-auto max-w-350 px-4 py-8 sm:px-6 lg:px-8">
	<div>
		<a href="/products" class="text-muted-foreground text-sm hover:underline">← All products</a>
		<h1 class="mt-2 text-2xl font-bold">{data.category.name}</h1>
		{#if data.category.description}
			<p class="text-muted-foreground mt-1 text-sm">{data.category.description}</p>
		{/if}
	</div>

	{#if data.products.length === 0}
		<p class="text-muted-foreground mt-12 text-center">No products in this category yet.</p>
	{:else}
		<div class="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
			{#each data.products as product (product.id)}
				<ProductCard {product} imageUrl={product.imageUrl} />
			{/each}
		</div>
	{/if}
</section>
