<script lang="ts">
	import { goto } from '$app/navigation';
	import { page as pageState } from '$app/state';
	import { Input } from '$lib/components/ui/input';
	import { Search, SlidersHorizontal } from '@lucide/svelte';
	import FilterSheet from './FilterSheet.svelte';
	import { SORT_OPTIONS, buildFilterHref, type ListingFilters } from '$lib/utils/productFilters';

	type Props = {
		filters: ListingFilters;
	};

	let { filters }: Props = $props();

	let searchValue = $state(filters.q);
	let searchTimer: ReturnType<typeof setTimeout> | null = null;
	let sheetOpen = $state(false);

	// Re-sync when URL-driven filters change (e.g. after category chip click)
	$effect(() => {
		searchValue = filters.q;
	});

	function pushHref(mutate: (params: URLSearchParams) => void) {
		const href = buildFilterHref(pageState.url, (params) => {
			mutate(params);
			params.delete('page');
		});
		goto(href, { noScroll: true, keepFocus: true, replaceState: false });
	}

	function handleSearchInput(e: Event) {
		searchValue = (e.target as HTMLInputElement).value;
		if (searchTimer) clearTimeout(searchTimer);
		searchTimer = setTimeout(() => {
			pushHref((params) => {
				const v = searchValue.trim();
				if (v) params.set('q', v);
				else params.delete('q');
			});
		}, 300);
	}

	function handleSortChange(e: Event) {
		const value = (e.target as HTMLSelectElement).value;
		pushHref((params) => {
			if (value === 'newest') params.delete('sort');
			else params.set('sort', value);
		});
	}

	// Badge counts only the filters that live inside the sheet (price + in-stock),
	// so search/sort/category tweaks don't inflate it.
	const activeCount = $derived(
		(filters.min !== null ? 1 : 0) + (filters.max !== null ? 1 : 0) + (filters.instock ? 1 : 0)
	);
</script>

<div class="flex flex-col gap-3 sm:flex-row sm:items-center">
	<!-- Search -->
	<div class="relative flex-1">
		<Search class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400" />
		<Input
			type="search"
			placeholder="Search products…"
			value={searchValue}
			oninput={handleSearchInput}
			class="w-full border-neutral-300 bg-white pl-9 text-neutral-900 placeholder:text-neutral-400"
		/>
	</div>

	<!-- Sort (native select — accessible + zero-JS) -->
	<div class="flex items-center gap-2">
		<label for="sort" class="shrink-0 text-sm text-neutral-500 sm:hidden">Sort</label>
		<select
			id="sort"
			value={filters.sort}
			onchange={handleSortChange}
			class="flex-1 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-neutral-500 focus:outline-none sm:min-w-44 sm:flex-none"
		>
			{#each SORT_OPTIONS as opt (opt.value)}
				<option value={opt.value}>{opt.label}</option>
			{/each}
		</select>

		<!-- Filter drawer trigger -->
		<button
			type="button"
			onclick={() => (sheetOpen = true)}
			class="inline-flex shrink-0 items-center gap-2 rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
		>
			<SlidersHorizontal class="size-4" />
			Filters
			{#if activeCount > 0}
				<span
					class="bg-brand-green inline-flex size-5 items-center justify-center rounded-full text-xs font-semibold text-white"
				>
					{activeCount}
				</span>
			{/if}
		</button>
	</div>
</div>

<FilterSheet open={sheetOpen} onOpenChange={(v) => (sheetOpen = v)} {filters} />
