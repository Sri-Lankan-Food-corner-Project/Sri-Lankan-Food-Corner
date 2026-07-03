<script lang="ts">
	import { goto } from '$app/navigation';
	import { page as pageState } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Sheet from '$lib/components/ui/sheet';
	import { buildFilterHref, type ListingFilters } from '$lib/utils/productFilters';

	type Props = {
		open: boolean;
		onOpenChange: (v: boolean) => void;
		filters: ListingFilters;
	};

	let { open, onOpenChange, filters }: Props = $props();

	let minInput = $state<string>(filters.min === null ? '' : String(filters.min));
	let maxInput = $state<string>(filters.max === null ? '' : String(filters.max));
	let instock = $state<boolean>(filters.instock);

	// Re-sync when the sheet opens with fresh URL state
	$effect(() => {
		if (open) {
			minInput = filters.min === null ? '' : String(filters.min);
			maxInput = filters.max === null ? '' : String(filters.max);
			instock = filters.instock;
		}
	});

	function apply() {
		const href = buildFilterHref(pageState.url, (params) => {
			const minN = minInput.trim() === '' ? null : parseInt(minInput, 10);
			const maxN = maxInput.trim() === '' ? null : parseInt(maxInput, 10);
			if (minN !== null && Number.isFinite(minN) && minN >= 0) {
				params.set('min', String(minN));
			} else {
				params.delete('min');
			}
			if (maxN !== null && Number.isFinite(maxN) && maxN >= 0) {
				params.set('max', String(maxN));
			} else {
				params.delete('max');
			}
			if (instock) params.set('instock', '1');
			else params.delete('instock');
			params.delete('page');
		});
		onOpenChange(false);
		goto(href, { noScroll: true, keepFocus: true });
	}

	function clearAll() {
		minInput = '';
		maxInput = '';
		instock = false;
	}
</script>

<Sheet.Root {open} {onOpenChange}>
	<Sheet.Content side="right" class="w-full sm:max-w-md">
		<Sheet.Header>
			<Sheet.Title>Filters</Sheet.Title>
			<Sheet.Description>Narrow down products by price and availability.</Sheet.Description>
		</Sheet.Header>

		<div class="flex-1 space-y-6 overflow-y-auto px-4 py-2">
			<div class="space-y-2">
				<Label>Price range (₩)</Label>
				<div class="grid grid-cols-2 gap-3">
					<div>
						<Label for="filter-min" class="text-muted-foreground text-xs">Min</Label>
						<Input
							id="filter-min"
							type="number"
							min="0"
							inputmode="numeric"
							placeholder="0"
							bind:value={minInput}
						/>
					</div>
					<div>
						<Label for="filter-max" class="text-muted-foreground text-xs">Max</Label>
						<Input
							id="filter-max"
							type="number"
							min="0"
							inputmode="numeric"
							placeholder="Any"
							bind:value={maxInput}
						/>
					</div>
				</div>
			</div>

			<div>
				<label class="flex cursor-pointer items-center gap-3 text-sm">
					<input
						type="checkbox"
						bind:checked={instock}
						class="border-input size-4 rounded border"
					/>
					<span>Show only in-stock items</span>
				</label>
			</div>
		</div>

		<Sheet.Footer class="flex-row gap-2">
			<Button type="button" variant="outline" class="flex-1" onclick={clearAll}>Clear</Button>
			<Button type="button" class="flex-1" onclick={apply}>Apply filters</Button>
		</Sheet.Footer>
	</Sheet.Content>
</Sheet.Root>
