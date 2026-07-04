<script lang="ts">
	import { page } from '$app/state';
	import { AlertTriangle, Home, RotateCcw } from '@lucide/svelte';

	const status = $derived(page.status);
	const message = $derived(page.error?.message ?? '');
</script>

<svelte:head>
	<title>Error {status} · Admin</title>
</svelte:head>

<div class="mx-auto flex min-h-[60vh] w-full max-w-lg flex-col items-center justify-center text-center">
	<div class="mb-4 flex size-16 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
		<AlertTriangle class="size-8" />
	</div>

	<p class="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
		Error {status}
	</p>
	<h1 class="mt-2 text-2xl font-bold">
		{#if status === 403}
			You don't have access to this page
		{:else if status === 404}
			Admin page not found
		{:else if status >= 500}
			Something broke on the server
		{:else}
			{message || 'Unexpected error'}
		{/if}
	</h1>
	{#if message && status !== 403}
		<p class="text-muted-foreground mt-2 text-sm">{message}</p>
	{/if}

	<div class="mt-6 flex flex-wrap justify-center gap-2">
		<a
			href="/admin"
			class="inline-flex items-center gap-2 rounded-md border bg-white px-4 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
		>
			<Home class="size-4" /> Back to dashboard
		</a>
		<button
			type="button"
			onclick={() => location.reload()}
			class="inline-flex items-center gap-2 rounded-md border bg-white px-4 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
		>
			<RotateCcw class="size-4" /> Try again
		</button>
	</div>
</div>
