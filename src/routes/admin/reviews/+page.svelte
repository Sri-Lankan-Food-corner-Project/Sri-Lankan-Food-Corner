<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import { toast } from 'svelte-sonner';
	import { Check, Trash2, X } from '@lucide/svelte';
	import * as Table from '$lib/components/ui/table';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import Pagination from '$lib/components/catalog/Pagination.svelte';
	import StarRating from '$lib/components/StarRating.svelte';
	import ConfirmDialog from '$lib/components/admin/ConfirmDialog.svelte';
	import { REVIEW_STATUSES, REVIEW_STATUS_LABELS, type ReviewStatus } from '$lib/schemas/reviewStatus';

	let { data } = $props();

	let acting = $state<string | null>(null);
	let rejecting = $state<string | null>(null);
	let rejectNote = $state('');
	let rejectSubmitting = $state(false);
	let deleting = $state<string | null>(null);

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

	const statusColor: Record<ReviewStatus, string> = {
		pending: 'bg-amber-100 text-amber-800',
		approved: 'bg-green-100 text-green-800',
		rejected: 'bg-red-100 text-red-700'
	};
</script>

<div class="space-y-6">
	<div class="flex flex-wrap items-center justify-between gap-4">
		<div>
			<h1 class="text-2xl font-bold">Reviews</h1>
			<p class="text-muted-foreground text-sm">{data.total} total</p>
		</div>
	</div>

	<!-- Status filter tabs — shadcn tokens so they adapt in dark mode -->
	<div class="flex flex-wrap gap-2">
		<a
			href={statusFilterHref('all')}
			class="rounded-full border px-4 py-1.5 text-sm font-medium transition {data.selectedStatus ===
			'all'
				? 'border-primary bg-primary text-primary-foreground'
				: 'border-input bg-background hover:bg-accent hover:text-accent-foreground'}"
		>
			All
		</a>
		{#each REVIEW_STATUSES as s (s)}
			<a
				href={statusFilterHref(s)}
				class="rounded-full border px-4 py-1.5 text-sm font-medium transition {data.selectedStatus ===
				s
					? 'border-primary bg-primary text-primary-foreground'
					: 'border-input bg-background hover:bg-accent hover:text-accent-foreground'}"
			>
				{REVIEW_STATUS_LABELS[s]}
			</a>
		{/each}
	</div>

	{#if data.reviews.length === 0}
		<div class="border-input bg-card rounded-2xl border border-dashed p-16 text-center">
			<p class="text-muted-foreground text-sm">No reviews match this filter.</p>
		</div>
	{:else}
		<div class="bg-card rounded-md border">
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
									class="text-sm font-medium hover:underline"
								>
									{r.productName}
								</a>
							</Table.Cell>
							<Table.Cell>
								<div class="text-sm font-medium">{r.authorName}</div>
								<div class="text-muted-foreground text-xs">{r.authorEmail}</div>
							</Table.Cell>
							<Table.Cell>
								<StarRating value={r.rating} size="sm" />
							</Table.Cell>
							<Table.Cell class="max-w-md">
								{#if r.title}
									<p class="text-sm font-semibold">{r.title}</p>
								{/if}
								<p class="line-clamp-3 text-sm whitespace-pre-line wrap-break-word">{r.body}</p>
								{#if r.adminNote}
									<p class="text-muted-foreground mt-1 text-[10px] italic">Note: {r.adminNote}</p>
								{/if}
							</Table.Cell>
							<Table.Cell class="text-muted-foreground text-xs">{fmtDate(r.createdAt)}</Table.Cell>
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
										onclick={() => (deleting = r.id)}
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

<!-- Reject modal — same shadcn Dialog primitives the admin ConfirmDialog uses,
     but with an extra textarea for the optional rejection reason. -->
<Dialog.Root
	open={rejecting !== null}
	onOpenChange={(v) => {
		if (!v) {
			rejecting = null;
			rejectNote = '';
		}
	}}
>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Reject this review?</Dialog.Title>
			<Dialog.Description>
				The customer will see the rejection reason on the product page. They can edit and resubmit.
			</Dialog.Description>
		</Dialog.Header>
		<form
			method="POST"
			action="?/reject"
			use:enhance={() => {
				rejectSubmitting = true;
				return async ({ result, update }) => {
					rejectSubmitting = false;
					if (result.type === 'success' || result.type === 'redirect') {
						toast.success('Review rejected');
						rejecting = null;
						rejectNote = '';
					}
					await update();
				};
			}}
		>
			<input type="hidden" name="id" value={rejecting ?? ''} />
			<label class="mb-4 block">
				<span class="mb-1 block text-xs font-medium">
					Reason <span class="text-muted-foreground">(optional)</span>
				</span>
				<textarea
					name="adminNote"
					bind:value={rejectNote}
					rows="3"
					maxlength="500"
					placeholder="e.g. Contains contact information, offensive language, off-topic…"
					class="border-input bg-background focus:border-primary w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
				></textarea>
			</label>
			<Dialog.Footer>
				<Button
					type="button"
					variant="outline"
					onclick={() => {
						rejecting = null;
						rejectNote = '';
					}}
					disabled={rejectSubmitting}
				>
					Cancel
				</Button>
				<Button type="submit" variant="destructive" disabled={rejectSubmitting}>
					{rejectSubmitting ? 'Working…' : 'Reject'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Delete confirm — reuses the shared admin ConfirmDialog (dark-mode friendly,
     form-based, matches every other delete flow in /admin). -->
<ConfirmDialog
	open={deleting !== null}
	onOpenChange={(v) => !v && (deleting = null)}
	title="Delete this review?"
	description="This will permanently remove the review. This cannot be undone."
	confirmLabel="Delete"
	variant="destructive"
	action="?/delete"
	hiddenFields={deleting ? { id: deleting } : {}}
	onConfirmed={() => toast.success('Review deleted')}
/>
