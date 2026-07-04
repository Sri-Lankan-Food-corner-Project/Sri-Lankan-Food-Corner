<script lang="ts">
	import { page as pageState } from '$app/state';
	import { X } from '@lucide/svelte';
	import { formatPrice } from '$lib/utils/formatPrice';
	import { buildFilterHref, type ListingFilters } from '$lib/utils/productFilters';

	type Category = { slug: string; name: string };

	type Props = {
		filters: ListingFilters;
		categories: Category[];
		showCategoryChip?: boolean;
	};

	let { filters, categories, showCategoryChip = true }: Props = $props();

	const categoryName = $derived(
		filters.category ? (categories.find((c) => c.slug === filters.category)?.name ?? filters.category) : ''
	);

	const priceLabel = $derived.by(() => {
		if (filters.min === null && filters.max === null) return '';
		const parts: string[] = [];
		if (filters.min !== null) parts.push(formatPrice(filters.min));
		else parts.push('₩0');
		parts.push('–');
		if (filters.max !== null) parts.push(formatPrice(filters.max));
		else parts.push('Any');
		return parts.join(' ');
	});

	function removeHref(mutate: (params: URLSearchParams) => void) {
		return buildFilterHref(pageState.url, (params) => {
			mutate(params);
			params.delete('page');
		});
	}

	const clearAllHref = $derived(
		buildFilterHref(pageState.url, (params) => {
			['q', 'category', 'min', 'max', 'instock', 'sort', 'page'].forEach((k) => {
				// Keep category on category pages (it's not in URL — pinned by route)
				if (!showCategoryChip && k === 'category') return;
				params.delete(k);
			});
		})
	);

	const hasAny = $derived(
		!!filters.q ||
			(showCategoryChip && !!filters.category) ||
			filters.min !== null ||
			filters.max !== null ||
			filters.instock
	);
</script>

{#if hasAny}
	<div class="flex flex-wrap items-center gap-2">
		{#if filters.q}
			<a
				href={removeHref((p) => p.delete('q'))}
				class="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-800 transition hover:bg-neutral-50"
			>
				Search: "{filters.q}"
				<X class="size-3" />
			</a>
		{/if}
		{#if showCategoryChip && filters.category}
			<a
				href={removeHref((p) => p.delete('category'))}
				class="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-800 transition hover:bg-neutral-50"
			>
				{categoryName}
				<X class="size-3" />
			</a>
		{/if}
		{#if priceLabel}
			<a
				href={removeHref((p) => {
					p.delete('min');
					p.delete('max');
				})}
				class="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-800 transition hover:bg-neutral-50"
			>
				{priceLabel}
				<X class="size-3" />
			</a>
		{/if}
		{#if filters.instock}
			<a
				href={removeHref((p) => p.delete('instock'))}
				class="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-800 transition hover:bg-neutral-50"
			>
				In stock
				<X class="size-3" />
			</a>
		{/if}

		<a href={clearAllHref} class="ml-1 text-xs font-semibold text-neutral-600 hover:text-neutral-900 hover:underline">
			Clear all
		</a>
	</div>
{/if}
