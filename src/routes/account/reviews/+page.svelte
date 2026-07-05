<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { Pencil, Star, Trash2 } from '@lucide/svelte';
	import StarRating from '$lib/components/StarRating.svelte';
	import { showConfirm } from '$lib/stores/confirm';
	import { submitReviewSchema, type ReviewStatus } from '$lib/schemas/reviewStatus';

	type ReviewRow = {
		id: string;
		productId: string;
		productName: string;
		productSlug: string;
		rating: number;
		title: string | null;
		body: string;
		status: string;
		adminNote: string | null;
		createdAt: Date | string | null;
		updatedAt: Date | string | null;
	};

	let { data } = $props();

	type EditState = {
		id: string;
		rating: number;
		title: string;
		body: string;
	};

	let editing = $state<EditState | null>(null);
	let saving = $state(false);
	let errors = $state<{ rating?: string; title?: string; body?: string }>({});
	let attempted = $state(false);

	function startEdit(r: ReviewRow) {
		editing = {
			id: r.id,
			rating: r.rating,
			title: r.title ?? '',
			body: r.body
		};
		errors = {};
		attempted = false;
	}

	function cancel() {
		editing = null;
		errors = {};
		attempted = false;
	}

	function validate(): boolean {
		if (!editing) return false;
		const parsed = submitReviewSchema.safeParse({
			rating: editing.rating,
			title: editing.title.trim() || undefined,
			body: editing.body.trim()
		});
		if (parsed.success) {
			errors = {};
			return true;
		}
		const next: typeof errors = {};
		for (const issue of parsed.error.issues) {
			const key = issue.path[0] as keyof typeof errors;
			if (!next[key]) next[key] = issue.message;
		}
		errors = next;
		return false;
	}

	$effect(() => {
		if (!attempted || !editing) return;
		void editing.rating;
		void editing.title;
		void editing.body;
		validate();
	});

	async function save() {
		if (!editing || saving) return;
		attempted = true;
		if (!validate()) {
			toast.error('Please fix the highlighted fields');
			return;
		}
		saving = true;
		try {
			const fd = new FormData();
			fd.set('reviewId', editing.id);
			fd.set('rating', String(editing.rating));
			fd.set('title', editing.title.trim());
			fd.set('body', editing.body.trim());

			const res = await fetch('?/update', { method: 'POST', body: fd });
			const raw = await res.json();
			const parsed = raw?.data ? JSON.parse(raw.data) : null;
			if (parsed?.error) {
				toast.error(parsed.error);
				return;
			}
			editing = null;
			attempted = false;
			await invalidateAll();
			toast.success('Review updated — pending re-approval');
		} catch (err) {
			console.error(err);
			toast.error('Could not save. Please try again.');
		} finally {
			saving = false;
		}
	}

	async function del(id: string) {
		const ok = await showConfirm({
			title: 'Delete your review?',
			description: 'This will permanently remove your review from the product page.',
			confirmLabel: 'Delete',
			destructive: true
		});
		if (!ok) return;
		try {
			const fd = new FormData();
			fd.set('reviewId', id);
			await fetch('?/delete', { method: 'POST', body: fd });
			await invalidateAll();
			toast.success('Review deleted');
		} catch {
			toast.error('Could not delete. Please try again.');
		}
	}

	function fmtDate(d: Date | string | null): string {
		if (!d) return '';
		const dt = typeof d === 'string' ? new Date(d) : d;
		return dt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
	}

	const statusStyle: Record<ReviewStatus, string> = {
		pending: 'bg-amber-50 text-amber-700',
		approved: 'bg-green-50 text-green-700',
		rejected: 'bg-red-50 text-red-700'
	};

	const statusLabel: Record<ReviewStatus, string> = {
		pending: 'Waiting for admin approval',
		approved: 'Approved',
		rejected: 'Rejected'
	};
</script>

