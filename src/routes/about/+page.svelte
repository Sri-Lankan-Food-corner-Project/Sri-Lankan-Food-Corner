<script lang="ts">
	import shopPhoto from '$lib/assets/aboutus/shop.webp';
	import { site, telHref } from '$lib/config/site';
	import {
		ArrowRight,
		Heart,
		Leaf,
		MapPin,
		Phone,
		Sparkles,
		Utensils
	} from '@lucide/svelte';

	const openedYear = new Date(site.business.openedDate).getFullYear();
	const yearsRunning = new Date().getFullYear() - openedYear;
</script>

<svelte:head>
	<title>About Us — {site.name}</title>
	<meta
		name="description"
		content="Meet {site.name} — a family-run Sri Lankan grocery in Dangjin, Korea. Rice, spices, curry mixes, fresh vegetables and pantry staples from home."
	/>
</svelte:head>

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
			About {site.tagline}
		</p>
		<h1 class="mt-3 max-w-3xl text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
			A little piece of home, on your Korean kitchen shelf.
		</h1>
		<p class="mt-4 max-w-2xl text-sm text-white/85 sm:text-base">
			{site.name} brings Sri Lankan flavours, familiar brands, and everyday grocery
			essentials to families across South Korea — carefully sourced, honestly priced,
			and packed with the tastes of home.
		</p>

		<div class="mt-6 flex flex-wrap items-center gap-3">
			<a
				href="/products"
				class="bg-brand-amber hover:bg-brand-amber-hover inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-neutral-900 transition"
			>
				Explore our products
				<ArrowRight class="size-4" />
			</a>
			<a
				href={site.mapUrl}
				target="_blank"
				rel="noopener"
				class="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
			>
				<MapPin class="size-4" />
				Find our store
			</a>
		</div>
	</div>
</section>

