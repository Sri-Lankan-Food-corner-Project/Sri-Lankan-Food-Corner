<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { untrack } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Table from '$lib/components/ui/table';
	import ConfirmDialog from '$lib/components/admin/ConfirmDialog.svelte';
	import { Pencil, Trash2, Plus, ChevronLeft, ChevronRight, Search } from '@lucide/svelte';
	import { formatPrice } from '$lib/utils/formatPrice';
	import { cn } from '$lib/utils';

	let { data } = $props();

	type Row = (typeof data.products)[number];

	let deleting = $state<Row | null>(null);
	let toggling = $state<Row | null>(null);
	let searchValue = $state(untrack(() => data.q));
	let searchTimer: ReturnType<typeof setTimeout> | null = null;

	function updateSearchParams(mutate: (params: URLSearchParams) => void) {
		const url = new URL(page.url);
		mutate(url.searchParams);
		goto(url.toString(), { replaceState: true, keepFocus: true, noScroll: true });
	}

	function handleCategoryChange(e: Event) {
		const value = (e.target as HTMLSelectElement).value;
		updateSearchParams((params) => {
			if (value === 'all') params.delete('category');
			else params.set('category', value);
			params.delete('page');
		});
	}

	function handleSearchInput(e: Event) {
		searchValue = (e.target as HTMLInputElement).value;
		if (searchTimer) clearTimeout(searchTimer);
		searchTimer = setTimeout(() => {
			updateSearchParams((params) => {
				if (searchValue.trim()) params.set('q', searchValue.trim());
				else params.delete('q');
				params.delete('page');
			});
		}, 300);
	}

	function goToPage(n: number) {
		updateSearchParams((params) => {
			if (n <= 1) params.delete('page');
			else params.set('page', String(n));
		});
	}

	const rangeFrom = $derived((data.page - 1) * data.pageSize + 1);
	const rangeTo = $derived(Math.min(data.page * data.pageSize, data.total));
</script>

<div class="flex items-center justify-between gap-4">
	<h1 class="text-2xl font-bold">Products</h1>
	<Button href="/admin/products/new">
		<Plus class="mr-2 size-4" /> New product
	</Button>
</div>

