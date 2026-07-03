<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { showConfirm } from '$lib/stores/confirm';
	import { MapPin, Pencil, Plus, Star, Trash2 } from '@lucide/svelte';

	let { data } = $props();

	type FormState = {
		id: string | null;
		label: string;
		fullName: string;
		phone: string;
		street: string;
		houseNumber: string;
		roomNumber: string;
		accessCode: string;
		city: string;
		postcode: string;
		isDefault: boolean;
	};

	const emptyForm: FormState = {
		id: null,
		label: '',
		fullName: '',
		phone: '',
		street: '',
		houseNumber: '',
		roomNumber: '',
		accessCode: '',
		city: '',
		postcode: '',
		isDefault: false
	};

	let editing = $state<FormState | null>(null);
	let saving = $state(false);

	function startAdd() {
		editing = { ...emptyForm };
	}

	function startEdit(a: (typeof data.addresses)[number]) {
		editing = {
			id: a.id,
			label: a.label ?? '',
			fullName: a.fullName,
			phone: a.phone,
			street: a.street,
			houseNumber: a.houseNumber ?? '',
			roomNumber: a.roomNumber ?? '',
			accessCode: a.accessCode ?? '',
			city: a.city,
			postcode: a.postcode,
			isDefault: a.isDefault
		};
	}

	async function save() {
		if (!editing || saving) return;
		saving = true;
		try {
			const fd = new FormData();
			if (editing.id) fd.set('addressId', editing.id);
			fd.set('label', editing.label);
			fd.set('fullName', editing.fullName);
			fd.set('phone', editing.phone);
			fd.set('street', editing.street);
			fd.set('houseNumber', editing.houseNumber);
			fd.set('roomNumber', editing.roomNumber);
			fd.set('accessCode', editing.accessCode);
			fd.set('city', editing.city);
			fd.set('postcode', editing.postcode);
			if (editing.isDefault) fd.set('isDefault', 'on');

			const res = await fetch('?/save', { method: 'POST', body: fd });
			const raw = await res.json();
			const parsed = raw?.data ? JSON.parse(raw.data) : null;
			if (parsed?.error) {
				toast.error(parsed.error);
				return;
			}
			editing = null;
			await invalidateAll();
			toast.success('Address saved');
		} catch (err) {
			console.error(err);
			toast.error('Could not save. Please try again.');
		} finally {
			saving = false;
		}
	}

	async function del(id: string) {
		const ok = await showConfirm({
			title: 'Delete this address?',
			description: 'This will remove the address from your address book. This cannot be undone.',
			confirmLabel: 'Delete',
			destructive: true
		});
		if (!ok) return;
		try {
			const fd = new FormData();
			fd.set('addressId', id);
			await fetch('?/delete', { method: 'POST', body: fd });
			await invalidateAll();
			toast.success('Address deleted');
		} catch {
			toast.error('Could not delete. Please try again.');
		}
	}
</script>

