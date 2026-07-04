<script lang="ts">
	import ProductCard from '$lib/components/ProductCard.svelte';
	import FilterBar from './FilterBar.svelte';
	import ActiveFilters from './ActiveFilters.svelte';
	import Pagination from './Pagination.svelte';
	import type { ListingProduct } from '$lib/server/loadProductListing';
	import type { ListingFilters } from '$lib/utils/productFilters';

	type Category = { slug: string; name: string };

	type Props = {
		title: string;
		subtitle?: string | null;
		breadcrumb?: { label: string; href: string }[];
		categories: Category[];
		showCategoryChip?: boolean;
		filters: ListingFilters;
		products: ListingProduct[];
		total: number;
		page: number;
		totalPages: number;
		priceBounds: { min: number; max: number };
	};

	let {
		title,
		subtitle = null,
		breadcrumb = [],
		categories,
		showCategoryChip = true,
		filters,
		products,
		total,
		page,
		totalPages,
		priceBounds
	}: Props = $props();
</script>

<section class="mx-auto w-full max-w-350 px-4 py-8 sm:px-6 lg:px-8">
	{#if breadcrumb.length > 0}
		<nav class="mb-3 text-xs text-neutral-500" aria-label="Breadcrumb">
			<ol class="flex flex-wrap items-center gap-1">
				{#each breadcrumb as crumb, i (crumb.href)}
					<li class="flex items-center gap-1">
						{#if i > 0}
							<span aria-hidden="true">›</span>
						{/if}
						<a href={crumb.href} class="hover:underline">{crumb.label}</a>
					</li>
				{/each}
			</ol>
		</nav>
	{/if}

	<div class="flex flex-wrap items-end justify-between gap-3">
		<div class="min-w-0">
			<h1 class="text-3xl font-extrabold tracking-tight text-neutral-900 capitalize sm:text-4xl">
				{title}
			</h1>
			{#if subtitle}
				<p class="mt-2 max-w-2xl text-sm text-neutral-500 sm:text-base">{subtitle}</p>
			{/if}
		</div>
		<p class="shrink-0 text-sm text-neutral-500">
			<span class="font-semibold text-neutral-900">{total}</span>
			{total === 1 ? 'item' : 'items'}
		</p>
	</div>

	<div class="mt-6">
		<FilterBar {filters} {priceBounds} />
	</div>

	<div class="mt-3">
		<ActiveFilters {filters} {categories} {showCategoryChip} />
	</div>

	{#if products.length === 0}
		<div class="mt-8 rounded-2xl border border-dashed border-neutral-300 bg-white/60 px-6 py-16 text-center">
			<p class="text-lg font-semibold text-neutral-900">No products match your filters</p>
			<p class="mt-1 text-sm text-neutral-500">
				Try clearing a filter, widening the price range, or searching a different term.
			</p>
		</div>
	{:else}
		<div class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
			{#each products as product (product.id)}
				<ProductCard
					{product}
					imageUrl={product.imageUrl ?? undefined}
					hoverImageUrl={product.hoverImageUrl ?? undefined}
				/>
			{/each}
		</div>

		<Pagination {page} {totalPages} />
	{/if}
</section>
