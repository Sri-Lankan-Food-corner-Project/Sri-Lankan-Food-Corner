<script lang="ts">
	import { site, telHref } from '$lib/config/site';
	import SEO from '$lib/components/SEO.svelte';
	import { SITE_URL, SITE_NAME } from '$lib/config/seo';
	import { ArrowRight, Mail, MapPin, Phone } from '@lucide/svelte';

	const contactJsonLd = {
		'@context': 'https://schema.org',
		'@type': 'ContactPage',
		mainEntity: {
			'@type': 'GroceryStore',
			name: SITE_NAME,
			telephone: site.phone.primary,
			address: {
				'@type': 'PostalAddress',
				streetAddress: site.address.en,
				addressLocality: 'Dangjin',
				addressRegion: 'Chungcheongnam-do',
				addressCountry: 'KR'
			}
		},
		breadcrumb: {
			'@type': 'BreadcrumbList',
			itemListElement: [
				{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
				{ '@type': 'ListItem', position: 2, name: 'Contact', item: `${SITE_URL}/contact` }
			]
		}
	};
</script>

<SEO
	title="Contact Us — Visit or call our Dangjin store"
	description="Get in touch with {site.name} — visit our store in Dangjin, call {site.phone.primary}, or send an email. We ship Sri Lankan groceries across South Korea."
	jsonLd={contactJsonLd}
/>

<!-- Hero -->
<section class="bg-brand-green relative overflow-hidden text-white">
	<div class="pointer-events-none absolute inset-0 opacity-20">
		<div
			class="bg-brand-amber absolute -top-32 -right-20 size-96 rounded-full blur-3xl"
		></div>
		<div
			class="bg-brand-cream absolute -bottom-40 -left-20 size-96 rounded-full blur-3xl"
		></div>
	</div>

	<div class="mx-auto max-w-350 px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16 relative">
		<p class="text-brand-amber text-xs font-bold tracking-[0.3em] uppercase">
			Get in touch
		</p>
		<h1 class="mt-3 max-w-3xl text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
			Come say hello, or drop us a line.
		</h1>
		<p class="mt-4 max-w-2xl text-sm text-white/85 sm:text-base">
			Whether it's about an order, a product you can't find, or just to say hi 
			we're here. Stop by the store in Dangjin, or reach us on any of the channels
			below.
		</p>
	</div>
</section>

<!-- Contact details -->
<section class="bg-brand-cream">
	<div
		class="mx-auto grid max-w-350 gap-8 px-4 py-12 sm:px-6 sm:py-16 md:grid-cols-2 md:gap-10 lg:gap-12 lg:px-8"
	>
		<div>
			<p class="text-brand-green text-xs font-bold tracking-[0.3em] uppercase">
				Come say hello
			</p>
			<h2 class="mt-3 text-2xl font-extrabold text-neutral-900 sm:text-3xl lg:text-4xl">
				You&apos;ll find us in Dangjin.
			</h2>
			<p class="mt-4 text-base leading-relaxed text-neutral-600">
				We serve the local community in person and ship nationwide across South
				Korea. Stop by, or shop the whole store online  same prices either way.
			</p>

			<div class="mt-6 grid gap-3 sm:gap-4">
				<a
					href={site.mapUrl}
					target="_blank"
					rel="noopener"
					class="ring-brand-charcoal/10 hover:ring-brand-green group flex items-start gap-4 rounded-2xl bg-white p-5 ring-1 transition"
				>
					<div
						class="bg-brand-green/10 text-brand-green flex size-11 shrink-0 items-center justify-center rounded-xl"
					>
						<MapPin class="size-5" />
					</div>
					<div class="min-w-0">
						<p class="text-xs font-semibold tracking-wider text-neutral-500 uppercase">
							Store address
						</p>
						<p class="mt-1 text-sm font-semibold text-neutral-900">{site.address.en}</p>
						<p class="mt-0.5 text-sm text-neutral-500">{site.address.kr}</p>
					</div>
				</a>

				<a
					href={telHref(site.phone.primary)}
					class="ring-brand-charcoal/10 hover:ring-brand-green group flex items-start gap-4 rounded-2xl bg-white p-5 ring-1 transition"
				>
					<div
						class="bg-brand-amber/15 text-brand-amber flex size-11 shrink-0 items-center justify-center rounded-xl"
					>
						<Phone class="size-5" />
					</div>
					<div class="min-w-0">
						<p class="text-xs font-semibold tracking-wider text-neutral-500 uppercase">
							Give us a call
						</p>
						<p class="mt-1 text-sm font-semibold text-neutral-900">{site.phone.primary}</p>
						{#if site.phone.secondary}
							<p class="mt-0.5 text-sm text-neutral-500">or {site.phone.secondary}</p>
						{/if}
					</div>
				</a>

				<a
					href="mailto:{site.email}"
					class="ring-brand-charcoal/10 hover:ring-brand-green group flex items-start gap-4 rounded-2xl bg-white p-5 ring-1 transition"
				>
					<div
						class="bg-brand-charcoal/10 text-brand-charcoal flex size-11 shrink-0 items-center justify-center rounded-xl"
					>
						<Mail class="size-5" />
					</div>
					<div class="min-w-0">
						<p class="text-xs font-semibold tracking-wider text-neutral-500 uppercase">
							Send an email
						</p>
						<p class="mt-1 text-sm font-semibold text-neutral-900 break-all">{site.email}</p>
						<p class="mt-0.5 text-sm text-neutral-500">We reply within one business day.</p>
					</div>
				</a>
			</div>
		</div>

		<div
			class="bg-brand-green relative flex flex-col justify-between overflow-hidden rounded-3xl p-8 text-white sm:p-10"
		>
			<div
				class="bg-brand-amber/25 pointer-events-none absolute -top-24 -right-16 size-72 rounded-full blur-3xl"
			></div>

			<div class="relative">
				<p class="text-brand-amber text-xs font-bold tracking-[0.3em] uppercase">
					Visit the store
				</p>
				<h3 class="mt-3 text-2xl font-extrabold sm:text-3xl">
					Chungcheongnam-do &middot; Dangjin-si
				</h3>
				<p class="mt-4 text-sm leading-relaxed text-white/80">
					Family-run and open to everyone. Look for the red "Sri Lankan Food Corner"
					sign on Deokpyeong-ro  we're at street level, easy to spot.
				</p>

				{#if site.social.facebook || site.social.instagram || site.social.tiktok || site.social.youtube}
					<div class="mt-6">
						<p class="text-xs font-semibold tracking-wider text-white/60 uppercase">
							Follow us
						</p>
						<div class="mt-3 flex flex-wrap items-center gap-3">
							{#if site.social.facebook}
								<a
									href={site.social.facebook}
									target="_blank"
									rel="noopener"
									aria-label="Facebook"
									class="inline-flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
								>
									<svg viewBox="0 0 24 24" fill="currentColor" class="size-4">
										<path
											d="M9.101 23.691v-7.98H6.627v-3.667h2.474V10.464c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036c-.373-.017-.62-.026-.733-.026-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"
										/>
									</svg>
								</a>
							{/if}
							{#if site.social.instagram}
								<a
									href={site.social.instagram}
									target="_blank"
									rel="noopener"
									aria-label="Instagram"
									class="inline-flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
								>
									<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="size-4">
										<rect x="3" y="3" width="18" height="18" rx="5" />
										<circle cx="12" cy="12" r="4" />
										<circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
									</svg>
								</a>
							{/if}
							{#if site.social.tiktok}
								<a
									href={site.social.tiktok}
									target="_blank"
									rel="noopener"
									aria-label="TikTok"
									class="inline-flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
								>
									<svg viewBox="0 0 24 24" fill="currentColor" class="size-4">
										<path
											d="M21 8.5a7.5 7.5 0 0 1-4.5-1.5v8.25a5.75 5.75 0 1 1-5.75-5.75c.32 0 .63.03.93.08v2.98a2.83 2.83 0 1 0 1.99 2.7V3h2.83c.13 1.9 1.28 3.53 2.9 4.42a5.4 5.4 0 0 0 1.6.61V8.5Z"
										/>
									</svg>
								</a>
							{/if}
							{#if site.social.youtube}
								<a
									href={site.social.youtube}
									target="_blank"
									rel="noopener"
									aria-label="YouTube"
									class="inline-flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
								>
									<svg viewBox="0 0 24 24" fill="currentColor" class="size-4">
										<path
											d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.6 3.6 12 3.6 12 3.6s-7.6 0-9.4.5A3 3 0 0 0 .5 6.2C0 8 0 12 0 12s0 4 .5 5.8a3 3 0 0 0 2.1 2.1c1.8.5 9.4.5 9.4.5s7.6 0 9.4-.5a3 3 0 0 0 2.1-2.1c.5-1.8.5-5.8.5-5.8s0-4-.5-5.8ZM9.6 15.6V8.4L15.8 12l-6.2 3.6Z"
										/>
									</svg>
								</a>
							{/if}
						</div>
					</div>
				{/if}
			</div>

			<div class="relative mt-8">
				<a
					href={site.mapUrl}
					target="_blank"
					rel="noopener"
					class="bg-brand-amber hover:bg-brand-amber-hover inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-neutral-900 transition"
				>
					Open in Google Maps
					<ArrowRight class="size-4" />
				</a>
			</div>
		</div>
	</div>
</section>