<div class="space-y-6">
	{#if data.reviews.length === 0}
		<div class="bg-brand-cream ring-brand-charcoal/10 rounded-2xl p-10 text-center ring-1">
			<Star class="text-brand-charcoal/30 mx-auto size-14" />
			<h2 class="mt-4 text-xl font-bold text-neutral-900">You haven't written any reviews yet</h2>
			<p class="mt-2 text-sm text-neutral-500">
				After you buy a product, come back and share what you thought.
			</p>
		</div>
	{:else}
		<h2 class="text-lg font-bold text-neutral-900">Your reviews</h2>

		<div class="space-y-4">
			{#each data.reviews as r (r.id)}
				{@const s = r.status as ReviewStatus}
				<div class="bg-brand-cream ring-brand-charcoal/10 rounded-2xl p-5 ring-1">
					{#if editing?.id === r.id}
						<!-- Inline edit form -->
						<p class="text-xs font-semibold uppercase tracking-wide text-neutral-500">
							Editing your review for
						</p>
						<a
							href={`/products/${r.productSlug}`}
							class="text-brand-green mt-0.5 inline-block text-sm font-semibold hover:underline"
							target="_blank"
							rel="noopener"
						>
							{r.productName}
						</a>

						<div class="mt-4 space-y-4">
							<div>
								<span class="mb-1 block text-xs font-medium text-neutral-700">
									Your rating <span class="text-red-500">*</span>
								</span>
								<StarRating
									value={editing.rating}
									interactive
									size="lg"
									onChange={(n) => editing && (editing.rating = n)}
									label="Rate this product"
								/>
								{#if errors.rating}
									<p class="mt-1 text-xs text-red-600">{errors.rating}</p>
								{/if}
							</div>

							<label class="block">
								<span class="mb-1 block text-xs font-medium text-neutral-700">
									Title <span class="text-neutral-400">(optional)</span>
								</span>
								<input
									type="text"
									bind:value={editing.title}
									maxlength="80"
									aria-invalid={!!errors.title}
									class="focus:border-brand-green w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-neutral-900 focus:outline-none {errors.title
										? 'border-red-500'
										: 'border-neutral-300'}"
								/>
								{#if errors.title}
									<p class="mt-1 text-xs text-red-600">{errors.title}</p>
								{/if}
							</label>

							<label class="block">
								<span class="mb-1 block text-xs font-medium text-neutral-700">
									Your review <span class="text-red-500">*</span>
								</span>
								<textarea
									bind:value={editing.body}
									rows="4"
									maxlength="2000"
									aria-invalid={!!errors.body}
									class="focus:border-brand-green w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-neutral-900 focus:outline-none {errors.body
										? 'border-red-500'
										: 'border-neutral-300'}"
								></textarea>
								<div class="mt-1 flex items-center justify-between">
									{#if errors.body}
										<p class="text-xs text-red-600">{errors.body}</p>
									{:else}
										<span></span>
									{/if}
									<span class="text-[10px] text-neutral-400">{editing.body.length} / 2000</span>
								</div>
							</label>
						</div>

						<div class="mt-5 flex justify-end gap-2">
							<button
								type="button"
								onclick={cancel}
								class="cursor-pointer rounded-full border border-neutral-300 bg-white px-5 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
							>
								Cancel
							</button>
							<button
								type="button"
								onclick={save}
								disabled={saving}
								class="bg-brand-green hover:bg-brand-green-hover cursor-pointer rounded-full px-5 py-2 text-sm font-semibold text-white transition disabled:opacity-60"
							>
								{saving ? 'Saving…' : 'Save review'}
							</button>
						</div>
					{:else}
						<!-- Read-only card -->
						<div class="flex flex-wrap items-start justify-between gap-3">
							<div class="min-w-0 flex-1">
								<a
									href={`/products/${r.productSlug}`}
									class="text-brand-green text-sm font-semibold hover:underline"
									target="_blank"
									rel="noopener"
								>
									{r.productName}
								</a>
								<div class="mt-2 flex items-center gap-2">
									<StarRating value={r.rating} size="sm" />
									{#if r.title}
										<span class="text-sm font-semibold text-neutral-900">{r.title}</span>
									{/if}
								</div>
								<p class="mt-2 whitespace-pre-line text-sm text-neutral-700">{r.body}</p>
								<p
									class="mt-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium {statusStyle[
										s
									]}"
								>
									{statusLabel[s]}{s === 'rejected' && r.adminNote ? ` — ${r.adminNote}` : ''}
								</p>
								<p class="mt-2 text-xs text-neutral-500">Submitted {fmtDate(r.createdAt)}</p>
							</div>
							<div class="flex shrink-0 gap-1">
								<!-- Edit is hidden for approved reviews — editing would silently
								     send the review back to 'pending' and pull it from public view.
								     If they want to change an approved review, they delete and rewrite. -->
								{#if s !== 'approved'}
									<button
										type="button"
										onclick={() => startEdit(r)}
										class="cursor-pointer rounded-lg p-1.5 text-neutral-500 transition hover:bg-white hover:text-neutral-900"
										aria-label="Edit review"
									>
										<Pencil class="size-3.5" />
									</button>
								{/if}
								<button
									type="button"
									onclick={() => del(r.id)}
									class="cursor-pointer rounded-lg p-1.5 text-neutral-500 transition hover:bg-red-50 hover:text-red-600"
									aria-label="Delete review"
								>
									<Trash2 class="size-3.5" />
								</button>
							</div>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>
