<script lang="ts">
	import ProductForm from '$lib/components/admin/ProductForm.svelte';
	import { Button } from '$lib/components/ui/button';
	import { ChevronLeft } from '@lucide/svelte';

	let { data, form } = $props();
</script>

<div class="mb-4 flex items-center gap-2">
	<Button href="/admin/products" variant="ghost" size="icon">
		<ChevronLeft class="size-4" />
	</Button>
	<h1 class="text-2xl font-bold">New product</h1>
</div>

{#if form?.error}
	<p class="text-destructive mb-4 text-sm">{form.error}</p>
{/if}

<form method="POST">
	<ProductForm categories={data.categories} submitLabel="Create product" />
</form>
