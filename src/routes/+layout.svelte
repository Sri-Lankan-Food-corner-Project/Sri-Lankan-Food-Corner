<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import MobileBottomNav from '$lib/components/MobileBottomNav.svelte';
	import CartSheet from '$lib/components/CartSheet.svelte';
	import { ModeWatcher } from 'mode-watcher';
	import { BProgress } from '@bprogress/core';
	import '@bprogress/core/css';
	import { afterNavigate, beforeNavigate } from '$app/navigation';
	import { page } from '$app/state';

	BProgress.configure({ showSpinner: false });

	let { data, children } = $props();

	const isAdmin = $derived(page.url.pathname.startsWith('/admin'));

	let loadingTimeout: ReturnType<typeof setTimeout>;

	beforeNavigate(() => {
		loadingTimeout = setTimeout(() => {
			BProgress.start();
		}, 300);
	});

	afterNavigate(() => {
		clearTimeout(loadingTimeout);
		BProgress.done();
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<ModeWatcher />

{#if isAdmin}
	{@render children()}
{:else}
	<div class="flex min-h-screen flex-col pb-16 md:pb-0">
		<Header categories={data.categories} user={data.user} />
		<main class="flex-1">
			{@render children()}
		</main>
		<Footer categories={data.categories} />
	</div>

	<MobileBottomNav categories={data.categories} />
	<CartSheet />
{/if}
