<script lang="ts">
	import { untrack } from 'svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import ProductForm from '$lib/components/admin/ProductForm.svelte';
	import ConfirmDialog from '$lib/components/admin/ConfirmDialog.svelte';
	import { Button } from '$lib/components/ui/button';
	import { ChevronLeft, Trash2 } from '@lucide/svelte';
	import { productSchema } from '$lib/schemas/product';

	let { data } = $props();

	let confirmingDelete = $state(false);

	const sf = superForm(untrack(() => data.form), {
		validators: zodClient(productSchema),
		dataType: 'json'
	});

	const message = sf.message;
</script>

<div class="mb-4 flex items-center justify-between">
	<div class="flex items-center gap-2">
		<Button href="/admin/products" variant="ghost" size="icon">
			<ChevronLeft class="size-4" />
		</Button>
		<h1 class="text-2xl font-bold">Edit product</h1>
	</div>

	<Button variant="destructive" size="sm" onclick={() => (confirmingDelete = true)}>
		<Trash2 class="mr-2 size-4" /> Delete
	</Button>
</div>

{#if $message}
	<p class="text-destructive mb-4 text-sm">{$message}</p>
{/if}

<ProductForm
	superform={sf}
	categories={data.categories}
	submitLabel="Save changes"
	action="?/update"
/>

<ConfirmDialog
	open={confirmingDelete}
	onOpenChange={(v) => (confirmingDelete = v)}
	title="Delete product?"
	description={`"${data.product.name}" will be permanently removed. This cannot be undone.`}
	confirmLabel="Delete"
	variant="destructive"
	action="?/delete"
/>
