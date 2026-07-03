<script lang="ts">
	import { untrack } from 'svelte';
	import { enhance } from '$app/forms';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Table from '$lib/components/ui/table';
	import ConfirmDialog from '$lib/components/admin/ConfirmDialog.svelte';
	import {
		Pencil,
		Trash2,
		Plus,
		ArrowUp,
		ArrowDown,
		Package,
		X,
		Search
	} from '@lucide/svelte';
	import { homeSectionSchema, HOME_SECTION_TYPES } from '$lib/schemas/homeSection';
	import { formatPrice } from '$lib/utils/formatPrice';

	let { data } = $props();

	type Section = (typeof data.sections)[number];

	let creating = $state(false);
	let editing = $state<Section | null>(null);
	let deleting = $state<Section | null>(null);
	let managingId = $state<string | null>(null);
	const managing = $derived(
		managingId ? (data.sections.find((s) => s.id === managingId) ?? null) : null
	);
	let pickerSearch = $state('');

	const typeLabels: Record<(typeof HOME_SECTION_TYPES)[number], string> = {
		manual: 'Manual pick',
		category: 'By category',
		newest: 'Newest products',
		discounted: 'On sale'
	};

	const create = superForm(untrack(() => data.createForm), {
		id: 'create',
		validators: zodClient(homeSectionSchema),
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
		validators: zodClient(homeSectionSchema),
		resetForm: false,
		onUpdated: ({ form }) => {
			if (form.valid && !form.message) editing = null;
		}
	});
	const editForm = edit.form;
	const editErrors = edit.errors;
	const editMessage = edit.message;

	function openCreate() {
		$createForm.title = '';
		$createForm.subtitle = '';
		$createForm.type = 'newest';
		$createForm.categoryId = null;
		$createForm.limit = 12;
		$createForm.sortOrder = (data.sections.at(-1)?.sortOrder ?? -1) + 1;
		$createForm.isActive = true;
		creating = true;
	}

	function openEdit(s: Section) {
		$editForm.id = s.id;
		$editForm.title = s.title;
		$editForm.subtitle = s.subtitle ?? '';
		$editForm.type = s.type as (typeof HOME_SECTION_TYPES)[number];
		$editForm.categoryId = s.categoryId;
		$editForm.limit = s.limit;
		$editForm.sortOrder = s.sortOrder;
		$editForm.isActive = s.isActive;
		editing = s;
	}

	function openManage(s: Section) {
		pickerSearch = '';
		managingId = s.id;
	}

	const pickedIdsForManaged = $derived(
		managing ? new Set(managing.picks.map((p) => p.productId)) : new Set<string>()
	);

	const filteredPickerProducts = $derived.by(() => {
		const q = pickerSearch.trim().toLowerCase();
		if (!q) return data.products;
		return data.products.filter((p) => p.name.toLowerCase().includes(q));
	});
</script>

<div class="flex items-center justify-between">
	<div>
		<h1 class="text-2xl font-bold">Home sections</h1>
		<p class="text-muted-foreground mt-1 text-sm">
			Sliders shown on the storefront home page. Reorder them with the arrows.
		</p>
	</div>
	<Button onclick={openCreate}>
		<Plus class="mr-2 size-4" /> New section
	</Button>
</div>

