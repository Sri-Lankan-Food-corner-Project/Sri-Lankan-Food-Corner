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

<section class="mx-auto w-full max-w-350 py-6">
	<div class="flex items-end justify-between gap-4 px-4 sm:px-6 lg:px-8">
		<div class="min-w-0">
			<h2 class="text-xl font-extrabold text-neutral-900 sm:text-2xl">{title}</h2>
			{#if subtitle}
				<p class="mt-1 text-sm text-neutral-500">{subtitle}</p>
			{/if}
		</div>
		{#if viewAllHref}
			<a
				href={viewAllHref}
				class="hover:text-brand-green shrink-0 text-sm font-semibold text-neutral-900 underline underline-offset-4"
			>
				All Products
			</a>
		{/if}
	</div>

	<div class="group/slider relative mt-4">
		<button
			type="button"
			onclick={() => scrollBy(-1)}
			aria-label="Scroll left"
			class="pointer-events-none absolute top-1/2 cursor-pointer left-1 z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white/95 text-neutral-700 opacity-0 shadow-md backdrop-blur transition-opacity duration-200 group-hover/slider:pointer-events-auto group-hover/slider:opacity-100 hover:text-neutral-900 sm:flex"
		>
			<ChevronLeft class="size-5" />
		</button>
		<button
			type="button"
			onclick={() => scrollBy(1)}
			aria-label="Scroll right"
			class="pointer-events-none absolute top-1/2 cursor-pointer right-1 z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white/95 text-neutral-700 opacity-0 shadow-md backdrop-blur transition-opacity duration-200 group-hover/slider:pointer-events-auto group-hover/slider:opacity-100 hover:text-neutral-900 sm:flex"
		>
			<ChevronRight class="size-5" />
		</button>

		<div class="px-4 sm:px-6 lg:px-8">
		<div
			bind:this={track}
			class="slider-track flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth sm:gap-4"
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
