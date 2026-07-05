<script lang="ts">
	import { invalidateAll, goto } from '$app/navigation';
	import { page } from '$app/state';
	import { toast } from 'svelte-sonner';
	import { Check, Trash2, X } from '@lucide/svelte';
	import * as Table from '$lib/components/ui/table';
	import Pagination from '$lib/components/catalog/Pagination.svelte';
	import StarRating from '$lib/components/StarRating.svelte';
	import { showConfirm } from '$lib/stores/confirm';
	import { REVIEW_STATUSES, REVIEW_STATUS_LABELS, type ReviewStatus } from '$lib/schemas/reviewStatus';

	let { data } = $props();

	let acting = $state<string | null>(null);
	let rejecting = $state<string | null>(null);
	let rejectNote = $state('');

	function fmtDate(d: Date | string | null): string {
		if (!d) return '';
		const dt = typeof d === 'string' ? new Date(d) : d;
		return dt.toLocaleString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function statusFilterHref(status: 'all' | ReviewStatus) {
		const url = new URL(page.url.href);
		url.searchParams.delete('page');
		if (status === 'all') url.searchParams.delete('status');
		else url.searchParams.set('status', status);
		return url.pathname + url.search;
	}

	async function approve(id: string) {
		if (acting) return;
		acting = id;
		try {
			const fd = new FormData();
			fd.set('id', id);
			await fetch('?/approve', { method: 'POST', body: fd });
			await invalidateAll();
			toast.success('Review approved');
		} catch {
			toast.error('Could not approve');
		} finally {
			acting = null;
		}
	}

	async function confirmReject() {
		if (!rejecting || acting) return;
		const id = rejecting;
		acting = id;
		try {
			const fd = new FormData();
			fd.set('id', id);
			fd.set('adminNote', rejectNote.trim());
			await fetch('?/reject', { method: 'POST', body: fd });
			await invalidateAll();
			toast.success('Review rejected');
			rejecting = null;
			rejectNote = '';
		} catch {
			toast.error('Could not reject');
		} finally {
			acting = null;
		}
	}

	async function del(id: string) {
		const ok = await showConfirm({
			title: 'Delete this review?',
			description: 'This will permanently remove the review. This cannot be undone.',
			confirmLabel: 'Delete',
			destructive: true
		});
		if (!ok) return;
		acting = id;
		try {
			const fd = new FormData();
			fd.set('id', id);
			await fetch('?/delete', { method: 'POST', body: fd });
			await invalidateAll();
			toast.success('Review deleted');
		} catch {
			toast.error('Could not delete');
		} finally {
			acting = null;
		}
	}

	const statusColor: Record<ReviewStatus, string> = {
		pending: 'bg-amber-100 text-amber-800',
		approved: 'bg-green-100 text-green-800',
		rejected: 'bg-red-100 text-red-700'
	};
</script>

<div class="space-y-6">
	<div class="flex flex-wrap items-center justify-between gap-4">
		<div>
			<h1 class="text-2xl font-bold text-neutral-900">Reviews</h1>
			<p class="text-sm text-neutral-500">{data.total} total</p>
		</div>
	</div>

	<!-- Status filter tabs -->
	<div class="flex flex-wrap gap-2">
		<a
			href={statusFilterHref('all')}
			class="rounded-full border px-4 py-1.5 text-sm font-medium transition {data.selectedStatus ===
			'all'
				? 'border-brand-green bg-brand-green text-white'
				: 'border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50'}"
		>
			All
		</a>
		{#each REVIEW_STATUSES as s (s)}
			<a
				href={statusFilterHref(s)}
				class="rounded-full border px-4 py-1.5 text-sm font-medium transition {data.selectedStatus ===
				s
					? 'border-brand-green bg-brand-green text-white'
					: 'border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50'}"
			>
				{REVIEW_STATUS_LABELS[s]}
			</a>
		{/each}
	</div>

	{#if data.reviews.length === 0}
		<div class="rounded-2xl border border-dashed border-neutral-300 bg-white p-16 text-center">
			<p class="text-sm text-neutral-500">No reviews match this filter.</p>
		</div>
	{:else}
		<div class="rounded-lg border">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Product</Table.Head>
						<Table.Head>Customer</Table.Head>
						<Table.Head>Rating</Table.Head>
						<Table.Head>Review</Table.Head>
						<Table.Head>Submitted</Table.Head>
						<Table.Head>Status</Table.Head>
						<Table.Head class="text-right">Actions</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.reviews as r (r.id)}
						<Table.Row>
							<Table.Cell>
								<a
									href={`/products/${r.productSlug}`}
									target="_blank"
									rel="noopener"
									class="text-sm font-medium text-neutral-900 hover:underline"
								>
									{r.productName}
								</a>
							</Table.Cell>
							<Table.Cell>
								<div class="text-sm text-neutral-900">{r.authorName}</div>
								<div class="text-xs text-neutral-500">{r.authorEmail}</div>
							</Table.Cell>
							<Table.Cell>
								<StarRating value={r.rating} size="sm" />
							</Table.Cell>
							<Table.Cell class="max-w-md">
								{#if r.title}
									<p class="text-sm font-semibold text-neutral-900">{r.title}</p>
								{/if}
								<p class="text-sm text-neutral-700 line-clamp-3 whitespace-pre-line">{r.body}</p>
								{#if r.adminNote}
									<p class="mt-1 text-[10px] italic text-neutral-500">Note: {r.adminNote}</p>
								{/if}
							</Table.Cell>
							<Table.Cell class="text-xs text-neutral-500">{fmtDate(r.createdAt)}</Table.Cell>
							<Table.Cell>
								<span
									class="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold {statusColor[
										r.status
									]}"
								>
									{REVIEW_STATUS_LABELS[r.status]}
								</span>
							</Table.Cell>
							<Table.Cell class="text-right">
								<div class="inline-flex items-center gap-1">
									{#if r.status !== 'approved'}
										<button
											type="button"
											onclick={() => approve(r.id)}
											disabled={acting === r.id}
											aria-label="Approve"
											class="cursor-pointer rounded-lg p-1.5 text-green-600 transition hover:bg-green-50 disabled:opacity-50"
										>
											<Check class="size-4" />
										</button>
									{/if}
									{#if r.status !== 'rejected'}
										<button
											type="button"
											onclick={() => {
												rejecting = r.id;
												rejectNote = r.adminNote ?? '';
											}}
											disabled={acting === r.id}
											aria-label="Reject"
											class="cursor-pointer rounded-lg p-1.5 text-amber-600 transition hover:bg-amber-50 disabled:opacity-50"
										>
											<X class="size-4" />
										</button>
									{/if}
									<button
										type="button"
										onclick={() => del(r.id)}
										disabled={acting === r.id}
										aria-label="Delete"
										class="cursor-pointer rounded-lg p-1.5 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
									>
										<Trash2 class="size-4" />
									</button>
								</div>
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>

		<Pagination page={data.page} totalPages={data.totalPages} />
	{/if}
</div>

<!-- Reject modal — asks for optional admin note -->
{#if rejecting}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
		role="dialog"
		aria-modal="true"
	>
		<div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
			<h2 class="text-lg font-bold text-neutral-900">Reject this review?</h2>
			<p class="mt-1 text-sm text-neutral-600">
				The customer will see the rejection reason on the product page. They can edit and resubmit.
			</p>
			<label class="mt-4 block">
				<span class="mb-1 block text-xs font-medium text-neutral-700">
					Reason <span class="text-neutral-400">(optional)</span>
				</span>
				<textarea
					bind:value={rejectNote}
					rows="3"
					maxlength="500"
					placeholder="e.g. Contains contact information, offensive language, off-topic…"
					class="focus:border-brand-green w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:outline-none"
				></textarea>
			</label>
			<div class="mt-5 flex justify-end gap-2">
				<button
					type="button"
					onclick={() => {
						rejecting = null;
						rejectNote = '';
					}}
					class="cursor-pointer rounded-full border border-neutral-300 bg-white px-5 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
				>
					Cancel
				</button>
				<button
					type="button"
					onclick={confirmReject}
					disabled={acting !== null}
					class="cursor-pointer rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
				>
					Reject
				</button>
			</div>
		</div>
	</div>
{/if}
