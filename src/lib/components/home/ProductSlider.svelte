<script lang="ts">
	import ProductCard from '$lib/components/ProductCard.svelte';
	import { ChevronLeft, ChevronRight } from '@lucide/svelte';
	import type { Product } from '$lib/types/product';

	type SliderProduct = Product & { imageUrl: string | null; hoverImageUrl: string | null };

	type Props = {
		title: string;
		subtitle?: string | null;
		products: SliderProduct[];
		viewAllHref?: string | null;
	};

	let { title, subtitle = null, products, viewAllHref = null }: Props = $props();

	let track = $state<HTMLDivElement | null>(null);

	function scrollBy(direction: 1 | -1) {
		if (!track) return;
		const step = Math.max(track.clientWidth * 0.85, 240);
		track.scrollBy({ left: step * direction, behavior: 'smooth' });
	}
</script>

<section class="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
	<div class="flex items-end justify-between gap-4">
		<div class="min-w-0">
			<h2 class="text-xl font-extrabold text-neutral-900 sm:text-2xl">{title}</h2>
			{#if subtitle}
				<p class="mt-1 text-sm text-neutral-500">{subtitle}</p>
			{/if}
		</div>
		<div class="flex items-center gap-2">
			{#if viewAllHref}
				<a
					href={viewAllHref}
					class="text-brand-green hover:text-brand-green-hover hidden text-sm font-semibold underline-offset-4 hover:underline sm:inline"
				>
					View all
				</a>
			{/if}
			<button
				type="button"
				onclick={() => scrollBy(-1)}
				aria-label="Scroll left"
				class="hover:bg-brand-cream hidden size-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-sm transition sm:inline-flex"
			>
				<ChevronLeft class="size-4" />
			</button>
			<button
				type="button"
				onclick={() => scrollBy(1)}
				aria-label="Scroll right"
				class="hover:bg-brand-cream hidden size-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-sm transition sm:inline-flex"
			>
				<ChevronRight class="size-4" />
			</button>
		</div>
	</div>

	<div
		bind:this={track}
		class="slider-track mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2"
	>
		{#each products as p (p.id)}
			<div class="w-[45%] shrink-0 snap-start sm:w-[32%] md:w-[24%] lg:w-[19%]">
				<ProductCard
					product={p}
					imageUrl={p.imageUrl ?? undefined}
					hoverImageUrl={p.hoverImageUrl ?? undefined}
				/>
			</div>
		{/each}
	</div>
</section>

<style>
	.slider-track {
		scrollbar-width: none;
	}
	.slider-track::-webkit-scrollbar {
		display: none;
	}
</style>
