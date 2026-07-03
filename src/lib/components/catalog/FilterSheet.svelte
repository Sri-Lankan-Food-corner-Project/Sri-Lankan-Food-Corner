<script lang="ts">
	import { goto } from '$app/navigation';
	import { page as pageState } from '$app/state';
	import { Slider } from 'bits-ui';
	import * as Sheet from '$lib/components/ui/sheet';
	import { formatPrice } from '$lib/utils/formatPrice';
	import { buildFilterHref, type ListingFilters } from '$lib/utils/productFilters';

	type Props = {
		open: boolean;
		onOpenChange: (v: boolean) => void;
		filters: ListingFilters;
		priceBounds: { min: number; max: number };
	};

	let { open, onOpenChange, filters, priceBounds }: Props = $props();

	// Slider snaps to ₩100 increments; if the catalog is truly empty we still
	// need a valid (min ≤ max) range so bits-ui doesn't throw.
	const step = 100;
	const sliderMin = $derived(Math.floor(priceBounds.min / step) * step);
	const sliderMax = $derived(
		Math.max(sliderMin + step, Math.ceil(priceBounds.max / step) * step)
	);

	let range = $state<[number, number]>([sliderMin, sliderMax]);
	let instock = $state<boolean>(filters.instock);

	// Re-sync from URL whenever the sheet opens.
	$effect(() => {
		if (open) {
			const lo = filters.min ?? sliderMin;
			const hi = filters.max ?? sliderMax;
			range = [
				Math.max(sliderMin, Math.min(sliderMax, lo)),
				Math.max(sliderMin, Math.min(sliderMax, hi))
			];
			instock = filters.instock;
		}
	});

	function apply() {
		const href = buildFilterHref(pageState.url, (params) => {
			const [lo, hi] = range;
			if (lo > sliderMin) params.set('min', String(lo));
			else params.delete('min');
			if (hi < sliderMax) params.set('max', String(hi));
			else params.delete('max');
			if (instock) params.set('instock', '1');
			else params.delete('instock');
			params.delete('page');
		});
		onOpenChange(false);
		goto(href, { noScroll: true, keepFocus: true });
	}

	function clearAll() {
		range = [sliderMin, sliderMax];
		instock = false;
	}
</script>

<Sheet.Root {open} {onOpenChange}>
	<Sheet.Content
		side="right"
		class="w-full bg-white text-neutral-900 sm:max-w-md dark:bg-white dark:text-neutral-900"
	>
		<Sheet.Header class="border-b border-neutral-200">
			<Sheet.Title class="text-neutral-900">Filters</Sheet.Title>
			<Sheet.Description class="text-neutral-500">
				Narrow down products by price and availability.
			</Sheet.Description>
		</Sheet.Header>

		<div class="flex-1 space-y-8 overflow-y-auto px-6 py-4">
			<!-- Price range slider -->
			<div>
				<div class="flex items-baseline justify-between">
					<span class="text-sm font-semibold text-neutral-900">Filter by price</span>
				</div>

				<Slider.Root
					type="multiple"
					bind:value={range}
					min={sliderMin}
					max={sliderMax}
					{step}
					class="relative mt-6 flex h-5 w-full touch-none items-center select-none"
				>
					<span class="relative h-1 w-full grow overflow-hidden rounded-full bg-neutral-200">
						<Slider.Range class="bg-brand-green absolute h-full" />
					</span>
					<Slider.Thumb
						index={0}
						class="focus-visible:ring-brand-green block size-5 rounded-full border-2 border-neutral-800 bg-white shadow transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50"
					/>
					<Slider.Thumb
						index={1}
						class="focus-visible:ring-brand-green block size-5 rounded-full border-2 border-neutral-800 bg-white shadow transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50"
					/>
				</Slider.Root>

				<p class="mt-4 text-sm text-neutral-600">
					Price:
					<span class="font-semibold text-neutral-900">{formatPrice(range[0])}</span>
					<span class="mx-1">—</span>
					<span class="font-semibold text-neutral-900">{formatPrice(range[1])}</span>
				</p>
			</div>

			<!-- In-stock -->
			<label class="flex cursor-pointer items-center gap-3 text-sm text-neutral-800">
				<input
					type="checkbox"
					bind:checked={instock}
					class="size-4 rounded border-neutral-400 accent-neutral-900"
				/>
				<span>Show only in-stock items</span>
			</label>
		</div>

		<Sheet.Footer class="flex-row gap-2 border-t border-neutral-200 bg-white p-4">
			<button
				type="button"
				onclick={clearAll}
				class="flex-1 rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
			>
				Clear
			</button>
			<button
				type="button"
				onclick={apply}
				class="bg-brand-green hover:bg-brand-green-hover flex-1 rounded-md px-4 py-2 text-sm font-semibold text-white transition"
			>
				Apply filters
			</button>
		</Sheet.Footer>
	</Sheet.Content>
</Sheet.Root>
