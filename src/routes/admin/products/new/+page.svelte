<script lang="ts">
	import { untrack } from 'svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import ProductForm from '$lib/components/admin/ProductForm.svelte';
	import { Button } from '$lib/components/ui/button';
	import { ChevronLeft } from '@lucide/svelte';
	import { productSchema } from '$lib/schemas/product';

	let { data } = $props();

	const sf = superForm(untrack(() => data.form), {
		validators: zodClient(productSchema)
	});

	const message = sf.message;

	$effect(() => {
		if ($message) toast.error($message);
	});
</script>

<div class="mb-4 flex items-center gap-2">
	<Button href="/admin/products" variant="ghost" size="icon">
		<ChevronLeft class="size-4" />
	</Button>
	<h1 class="text-2xl font-bold">New product</h1>
</div>

{#if $message}
	<p class="text-destructive mb-4 text-sm">{$message}</p>
{/if}

<ProductForm
	superform={sf}
	categories={data.categories}
	submitLabel="Create product"
	submittingLabel="Creating…"
/>
