<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { ModeWatcher } from 'mode-watcher';

	let { data, children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<ModeWatcher />

<div class="flex min-h-screen flex-col">
	<Header categories={data.categories} user={data.user} />
	<main class="flex-1">
		{@render children()}
	</main>
	<Footer />
</div>