<!-- Story -->
<section class="mx-auto max-w-350 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
	<div class="grid gap-10 md:grid-cols-2 md:items-stretch md:gap-12">
		<div>
			<p class="text-brand-green text-xs font-bold tracking-[0.3em] uppercase">Our Story</p>
			<h2 class="mt-3 text-3xl font-extrabold text-neutral-900 sm:text-4xl">
				Built by a Sri Lankan family, for the community we live in.
			</h2>
			<p class="mt-5 text-base leading-relaxed text-neutral-600">
				What began as a small idea — how do we keep cooking the food we grew up with,
				thousands of kilometres from home? — turned into a shop the whole community
				stops by. From wedding-scale rice sacks to a quick pack of pol sambol seasoning
				on the way back from work, we&apos;re the corner store you know by name.
			</p>
			<p class="mt-4 text-base leading-relaxed text-neutral-600">
				We choose every product ourselves. If we wouldn&apos;t put it on our own dining
				table, it doesn&apos;t make it onto our shelves. That&apos;s the whole rule.
			</p>

			<div
				class="mt-8 grid gap-4 border-t border-neutral-200 pt-8 sm:grid-cols-3"
			>
				<div>
					<p class="text-brand-green text-3xl font-extrabold">300+</p>
					<p class="mt-1 text-xs font-medium text-neutral-500">Products stocked</p>
				</div>
				<div>
					<p class="text-brand-green text-3xl font-extrabold">5+</p>
					<p class="mt-1 text-xs font-medium text-neutral-500">Regions we ship to</p>
				</div>
				<div>
					<p class="text-brand-green text-3xl font-extrabold">100%</p>
					<p class="mt-1 text-xs font-medium text-neutral-500">Owned &amp; run locally</p>
				</div>
			</div>
		</div>

		<div
			class="ring-brand-charcoal/10 relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-2xl ring-1 md:mx-0 md:aspect-auto md:h-full md:max-w-none md:justify-self-stretch md:order-last"
		>
			<img
				src={shopPhoto}
				alt="Our store in Dangjin"
				class="h-full w-full object-cover"
				loading="lazy"
			/>
			<div
				class="pointer-events-none absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent"
			></div>
			<div
				class="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-neutral-900 shadow-sm ring-1 ring-black/5 backdrop-blur"
			>
				Since {openedYear}
				{#if yearsRunning > 0}
					· {yearsRunning}+ years
				{/if}
			</div>
		</div>
	</div>
</section>

<!-- What we offer -->
<section class="bg-brand-sand">
	<div class="mx-auto max-w-350 px-4 py-16 sm:px-6 sm:py-10 lg:px-8">
		<div class="max-w-2xl">
			<p class="text-brand-green text-xs font-bold tracking-[0.3em] uppercase">
				What&apos;s on our shelves
			</p>
			<h2 class="mt-3 text-3xl font-extrabold text-neutral-900 sm:text-4xl">
				Everything a South Asian kitchen actually needs.
			</h2>
			<p class="mt-4 text-base leading-relaxed text-neutral-600">
				Focused on Sri Lankan cooking, but built out to cover the wider Desi and
				South Asian pantry — plus the Korean everyday essentials you&apos;d expect
				from your neighbourhood store.
			</p>
		</div>

		<div class="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
			<div class="group rounded-2xl bg-white p-6 ring-1 ring-black/5 transition hover:shadow-md">
				<div
					class="bg-brand-green/10 text-brand-green flex size-11 items-center justify-center rounded-xl"
				>
					<Utensils class="size-5" />
				</div>
				<h3 class="mt-4 text-base font-bold text-neutral-900">Sri Lankan staples</h3>
				<p class="mt-2 text-sm leading-relaxed text-neutral-500">
					Curry powders, spice mixes, red rice, coconut products, papadam, karapincha
					and the brands you grew up with.
				</p>
			</div>

			<div class="group rounded-2xl bg-white p-6 ring-1 ring-black/5 transition hover:shadow-md">
				<div
					class="bg-brand-amber/15 text-brand-amber flex size-11 items-center justify-center rounded-xl"
				>
					<Leaf class="size-5" />
				</div>
				<h3 class="mt-4 text-base font-bold text-neutral-900">Fresh vegetables</h3>
				<p class="mt-2 text-sm leading-relaxed text-neutral-500">
					A rotating pick of fresh produce chosen for the way we actually cook —
					curries, tempered sides, and everyday tempers.
				</p>
			</div>

			<div class="group rounded-2xl bg-white p-6 ring-1 ring-black/5 transition hover:shadow-md">
				<div
					class="bg-brand-charcoal/10 text-brand-charcoal flex size-11 items-center justify-center rounded-xl"
				>
					<Sparkles class="size-5" />
				</div>
				<h3 class="mt-4 text-base font-bold text-neutral-900">Wider South Asian</h3>
				<p class="mt-2 text-sm leading-relaxed text-neutral-500">
					Halal-certified goods, atta flour, basmati rice, lentils, ghee, snacks and
					teas from across the region.
				</p>
			</div>

			<div class="group rounded-2xl bg-white p-6 ring-1 ring-black/5 transition hover:shadow-md">
				<div
					class="bg-brand-green/10 text-brand-green flex size-11 items-center justify-center rounded-xl"
				>
					<Heart class="size-5" />
				</div>
				<h3 class="mt-4 text-base font-bold text-neutral-900">Korean essentials</h3>
				<p class="mt-2 text-sm leading-relaxed text-neutral-500">
					The everyday Korean pantry items you shop for anyway — no need to make a
					second stop somewhere else.
				</p>
			</div>
		</div>
	</div>
</section>

<!-- Visit -->
<section class="bg-brand-cream">
	<div
		class="mx-auto grid max-w-350 gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:px-8"
	>
		<div>
			<p class="text-brand-green text-xs font-bold tracking-[0.3em] uppercase">
				Come say hello
			</p>
			<h2 class="mt-3 text-3xl font-extrabold text-neutral-900 sm:text-4xl">
				You&apos;ll find us in Dangjin.
			</h2>
			<p class="mt-4 text-base leading-relaxed text-neutral-600">
				We serve the local community in person and ship nationwide across South
				Korea. Stop by, or shop the whole store online — same prices either way.
			</p>

			<div class="mt-8 grid gap-4">
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
					Ready to shop?
				</p>
				<h3 class="mt-3 text-2xl font-extrabold sm:text-3xl">
					Order online, get it delivered anywhere in Korea.
				</h3>
				<p class="mt-4 text-sm leading-relaxed text-white/80">
					Browse the whole store from your phone — same stock, same prices, same
					family behind it. Weight-based shipping and local pickup available at
					checkout.
				</p>
			</div>

			<div class="relative mt-8 flex flex-wrap gap-3">
				<a
					href="/products"
					class="bg-brand-amber hover:bg-brand-amber-hover inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-neutral-900 transition"
				>
					Browse products
					<ArrowRight class="size-4" />
				</a>
				<a
					href="/contact"
					class="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
				>
					Contact us
				</a>
			</div>
		</div>
	</div>
</section>
