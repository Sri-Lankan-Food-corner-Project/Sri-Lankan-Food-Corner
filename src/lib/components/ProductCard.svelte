<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { formatPrice } from '$lib/utils/formatPrice';
	import { cart } from '$lib/stores/cart';
	import type { Product } from '$lib/types/product';

	let { product, imageUrl }: { product: Product; imageUrl?: string } = $props();

	const soldOut = $derived(product.stockQuantity === 0);
	const discountPercent = $derived(
		product.compareAtPrice && product.compareAtPrice > product.price
			? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
			: 0
	);

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

<Card.Root class="relative overflow-hidden">
	<a href="/products/{product.slug}" class="block">
		<div class="bg-muted relative aspect-square">
			{#if imageUrl}
				<img src={imageUrl} alt={product.name} class="h-full w-full object-cover" />
			{/if}

			{#if soldOut}
				<div class="absolute top-2 left-2">
					<Badge class="bg-foreground text-background rounded-full px-3 py-1">SOLD OUT</Badge>
				</div>
			{:else if discountPercent > 0}
				<div class="absolute top-2 left-2">
					<Badge class="bg-destructive text-destructive-foreground rounded-full px-3 py-1">
						-{discountPercent}%
					</Badge>
				</div>
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
		<div class="mt-2 flex items-baseline gap-2">
			{#if discountPercent > 0}
				<span class="text-muted-foreground text-sm line-through">
					{formatPrice(product.compareAtPrice ?? 0)}
				</span>
			{/if}
			<span class="font-semibold">{formatPrice(product.price)}</span>
		</div>
	</Card.Content>

	<Card.Footer class="p-4 pt-0">
		{#if soldOut}
			<Button class="w-full" variant="outline" disabled>Sold out</Button>
		{:else}
			<Button
				class="bg-brand-green hover:bg-brand-green-hover w-full rounded-full text-white"
				onclick={add}
			>
				Add to Cart
			</Button>
		{/if}
	</Card.Footer>
</Card.Root>
