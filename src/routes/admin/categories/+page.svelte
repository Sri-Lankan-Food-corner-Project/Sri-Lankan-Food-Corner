<script lang="ts">
	import { untrack } from 'svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Table from '$lib/components/ui/table';
	import ConfirmDialog from '$lib/components/admin/ConfirmDialog.svelte';
	import { Pencil, Trash2, Plus } from '@lucide/svelte';
	import { categorySchema } from '$lib/schemas/category';
	import { slugify } from '$lib/utils/slugify';

	let { data } = $props();

	let creating = $state(false);
	let editing = $state<null | (typeof data.categories)[number]>(null);
	let deletingId = $state<string | null>(null);
	let deletingName = $state('');

	const create = superForm(untrack(() => data.createForm), {
		id: 'create',
		validators: zodClient(categorySchema),
		resetForm: true,
		onUpdated: ({ form }) => {
			if (form.valid && !form.message) creating = false;
		}
	});
	const createForm = create.form;
	const createErrors = create.errors;
	const createMessage = create.message;

	const edit = superForm(untrack(() => data.editForm), {
		id: 'edit',
		validators: zodClient(categorySchema),
		resetForm: false,
		onUpdated: ({ form }) => {
			if (form.valid && !form.message) editing = null;
		}
	});
	const editForm = edit.form;
	const editErrors = edit.errors;
	const editMessage = edit.message;

	function openCreate() {
		$createForm.name = '';
		$createForm.slug = '';
		$createForm.description = '';
		$createForm.sortOrder = 0;
		creating = true;
	}

	function openEdit(c: (typeof data.categories)[number]) {
		$editForm.id = c.id;
		$editForm.name = c.name;
		$editForm.slug = c.slug;
		$editForm.description = c.description ?? '';
		$editForm.sortOrder = c.sortOrder ?? 0;
		editing = c;
	}

	function openDelete(c: (typeof data.categories)[number]) {
		deletingId = c.id;
		deletingName = c.name;
	}

	function autoSlug(base: string) {
		return slugify(base);
	}
</script>

<div class="flex items-center justify-between">
	<h1 class="text-2xl font-bold">Categories</h1>
	<Button onclick={openCreate}>
		<Plus class="mr-2 size-4" /> New category
	</Button>
</div>

<div class="bg-card mt-6 rounded-md border">
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head>Name</Table.Head>
				<Table.Head>Slug</Table.Head>
				<Table.Head class="w-24">Sort</Table.Head>
				<Table.Head class="w-32 text-right">Actions</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each data.categories as c (c.id)}
				<Table.Row>
					<Table.Cell class="font-medium">{c.name}</Table.Cell>
					<Table.Cell class="text-muted-foreground text-sm">{c.slug}</Table.Cell>
					<Table.Cell>{c.sortOrder}</Table.Cell>
					<Table.Cell class="text-right">
						<Button variant="ghost" size="icon" onclick={() => openEdit(c)}>
							<Pencil class="size-4" />
						</Button>
						<Button variant="ghost" size="icon" onclick={() => openDelete(c)}>
							<Trash2 class="text-destructive size-4" />
						</Button>
					</Table.Cell>
				</Table.Row>
			{:else}
				<Table.Row>
					<Table.Cell colspan={4} class="text-muted-foreground py-8 text-center">
						No categories yet.
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>

<!-- Create dialog -->
<Dialog.Root bind:open={creating}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>New category</Dialog.Title>
			<Dialog.Description>Add a product category.</Dialog.Description>
		</Dialog.Header>
		<form method="POST" action="?/create" use:create.enhance class="grid gap-4">
			<div class="grid gap-2">
				<Label for="c-name">Name</Label>
				<Input
					id="c-name"
					name="name"
					bind:value={$createForm.name}
					oninput={() => ($createForm.slug = autoSlug($createForm.name))}
					aria-invalid={$createErrors.name ? 'true' : undefined}
				/>
				{#if $createErrors.name}
					<p class="text-destructive text-xs">{$createErrors.name}</p>
				{/if}
			</div>
			<div class="grid gap-2">
				<Label for="c-slug">Slug</Label>
				<Input
					id="c-slug"
					name="slug"
					bind:value={$createForm.slug}
					aria-invalid={$createErrors.slug ? 'true' : undefined}
				/>
				{#if $createErrors.slug}
					<p class="text-destructive text-xs">{$createErrors.slug}</p>
				{/if}
			</div>
			<div class="grid gap-2">
				<Label for="c-desc">Description</Label>
				<Textarea id="c-desc" name="description" rows={3} bind:value={$createForm.description} />
			</div>
			<div class="grid gap-2">
				<Label for="c-sort">Sort order</Label>
				<Input id="c-sort" name="sortOrder" type="number" bind:value={$createForm.sortOrder} />
			</div>
			{#if $createMessage}
				<p class="text-destructive text-sm">{$createMessage}</p>
			{/if}
			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => (creating = false)}>Cancel</Button>
				<Button type="submit">Create</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Edit dialog -->
<Dialog.Root open={editing !== null} onOpenChange={(v) => !v && (editing = null)}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Edit category</Dialog.Title>
		</Dialog.Header>
		<form method="POST" action="?/update" use:edit.enhance class="grid gap-4">
			<input type="hidden" name="id" value={$editForm.id} />
			<div class="grid gap-2">
				<Label for="e-name">Name</Label>
				<Input
					id="e-name"
					name="name"
					bind:value={$editForm.name}
					aria-invalid={$editErrors.name ? 'true' : undefined}
				/>
				{#if $editErrors.name}
					<p class="text-destructive text-xs">{$editErrors.name}</p>
				{/if}
			</div>
			<div class="grid gap-2">
				<Label for="e-slug">Slug</Label>
				<Input
					id="e-slug"
					name="slug"
					bind:value={$editForm.slug}
					aria-invalid={$editErrors.slug ? 'true' : undefined}
				/>
				{#if $editErrors.slug}
					<p class="text-destructive text-xs">{$editErrors.slug}</p>
				{/if}
			</div>
			<div class="grid gap-2">
				<Label for="e-desc">Description</Label>
				<Textarea id="e-desc" name="description" rows={3} bind:value={$editForm.description} />
			</div>
			<div class="grid gap-2">
				<Label for="e-sort">Sort order</Label>
				<Input id="e-sort" name="sortOrder" type="number" bind:value={$editForm.sortOrder} />
			</div>
			{#if $editMessage}
				<p class="text-destructive text-sm">{$editMessage}</p>
			{/if}
			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => (editing = null)}>Cancel</Button>
				<Button type="submit">Save</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Delete confirm -->
<ConfirmDialog
	open={deletingId !== null}
	onOpenChange={(v) => !v && (deletingId = null)}
	title="Delete category?"
	description={`Delete category "${deletingName}"? Products in this category won't be deleted â€” they'll just become uncategorized.`}
	confirmLabel="Delete"
	variant="destructive"
	action="?/delete"
	hiddenFields={deletingId ? { id: deletingId } : {}}
/>
