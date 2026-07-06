<script lang="ts">
	import { page } from '$app/state';
	import {
		SITE_NAME,
		SITE_URL,
		DEFAULT_DESCRIPTION,
		DEFAULT_OG_IMAGE
	} from '$lib/config/seo';

	type Props = {
		// Page title (final tag: `${title} | ${SITE_NAME}`). Omit on home so title = SITE_NAME.
		title?: string;
		description?: string;
		// Absolute URL to a 1200×630 image for social previews.
		image?: string;
		// 'website' for most pages, 'article' for blog posts, 'product' for PDPs.
		type?: 'website' | 'article' | 'product';
		// Canonical URL. Defaults to current page URL (strips query strings).
		canonical?: string;
		// If true, adds `<meta name="robots" content="noindex">` — use for /admin, /account, /checkout.
		noindex?: boolean;
		// Free-form additional JSON-LD (e.g. Product, BreadcrumbList).
		jsonLd?: Record<string, unknown> | Record<string, unknown>[];
	};

	let {
		title,
		description = DEFAULT_DESCRIPTION,
		image = DEFAULT_OG_IMAGE,
		type = 'website',
		canonical,
		noindex = false,
		jsonLd
	}: Props = $props();

	const fullTitle = $derived(title ? `${title} | ${SITE_NAME}` : SITE_NAME);
	const url = $derived(canonical ?? `${SITE_URL}${page.url.pathname}`);
	const jsonLdArr = $derived(
		jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : []
	);
</script>

<svelte:head>
	<title>{fullTitle}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={url} />

	{#if noindex}
		<meta name="robots" content="noindex, nofollow" />
	{:else}
		<meta name="robots" content="index, follow, max-image-preview:large" />
	{/if}

	<!-- Open Graph (Facebook, LinkedIn, KakaoTalk previews) -->
	<meta property="og:site_name" content={SITE_NAME} />
	<meta property="og:type" content={type} />
	<meta property="og:title" content={fullTitle} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={url} />
	<meta property="og:image" content={image} />
	<meta property="og:locale" content="en_US" />
	<meta property="og:locale:alternate" content="ko_KR" />

	<!-- Twitter/X card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={fullTitle} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={image} />

	{#each jsonLdArr as data (data)}
		{@html `<script type="application/ld+json">${JSON.stringify(data)}<\/script>`}
	{/each}
</svelte:head>