<div class="bg-card mt-6 rounded-md border">
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head class="w-28">Order</Table.Head>
				<Table.Head>Title</Table.Head>
				<Table.Head>Type</Table.Head>
				<Table.Head class="w-20">Limit</Table.Head>
				<Table.Head class="w-24">Status</Table.Head>
				<Table.Head class="w-56 text-right">Actions</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each data.sections as s, i (s.id)}
				<Table.Row>
					<Table.Cell>
						<div class="flex items-center gap-1">
							<form method="POST" action="?/move" use:enhance>
								<input type="hidden" name="id" value={s.id} />
								<input type="hidden" name="direction" value="up" />
								<Button
									type="submit"
									variant="ghost"
									size="icon"
									disabled={i === 0}
									aria-label="Move up"
								>
									<ArrowUp class="size-4" />
								</Button>
							</form>
							<form method="POST" action="?/move" use:enhance>
								<input type="hidden" name="id" value={s.id} />
								<input type="hidden" name="direction" value="down" />
								<Button
									type="submit"
									variant="ghost"
									size="icon"
									disabled={i === data.sections.length - 1}
									aria-label="Move down"
								>
									<ArrowDown class="size-4" />
								</Button>
							</form>
						</div>
					</Table.Cell>
					<Table.Cell>
						<div class="font-medium">{s.title}</div>
						{#if s.subtitle}
							<div class="text-muted-foreground text-xs">{s.subtitle}</div>
						{/if}
					</Table.Cell>
					<Table.Cell class="text-sm">
						{typeLabels[s.type as keyof typeof typeLabels] ?? s.type}
						{#if s.type === 'category' && s.categoryName}
							<span class="text-muted-foreground"> · {s.categoryName}</span>
						{/if}
						{#if s.type === 'manual'}
							<span class="text-muted-foreground"> · {s.picks.length} picked</span>
						{/if}
					</Table.Cell>
					<Table.Cell>{s.limit}</Table.Cell>
					<Table.Cell>
						{#if s.isActive}
							<span class="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
								Active
							</span>
						{:else}
							<span class="inline-flex rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
								Hidden
							</span>
						{/if}
					</Table.Cell>
					<Table.Cell class="text-right">
						{#if s.type === 'manual'}
							<Button variant="ghost" size="icon" aria-label="Manage products" onclick={() => openManage(s)}>
								<Package class="size-4" />
							</Button>
						{/if}
						<Button variant="ghost" size="icon" onclick={() => openEdit(s)} aria-label="Edit">
							<Pencil class="size-4" />
						</Button>
						<Button variant="ghost" size="icon" onclick={() => (deleting = s)} aria-label="Delete">
							<Trash2 class="text-destructive size-4" />
						</Button>
					</Table.Cell>
				</Table.Row>
			{:else}
				<Table.Row>
					<Table.Cell colspan={6} class="text-muted-foreground py-8 text-center">
						No sections yet. Add one to show product sliders on the home page.
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
			<Dialog.Title>New home section</Dialog.Title>
		</Dialog.Header>
		<form method="POST" action="?/create" use:create.enhance class="grid gap-4">
			<div class="grid gap-2">
				<Label for="c-title">Title</Label>
				<Input
					id="c-title"
					name="title"
					bind:value={$createForm.title}
					aria-invalid={$createErrors.title ? 'true' : undefined}
				/>
				{#if $createErrors.title}
					<p class="text-destructive text-xs">{$createErrors.title}</p>
				{/if}
			</div>
			<div class="grid gap-2">
				<Label for="c-subtitle">Subtitle (optional)</Label>
				<Input id="c-subtitle" name="subtitle" bind:value={$createForm.subtitle} />
			</div>
			<div class="grid gap-2">
				<Label for="c-type">Type</Label>
				<select
					id="c-type"
					name="type"
					bind:value={$createForm.type}
					class="border-input bg-background rounded-md border px-3 py-2 text-sm"
				>
					{#each HOME_SECTION_TYPES as t (t)}
						<option value={t}>{typeLabels[t]}</option>
					{/each}
				</select>
			</div>
			{#if $createForm.type === 'category'}
				<div class="grid gap-2">
					<Label for="c-category">Category</Label>
					<select
						id="c-category"
						name="categoryId"
						bind:value={$createForm.categoryId}
						class="border-input bg-background rounded-md border px-3 py-2 text-sm"
						aria-invalid={$createErrors.categoryId ? 'true' : undefined}
					>
						<option value={null}>Select a category…</option>
						{#each data.categories as c (c.id)}
							<option value={c.id}>{c.name}</option>
						{/each}
					</select>
					{#if $createErrors.categoryId}
						<p class="text-destructive text-xs">{$createErrors.categoryId}</p>
					{/if}
				</div>
			{/if}
			<div class="grid grid-cols-2 gap-4">
				<div class="grid gap-2">
					<Label for="c-limit">Max products</Label>
					<Input id="c-limit" name="limit" type="number" min="1" max="50" bind:value={$createForm.limit} />
				</div>
				<div class="grid gap-2">
					<Label for="c-sort">Sort order</Label>
					<Input id="c-sort" name="sortOrder" type="number" bind:value={$createForm.sortOrder} />
				</div>
			</div>
			<label class="flex items-center gap-2 text-sm">
				<input type="checkbox" name="isActive" bind:checked={$createForm.isActive} />
				Show on home page
			</label>
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
			<Dialog.Title>Edit home section</Dialog.Title>
		</Dialog.Header>
		<form method="POST" action="?/update" use:edit.enhance class="grid gap-4">
			<input type="hidden" name="id" value={$editForm.id} />
			<div class="grid gap-2">
				<Label for="e-title">Title</Label>
				<Input
					id="e-title"
					name="title"
					bind:value={$editForm.title}
					aria-invalid={$editErrors.title ? 'true' : undefined}
				/>
				{#if $editErrors.title}
					<p class="text-destructive text-xs">{$editErrors.title}</p>
				{/if}
			</div>
			<div class="grid gap-2">
				<Label for="e-subtitle">Subtitle</Label>
				<Input id="e-subtitle" name="subtitle" bind:value={$editForm.subtitle} />
			</div>
			<div class="grid gap-2">
				<Label for="e-type">Type</Label>
				<select
					id="e-type"
					name="type"
					bind:value={$editForm.type}
					class="border-input bg-background rounded-md border px-3 py-2 text-sm"
				>
					{#each HOME_SECTION_TYPES as t (t)}
						<option value={t}>{typeLabels[t]}</option>
					{/each}
				</select>
			</div>
			{#if $editForm.type === 'category'}
				<div class="grid gap-2">
					<Label for="e-category">Category</Label>
					<select
						id="e-category"
						name="categoryId"
						bind:value={$editForm.categoryId}
						class="border-input bg-background rounded-md border px-3 py-2 text-sm"
						aria-invalid={$editErrors.categoryId ? 'true' : undefined}
					>
						<option value={null}>Select a category…</option>
						{#each data.categories as c (c.id)}
							<option value={c.id}>{c.name}</option>
						{/each}
					</select>
					{#if $editErrors.categoryId}
						<p class="text-destructive text-xs">{$editErrors.categoryId}</p>
					{/if}
				</div>
			{/if}
			<div class="grid grid-cols-2 gap-4">
				<div class="grid gap-2">
					<Label for="e-limit">Max products</Label>
					<Input id="e-limit" name="limit" type="number" min="1" max="50" bind:value={$editForm.limit} />
				</div>
				<div class="grid gap-2">
					<Label for="e-sort">Sort order</Label>
					<Input id="e-sort" name="sortOrder" type="number" bind:value={$editForm.sortOrder} />
				</div>
			</div>
			<label class="flex items-center gap-2 text-sm">
				<input type="checkbox" name="isActive" bind:checked={$editForm.isActive} />
				Show on home page
			</label>
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

<!-- Product picker dialog (manual sections) -->
<Dialog.Root open={managing !== null} onOpenChange={(v) => !v && (managingId = null)}>
	<Dialog.Content class="max-w-2xl">
		<Dialog.Header>
			<Dialog.Title>Products in "{managing?.title}"</Dialog.Title>
			<Dialog.Description>
				Click a product to add it to this section. Products appear on the storefront in the order they're added.
			</Dialog.Description>
		</Dialog.Header>

		{#if managing}
			<div class="grid gap-4">
				<!-- Currently picked -->
				<div>
					<div class="text-muted-foreground mb-2 text-xs font-semibold uppercase">
						In this section ({managing.picks.length})
					</div>
					{#if managing.picks.length === 0}
						<p class="text-muted-foreground text-sm italic">No products picked yet.</p>
					{:else}
						<ul class="flex flex-wrap gap-2">
							{#each managing.picks as pick (pick.productId)}
								<li class="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-sm">
									<span>{pick.productName}</span>
									<form method="POST" action="?/removeProduct" use:enhance>
										<input type="hidden" name="sectionId" value={managing.id} />
										<input type="hidden" name="productId" value={pick.productId} />
										<button
											type="submit"
											class="text-muted-foreground hover:text-destructive"
											aria-label="Remove {pick.productName}"
										>
											<X class="size-3.5" />
										</button>
									</form>
								</li>
							{/each}
						</ul>
					{/if}
				</div>

				<!-- Add products -->
				<div>
					<div class="relative mb-2">
						<Search class="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
						<Input
							type="search"
							placeholder="Search products…"
							bind:value={pickerSearch}
							class="pl-9"
						/>
					</div>
					<div class="max-h-72 overflow-y-auto rounded-md border">
						<ul class="divide-y">
							{#each filteredPickerProducts as p (p.id)}
								{@const alreadyPicked = pickedIdsForManaged.has(p.id)}
								<li class="flex items-center justify-between gap-3 px-3 py-2">
									<div class="flex min-w-0 items-center gap-3">
										<div class="bg-brand-sand size-10 shrink-0 overflow-hidden rounded">
											{#if p.imageUrl}
												<img src={p.imageUrl} alt="" class="h-full w-full object-cover" />
											{/if}
										</div>
										<div class="min-w-0">
											<div class="truncate text-sm font-medium">{p.name}</div>
											<div class="text-muted-foreground text-xs">{formatPrice(p.price)}</div>
										</div>
									</div>
									{#if alreadyPicked}
										<span class="text-muted-foreground text-xs">Added</span>
									{:else}
										<form method="POST" action="?/addProduct" use:enhance>
											<input type="hidden" name="sectionId" value={managing.id} />
											<input type="hidden" name="productId" value={p.id} />
											<Button type="submit" variant="outline" size="sm">
												<Plus class="mr-1 size-3.5" /> Add
											</Button>
										</form>
									{/if}
								</li>
							{:else}
								<li class="text-muted-foreground px-3 py-6 text-center text-sm">
									No products match.
								</li>
							{/each}
						</ul>
					</div>
				</div>
			</div>
		{/if}

		<Dialog.Footer>
			<Button type="button" variant="outline" onclick={() => (managingId = null)}>Done</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Delete confirm -->
<ConfirmDialog
	open={deleting !== null}
	onOpenChange={(v) => !v && (deleting = null)}
	title="Delete section?"
	description={`Remove "${deleting?.title ?? ''}" from the home page? Product data isn't affected.`}
	confirmLabel="Delete"
	variant="destructive"
	action="?/delete"
	hiddenFields={deleting ? { id: deleting.id } : {}}
/>
