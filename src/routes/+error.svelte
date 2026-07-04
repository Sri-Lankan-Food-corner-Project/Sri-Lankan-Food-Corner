<script lang="ts">
	import { page } from '$app/state';
	import { site } from '$lib/config/site';
	import { Home, ShoppingBag, AlertTriangle, Compass } from '@lucide/svelte';

	const status = $derived(page.status);
	const message = $derived(page.error?.message ?? '');
	const errorId = $derived(page.error?.id ?? '');

	// Different tone per status range: not-found is gentle & helpful,
	// server errors are apologetic & signal ongoing action.
	const isNotFound = $derived(status === 404);
	const isServerError = $derived(status >= 500);
</script>

<svelte:head>
	<title>
		{isNotFound ? 'Page not found' : isServerError ? 'Something went wrong' : `Error ${status}`}
		· {site.name}
	</title>
</svelte:head>

<section
	class="mx-auto flex min-h-[60vh] w-full max-w-350 flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8"
>
	<div
		class="mb-6 flex size-20 items-center justify-center rounded-full {isNotFound
			? 'bg-brand-cream text-brand-green'
			: 'bg-red-100 text-red-600'}"
	>
		{#if isNotFound}
			<Compass class="size-10" />
		{:else}
			<AlertTriangle class="size-10" />
		{/if}
	</div>

	<p class="text-brand-green text-sm font-bold tracking-wider uppercase">Error {status}</p>

	<h1 class="mt-2 text-3xl font-extrabold text-neutral-900 sm:text-4xl">
		{#if isNotFound}
			We couldn't find that page
		{:else if isServerError}
			Something went wrong on our end
		{:else}
			{message || 'An unexpected error occurred'}
		{/if}
	</h1>

	<p class="mt-3 max-w-md text-sm text-neutral-600 sm:text-base">
		{#if isNotFound}
			The link may be broken, or the page may have moved. Try browsing our products from the home
			page instead.
		{:else if isServerError}
			We're on it — please try again in a minute. If the problem persists, please contact us and
			we'll help right away.
		{:else if message}
			{message}
		{:else}
			Please try again. If the issue continues, reach out to us.
		{/if}
	</p>

	<div class="mt-8 flex flex-wrap justify-center gap-3">
		<a
			href="/"
			class="bg-brand-charcoal hover:bg-brand-charcoal-hover inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition"
		>
			<Home class="size-4" /> Go home
		</a>
		<a
			href="/products"
			class="border-brand-charcoal/15 hover:bg-brand-cream inline-flex items-center gap-2 rounded-full border bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 transition"
		>
			<ShoppingBag class="size-4" /> Browse products
		</a>
	</div>

	{#if errorId && isServerError}
		<p class="mt-6 text-xs text-neutral-400">
			Reference: <code class="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-neutral-600"
				>{errorId}</code
			>
		</p>
	{/if}
</section>
