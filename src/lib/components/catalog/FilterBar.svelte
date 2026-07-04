<script lang="ts">
	import { untrack } from 'svelte';
	import { goto } from '$app/navigation';
	import { page as pageState } from '$app/state';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { ChevronDown, Search, SlidersHorizontal } from '@lucide/svelte';
	import FilterSheet from './FilterSheet.svelte';
	import { SORT_OPTIONS, buildFilterHref, type ListingFilters } from '$lib/utils/productFilters';

	type Props = {
		filters: ListingFilters;
		priceBounds: { min: number; max: number };
	};

	let { filters, priceBounds }: Props = $props();

	let searchValue = $state(untrack(() => filters.q));
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

	function selectSort(value: string) {
		pushHref((params) => {
			if (value === 'newest') params.delete('sort');
			else params.set('sort', value);
		});
	}

	const currentSortLabel = $derived(
		SORT_OPTIONS.find((o) => o.value === filters.sort)?.label ?? 'Newest'
	);

	// Badge counts only the filters that live inside the sheet (price + in-stock),
	// so search/sort/category tweaks don't inflate it.
	const activeCount = $derived(
		(filters.min !== null ? 1 : 0) + (filters.max !== null ? 1 : 0) + (filters.instock ? 1 : 0)
	);

	const sortItemClass =
		"flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-sm text-neutral-700! cursor-pointer focus:bg-brand-charcoal! focus:text-white! outline-none transition-colors";
</script>

<div class="flex flex-col gap-3 sm:flex-row sm:items-center">
	<!-- Search — matches header pill style -->
	<form
		onsubmit={(e) => e.preventDefault()}
		role="search"
		class="flex-1"
	>
		<div
			class="flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2.5 transition focus-within:border-neutral-400 focus-within:ring-2 focus-within:ring-neutral-900/10"
		>
			<Search class="size-4 shrink-0 text-neutral-400" />
			<input
				type="search"
				placeholder="Search products…"
				value={searchValue}
				oninput={handleSearchInput}
				class="w-full border-0 bg-transparent p-0 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-0 focus:ring-0 focus:outline-none"
			/>
		</div>
	</form>

	<div class="flex items-center gap-2">
		<!-- Sort dropdown -->
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<button
						{...props}
						class="inline-flex shrink-0 items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50"
					>
						<span class="text-neutral-500">Sort:</span>
						<span>{currentSortLabel}</span>
						<ChevronDown class="size-4 text-neutral-400" />
					</button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content
				align="end"
				sideOffset={8}
				class="min-w-56! rounded-xl! border! border-black/5! bg-white! p-1.5! text-neutral-800! shadow-xl! ring-0!"
			>
				{#each SORT_OPTIONS as opt (opt.value)}
					<DropdownMenu.Item class={sortItemClass} onclick={() => selectSort(opt.value)}>
						<span>{opt.label}</span>
						{#if opt.value === filters.sort}
							<span class="bg-brand-green ml-2 inline-block size-1.5 rounded-full"></span>
						{/if}
					</DropdownMenu.Item>
				{/each}
			</DropdownMenu.Content>
		</DropdownMenu.Root>

		<!-- Filter drawer trigger -->
		<button
			type="button"
			onclick={() => (sheetOpen = true)}
			class="inline-flex shrink-0 items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50"
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

<FilterSheet open={sheetOpen} onOpenChange={(v) => (sheetOpen = v)} {filters} {priceBounds} />
