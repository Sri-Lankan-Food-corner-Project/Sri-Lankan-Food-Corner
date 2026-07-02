<script lang="ts">
	import { untrack } from 'svelte';
	import type { SuperForm } from 'sveltekit-superforms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Switch } from '$lib/components/ui/switch';
	import { slugify } from '$lib/utils/slugify';
	import type { ProductInput } from '$lib/schemas/product';

	type Category = { id: string; name: string };

	let {
		superform,
		categories = [],
		submitLabel = 'Save',
		action = ''
	}: {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		superform: SuperForm<ProductInput, any>;
		categories?: Category[];
		submitLabel?: string;
		action?: string;
	} = $props();

	const { form, errors, enhance } = untrack(() => superform);

	let slugTouched = $state(untrack(() => Boolean($form.slug)));

	function handleNameInput(e: Event) {
		$form.name = (e.target as HTMLInputElement).value;
		if (!slugTouched) $form.slug = slugify($form.name);
	}
</script>

<form method="POST" {action} use:enhance class="grid max-w-2xl gap-4">
	<div class="grid gap-2">
		<Label for="name">Name</Label>
		<Input
			id="name"
			name="name"
			value={$form.name}
			oninput={handleNameInput}
			aria-invalid={$errors.name ? 'true' : undefined}
		/>
		{#if $errors.name}
			<p class="text-destructive text-xs">{$errors.name}</p>
		{/if}
	</div>

	<div class="grid gap-2">
		<Label for="slug">Slug</Label>
		<Input
			id="slug"
			name="slug"
			bind:value={$form.slug}
			oninput={() => (slugTouched = true)}
			aria-invalid={$errors.slug ? 'true' : undefined}
		/>
		{#if $errors.slug}
			<p class="text-destructive text-xs">{$errors.slug}</p>
		{:else}
			<p class="text-muted-foreground text-xs">
				Used in the URL: /products/{$form.slug || 'your-slug'}
			</p>
		{/if}
	</div>

	<div class="grid gap-2">
		<Label for="categoryId">Category</Label>
		<select
			id="categoryId"
			name="categoryId"
			bind:value={$form.categoryId}
			class="border-input bg-background focus-visible:ring-ring rounded-md border px-3 py-2 text-sm focus-visible:ring-1 focus-visible:outline-none"
		>
			<option value={null}>— None —</option>
			{#each categories as c (c.id)}
				<option value={c.id}>{c.name}</option>
			{/each}
		</select>
	</div>

	<div>
		<div class="grid grid-cols-2 gap-4">
			<div class="grid gap-2">
				<Label for="price">Price (KRW)</Label>
				<Input
					id="price"
					name="price"
					type="number"
					min="0"
					step="1"
					bind:value={$form.price}
					aria-invalid={$errors.price ? 'true' : undefined}
				/>
				{#if $errors.price}
					<p class="text-destructive text-xs">{$errors.price}</p>
				{/if}
			</div>
			<div class="grid gap-2">
				<Label for="compareAtPrice">Compare-at price (KRW)</Label>
				<Input
					id="compareAtPrice"
					name="compareAtPrice"
					type="number"
					min="0"
					step="1"
					value={$form.compareAtPrice ?? ''}
					oninput={(e) => {
						const v = (e.target as HTMLInputElement).value;
						$form.compareAtPrice = v === '' ? null : Number(v);
					}}
					placeholder="Optional"
					aria-invalid={$errors.compareAtPrice ? 'true' : undefined}
				/>
				{#if $errors.compareAtPrice}
					<p class="text-destructive text-xs">{$errors.compareAtPrice}</p>
				{/if}
			</div>
		</div>
		<p class="text-muted-foreground mt-2 text-xs">
			Compare-at price is the original price — shown as a strikethrough to signal a discount.
		</p>
	</div>

	<div class="grid gap-2">
		<Label for="unit">Unit</Label>
		<Input
			id="unit"
			name="unit"
			value={$form.unit ?? ''}
			oninput={(e) => {
				const v = (e.target as HTMLInputElement).value;
				$form.unit = v === '' ? null : v;
			}}
			placeholder="e.g. 500g, 1 pack"
		/>
	</div>

	<div class="grid gap-2">
		<Label for="stockQuantity">Stock quantity</Label>
		<Input
			id="stockQuantity"
			name="stockQuantity"
			type="number"
			min="0"
			step="1"
			bind:value={$form.stockQuantity}
			aria-invalid={$errors.stockQuantity ? 'true' : undefined}
		/>
		{#if $errors.stockQuantity}
			<p class="text-destructive text-xs">{$errors.stockQuantity}</p>
		{/if}
	</div>

	<div class="grid gap-2">
		<Label for="description">Description</Label>
		<Textarea
			id="description"
			name="description"
			rows={5}
			value={$form.description ?? ''}
			oninput={(e) => {
				const v = (e.target as HTMLTextAreaElement).value;
				$form.description = v === '' ? null : v;
			}}
		/>
	</div>

	<div class="flex items-center justify-between rounded-md border p-4">
		<div>
			<Label for="isActive" class="text-base">Active</Label>
			<p class="text-muted-foreground text-sm">Show this product on the storefront.</p>
		</div>
		<Switch id="isActive" name="isActive" bind:checked={$form.isActive} />
	</div>

	<div class="flex justify-end gap-2">
		<Button type="submit">{submitLabel}</Button>
	</div>
</form>
