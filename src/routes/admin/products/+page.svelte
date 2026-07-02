<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Switch } from '$lib/components/ui/switch';
	import { Label } from '$lib/components/ui/label';
	import * as Table from '$lib/components/ui/table';
	import ConfirmDialog from '$lib/components/admin/ConfirmDialog.svelte';
	import { Pencil, Trash2, Plus } from '@lucide/svelte';
	import { formatPrice } from '$lib/utils/formatPrice';

	let { data } = $props();

	type Row = (typeof data.products)[number];

	let deleting = $state<Row | null>(null);
	let toggling = $state<Row | null>(null);

	function handleCategoryChange(e: Event) {
		const value = (e.target as HTMLSelectElement).value;
		const url = new URL(page.url);
		if (value === 'all') url.searchParams.delete('category');
		else url.searchParams.set('category', value);
		goto(url.toString(), { replaceState: true });
	}
</script>

<div class="flex items-center justify-between gap-4">
	<h1 class="text-2xl font-bold">Products</h1>
	<Button href="/admin/products/new">
		<Plus class="mr-2 size-4" /> New product
	</Button>
</div>

<div class="mt-6 flex items-center gap-3">
	<Label for="category-filter" class="text-muted-foreground text-sm">Filter by category</Label>
	<select
		id="category-filter"
		value={data.selectedCategory}
		onchange={handleCategoryChange}
		class="border-input bg-background rounded-md border px-3 py-2 text-sm"
	>
		<option value="all">All categories</option>
		{#each data.categories as c (c.id)}
			<option value={c.id}>{c.name}</option>
		{/each}
	</select>
	<span class="text-muted-foreground text-sm">
		{data.products.length} product{data.products.length === 1 ? '' : 's'}
	</span>
</div>

<div class="bg-card mt-4 rounded-md border">
	<Table.Root>
		<Table.Header>
			<Table.Row>
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
						<Switch
							checked={p.isActive}
							onCheckedChange={() => (toggling = p)}
							aria-label={p.isActive ? 'Deactivate' : 'Activate'}
						/>
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
					<Table.Cell colspan={6} class="text-muted-foreground py-8 text-center">
						{data.selectedCategory === 'all'
							? 'No products yet. Click "New product" to add one.'
							: 'No products in this category.'}
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>

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
