<script lang="ts">
	import { invalidateAll, goto } from '$app/navigation';
	import { page } from '$app/state';
	import { toast } from 'svelte-sonner';
	import StarRating from './StarRating.svelte';
	import { submitReviewSchema } from '$lib/schemas/reviewStatus';

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

	let rating = $state(0);
	let title = $state('');
	let body = $state('');
	let errors = $state<{ rating?: string; title?: string; body?: string }>({});
	let attempted = $state(false);
	let submitting = $state(false);

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

	$effect(() => {
		if (!attempted) return;
		void rating;
		void title;
		void body;
		validate();
	});

	async function submit() {
		if (!user) {
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
			rating = 0;
			title = '';
			body = '';
			attempted = false;
			await invalidateAll();
			toast.success('Review submitted — pending approval');
		} catch (err) {
			console.error(err);
			toast.error('Could not submit. Please try again.');
		} finally {
			submitting = false;
		}
	}

	function fmtDate(d: Date | string | null): string {
		if (!d) return '';
		const dt = typeof d === 'string' ? new Date(d) : d;
		return dt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
	}

	// Only show the "your review" status callout for pending / rejected — an
	// approved review is already displayed inline in the public list below.
	const showOwnCallout = $derived(!!ownReview && ownReview.status !== 'approved');
	// Show the write-a-review form only when the user has NO review yet. Editing
	// and deleting happens on the /account/reviews tab.
	const showForm = $derived(!ownReview);
</script>

<section id="reviews" class="mt-16 border-t border-neutral-200 pt-10">
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

	<!-- Callout — only when review is pending or rejected. Approved reviews just
	     appear in the list below, no duplicate card. -->
	{#if showOwnCallout && ownReview}
		<div class="mt-6 rounded-2xl border border-neutral-200 bg-white p-5">
			<p class="text-xs font-semibold uppercase tracking-wide text-neutral-500">Your review</p>
			<div class="mt-1 flex items-center gap-2">
				<StarRating value={ownReview.rating} size="sm" />
				{#if ownReview.title}
					<span class="text-sm font-semibold text-neutral-900">{ownReview.title}</span>
				{/if}
			</div>
			<p class="mt-2 whitespace-pre-line text-sm text-neutral-700">{ownReview.body}</p>
			{#if ownReview.status === 'pending'}
				<p
					class="mt-3 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700"
				>
					Waiting for admin approval
				</p>
			{:else}
				<p
					class="mt-3 inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700"
				>
					Rejected{ownReview.adminNote ? ` — ${ownReview.adminNote}` : ''}
				</p>
			{/if}
			<p class="mt-3 text-xs text-neutral-500">
				Edit or delete your review in
				<a href="/account/reviews" class="text-brand-green font-semibold hover:underline">
					your account
				</a>.
			</p>
		</div>
	{/if}

	<!-- Submit form — hidden once the user has any review. -->
	{#if showForm}
		<div class="mt-6 rounded-2xl border border-neutral-200 bg-white p-6">
			<h3 class="text-lg font-bold text-neutral-900">Write a review</h3>
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

			<div class="mt-6 flex justify-end">
				<button
					type="button"
					onclick={submit}
					disabled={submitting}
					class="bg-brand-green hover:bg-brand-green-hover cursor-pointer rounded-full px-5 py-2 text-sm font-semibold text-white transition disabled:opacity-60"
				>
					{submitting ? 'Submitting…' : user ? 'Submit review' : 'Sign in to review'}
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
					<p class="mt-1.5 whitespace-pre-line text-sm text-neutral-700">{r.body}</p>
					<p class="mt-3 text-xs text-neutral-500">— {r.authorName}</p>
				</article>
			{/each}
		</div>
	{/if}
</section>
