<script lang="ts">
	import AddToCartButton from '$lib/components/AddToCartButton.svelte';
	import { formatPrice } from '$lib/utils/formatPrice';
	import { cart } from '$lib/stores/cart';
	import { cartOpen } from '$lib/stores/cartUi';
	import type { Product } from '$lib/types/product';

	type Props = {
		product: Product;
		imageUrl?: string;
		hoverImageUrl?: string;
	};

	let { product, imageUrl, hoverImageUrl }: Props = $props();

	let adding = $state(false);

	const soldOut = $derived(product.stockQuantity === 0);
	const discountPercent = $derived(
		product.compareAtPrice && product.compareAtPrice > product.price
			? Math.round(
					((product.compareAtPrice - product.price) / product.compareAtPrice) * 100
				)
			: 0
	);
	const hasHoverImage = $derived(!!hoverImageUrl && hoverImageUrl !== imageUrl);

	async function add() {
		if (adding) return;
		adding = true;
		cart.add({
			productId: product.id,
			slug: product.slug,
			name: product.name,
			unitPrice: product.price,
			quantity: 1,
			imageUrl
		});
		await new Promise((r) => setTimeout(r, 400));
		adding = false;
		cartOpen.set(true);
	}
</script>

<div
	class="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition-shadow duration-300 hover:shadow-lg"
>
	<div class="relative">
		<a href="/products/{product.slug}" class="block">
			<div class="bg-brand-sand relative aspect-square overflow-hidden">
				{#if imageUrl}
					<img
						src={imageUrl}
						alt={product.name}
						class="absolute inset-0 h-full w-full object-cover transition-all duration-500 ease-out {hasHoverImage
							? 'group-hover:opacity-0'
							: 'group-hover:scale-110'} {soldOut ? 'opacity-70 grayscale' : ''}"
					/>
					{#if hasHoverImage}
						<img
							src={hoverImageUrl}
							alt=""
							aria-hidden="true"
							class="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
						/>
					{/if}
				{/if}

				{#if discountPercent > 0 && !soldOut}
					<span
						class="absolute top-3 left-3 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow-md"
					>
						-{discountPercent}%
					</span>
				{/if}

				{#if soldOut}
					<div
						class="bg-brand-charcoal/85 absolute inset-x-0 top-1/2 -translate-y-1/2 py-2 text-center text-xs font-bold tracking-[0.2em] text-white uppercase"
					>
						Sold Out
					</div>
				{/if}
			</div>
		</a>

		{#if !soldOut}
			<div
				class="pointer-events-none absolute inset-x-3 bottom-3 hidden translate-y-2 opacity-0 transition-all duration-300 ease-out group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 lg:block"
			>
				<AddToCartButton onclick={add} loading={adding} />
			</div>
		{/if}
	</div>

	<div class="flex flex-1 flex-col p-4">
		<a href="/products/{product.slug}" class="block">
			<h3
				class="group-hover:text-brand-green line-clamp-2 text-sm font-semibold text-neutral-900 transition-colors"
			>
				{product.name}
			</h3>
		</a>
		{#if product.unit}
			<p class="mt-1 text-xs text-neutral-500">{product.unit}</p>
		{/if}

		<div class="mt-3 flex items-baseline gap-2">
			{#if discountPercent > 0}
				<span class="text-xs text-neutral-400 line-through">
					{formatPrice(product.compareAtPrice ?? 0)}
				</span>
			{/if}
			<span class="text-base font-extrabold text-neutral-900">
				{formatPrice(product.price)}
			</span>
		</div>

		{#if !soldOut}
			<div class="mt-4 lg:hidden">
				<AddToCartButton onclick={add} loading={adding} />
			</div>
		{/if}
	</div>
</div>
