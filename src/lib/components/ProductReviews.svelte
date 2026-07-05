<script lang="ts">
	import { invalidateAll, goto } from '$app/navigation';
	import { page } from '$app/state';
	import { toast } from 'svelte-sonner';
	import StarRating from './StarRating.svelte';
	import { submitReviewSchema } from '$lib/schemas/reviewStatus';
	import { ChevronLeft, ChevronRight } from '@lucide/svelte';

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
		productName: string;
	};

	let { user, reviews, summary, ownReview, productName }: Props = $props();

	const distribution: Record<number, number> = $derived({
		5: reviews.filter((r) => r.rating === 5).length,
		4: reviews.filter((r) => r.rating === 4).length,
		3: reviews.filter((r) => r.rating === 3).length,
		2: reviews.filter((r) => r.rating === 2).length,
		1: reviews.filter((r) => r.rating === 1).length
	});

	function barWidth(count: number): string {
		const total = summary.count || reviews.length;
		if (total === 0) return '0%';
		return `${(count / total) * 100}%`;
	}

	const REVIEWS_PER_PAGE = 3;
	let currentPage = $state(1);
	const totalPages = $derived(Math.max(1, Math.ceil(reviews.length / REVIEWS_PER_PAGE)));
	const paginatedReviews = $derived(
		reviews.slice((currentPage - 1) * REVIEWS_PER_PAGE, currentPage * REVIEWS_PER_PAGE)
	);

	function goToPage(n: number) {
		currentPage = Math.min(totalPages, Math.max(1, n));
	}

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
			toast.success('Review submitted - pending approval');
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

