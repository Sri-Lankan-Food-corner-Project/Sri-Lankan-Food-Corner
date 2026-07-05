<script lang="ts">
	import { invalidateAll, goto } from '$app/navigation';
	import { page } from '$app/state';
	import { toast } from 'svelte-sonner';
	import StarRating from './StarRating.svelte';
	import { submitReviewSchema } from '$lib/schemas/reviewStatus';
	import { showConfirm } from '$lib/stores/confirm';

	type ReviewItem = {
		id: string;
		rating: number;
		title: string | null;
		body: string;
		createdAt: Date | string | null;
		authorName: string;
	};

	type OwnReview = {
		id: string;
		rating: number;
		title: string | null;
		body: string;
		status: 'pending' | 'approved' | 'rejected';
		adminNote: string | null;
	} | null;

	type Props = {
		user: { id: string } | null | undefined;
		reviews: ReviewItem[];
		summary: { count: number; average: number };
		ownReview: OwnReview;
	};

	let { user, reviews, summary, ownReview }: Props = $props();

	// Initialize empty — the effect below hydrates from ownReview and keeps it in
	// sync across data invalidations. Referencing ownReview here would only
	// capture its initial value.
	let rating = $state(0);
	let title = $state('');
	let body = $state('');
	let errors = $state<{ rating?: string; title?: string; body?: string }>({});
	let attempted = $state(false);
	let submitting = $state(false);
	let editing = $state(false);

	// Keep local form state in sync if the loaded ownReview changes (after save
	// + invalidateAll pulls fresh data).
	$effect(() => {
		if (!editing) {
			rating = ownReview?.rating ?? 0;
			title = ownReview?.title ?? '';
			body = ownReview?.body ?? '';
		}
	});

	function validate(): boolean {
		const parsed = submitReviewSchema.safeParse({
			rating,
			title: title.trim() || undefined,
			body: body.trim()
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

	// Re-validate live once the user has attempted to submit.
	$effect(() => {
		if (!attempted) return;
		void rating;
		void title;
		void body;
		validate();
	});

	async function submit() {
		if (!user) {
			// Redirect to auth modal with return-to product page.
			await goto(`?auth=login&returnTo=${encodeURIComponent(page.url.pathname)}`, {
				keepFocus: true
			});
			return;
		}
		attempted = true;
		if (!validate() || submitting) return;
		submitting = true;
		try {
			const fd = new FormData();
			fd.set('rating', String(rating));
			fd.set('title', title.trim());
			fd.set('body', body.trim());

			const res = await fetch('?/submitReview', { method: 'POST', body: fd });
			const raw = await res.json();
			const parsed = raw?.data ? JSON.parse(raw.data) : null;
			if (parsed?.error) {
				toast.error(parsed.error);
				return;
			}
			editing = false;
			await invalidateAll();
			toast.success(ownReview ? 'Review updated — pending approval' : 'Review submitted — pending approval');
		} catch (err) {
			console.error(err);
			toast.error('Could not submit. Please try again.');
		} finally {
			submitting = false;
		}
	}

	async function del() {
		if (!ownReview) return;
		const ok = await showConfirm({
			title: 'Delete your review?',
			description: 'This will permanently remove your review from this product.',
			confirmLabel: 'Delete',
			destructive: true
		});
		if (!ok) return;
		try {
			const fd = new FormData();
			fd.set('reviewId', ownReview.id);
			await fetch('?/deleteReview', { method: 'POST', body: fd });
			await invalidateAll();
			editing = false;
			rating = 0;
			title = '';
			body = '';
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

	const isEditingExisting = $derived(!!ownReview && editing);
	const showForm = $derived(!ownReview || editing);
</script>

<section id="reviews" class="mt-16 border-t border-neutral-200 pt-10">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div>
			<h2 class="text-2xl font-bold text-neutral-900">Customer reviews</h2>
			{#if summary.count > 0}
				<div class="mt-2 flex items-center gap-3">
					<StarRating value={Math.round(summary.average)} size="md" />
					<span class="text-sm text-neutral-600">
						<span class="font-semibold text-neutral-900">{summary.average.toFixed(1)}</span>
						out of 5 — {summary.count} review{summary.count === 1 ? '' : 's'}
					</span>
				</div>
			{:else}
				<p class="mt-1 text-sm text-neutral-500">No reviews yet. Be the first.</p>
			{/if}
		</div>
	</div>

	<!-- Own review status callout — shows whether the user's review is awaiting approval / rejected. -->
	{#if ownReview && !editing}
		<div class="mt-6 rounded-2xl border border-neutral-200 bg-white p-5">
			<div class="flex flex-wrap items-start justify-between gap-3">
				<div>
					<p class="text-xs font-semibold uppercase tracking-wide text-neutral-500">Your review</p>
					<div class="mt-1 flex items-center gap-2">
						<StarRating value={ownReview.rating} size="sm" />
						{#if ownReview.title}
							<span class="text-sm font-semibold text-neutral-900">{ownReview.title}</span>
						{/if}
					</div>
					<p class="mt-2 text-sm text-neutral-700 whitespace-pre-line">{ownReview.body}</p>
					{#if ownReview.status === 'pending'}
						<p class="mt-3 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
							Waiting for admin approval — only you can see this
						</p>
					{:else if ownReview.status === 'rejected'}
						<p class="mt-3 inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
							Rejected{ownReview.adminNote ? ` — ${ownReview.adminNote}` : ''}
						</p>
					{:else}
						<p class="mt-3 inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
							Approved — visible to other customers
						</p>
					{/if}
				</div>
				<div class="flex gap-2">
					<button
						type="button"
						onclick={() => (editing = true)}
						class="cursor-pointer rounded-full border border-neutral-300 bg-white px-4 py-1.5 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50"
					>
						Edit
					</button>
					<button
						type="button"
						onclick={del}
						class="cursor-pointer rounded-full border border-red-200 bg-white px-4 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
					>
						Delete
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Submit / edit form -->
	{#if showForm}
		<div class="mt-6 rounded-2xl border border-neutral-200 bg-white p-6">
			<h3 class="text-lg font-bold text-neutral-900">
				{isEditingExisting ? 'Edit your review' : 'Write a review'}
			</h3>
			{#if !user}
				<p class="mt-2 text-sm text-neutral-600">
					Sign in to leave a review. Your review will be visible to others after admin approval.
				</p>
			{:else}
				<p class="mt-2 text-sm text-neutral-600">
					Reviews are visible to other customers after admin approval.
				</p>
			{/if}

			<div class="mt-5 space-y-4">
				<div>
					<span class="mb-1 block text-xs font-medium text-neutral-700">
						Your rating <span class="text-red-500">*</span>
					</span>
					<StarRating
						value={rating}
						interactive
						size="lg"
						onChange={(n) => (rating = n)}
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
						bind:value={title}
						maxlength="80"
						placeholder="Sums it up in one line"
						aria-invalid={!!errors.title}
						class="focus:border-brand-green w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none {errors.title
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
						bind:value={body}
						rows="5"
						maxlength="2000"
						placeholder="What did you like or not like about this product?"
						aria-invalid={!!errors.body}
						class="focus:border-brand-green w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none {errors.body
							? 'border-red-500'
							: 'border-neutral-300'}"
					></textarea>
					<div class="mt-1 flex items-center justify-between">
						{#if errors.body}
							<p class="text-xs text-red-600">{errors.body}</p>
						{:else}
							<span></span>
						{/if}
						<span class="text-[10px] text-neutral-400">{body.length} / 2000</span>
					</div>
				</label>
			</div>

			<div class="mt-6 flex justify-end gap-2">
				{#if isEditingExisting}
					<button
						type="button"
						onclick={() => (editing = false)}
						class="cursor-pointer rounded-full border border-neutral-300 bg-white px-5 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
					>
						Cancel
					</button>
				{/if}
				<button
					type="button"
					onclick={submit}
					disabled={submitting}
					class="bg-brand-green hover:bg-brand-green-hover cursor-pointer rounded-full px-5 py-2 text-sm font-semibold text-white transition disabled:opacity-60"
				>
					{submitting
						? 'Submitting…'
						: isEditingExisting
							? 'Update review'
							: user
								? 'Submit review'
								: 'Sign in to review'}
				</button>
			</div>
		</div>
	{/if}

	<!-- Approved reviews list -->
	{#if reviews.length > 0}
		<div class="mt-10 space-y-6">
			{#each reviews as r (r.id)}
				<article class="rounded-2xl border border-neutral-200 bg-white p-5">
					<div class="flex items-center gap-3">
						<StarRating value={r.rating} size="sm" />
						<span class="text-xs text-neutral-500">{fmtDate(r.createdAt)}</span>
					</div>
					{#if r.title}
						<h3 class="mt-2 text-base font-bold text-neutral-900">{r.title}</h3>
					{/if}
					<p class="mt-1.5 text-sm text-neutral-700 whitespace-pre-line">{r.body}</p>
					<p class="mt-3 text-xs text-neutral-500">— {r.authorName}</p>
				</article>
			{/each}
		</div>
	{:else if summary.count === 0}
		<!-- no reviews at all — form is enough -->
	{:else}
		<p class="mt-6 text-sm text-neutral-500">No public reviews yet.</p>
	{/if}
</section>
