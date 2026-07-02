<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { formatPrice } from '$lib/utils/formatPrice';
	import { cart } from '$lib/stores/cart';
	import type { Product } from '$lib/types/product';

	let { product, imageUrl }: { product: Product; imageUrl?: string } = $props();

	function add() {
		cart.add({
			productId: product.id,
			slug: product.slug,
			name: product.name,
			unitPrice: product.price,
			quantity: 1,
			imageUrl
		});
	}
</script>

<Card.Root class="overflow-hidden">
	<a href="/products/{product.slug}" class="block">
		<div class="bg-muted aspect-square">
			{#if imageUrl}
				<img src={imageUrl} alt={product.name} class="h-full w-full object-cover" />
			{/if}
		</div>
	</a>
	<Card.Content class="p-4">
		<a href="/products/{product.slug}" class="hover:underline">
			<h3 class="text-sm font-medium">{product.name}</h3>
		</a>
		{#if product.unit}
			<p class="text-muted-foreground text-xs">{product.unit}</p>
		{/if}
		<div class="mt-2 flex items-center justify-between">
			<span class="font-semibold">{formatPrice(product.price)}</span>
			{#if product.stockQuantity === 0}
				<Badge variant="destructive">Out of stock</Badge>
			{/if}
		</div>
	</Card.Content>
	<Card.Footer class="p-4 pt-0">
		<Button class="w-full" onclick={add} disabled={product.stockQuantity === 0}>Add to Cart</Button>
	</Card.Footer>
</Card.Root>