{#snippet reviewsList()}
	<div class="space-y-4">
		{#each paginatedReviews as r (r.id)}
			<article class="rounded-2xl border border-neutral-200 bg-white p-5">
				<div class="flex items-center gap-3">
					<StarRating value={r.rating} size="sm" />
					<span class="text-xs text-neutral-500">{fmtDate(r.createdAt)}</span>
				</div>
				{#if r.title}
					<h3 class="mt-2 text-base font-bold text-neutral-900 wrap-break-word">
						{r.title}
					</h3>
				{/if}
				<p class="mt-1.5 text-sm text-neutral-700 whitespace-pre-line wrap-break-word">
					{r.body}
				</p>
				<p class="mt-3 text-xs text-neutral-500"> {r.authorName}</p>
			</article>
		{/each}

		{#if totalPages > 1}
			<nav
				class="flex items-center justify-center gap-1 pt-4"
				aria-label="Reviews pagination"
			>
				<button
					type="button"
					onclick={() => goToPage(currentPage - 1)}
					disabled={currentPage === 1}
					aria-label="Previous page"
					class="inline-flex size-9 cursor-pointer items-center justify-center rounded-full text-neutral-600 transition hover:bg-white hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
				>
					<ChevronLeft class="size-4" />
				</button>
				{#each Array(totalPages) as _, i (i)}
					<button
						type="button"
						onclick={() => goToPage(i + 1)}
						aria-current={currentPage === i + 1 ? 'page' : undefined}
						class="inline-flex size-9 cursor-pointer items-center justify-center rounded-full text-sm font-medium transition {currentPage ===
						i + 1
							? 'bg-brand-charcoal text-white'
							: 'text-neutral-600 hover:bg-white hover:text-neutral-900'}"
					>
						{i + 1}
					</button>
				{/each}
				<button
					type="button"
					onclick={() => goToPage(currentPage + 1)}
					disabled={currentPage === totalPages}
					aria-label="Next page"
					class="inline-flex size-9 cursor-pointer items-center justify-center rounded-full text-neutral-600 transition hover:bg-white hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
				>
					<ChevronRight class="size-4" />
				</button>
			</nav>
		{/if}
	</div>
{/snippet}

<section id="reviews" class="mt-16 border-t border-neutral-200 pt-10">
	<h2 class="text-2xl font-bold text-neutral-900">Customer Reviews</h2>

	<div class="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
		<div class="flex flex-col">
			<div class="flex flex-col items-center gap-2">
				{#if summary.count > 0}
					<div class="text-5xl font-extrabold text-neutral-900 tabular-nums">
						{summary.average.toFixed(1)}
					</div>
				{/if}
				<StarRating value={Math.round(summary.average)} size="lg" />
				<p class="text-sm text-neutral-500">
					{summary.count} review{summary.count === 1 ? '' : 's'}
				</p>
			</div>

			<div class="mt-8 space-y-2.5">
				{#each [5, 4, 3, 2, 1] as n (n)}
					<div class="flex items-center gap-3">
						<div class="shrink-0">
							<StarRating value={n} size="sm" />
						</div>
						<div class="relative h-2 flex-1 overflow-hidden rounded-full bg-neutral-100">
							<div
								class="bg-brand-amber absolute inset-y-0 left-0 rounded-full transition-all duration-300"
								style="width: {barWidth(distribution[n])};"
							></div>
						</div>
						<span class="w-6 text-right text-xs text-neutral-500 tabular-nums">
							{distribution[n]}
						</span>
					</div>
				{/each}
			</div>
		</div>

		<div class="flex flex-col">
			{#if showOwnCallout && ownReview}
				<div class="mb-6 rounded-2xl border border-neutral-200 bg-white p-6">
					<p class="text-xs font-semibold uppercase tracking-wide text-neutral-500">
						Your review
					</p>
					<div class="mt-1 flex items-center gap-2">
						<StarRating value={ownReview.rating} size="sm" />
						{#if ownReview.title}
							<span class="text-sm font-semibold text-neutral-900">{ownReview.title}</span>
						{/if}
					</div>
					<p class="mt-2 text-sm text-neutral-700 whitespace-pre-line wrap-break-word">
						{ownReview.body}
					</p>
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
							Rejected{ownReview.adminNote ? `  ${ownReview.adminNote}` : ''}
						</p>
					{/if}
					<p class="mt-3 text-xs text-neutral-500">
						Edit or delete your review in
						<a href="/account/reviews" class="text-brand-green font-semibold hover:underline">
							your account
						</a>.
					</p>
				</div>
			{:else if showForm}
				<h3 class="text-lg font-bold text-neutral-900">
					{#if summary.count === 0}
						Be the first to review "{productName}"
					{:else}
						Share your thoughts
					{/if}
				</h3>
				{#if !user}
					<p class="mt-1 text-sm text-neutral-600">
						Sign in to leave a review. Your review will be visible to others after admin approval.
					</p>
				{:else}
					<p class="mt-1 text-sm text-neutral-600">
						Reviews are visible to other customers after admin approval.
					</p>
				{/if}

				<div class="mt-5 space-y-4">
					<div class="flex items-center gap-3">
						<span class="text-xs font-medium text-neutral-700">
							Your rating <span class="text-red-500">*</span> :
						</span>
						<StarRating
							value={rating}
							interactive
							size="md"
							onChange={(n) => (rating = n)}
							label="Rate this product"
						/>
					</div>
					{#if errors.rating}
						<p class="-mt-2 text-xs text-red-600">{errors.rating}</p>
					{/if}

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
							rows="6"
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

				<div class="mt-6">
					<button
						type="button"
						onclick={submit}
						disabled={submitting}
						class="bg-brand-charcoal hover:bg-brand-charcoal-hover cursor-pointer rounded-md px-6 py-2.5 text-sm font-semibold text-white transition disabled:opacity-60"
					>
						{submitting ? 'Submitting…' : user ? 'Submit' : 'Sign in to review'}
					</button>
				</div>
			{:else if reviews.length > 0}
				{@render reviewsList()}
			{/if}
		</div>
	</div>

	{#if (showOwnCallout || showForm) && reviews.length > 0}
		<div class="mt-12 border-t border-neutral-200 pt-10">
			{@render reviewsList()}
		</div>
	{/if}
</section>
