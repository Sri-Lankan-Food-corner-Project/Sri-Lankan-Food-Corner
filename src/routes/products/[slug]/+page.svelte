<script lang="ts">
	import AddToCartButton from '$lib/components/AddToCartButton.svelte';
	import ProductReviews from '$lib/components/ProductReviews.svelte';
	import ProductSlider from '$lib/components/home/ProductSlider.svelte';
	import { formatPrice } from '$lib/utils/formatPrice';
	import { cart } from '$lib/stores/cart';
	import { cartOpen } from '$lib/stores/cartUi';
	import { ArrowLeft, ChevronLeft, ChevronRight, Minus, Plus } from '@lucide/svelte';

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

	function prevImage() {
		if (data.images.length === 0) return;
		activeImage = (activeImage - 1 + data.images.length) % data.images.length;
	}
	function nextImage() {
		if (data.images.length === 0) return;
		activeImage = (activeImage + 1) % data.images.length;
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

<section class="mx-auto max-w-350 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
	<button
		type="button"
		onclick={() => history.back()}
		class="hover:text-brand-green hover:bg-brand-cream mb-6 inline-flex cursor-pointer items-center gap-2 rounded-full bg-white/80 px-3.5 py-2 text-sm font-medium text-neutral-700 shadow-sm ring-1 ring-black/5 backdrop-blur-sm transition sm:px-4"
		aria-label="Go back"
	>
		<ArrowLeft class="size-4" />
		<span>Back</span>
	</button>

	<div class="lg:flex lg:items-start lg:gap-6">
		{#if data.images.length > 1}
			<div class="hidden lg:flex lg:shrink-0 lg:flex-col lg:gap-3 lg:p-1">
				{#each data.images as img, i (i)}
					<button
						type="button"
						aria-label="Show image {i + 1}"
						aria-current={activeImage === i}
						class="bg-brand-sand relative size-20 shrink-0 overflow-hidden rounded-xl transition {activeImage ===
						i
							? 'ring-brand-green ring-offset-brand-sand ring-2 ring-offset-2'
							: 'cursor-pointer opacity-70 ring-1 ring-black/5 hover:opacity-100 hover:ring-black/20'}"
						onclick={() => (activeImage = i)}
					>
						<img src={img} alt="" class="h-full w-full object-cover" />
					</button>
				{/each}
			</div>
		{/if}

		<div class="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-2 lg:gap-12">
			<div>
				<div
					class="bg-brand-sand group relative aspect-square overflow-hidden rounded-2xl ring-1 ring-black/5"
				>
					{#if data.images.length > 0}
						<img
							src={data.images[activeImage]}
							alt={p.name}
							class="h-full w-full object-cover transition-opacity duration-200 {soldOut
								? 'opacity-70 grayscale'
								: ''}"
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

					{#if data.images.length > 1}
						<button
							type="button"
							onclick={prevImage}
							aria-label="Previous image"
							class="hover:text-brand-green absolute top-1/2 left-3 inline-flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 text-neutral-700 shadow-md ring-1 ring-black/5 backdrop-blur-sm transition hover:bg-white sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
						>
							<ChevronLeft class="size-5" />
						</button>
						<button
							type="button"
							onclick={nextImage}
							aria-label="Next image"
							class="hover:text-brand-green absolute top-1/2 right-3 inline-flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 text-neutral-700 shadow-md ring-1 ring-black/5 backdrop-blur-sm transition hover:bg-white sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
						>
							<ChevronRight class="size-5" />
						</button>
						<span
							class="absolute right-3 bottom-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white tabular-nums backdrop-blur-sm"
						>
							{activeImage + 1} / {data.images.length}
						</span>
					{/if}
				</div>

				{#if data.images.length > 1}
					<div class="mt-3 -mx-1 flex gap-3 overflow-x-auto p-1 lg:hidden">
						{#each data.images as img, i (i)}
							<button
								type="button"
								aria-label="Show image {i + 1}"
								aria-current={activeImage === i}
								class="bg-brand-sand relative size-20 shrink-0 overflow-hidden rounded-xl transition {activeImage ===
								i
									? 'ring-brand-green ring-offset-brand-sand ring-2 ring-offset-2'
									: 'cursor-pointer opacity-70 ring-1 ring-black/5 hover:opacity-100 hover:ring-black/20'}"
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
						class="flex size-9 cursor-pointer items-center justify-center rounded-full text-neutral-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
						disabled={quantity <= 1 || soldOut}
						aria-label="Decrease quantity"
					>
						<Minus class="size-4" />
					</button>
					<span class="w-10 text-center text-sm font-semibold text-neutral-900">{quantity}</span>
					<button
						type="button"
						onclick={inc}
						class="flex size-9 cursor-pointer items-center justify-center rounded-full text-neutral-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
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
	</div>

	<div class="mx-auto max-w-6xl">
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
			productName={p.name}
		/>
	{/await}
	</div>
</section>

{#await data.streamed.relatedProducts}
	<section class="mx-auto w-full max-w-350 py-6">
		<div class="flex items-end justify-between gap-4 px-4 sm:px-6 lg:px-8">
			<div class="animate-pulse space-y-2">
				<div class="h-6 w-48 rounded bg-neutral-200"></div>
			</div>
		</div>
		<div class="mt-4 flex gap-3 overflow-hidden px-4 sm:gap-4 sm:px-6 lg:px-8">
			{#each [0, 1, 2, 3, 4] as i (i)}
				<div class="w-[45%] shrink-0 sm:w-[32%] md:w-[24%] lg:w-[19%]">
					<div class="animate-pulse space-y-2">
						<div class="aspect-square rounded-xl bg-neutral-200"></div>
						<div class="h-4 w-3/4 rounded bg-neutral-200"></div>
						<div class="h-3 w-1/2 rounded bg-neutral-200"></div>
					</div>
				</div>
			{/each}
		</div>
	</section>
{:then related}
	{#if related.length > 0}
		<ProductSlider
			title="Related Products"
			subtitle={p.categoryName ? `More from ${p.categoryName}` : null}
			products={related}
			viewAllHref={p.categorySlug ? `/category/${p.categorySlug}` : '/products'}
		/>
	{/if}
{/await}
