<script lang="ts">
	import AddToCartButton from '$lib/components/AddToCartButton.svelte';
	import ProductReviews from '$lib/components/ProductReviews.svelte';
	import { formatPrice } from '$lib/utils/formatPrice';
	import { cart } from '$lib/stores/cart';
	import { cartOpen } from '$lib/stores/cartUi';
	import { ArrowLeft, Minus, Plus } from '@lucide/svelte';

	let { data } = $props();

	let quantity = $state(1);
	let activeImage = $state(0);
	let adding = $state(false);

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

	async function addToCart() {
		if (adding) return;
		adding = true;
		cart.add({
			productId: p.id,
			slug: p.slug,
			name: p.name,
			unitPrice: p.price,
			quantity,
			imageUrl: data.images[0]
		});
		await new Promise((r) => setTimeout(r, 400));
		adding = false;
		cartOpen.set(true);
	}
</script>

<section class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
	<button
		type="button"
		onclick={() => history.back()}
		class="hover:text-brand-green cursor-pointer mb-6 inline-flex items-center gap-2 text-sm font-medium text-neutral-600 transition-colors"
	>
		<ArrowLeft class="size-4" />
		Back
	</button>

	<div class="grid gap-8 lg:grid-cols-2 lg:gap-12">
		<div>
			<div
				class="bg-brand-sand relative aspect-square overflow-hidden rounded-2xl ring-1 ring-black/5"
			>
				{#if data.images.length > 0}
					<img
						src={data.images[activeImage]}
						alt={p.name}
						class="h-full w-full object-cover {soldOut ? 'opacity-70 grayscale' : ''}"
					/>
				{/if}

				{#if soldOut}
					<div
						class="bg-brand-charcoal/85 absolute inset-x-0 top-1/2 -translate-y-1/2 py-3 text-center text-sm font-bold tracking-[0.2em] text-white uppercase"
					>
						Sold Out
					</div>
				{:else if discountPercent > 0}
					<span
						class="absolute top-4 left-4 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow-md"
					>
						-{discountPercent}%
					</span>
				{/if}
			</div>

			{#if data.images.length > 1}
				<div class="mt-4 flex gap-3 overflow-x-auto">
					{#each data.images as img, i (i)}
						<button
							type="button"
							class="bg-brand-sand size-20 shrink-0 overflow-hidden rounded-xl ring-inset transition {activeImage ===
							i
								? 'ring-brand-green ring-2'
								: 'ring-1 ring-black/5 hover:ring-black/20'}"
							onclick={() => (activeImage = i)}
						>
							<img src={img} alt="" class="h-full w-full object-cover" />
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<div class="flex flex-col">
			{#if p.categoryName && p.categorySlug}
				<a
					href="/category/{p.categorySlug}"
					class="hover:text-brand-green text-xs font-semibold tracking-widest text-neutral-500 uppercase transition-colors"
				>
					{p.categoryName}
				</a>
			{/if}

			<h1 class="mt-2 text-3xl font-extrabold text-neutral-900 sm:text-4xl">{p.name}</h1>

			{#if p.unit}
				<p class="mt-2 text-sm text-neutral-500">{p.unit}</p>
			{/if}

			<div class="mt-6 flex items-baseline gap-3">
				{#if discountPercent > 0}
					<span class="text-lg text-neutral-400 line-through">
						{formatPrice(p.compareAtPrice ?? 0)}
					</span>
				{/if}
				<span class="text-3xl font-extrabold text-neutral-900">
					{formatPrice(p.price)}
				</span>
			</div>

			{#if p.description}
				<div class="mt-6 border-t border-black/5 pt-6">
					<p class="text-sm leading-relaxed whitespace-pre-line text-neutral-600">
						{p.description}
					</p>
				</div>
			{/if}

			<div class="mt-8 flex flex-col gap-3 sm:flex-row sm:items-stretch">
				<div class="inline-flex items-center rounded-full bg-neutral-100 p-1">
					<button
						type="button"
						onclick={dec}
						class="flex size-9 items-center justify-center rounded-full text-neutral-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
						disabled={quantity <= 1 || soldOut}
						aria-label="Decrease quantity"
					>
						<Minus class="size-4" />
					</button>
					<span class="w-10 text-center text-sm font-semibold text-neutral-900">{quantity}</span>
					<button
						type="button"
						onclick={inc}
						class="flex size-9 items-center justify-center rounded-full text-neutral-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
						disabled={quantity >= p.stockQuantity || soldOut}
						aria-label="Increase quantity"
					>
						<Plus class="size-4" />
					</button>
				</div>

				<div class="flex-1">
					<AddToCartButton
						onclick={addToCart}
						disabled={soldOut}
						loading={adding}
						label={soldOut ? 'Sold Out' : 'Add to Cart'}
					/>
				</div>
			</div>

			{#if !soldOut && p.stockQuantity < 10}
				<p class="mt-4 text-xs font-medium text-amber-700">
					Only {p.stockQuantity} left in stock — order soon.
				</p>
			{/if}
		</div>
	</div>

	{#await data.streamed.reviewData}
		<!-- Skeleton — shown while the reviews query streams in. Matches the
		     approximate layout of the real review section so the page doesn't
		     jump when the data arrives. -->
		<section class="mt-16 border-t border-neutral-200 pt-10">
			<div class="animate-pulse space-y-3">
				<div class="h-7 w-48 rounded bg-neutral-200"></div>
				<div class="h-4 w-40 rounded bg-neutral-200"></div>
			</div>
			<div class="mt-10 space-y-4">
				{#each [0, 1] as i (i)}
					<div class="rounded-2xl border border-neutral-200 bg-white p-5">
						<div class="animate-pulse space-y-3">
							<div class="h-4 w-24 rounded bg-neutral-200"></div>
							<div class="h-3 w-full rounded bg-neutral-200"></div>
							<div class="h-3 w-3/4 rounded bg-neutral-200"></div>
						</div>
					</div>
				{/each}
			</div>
		</section>
	{:then r}
		<ProductReviews
			user={data.user}
			reviews={r.reviews}
			summary={r.summary}
			ownReview={r.ownReview}
		/>
	{/await}
</section>
