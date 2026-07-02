<script lang="ts">
	import { untrack } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Switch } from '$lib/components/ui/switch';
	import { slugify } from '$lib/utils/slugify';

	type Category = { id: string; name: string };
	type ProductInput = {
		id?: string;
		name?: string;
		slug?: string;
		categoryId?: string | null;
		price?: number;
		unit?: string | null;
		stockQuantity?: number;
		description?: string | null;
		isActive?: boolean | null;
	};

	let {
		product = {},
		categories = [],
		submitLabel = 'Save'
	}: { product?: ProductInput; categories?: Category[]; submitLabel?: string } = $props();

	let name = $state(untrack(() => product.name ?? ''));
	let slug = $state(untrack(() => product.slug ?? ''));
	let slugTouched = $state(untrack(() => Boolean(product.slug)));
	let isActive = $state(untrack(() => product.isActive ?? true));

	function handleNameInput(e: Event) {
		name = (e.target as HTMLInputElement).value;
		if (!slugTouched) slug = slugify(name);
	}
</script>

<div class="grid max-w-2xl gap-4">
	<div class="grid gap-2">
		<Label for="name">Name</Label>
		<Input id="name" name="name" value={name} oninput={handleNameInput} required />
	</div>

	<div class="grid gap-2">
		<Label for="slug">Slug</Label>
		<Input
			id="slug"
			name="slug"
			bind:value={slug}
			oninput={() => (slugTouched = true)}
			required
		/>
		<p class="text-muted-foreground text-xs">
			Used in the product URL (/products/{slug || 'your-slug'}).
		</p>
	</div>

	<div class="grid gap-2">
		<Label for="categoryId">Category</Label>
		<select
			id="categoryId"
			name="categoryId"
			class="border-input bg-background focus-visible:ring-ring rounded-md border px-3 py-2 text-sm focus-visible:ring-1 focus-visible:outline-none"
		>
			<option value="">— None —</option>
			{#each categories as c (c.id)}
				<option value={c.id} selected={product.categoryId === c.id}>{c.name}</option>
			{/each}
		</select>
	</div>

	<div class="grid grid-cols-2 gap-4">
		<div class="grid gap-2">
			<Label for="price">Price (KRW)</Label>
			<Input
				id="price"
				name="price"
				type="number"
				min="0"
				step="1"
				value={product.price ?? 0}
				required
			/>
		</div>
		<div class="grid gap-2">
			<Label for="unit">Unit</Label>
			<Input id="unit" name="unit" value={product.unit ?? ''} placeholder="e.g. 500g, 1 pack" />
		</div>
	</div>

	<div class="grid gap-2">
		<Label for="stockQuantity">Stock quantity</Label>
		<Input
			id="stockQuantity"
			name="stockQuantity"
			type="number"
			min="0"
			step="1"
			value={product.stockQuantity ?? 0}
			required
		/>
	</div>

	<div class="grid gap-2">
		<Label for="description">Description</Label>
		<Textarea
			id="description"
			name="description"
			rows={5}
			value={product.description ?? ''}
		/>
	</div>

	<div class="flex items-center justify-between rounded-md border p-4">
		<div>
			<Label for="isActive" class="text-base">Active</Label>
			<p class="text-muted-foreground text-sm">Show this product on the storefront.</p>
		</div>
		<Switch id="isActive" name="isActive" bind:checked={isActive} />
	</div>

	<div class="flex justify-end gap-2">
		<Button type="submit">{submitLabel}</Button>
	</div>
</div>
