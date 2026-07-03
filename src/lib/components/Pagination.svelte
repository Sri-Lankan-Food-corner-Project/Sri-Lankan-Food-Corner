<script lang="ts">
	import { page as pageStore } from '$app/state';
	import { ChevronLeft, ChevronRight } from '@lucide/svelte';

	type Props = {
		page: number;
		pageCount: number;
		/** URL search-param name to update. Defaults to "page". */
		param?: string;
	};

	let { page, pageCount, param = 'page' }: Props = $props();

	function href(target: number): string {
		const p = new URLSearchParams(pageStore.url.searchParams);
		if (target <= 1) p.delete(param);
		else p.set(param, String(target));
		const q = p.toString();
		return q ? `?${q}` : pageStore.url.pathname;
	}

	// Compact page list: [1, ..., current-1, current, current+1, ..., last]
	function pageList(current: number, total: number): (number | 'ellipsis')[] {
		if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

		const pages: (number | 'ellipsis')[] = [1];
		const start = Math.max(2, current - 1);
		const end = Math.min(total - 1, current + 1);

		if (start > 2) pages.push('ellipsis');
		for (let i = start; i <= end; i++) pages.push(i);
		if (end < total - 1) pages.push('ellipsis');
		pages.push(total);

		return pages;
	}

	const pages = $derived(pageList(page, pageCount));
	const hasPrev = $derived(page > 1);
	const hasNext = $derived(page < pageCount);
</script>

{#if pageCount > 1}
	<nav aria-label="Pagination" class="flex items-center justify-center gap-1">
		<a
			href={href(page - 1)}
			aria-label="Previous page"
			aria-disabled={!hasPrev}
			tabindex={hasPrev ? 0 : -1}
			class="inline-flex size-9 items-center justify-center rounded-full text-neutral-700 transition {hasPrev
				? 'hover:bg-brand-charcoal hover:text-white'
				: 'pointer-events-none opacity-40'}"
		>
			<ChevronLeft class="size-4" />
		</a>

		{#each pages as p, i (i)}
			{#if p === 'ellipsis'}
				<span class="px-2 text-sm text-neutral-400">…</span>
			{:else}
				<a
					href={href(p)}
					aria-current={p === page ? 'page' : undefined}
					class="inline-flex size-9 items-center justify-center rounded-full text-sm font-semibold transition {p ===
					page
						? 'bg-brand-charcoal text-white'
						: 'text-neutral-700 hover:bg-brand-charcoal hover:text-white'}"
				>
					{p}
				</a>
			{/if}
		{/each}

		<a
			href={href(page + 1)}
			aria-label="Next page"
			aria-disabled={!hasNext}
			tabindex={hasNext ? 0 : -1}
			class="inline-flex size-9 items-center justify-center rounded-full text-neutral-700 transition {hasNext
				? 'hover:bg-brand-charcoal hover:text-white'
				: 'pointer-events-none opacity-40'}"
		>
			<ChevronRight class="size-4" />
		</a>
	</nav>
{/if}