<div class="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
	<div class="flex flex-col gap-3 sm:flex-row sm:items-center">
		<div class="relative">
			<Search class="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
			<Input
				type="search"
				placeholder="Search products…"
				value={searchValue}
				oninput={handleSearchInput}
				class="w-full pl-9 sm:w-72"
			/>
		</div>
		<div class="flex items-center gap-2">
			<Label for="category-filter" class="text-muted-foreground text-sm shrink-0">Category</Label>
			<select
				id="category-filter"
				value={data.selectedCategory}
				onchange={handleCategoryChange}
				class="border-input bg-background rounded-md border px-3 py-2 text-sm"
			>
				<option value="all">All</option>
				{#each data.categories as c (c.id)}
					<option value={c.id}>{c.name}</option>
				{/each}
			</select>
		</div>
	</div>
	<span class="text-muted-foreground text-sm">
		{#if data.total === 0}
			No products
		{:else}
			{rangeFrom}–{rangeTo} of {data.total}
		{/if}
	</span>
</div>

<div class="bg-card mt-4 rounded-md border">
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head class="w-16"></Table.Head>
				<Table.Head>Name</Table.Head>
				<Table.Head>Category</Table.Head>
				<Table.Head class="text-right">Price</Table.Head>
				<Table.Head class="text-right">Stock</Table.Head>
				<Table.Head class="w-24 text-center">Active</Table.Head>
				<Table.Head class="w-32 text-right">Actions</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each data.products as p (p.id)}
				<Table.Row>
					<Table.Cell>
						<div class="bg-muted size-10 overflow-hidden rounded">
							{#if p.imageUrl}
								<img src={p.imageUrl} alt={p.name} class="h-full w-full object-cover" />
							{/if}
						</div>
					</Table.Cell>
					<Table.Cell>
						<div class="font-medium">{p.name}</div>
						{#if p.unit}
							<div class="text-muted-foreground text-xs">{p.unit}</div>
						{/if}
					</Table.Cell>
					<Table.Cell class="text-muted-foreground text-sm">
						{p.categoryName ?? '—'}
					</Table.Cell>
					<Table.Cell class="text-right">
						<div>{formatPrice(p.price)}</div>
						{#if p.compareAtPrice && p.compareAtPrice > p.price}
							<div class="text-muted-foreground text-xs line-through">
								{formatPrice(p.compareAtPrice)}
							</div>
						{/if}
					</Table.Cell>
					<Table.Cell class="text-right">
						{#if p.stockQuantity === 0}
							<Badge variant="destructive">Sold out</Badge>
						{:else}
							<span>{p.stockQuantity}</span>
						{/if}
					</Table.Cell>
					<Table.Cell class="text-center">
						<button
							type="button"
							role="switch"
							aria-checked={p.isActive}
							aria-label={p.isActive ? 'Deactivate' : 'Activate'}
							onclick={() => (toggling = p)}
							class={cn(
								'inline-flex h-[18.4px] w-8 shrink-0 items-center rounded-full border transition-colors',
								p.isActive
									? 'bg-primary border-transparent'
									: 'bg-secondary border-border'
							)}
						>
							<span
								class={cn(
									'block size-4 rounded-full bg-background transition-transform',
									p.isActive ? 'translate-x-3.5' : 'translate-x-0'
								)}
							></span>
						</button>
					</Table.Cell>
					<Table.Cell class="text-right">
						<Button href="/admin/products/{p.id}" variant="ghost" size="icon">
							<Pencil class="size-4" />
						</Button>
						<Button variant="ghost" size="icon" onclick={() => (deleting = p)}>
							<Trash2 class="text-destructive size-4" />
						</Button>
					</Table.Cell>
				</Table.Row>
			{:else}
				<Table.Row>
					<Table.Cell colspan={7} class="text-muted-foreground py-8 text-center">
						{#if data.q}
							No products match "{data.q}".
						{:else if data.selectedCategory === 'all'}
							No products yet. Click "New product" to add one.
						{:else}
							No products in this category.
						{/if}
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>

{#if data.totalPages > 1}
	<div class="mt-4 flex items-center justify-between">
		<p class="text-muted-foreground text-sm">
			Page {data.page} of {data.totalPages}
		</p>
		<div class="flex items-center gap-1">
			<Button
				variant="outline"
				size="sm"
				disabled={data.page <= 1}
				onclick={() => goToPage(data.page - 1)}
			>
				<ChevronLeft class="mr-1 size-4" /> Previous
			</Button>
			<Button
				variant="outline"
				size="sm"
				disabled={data.page >= data.totalPages}
				onclick={() => goToPage(data.page + 1)}
			>
				Next <ChevronRight class="ml-1 size-4" />
			</Button>
		</div>
	</div>
{/if}

<ConfirmDialog
	open={toggling !== null}
	onOpenChange={(v) => !v && (toggling = null)}
	title={toggling?.isActive ? 'Deactivate product?' : 'Activate product?'}
	description={toggling?.isActive
		? `"${toggling?.name}" will be hidden from the storefront until reactivated.`
		: `"${toggling?.name}" will be visible on the storefront.`}
	confirmLabel={toggling?.isActive ? 'Deactivate' : 'Activate'}
	variant={toggling?.isActive ? 'destructive' : 'default'}
	action="?/toggleActive"
	hiddenFields={toggling ? { id: toggling.id, isActive: toggling.isActive ? 'false' : 'true' } : {}}
/>

<ConfirmDialog
	open={deleting !== null}
	onOpenChange={(v) => !v && (deleting = null)}
	title="Delete product?"
	description={`"${deleting?.name}" will be permanently removed. This cannot be undone.`}
	confirmLabel="Delete"
	variant="destructive"
	action="?/delete"
	hiddenFields={deleting ? { id: deleting.id } : {}}
/>
