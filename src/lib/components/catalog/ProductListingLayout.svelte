<script lang="ts">
	import ProductCard from '$lib/components/ProductCard.svelte';
	import CategoryStrip from './CategoryStrip.svelte';
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
		activeCategorySlug: string;
		/** When true (category page), the strip links to /category/<slug>. Otherwise it acts as a filter. */
		useCategoryLinks?: boolean;
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
		activeCategorySlug,
		useCategoryLinks = false,
		showCategoryChip = true,
		filters,
		products,
		total,
		page,
		totalPages,
		priceBounds
	}: Props = $props();
</script>

<CategoryStrip {categories} activeSlug={activeCategorySlug} linkAsFilter={!useCategoryLinks} />

<section class="mx-auto w-full max-w-350 px-4 py-6 sm:px-6 lg:px-8">
	{#if breadcrumb.length > 0}
		<nav class="text-muted-foreground mb-2 text-xs" aria-label="Breadcrumb">
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

	<div class="flex items-baseline justify-between gap-4">
		<div class="min-w-0">
			<h1 class="text-2xl font-bold text-neutral-900 sm:text-3xl">{title}</h1>
			{#if subtitle}
				<p class="text-muted-foreground mt-1 text-sm">{subtitle}</p>
			{/if}
		</div>
		<p class="text-muted-foreground shrink-0 text-sm">{total} items</p>
	</div>

	<div class="mt-4">
		<FilterBar {filters} {priceBounds} />
	</div>

	<div class="mt-3">
		<ActiveFilters {filters} {categories} {showCategoryChip} />
	</div>

	{#if products.length === 0}
		<div class="rounded-2xl border border-dashed border-neutral-300 bg-white/60 px-6 py-16 text-center">
			<p class="text-lg font-semibold text-neutral-900">No products match your filters</p>
			<p class="text-muted-foreground mt-1 text-sm">
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
