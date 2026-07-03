<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { formatPrice } from '$lib/utils/formatPrice';
	import { cart } from '$lib/stores/cart';
	import { Minus, Plus } from '@lucide/svelte';

	let { data } = $props();

	let quantity = $state(1);
	let activeImage = $state(0);

	const p = $derived(data.product);
	const soldOut = $derived(p.stockQuantity === 0);
	const discountPercent = $derived(
		p.compareAtPrice && p.compareAtPrice > p.price
			? Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100)
			: 0
	);

	function inc() {
		if (quantity < p.stockQuantity) quantity += 1;
	}
	function dec() {
		if (quantity > 1) quantity -= 1;
	}

	function addToCart() {
		cart.add({
			productId: p.id,
			slug: p.slug,
			name: p.name,
			unitPrice: p.price,
			quantity,
			imageUrl: data.images[0]
		});
	}
</script>

<section class="mx-auto grid max-w-350 gap-8 px-4 py-8 sm:px-6 md:grid-cols-2 lg:px-8">
	<div>
		<div class="bg-muted relative aspect-square overflow-hidden rounded-lg">
			{#if data.images.length > 0}
				<img
					src={data.images[activeImage]}
					alt={p.name}
					class="h-full w-full object-cover"
				/>
			{/if}

			{#if soldOut}
				<div class="absolute top-3 left-3">
					<Badge class="bg-foreground text-background rounded-full px-3 py-1">SOLD OUT</Badge>
				</div>
			{:else if discountPercent > 0}
				<div class="absolute top-3 left-3">
					<Badge class="bg-destructive text-destructive-foreground rounded-full px-3 py-1">
						-{discountPercent}%
					</Badge>
				</div>
			{/if}
		</div>

		{#if data.images.length > 1}
			<div class="mt-3 flex gap-2 overflow-x-auto">
				{#each data.images as img, i (i)}
					<button
						type="button"
						class="bg-muted size-16 shrink-0 overflow-hidden rounded border {activeImage === i
							? 'ring-primary ring-2'
							: ''}"
						onclick={() => (activeImage = i)}
					>
						<img src={img} alt="" class="h-full w-full object-cover" />
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<div>
		{#if p.categoryName && p.categorySlug}
			<a
				href="/category/{p.categorySlug}"
				class="text-muted-foreground text-sm hover:underline"
			>
				{p.categoryName}
			</a>
		{/if}
		<h1 class="mt-1 text-3xl font-bold">{p.name}</h1>
		{#if p.unit}
			<p class="text-muted-foreground text-sm">{p.unit}</p>
		{/if}

		<div class="mt-4 flex items-baseline gap-3">
			{#if discountPercent > 0}
				<span class="text-muted-foreground text-lg line-through">
					{formatPrice(p.compareAtPrice ?? 0)}
				</span>
			{/if}
			<span class="text-2xl font-bold">{formatPrice(p.price)}</span>
		</div>

		{#if p.description}
			<p class="text-muted-foreground mt-6 whitespace-pre-line text-sm">{p.description}</p>
		{/if}

		<div class="mt-8 flex items-center gap-4">
			<div class="flex items-center rounded-md border">
				<button type="button" onclick={dec} class="p-2" disabled={quantity <= 1}>
					<Minus class="size-4" />
				</button>
				<span class="w-10 text-center text-sm font-medium">{quantity}</span>
				<button
					type="button"
					onclick={inc}
					class="p-2"
					disabled={quantity >= p.stockQuantity}
				>
					<Plus class="size-4" />
				</button>
			</div>
			<Button class="flex-1" onclick={addToCart} disabled={soldOut}>
				{soldOut ? 'Sold out' : 'Add to Cart'}
			</Button>
		</div>

		{#if !soldOut && p.stockQuantity < 10}
			<p class="text-muted-foreground mt-3 text-xs">
				Only {p.stockQuantity} left in stock.
			</p>
		{/if}
	</div>
</section>
