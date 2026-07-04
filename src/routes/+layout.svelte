<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import MobileBottomNav from '$lib/components/MobileBottomNav.svelte';
	import CartSheet from '$lib/components/CartSheet.svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import AuthDialog from '$lib/components/AuthDialog.svelte';
	import { Toaster } from 'svelte-sonner';
	import { wishlist } from '$lib/stores/wishlist';
	import { showAuth, type AuthMode } from '$lib/stores/authUi';
	import { ModeWatcher } from 'mode-watcher';
	import { page } from '$app/state';

	let { data, children } = $props();

	const isAdmin = $derived(page.url.pathname.startsWith('/admin'));

	// Sync the client wishlist store whenever the server's list changes
	// (after login/logout, invalidateAll, navigation).
	$effect(() => {
		wishlist.hydrate(data.wishlistIds ?? []);
	});

	// Open the auth modal when the URL carries `?auth=login|signup` — this is how
	// protected route redirects surface the sign-in prompt without a full page.
	$effect(() => {
		const auth = page.url.searchParams.get('auth');
		if (auth !== 'login' && auth !== 'signup') return;
		showAuth({ mode: auth as AuthMode });
		// Strip the flag from the URL without re-navigating.
		const url = new URL(window.location.href);
		url.searchParams.delete('auth');
		history.replaceState(null, '', url.pathname + url.search);
	});

</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<ModeWatcher />

{#if isAdmin}
	{@render children()}
{:else}
	<div class="flex min-h-dvh flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
		<Header categories={data.categories} user={data.user} />
		<main class="flex-1">
			{@render children()}
		</main>
		<Footer categories={data.categories} />
	</div>

	<MobileBottomNav categories={data.categories} user={data.user} />
	<CartSheet />
{/if}

<ConfirmDialog />
<AuthDialog />
<Toaster position="top-right" richColors closeButton />
