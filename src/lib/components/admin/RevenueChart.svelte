<script lang="ts">
	import { formatPrice } from '$lib/utils/formatPrice';

	type Point = {
		day: string; // YYYY-MM-DD
		revenue: number;
		orderCount: number;
	};

	type Props = { data: Point[] };
	let { data }: Props = $props();

	// Compute the max value once — bars scale relative to it. Guard against
	// all-zero data so we don't divide by zero and get NaN heights.
	const maxRevenue = $derived(Math.max(1, ...data.map((d) => d.revenue)));
	const totalRevenue = $derived(data.reduce((sum, d) => sum + d.revenue, 0));
	const totalOrders = $derived(data.reduce((sum, d) => sum + d.orderCount, 0));

	// Hover state — updated by pointer events on each bar
	let hoveredIndex = $state<number | null>(null);
	const hovered = $derived(hoveredIndex === null ? null : data[hoveredIndex]);

	function formatDay(iso: string) {
		const d = new Date(iso + 'T00:00:00');
		return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
	}
</script>

<div class="bg-card rounded-lg border p-4 sm:p-6">
	<div class="flex flex-wrap items-start justify-between gap-3">
		<div>
			<h2 class="text-sm font-semibold text-neutral-500 uppercase tracking-wider">
				Revenue — last 14 days
			</h2>
			<p class="mt-1 text-2xl font-bold sm:text-3xl">{formatPrice(totalRevenue)}</p>
			<p class="text-muted-foreground text-xs">
				{totalOrders} paid {totalOrders === 1 ? 'order' : 'orders'}
			</p>
		</div>

		{#if hovered}
			<div class="text-right">
				<p class="text-muted-foreground text-xs uppercase tracking-wider">
					{formatDay(hovered.day)}
				</p>
				<p class="text-lg font-bold">{formatPrice(hovered.revenue)}</p>
				<p class="text-muted-foreground text-xs">
					{hovered.orderCount} {hovered.orderCount === 1 ? 'order' : 'orders'}
				</p>
			</div>
		{/if}
	</div>

	<!-- Bar chart. Uses a fixed 14-column grid; each cell holds one flex-column that
	     grows from bottom-up to represent revenue as a percentage of the max. -->
	<div class="mt-6 grid grid-cols-14 gap-1 sm:gap-1.5">
		{#each data as point, i (point.day)}
			{@const pct = (point.revenue / maxRevenue) * 100}
			<button
				type="button"
				onmouseenter={() => (hoveredIndex = i)}
				onmouseleave={() => (hoveredIndex = null)}
				onfocus={() => (hoveredIndex = i)}
				onblur={() => (hoveredIndex = null)}
				class="group flex h-32 flex-col justify-end rounded transition sm:h-40"
				aria-label="{formatDay(point.day)}: {formatPrice(point.revenue)}"
			>
				<div
					class="w-full rounded-t bg-neutral-200 transition-all group-hover:bg-brand-green group-focus:bg-brand-green dark:bg-neutral-700 dark:group-hover:bg-brand-amber dark:group-focus:bg-brand-amber {hoveredIndex ===
					i
						? 'bg-brand-green dark:bg-brand-amber'
						: ''}"
					style:height="{Math.max(pct, 2)}%"
				></div>
			</button>
		{/each}
	</div>

	<!-- x-axis labels (only some, to avoid crowding on mobile) -->
	<div class="mt-2 grid grid-cols-14 gap-1 text-[10px] text-neutral-400 sm:gap-1.5 sm:text-xs">
		{#each data as point, i (point.day)}
			<div class="text-center">
				<!-- Show every other label on mobile, every one on desktop -->
				<span class:hidden={i % 2 !== 0} class="sm:!inline">
					{formatDay(point.day).split(' ')[0]}
				</span>
			</div>
		{/each}
	</div>
</div>

<style>
	/* Tailwind doesn't ship grid-cols-14 by default */
	:global(.grid-cols-14) {
		grid-template-columns: repeat(14, minmax(0, 1fr));
	}
</style>
