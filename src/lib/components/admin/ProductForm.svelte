<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import type { Product, Category } from '$lib/types/product';

	let {
		product,
		categories = []
	}: { product?: Partial<Product>; categories?: Category[] } = $props();
</script>

<form method="POST" enctype="multipart/form-data" class="grid gap-4 max-w-2xl">
	<div class="grid gap-2">
		<Label for="name">Name</Label>
		<Input id="name" name="name" value={product?.name ?? ''} required />
	</div>

	<div class="grid gap-2">
		<Label for="slug">Slug</Label>
		<Input id="slug" name="slug" value={product?.slug ?? ''} required />
	</div>

	<div class="grid gap-2">
		<Label for="category">Category</Label>
		<select
			id="category"
			name="categoryId"
			class="border-input bg-background rounded-md border px-3 py-2 text-sm"
		>
			<option value="">— None —</option>
			{#each categories as c (c.id)}
				<option value={c.id} selected={product?.categoryId === c.id}>{c.name}</option>
			{/each}
		</select>
	</div>

	<div class="grid grid-cols-2 gap-4">
		<div class="grid gap-2">
			<Label for="price">Price (KRW)</Label>
			<Input id="price" name="price" type="number" min="0" value={product?.price ?? 0} required />
		</div>
		<div class="grid gap-2">
			<Label for="unit">Unit</Label>
			<Input id="unit" name="unit" value={product?.unit ?? ''} placeholder="e.g. 500g" />
		</div>
	</div>

	<div class="grid gap-2">
		<Label for="stock">Stock quantity</Label>
		<Input
			id="stock"
			name="stockQuantity"
			type="number"
			min="0"
			value={product?.stockQuantity ?? 0}
			required
		/>
	</div>

	<div class="grid gap-2">
		<Label for="description">Description</Label>
		<textarea
			id="description"
			name="description"
			rows="4"
			class="border-input bg-background rounded-md border px-3 py-2 text-sm"
		>{product?.description ?? ''}</textarea>
	</div>

	<div class="grid gap-2">
		<Label for="images">Product images</Label>
		<Input id="images" name="images" type="file" accept="image/*" multiple />
		<p class="text-muted-foreground text-xs">
			Uploaded to Cloudflare R2 via the server route (never directly from the browser).
		</p>
	</div>

	<div class="flex justify-end gap-2">
		<Button type="submit">Save</Button>
	</div>
</form>
