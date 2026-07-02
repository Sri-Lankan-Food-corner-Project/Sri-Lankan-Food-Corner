<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Switch } from '$lib/components/ui/switch';
	import { Label } from '$lib/components/ui/label';
	import * as Table from '$lib/components/ui/table';
	import { Pencil, Trash2, Plus } from '@lucide/svelte';
	import { formatPrice } from '$lib/utils/formatPrice';

	let { data, form } = $props();

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

{#if form?.error}
	<p class="text-destructive mt-4 text-sm">{form.error}</p>
{/if}

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
						<form
							method="POST"
							action="?/toggleActive"
							use:enhance
							class="inline"
							id="toggle-{p.id}"
						>
							<input type="hidden" name="id" value={p.id} />
							<input type="hidden" name="isActive" value={p.isActive ? 'false' : 'true'} />
							<Switch
								checked={p.isActive ?? false}
								onCheckedChange={() =>
									(document.getElementById(`toggle-${p.id}`) as HTMLFormElement)?.requestSubmit()}
								aria-label={p.isActive ? 'Deactivate' : 'Activate'}
							/>
						</form>
					</Table.Cell>
					<Table.Cell class="text-right">
						<Button href="/admin/products/{p.id}" variant="ghost" size="icon">
							<Pencil class="size-4" />
						</Button>
						<form
							method="POST"
							action="?/delete"
							use:enhance
							class="inline"
							onsubmit={(e) => {
								if (!confirm(`Delete "${p.name}"?`)) e.preventDefault();
							}}
						>
							<input type="hidden" name="id" value={p.id} />
							<Button type="submit" variant="ghost" size="icon">
								<Trash2 class="text-destructive size-4" />
							</Button>
						</form>
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
