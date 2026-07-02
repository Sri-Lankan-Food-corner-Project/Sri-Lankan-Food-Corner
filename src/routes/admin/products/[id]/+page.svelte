<script lang="ts">
	import ProductForm from '$lib/components/admin/ProductForm.svelte';
	import { Button } from '$lib/components/ui/button';
	import { ChevronLeft, Trash2 } from '@lucide/svelte';

	let { data, form } = $props();
</script>

<div class="mb-4 flex items-center justify-between">
	<div class="flex items-center gap-2">
		<Button href="/admin/products" variant="ghost" size="icon">
			<ChevronLeft class="size-4" />
		</Button>
		<h1 class="text-2xl font-bold">Edit product</h1>
	</div>

	<form
		method="POST"
		action="?/delete"
		onsubmit={(e) => {
			if (!confirm(`Delete "${data.product.name}"? This cannot be undone.`)) e.preventDefault();
		}}
	>
		<Button type="submit" variant="destructive" size="sm">
			<Trash2 class="mr-2 size-4" /> Delete
		</Button>
	</form>
</div>

{#if form?.error}
	<p class="text-destructive mb-4 text-sm">{form.error}</p>
{/if}

<form method="POST" action="?/update">
	<ProductForm product={data.product} categories={data.categories} submitLabel="Save changes" />
</form>
