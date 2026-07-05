<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { toast } from 'svelte-sonner';

	let { data, form } = $props();

	let saving = $state(false);
</script>

<div class="space-y-6">
	<div class="bg-brand-cream ring-brand-charcoal/10 rounded-2xl p-6 ring-1">
		<h2 class="text-lg font-bold text-neutral-900">Account details</h2>
		<p class="mt-1 text-sm text-neutral-500">Update your personal information.</p>

		{#if form?.error}
			<div
				class="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800"
				role="alert"
			>
				{form.error}
			</div>
		{/if}

		<form
			method="POST"
			action="?/update"
			use:enhance={() => {
				saving = true;
				return async ({ result, update }) => {
					await update();
					saving = false;
					if (result.type === 'success' && result.data?.saved) {
						toast.success('Details updated');
						await invalidateAll();
					} else if (result.type === 'failure') {
						toast.error(String(result.data?.error ?? 'Could not update.'));
					}
				};
			}}
			class="mt-5 grid gap-4 sm:grid-cols-2"
		>
			<label class="block sm:col-span-2">
				<span class="mb-1 block text-xs font-medium text-neutral-700">
					Name <span class="text-red-500">*</span>
				</span>
				<input
					name="name"
					type="text"
					required
					autocomplete="name"
					value={data.user?.name ?? ''}
					class="focus:border-brand-green w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 focus:outline-none"
				/>
			</label>

			<label class="block">
				<span class="mb-1 block text-xs font-medium text-neutral-700">Email</span>
				<input
					type="email"
					value={data.user?.email ?? ''}
					disabled
					class="w-full cursor-not-allowed rounded-lg border border-neutral-200 bg-neutral-100 px-4 py-2.5 text-sm text-neutral-500 focus:outline-none"
				/>
				<span class="mt-1 block text-[11px] text-neutral-500">
					Email changes need re-verification — please contact us.
				</span>
			</label>

			<label class="block">
				<span class="mb-1 block text-xs font-medium text-neutral-700">Phone</span>
				<input
					name="phone"
					type="tel"
					autocomplete="tel"
					value={data.user?.phone ?? ''}
					placeholder="010-0000-0000"
					class="focus:border-brand-green w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
				/>
			</label>

			<div class="flex justify-end sm:col-span-2">
				<button
					type="submit"
					disabled={saving}
					class="bg-brand-charcoal cursor-pointer hover:bg-brand-charcoal-hover rounded-full px-6 py-2.5 text-sm font-semibold text-white transition disabled:opacity-70"
				>
					{saving ? 'Saving…' : 'Save changes'}
				</button>
			</div>
		</form>
	</div>
</div>