<div class="space-y-6">
	{#if data.addresses.length === 0}
		<div
			class="bg-brand-cream ring-brand-charcoal/10 rounded-2xl p-10 text-center ring-1"
		>
			<MapPin class="text-brand-charcoal/30 mx-auto size-14" />
			<h2 class="mt-4 text-xl font-bold text-neutral-900">No addresses saved yet</h2>
			<p class="mt-2 text-sm text-neutral-500">
				Add an address to speed up checkout next time.
			</p>
			<button
				type="button"
				onclick={startAdd}
				class="bg-brand-charcoal hover:bg-brand-charcoal-hover mt-6 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white transition"
			>
				<Plus class="size-4" />
				Add an address
			</button>
		</div>
	{:else}
		<div class="flex items-center justify-between">
			<h2 class="text-lg font-bold text-neutral-900">Saved addresses</h2>
			<button
				type="button"
				onclick={startAdd}
				class="bg-brand-charcoal hover:bg-brand-charcoal-hover inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white transition"
			>
				<Plus class="size-4" />
				Add new
			</button>
		</div>

		<div class="grid gap-4 sm:grid-cols-2">
			{#each data.addresses as a (a.id)}
				<div class="bg-brand-cream ring-brand-charcoal/10 rounded-2xl p-5 ring-1">
					<div class="flex items-start justify-between gap-3">
						<div class="min-w-0 flex-1">
							<div class="flex flex-wrap items-center gap-2">
								<p class="text-sm font-bold text-neutral-900">
									{a.label ?? a.fullName}
								</p>
								{#if a.isDefault}
									<span
										class="bg-brand-green/10 text-brand-green inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
									>
										<Star class="size-3 fill-current" /> Default
									</span>
								{/if}
							</div>
							<p class="mt-1 text-xs text-neutral-600">{a.fullName} · {a.phone}</p>
							<p class="mt-0.5 text-xs text-neutral-600">
								{a.street}{a.houseNumber ? `, ${a.houseNumber}` : ''}{a.roomNumber
									? `, ${a.roomNumber}`
									: ''}
							</p>
							<p class="text-xs text-neutral-600">{a.city} {a.postcode}</p>
						</div>
						<div class="flex shrink-0 gap-1">
							<button
								type="button"
								onclick={() => startEdit(a)}
								class="rounded-lg p-1.5 text-neutral-500 transition hover:bg-white hover:text-neutral-900"
								aria-label="Edit address"
							>
								<Pencil class="size-3.5" />
							</button>
							<button
								type="button"
								onclick={() => del(a.id)}
								class="rounded-lg p-1.5 text-neutral-500 transition hover:bg-red-50 hover:text-red-600"
								aria-label="Delete address"
							>
								<Trash2 class="size-3.5" />
							</button>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}

	{#if editing}
		<div class="bg-brand-cream ring-brand-charcoal/10 rounded-2xl p-6 ring-1">
			<h3 class="text-lg font-bold text-neutral-900">
				{editing.id ? 'Edit address' : 'Add address'}
			</h3>
			<div class="mt-5 grid gap-4 sm:grid-cols-2">
				<label class="block sm:col-span-2">
					<span class="mb-1 block text-xs font-medium text-neutral-700">
						Label <span class="text-neutral-400">(optional)</span>
					</span>
					<input
						type="text"
						autocomplete="off"
						bind:value={editing.label}
						placeholder="Home / Office"
						class="focus:border-brand-green w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
					/>
				</label>
				<label class="block">
					<span class="mb-1 block text-xs font-medium text-neutral-700">
						Full Name <span class="text-red-500">*</span>
					</span>
					<input
						type="text"
						required
						autocomplete="off"
						bind:value={editing.fullName}
						class="focus:border-brand-green w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
					/>
				</label>
				<label class="block">
					<span class="mb-1 block text-xs font-medium text-neutral-700">
						Phone <span class="text-red-500">*</span>
					</span>
					<input
						type="tel"
						required
						autocomplete="off"
						bind:value={editing.phone}
						placeholder="010-0000-0000"
						class="focus:border-brand-green w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
					/>
				</label>
				<label class="block sm:col-span-2">
					<span class="mb-1 block text-xs font-medium text-neutral-700">
						Street Address <span class="text-red-500">*</span>
					</span>
					<input
						type="text"
						required
						autocomplete="off"
						bind:value={editing.street}
						class="focus:border-brand-green w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
					/>
				</label>
				<label class="block">
					<span class="mb-1 block text-xs font-medium text-neutral-700">House Number</span>
					<input
						type="text"
						autocomplete="off"
						bind:value={editing.houseNumber}
						class="focus:border-brand-green w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
					/>
				</label>
				<label class="block">
					<span class="mb-1 block text-xs font-medium text-neutral-700">Room / Unit</span>
					<input
						type="text"
						autocomplete="off"
						bind:value={editing.roomNumber}
						class="focus:border-brand-green w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
					/>
				</label>
				<label class="block">
					<span class="mb-1 block text-xs font-medium text-neutral-700">
						City <span class="text-red-500">*</span>
					</span>
					<input
						type="text"
						required
						autocomplete="off"
						bind:value={editing.city}
						class="focus:border-brand-green w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
					/>
				</label>
				<label class="block">
					<span class="mb-1 block text-xs font-medium text-neutral-700">
						Postcode <span class="text-red-500">*</span>
					</span>
					<input
						type="text"
						required
						autocomplete="off"
						bind:value={editing.postcode}
						class="focus:border-brand-green w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
					/>
				</label>
				<label class="block sm:col-span-2">
					<span class="mb-1 block text-xs font-medium text-neutral-700">Access Code</span>
					<input
						type="text"
						autocomplete="off"
						bind:value={editing.accessCode}
						class="focus:border-brand-green w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
					/>
				</label>
				<label class="flex items-center gap-2 text-sm text-neutral-700 sm:col-span-2">
					<input
						type="checkbox"
						bind:checked={editing.isDefault}
						class="text-brand-green focus:ring-brand-green size-4 rounded border-neutral-300"
					/>
					Set as default address
				</label>
			</div>

			<div class="mt-6 flex justify-end gap-2">
				<button
					type="button"
					onclick={() => (editing = null)}
					class="rounded-full border border-neutral-300 bg-white px-5 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
				>
					Cancel
				</button>
				<button
					type="button"
					onclick={save}
					disabled={saving}
					class="bg-brand-charcoal hover:bg-brand-charcoal-hover rounded-full px-5 py-2 text-sm font-semibold text-white transition disabled:opacity-70"
				>
					{saving ? 'Saving…' : 'Save address'}
				</button>
			</div>
		</div>
	{/if}
</div>
