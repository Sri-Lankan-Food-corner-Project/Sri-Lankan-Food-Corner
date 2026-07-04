<script lang="ts">
	import { page as pageState } from '$app/state';
	import { ChevronLeft, ChevronRight } from '@lucide/svelte';
	import { buildFilterHref } from '$lib/utils/productFilters';

	type Props = {
		page: number;
		totalPages: number;
	};

	let { page, totalPages }: Props = $props();

	function hrefFor(n: number) {
		return buildFilterHref(pageState.url, (params) => {
			if (n <= 1) params.delete('page');
			else params.set('page', String(n));
		});
	}

	// Windowed page numbers: first, current ±1, last, with ellipses.
	const items = $derived.by<(number | 'gap')[]>(() => {
		if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
		const result: (number | 'gap')[] = [1];
		const start = Math.max(2, page - 1);
		const end = Math.min(totalPages - 1, page + 1);
		if (start > 2) result.push('gap');
		for (let i = start; i <= end; i++) result.push(i);
		if (end < totalPages - 1) result.push('gap');
		result.push(totalPages);
		return result;
	});
</script>

{#if totalPages > 1}
	<nav aria-label="Pagination" class="mt-8 flex items-center justify-center gap-1">
		<!-- Prev -->
		{#if page > 1}
			<a
				href={hrefFor(page - 1)}
				class="inline-flex size-9 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-700 transition hover:bg-neutral-50"
				aria-label="Previous page"
			>
				<ChevronLeft class="size-4" />
			</a>
		{:else}
			<span
				aria-hidden="true"
				class="inline-flex size-9 items-center justify-center rounded-md border border-neutral-200 bg-neutral-50 text-neutral-300"
			>
				<ChevronLeft class="size-4" />
			</span>
		{/if}

		<!-- Numbered pages (hidden on very small screens) -->
		<div class="hidden items-center gap-1 sm:flex">
			{#each items as item, i (i)}
				{#if item === 'gap'}
					<span class="px-2 text-neutral-400">…</span>
				{:else if item === page}
					<span
						aria-current="page"
						class="bg-brand-green inline-flex size-9 items-center justify-center rounded-md text-sm font-semibold text-white"
					>
						{item}
					</span>
				{:else}
					<a
						href={hrefFor(item)}
						class="inline-flex size-9 items-center justify-center rounded-md border border-neutral-200 bg-white text-sm text-neutral-700 transition hover:bg-neutral-50"
					>
						{item}
					</a>
				{/if}
			{/each}
		</div>

		<!-- Compact "Page X of Y" on mobile -->
		<span class="text-muted-foreground px-3 text-sm sm:hidden">
			Page {page} of {totalPages}
		</span>

		<!-- Next -->
		{#if page < totalPages}
			<a
				href={hrefFor(page + 1)}
				class="inline-flex size-9 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-700 transition hover:bg-neutral-50"
				aria-label="Next page"
			>
				<ChevronRight class="size-4" />
			</a>
		{:else}
			<span
				aria-hidden="true"
				class="inline-flex size-9 items-center justify-center rounded-md border border-neutral-200 bg-neutral-50 text-neutral-300"
			>
				<ChevronRight class="size-4" />
			</span>
		{/if}
	</nav>
{/if}
