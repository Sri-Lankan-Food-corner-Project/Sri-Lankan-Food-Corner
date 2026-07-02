<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Table from '$lib/components/ui/table';
	import { Pencil, Trash2, Plus } from '@lucide/svelte';

	let { data, form } = $props();

	let editing = $state<null | (typeof data.categories)[number]>(null);
	let creating = $state(false);
</script>

<div class="flex items-center justify-between">
	<h1 class="text-2xl font-bold">Categories</h1>
	<Button onclick={() => (creating = true)}>
		<Plus class="mr-2 size-4" /> New category
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
						<Button variant="ghost" size="icon" onclick={() => (editing = c)}>
							<Pencil class="size-4" />
						</Button>
						<form
							method="POST"
							action="?/delete"
							use:enhance
							class="inline"
							onsubmit={(e) => {
								if (!confirm(`Delete category "${c.name}"?`)) e.preventDefault();
							}}
						>
							<input type="hidden" name="id" value={c.id} />
							<Button type="submit" variant="ghost" size="icon">
								<Trash2 class="text-destructive size-4" />
							</Button>
						</form>
					</Table.Cell>
				</Table.Row>
			{:else}
				<Table.Row>
					<Table.Cell colspan={4} class="text-muted-foreground text-center py-8">
						No categories yet. Click "New category" to add one.
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
		<form
			method="POST"
			action="?/create"
			use:enhance={() => {
				return async ({ result, update }) => {
					if (result.type === 'success') creating = false;
					await update();
				};
			}}
			class="grid gap-4"
		>
			<div class="grid gap-2">
				<Label for="new-name">Name</Label>
				<Input id="new-name" name="name" required />
			</div>
			<div class="grid gap-2">
				<Label for="new-slug">Slug (auto if blank)</Label>
				<Input id="new-slug" name="slug" placeholder="e.g. spices" />
			</div>
			<div class="grid gap-2">
				<Label for="new-desc">Description</Label>
				<Textarea id="new-desc" name="description" rows={3} />
			</div>
			<div class="grid gap-2">
				<Label for="new-sort">Sort order</Label>
				<Input id="new-sort" name="sortOrder" type="number" value="0" />
			</div>
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
		{#if editing}
			<form
				method="POST"
				action="?/update"
				use:enhance={() => {
					return async ({ result, update }) => {
						if (result.type === 'success') editing = null;
						await update();
					};
				}}
				class="grid gap-4"
			>
				<input type="hidden" name="id" value={editing.id} />
				<div class="grid gap-2">
					<Label for="edit-name">Name</Label>
					<Input id="edit-name" name="name" value={editing.name} required />
				</div>
				<div class="grid gap-2">
					<Label for="edit-slug">Slug</Label>
					<Input id="edit-slug" name="slug" value={editing.slug} required />
				</div>
				<div class="grid gap-2">
					<Label for="edit-desc">Description</Label>
					<Textarea id="edit-desc" name="description" rows={3} value={editing.description ?? ''} />
				</div>
				<div class="grid gap-2">
					<Label for="edit-sort">Sort order</Label>
					<Input id="edit-sort" name="sortOrder" type="number" value={editing.sortOrder ?? 0} />
				</div>
				<Dialog.Footer>
					<Button type="button" variant="outline" onclick={() => (editing = null)}>Cancel</Button>
					<Button type="submit">Save</Button>
				</Dialog.Footer>
			</form>
		{/if}
	</Dialog.Content>
</Dialog.Root>
