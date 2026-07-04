<script lang="ts">
	import { untrack } from 'svelte';
	import { goto } from '$app/navigation';
	import { page as pageState } from '$app/state';
	import { Slider } from 'bits-ui';
	import * as Sheet from '$lib/components/ui/sheet';
	import { formatPrice } from '$lib/utils/formatPrice';
	import { buildFilterHref, type ListingFilters } from '$lib/utils/productFilters';
	import { X } from '@lucide/svelte';

	type Props = {
		open: boolean;
		onOpenChange: (v: boolean) => void;
		filters: ListingFilters;
		priceBounds: { min: number; max: number };
	};

	let { open, onOpenChange, filters, priceBounds }: Props = $props();

	const step = 100;
	const sliderMin = $derived(Math.floor(priceBounds.min / step) * step);
	const sliderMax = $derived(
		Math.max(sliderMin + step, Math.ceil(priceBounds.max / step) * step)
	);

	let range = $state<[number, number]>(untrack(() => [sliderMin, sliderMax]));
	let instock = $state<boolean>(untrack(() => filters.instock));

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
		showCloseButton={false}
		class="bg-white! flex w-full flex-col gap-0 p-0 text-neutral-900 sm:max-w-md!"
	>
		<Sheet.Header class="flex flex-row items-center justify-between border-b border-black/5 p-5">
			<div>
				<Sheet.Title class="text-lg font-bold text-neutral-900">Filters</Sheet.Title>
				<Sheet.Description class="text-xs text-neutral-500">
					Refine by price and availability
				</Sheet.Description>
			</div>
			<Sheet.Close
				class="inline-flex items-center gap-1.5 text-sm text-neutral-600 transition-colors hover:text-neutral-900"
			>
				<X class="size-4" />
				<span>Close</span>
			</Sheet.Close>
		</Sheet.Header>

		<div class="flex-1 space-y-6 overflow-y-auto p-5">
			<!-- Price range slider -->
			<section>
				<h3 class="text-sm font-bold text-neutral-900">Filter by price</h3>

				<Slider.Root
					type="multiple"
					bind:value={range}
					min={sliderMin}
					max={sliderMax}
					{step}
					class="relative mt-6 flex h-5 w-full touch-none items-center select-none"
				>
					<span class="relative h-1 w-full grow overflow-hidden rounded-full bg-neutral-200">
						<Slider.Range class="bg-brand-charcoal absolute h-full" />
					</span>
					<Slider.Thumb
						index={0}
						class="focus-visible:ring-brand-green block size-5 rounded-full border-2 border-neutral-900 bg-white shadow transition-colors focus-visible:ring-2 focus-visible:outline-none"
					/>
					<Slider.Thumb
						index={1}
						class="focus-visible:ring-brand-green block size-5 rounded-full border-2 border-neutral-900 bg-white shadow transition-colors focus-visible:ring-2 focus-visible:outline-none"
					/>
				</Slider.Root>

				<p class="mt-4 text-sm text-neutral-600">
					Price:
					<span class="font-semibold text-neutral-900">{formatPrice(range[0])}</span>
					<span class="mx-1">—</span>
					<span class="font-semibold text-neutral-900">{formatPrice(range[1])}</span>
				</p>
			</section>

			<div class="h-px bg-black/5"></div>

			<!-- Availability -->
			<section>
				<h3 class="text-sm font-bold text-neutral-900">Availability</h3>
				<label class="mt-3 flex cursor-pointer items-center gap-3 text-sm text-neutral-800">
					<input
						type="checkbox"
						bind:checked={instock}
						class="size-4 rounded border-neutral-400 accent-neutral-900"
					/>
					<span>Show only in-stock items</span>
				</label>
			</section>
		</div>

		<div class="space-y-3 border-t border-black/5 p-5">
			<button
				type="button"
				onclick={apply}
				class="bg-brand-charcoal hover:bg-brand-charcoal-hover inline-flex w-full cursor-pointer items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold text-white transition"
			>
				Apply filters
			</button>
			<button
				type="button"
				onclick={clearAll}
				class="inline-flex w-full items-center justify-center rounded-full bg-neutral-100 px-4 py-2.5 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-200"
			>
				Clear all
			</button>
		</div>
	</Sheet.Content>
</Sheet.Root>
