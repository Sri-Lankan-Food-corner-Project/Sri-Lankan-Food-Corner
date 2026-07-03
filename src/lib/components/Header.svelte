<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { cartCount } from '$lib/stores/cart';
	import { cartOpen } from '$lib/stores/cartUi';
	import { MapPin, Phone, Heart, User, Search, ShoppingBag } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import logo from '$lib/assets/logo.webp';
	import { site, telHref } from '$lib/config/site';
	import AccountMenu from '$lib/components/header/AccountMenu.svelte';
	import CategoriesMenu from '$lib/components/header/CategoriesMenu.svelte';

	type Category = { slug: string; name: string };
	type HeaderUser = { email: string; role?: string | null | undefined };
	let {
		categories = [],
		user = null
	}: { categories?: Category[]; user?: HeaderUser | null } = $props();

	let searchQuery = $state('');

	function handleSearch(e: SubmitEvent) {
		e.preventDefault();
		const q = searchQuery.trim();
		if (q) goto(`/products?q=${encodeURIComponent(q)}`);
	}
</script>

<header class="sticky top-0 z-40 w-full shadow-sm">
	<!-- Top thin bar: dark brown, desktop only -->
	<div class="hidden bg-brand-green text-white/80 md:block">
		<div
			class="mx-auto flex h-9 max-w-350 items-center justify-between px-4 text-xs sm:px-6 lg:px-8"
		>
			<nav class="flex items-center gap-5" aria-label="Top">
				<a href="/about" class="transition-colors hover:text-white">About Us</a>
				<span class="text-white/25">|</span>
				<a href="/contact" class="transition-colors hover:text-white">Contact Us</a>
				<span class="text-white/25">|</span>
				<a href="/blog" class="transition-colors hover:text-white">Blog</a>
			</nav>
			<div class="flex items-center gap-5">
				<a
					href={site.mapUrl}
					target="_blank"
					rel="noopener"
					class="flex items-center gap-1.5 transition-colors hover:text-white"
				>
					<MapPin class="size-3.5" /> Store Location
				</a>
				<a
					href={telHref(site.phone.primary)}
					class="flex items-center gap-1.5 transition-colors hover:text-white"
				>
					<Phone class="size-3.5" /> {site.phone.primary}
				</a>
				<a
					href="/account/wishlist"
					class="flex items-center gap-1.5 transition-colors hover:text-white"
				>
					<Heart class="size-3.5" /> Wishlist
				</a>

				{#if user}
					<AccountMenu {user} />
				{:else}
					<a
						href="/account/login"
						class="flex items-center gap-1.5 transition-colors hover:text-white"
					>
						<User class="size-3.5" /> Login / Register
					</a>
				{/if}
			</div>
		</div>
	</div>

	<!-- Main bar: 86px, cream -->
	<div class="bg-brand-cream">
		<div
			class="mx-auto flex h-21.5 max-w-350 items-center gap-3 px-4 sm:gap-4 sm:px-6 lg:gap-6 lg:px-8"
		>
			<a href="/" class="flex shrink-0 items-center" aria-label="Home">
				<img src={logo} alt={site.name} class="h-11 w-auto sm:h-12 md:h-14" />
			</a>

			<div class="flex flex-1 items-center gap-3">
				<CategoriesMenu {categories} />

				<form onsubmit={handleSearch} class="flex-1" role="search">
					<div
						class="focus-within:border-neutral-400 focus-within:ring-2 focus-within:ring-neutral-900/10 flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2.5 transition"
					>
						<Search class="size-4 shrink-0 text-neutral-400" />
						<input
							bind:value={searchQuery}
							type="text"
							placeholder="Search for products"
							aria-label="Search for products"
							class="w-full border-0 bg-transparent p-0 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-0 focus:outline-none focus:ring-0"
						/>
					</div>
				</form>
			</div>

			<button
				type="button"
				onclick={() => cartOpen.set(true)}
				class="relative shrink-0 cursor-pointer"
				aria-label="Cart ({$cartCount} items)"
			>
				<span
					class="flex size-11 items-center justify-center rounded-full bg-brand-amber text-neutral-900 shadow-sm transition-colors hover:bg-brand-amber-hover"
				>
					<ShoppingBag class="size-5" />
				</span>
				<Badge
					class="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-neutral-900 px-1 text-[10px] font-medium text-white"
				>
					{$cartCount}
				</Badge>
			</button>
		</div>
	</div>
</header>
