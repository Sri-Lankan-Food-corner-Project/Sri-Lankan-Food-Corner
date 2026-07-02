<script lang="ts">
	import { untrack } from 'svelte';
	import type { SuperForm } from 'sveltekit-superforms';
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Switch } from '$lib/components/ui/switch';
	import { slugify } from '$lib/utils/slugify';
	import { cn } from '$lib/utils';
	import { X, Upload } from '@lucide/svelte';
	import type { ProductInput } from '$lib/schemas/product';

	type Category = { id: string; name: string };
	type ExistingImage = { id: string; imageUrl: string };

	let {
		superform,
		categories = [],
		existingImages = [],
		submitLabel = 'Save',
		action = ''
	}: {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		superform: SuperForm<ProductInput, any>;
		categories?: Category[];
		existingImages?: ExistingImage[];
		submitLabel?: string;
		action?: string;
	} = $props();

	const { form, errors } = untrack(() => superform);

	let slugTouched = $state(untrack(() => Boolean($form.slug)));
	let toRemove = $state<string[]>([]);
	let fileInput = $state<HTMLInputElement | null>(null);
	let newFiles = $state<File[]>([]);
	let previews = $derived(newFiles.map((f) => URL.createObjectURL(f)));

	function handleNameInput(e: Event) {
		$form.name = (e.target as HTMLInputElement).value;
		if (!slugTouched) $form.slug = slugify($form.name);
	}

	function toggleRemove(id: string) {
		toRemove = toRemove.includes(id)
			? toRemove.filter((i) => i !== id)
			: [...toRemove, id];
	}

	// Accumulate across multiple picker opens. DataTransfer lets us both build
	// up the selection AND keep those files in the actual file input, so the
	// browser includes them in the form submission.
	function handleFilesChange(e: Event) {
		const input = e.target as HTMLInputElement;
		if (!input.files) return;
		const dt = new DataTransfer();
		for (const f of newFiles) dt.items.add(f);
		for (const f of Array.from(input.files)) dt.items.add(f);
		input.files = dt.files;
		newFiles = Array.from(dt.files);
	}

	function removeNewFile(i: number) {
		if (!fileInput) return;
		const dt = new DataTransfer();
		for (let j = 0; j < newFiles.length; j++) {
			if (j !== i) dt.items.add(newFiles[j]);
		}
		fileInput.files = dt.files;
		newFiles = Array.from(dt.files);
	}
</script>

<form
	method="POST"
	enctype="multipart/form-data"
	{action}
	use:enhance
	class="grid max-w-2xl gap-4"
>
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

	<!-- Images -->
	<div class="grid gap-2">
		<Label>Product images</Label>

		{#if existingImages.length > 0}
			<div class="grid grid-cols-4 gap-2">
				{#each existingImages as img (img.id)}
					{@const marked = toRemove.includes(img.id)}
					<div class="relative aspect-square overflow-hidden rounded-md border">
						<img
							src={img.imageUrl}
							alt=""
							class={cn('h-full w-full object-cover', marked && 'opacity-30 grayscale')}
						/>
						<button
							type="button"
							onclick={() => toggleRemove(img.id)}
							aria-label={marked ? 'Undo remove' : 'Remove image'}
							class="bg-background/90 absolute top-1 right-1 rounded-full p-1 shadow"
						>
							<X class="size-3" />
						</button>
						{#if marked}
							<span class="bg-destructive text-destructive-foreground absolute bottom-1 left-1 rounded px-1.5 py-0.5 text-[10px] font-medium">
								Will remove
							</span>
						{/if}
					</div>
				{/each}
			</div>
		{/if}

		<input type="hidden" name="removedImageIds" value={toRemove.join(',')} />

		{#if newFiles.length > 0}
			<div class="grid grid-cols-4 gap-2">
				{#each newFiles as file, i (file.name + i)}
					<div class="bg-muted relative aspect-square overflow-hidden rounded-md border">
						<img src={previews[i]} alt="" class="h-full w-full object-cover" />
						<button
							type="button"
							onclick={() => removeNewFile(i)}
							aria-label="Remove selection"
							class="bg-background/90 absolute top-1 right-1 rounded-full p-1 shadow"
						>
							<X class="size-3" />
						</button>
					</div>
				{/each}
			</div>
		{/if}

		<label
			class="border-input hover:bg-accent/50 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed p-6 text-center transition-colors"
		>
			<Upload class="text-muted-foreground size-5" />
			<span class="text-sm">Click to select images</span>
			<span class="text-muted-foreground text-xs">JPEG/PNG/WebP — max 10 MB each</span>
			<input
				bind:this={fileInput}
				type="file"
				name="images"
				multiple
				accept="image/*"
				class="hidden"
				onchange={handleFilesChange}
			/>
		</label>
		<p class="text-muted-foreground text-xs">
			Images are resized to 1200px wide and converted to WebP on upload.
		</p>
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
