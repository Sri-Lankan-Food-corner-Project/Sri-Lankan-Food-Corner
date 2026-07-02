<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import * as Table from '$lib/components/ui/table';
	import { Pencil, Trash2, Plus } from '@lucide/svelte';
	import { formatPrice } from '$lib/utils/formatPrice';

	let { data, form } = $props();
</script>

<div class="flex items-center justify-between">
	<h1 class="text-2xl font-bold">Products</h1>
	<Button href="/admin/products/new">
		<Plus class="mr-2 size-4" /> New product
	</Button>
</div>

{#if form?.error}
	<p class="text-destructive mt-4 text-sm">{form.error}</p>
{/if}

<div class="bg-card mt-6 rounded-md border">
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head>Name</Table.Head>
				<Table.Head>Category</Table.Head>
				<Table.Head class="text-right">Price</Table.Head>
				<Table.Head class="text-right">Stock</Table.Head>
				<Table.Head>Status</Table.Head>
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
					<Table.Cell class="text-right">{formatPrice(p.price)}</Table.Cell>
					<Table.Cell class="text-right">
						<span class={p.stockQuantity === 0 ? 'text-destructive' : ''}>
							{p.stockQuantity}
						</span>
					</Table.Cell>
					<Table.Cell>
						{#if p.isActive}
							<Badge>Active</Badge>
						{:else}
							<Badge variant="secondary">Hidden</Badge>
						{/if}
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
					<Table.Cell colspan={6} class="text-muted-foreground text-center py-8">
						No products yet. Click "New product" to add one.
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>
