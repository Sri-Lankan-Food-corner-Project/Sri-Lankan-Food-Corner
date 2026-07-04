<script lang="ts">
	import { site, telHref } from '$lib/config/site';
	import { Wrench, Phone, MapPin, Clock } from '@lucide/svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>We'll be right back · {site.name}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<section
	class="mx-auto flex min-h-[80vh] w-full max-w-lg flex-col items-center justify-center px-4 py-16 text-center sm:px-6"
>
	<div class="bg-brand-cream text-brand-green mb-6 flex size-20 items-center justify-center rounded-full">
		<Wrench class="size-10" />
	</div>

	<p class="text-brand-green text-xs font-bold tracking-wider uppercase">Under maintenance</p>
	<h1 class="mt-2 text-3xl font-extrabold text-neutral-900 sm:text-4xl">We'll be right back</h1>

	<p class="mt-3 max-w-md text-sm text-neutral-600 sm:text-base">
		{#if data.message}
			{data.message}
		{:else}
			We're doing some quick maintenance to make the shop better. Please check back in a little while — thank you for your patience!
		{/if}
	</p>

	{#if data.reopenAt}
		<div class="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm ring-1 ring-neutral-200">
			<Clock class="text-brand-green size-4" />
			<span class="text-neutral-700">Reopening around <span class="font-semibold text-neutral-900">{data.reopenAt}</span></span>
		</div>
	{/if}

	<div class="mt-8 grid w-full gap-3 text-sm sm:grid-cols-2">
		<a
			href={telHref(site.phone.primary)}
			class="border-brand-charcoal/15 hover:bg-brand-cream flex items-center justify-center gap-2 rounded-2xl border bg-white px-4 py-3 font-semibold text-neutral-900 transition"
		>
			<Phone class="size-4" /> {site.phone.primary}
		</a>
		<a
			href={site.mapUrl}
			target="_blank"
			rel="noopener"
			class="border-brand-charcoal/15 hover:bg-brand-cream flex items-center justify-center gap-2 rounded-2xl border bg-white px-4 py-3 font-semibold text-neutral-900 transition"
		>
			<MapPin class="size-4" /> Store location
		</a>
	</div>

	<p class="text-muted-foreground mt-8 text-xs">
		{site.name}
	</p>
</section>
