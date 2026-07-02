<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { cartCount } from '$lib/stores/cart';
	import {
		MapPin,
		Phone,
		Heart,
		User,
		LogOut,
		Package,
		Menu,
		Search,
		ShoppingBag,
		ChevronDown
	} from '@lucide/svelte';
	import { signOut } from '$lib/auth-client';
	import { goto, invalidateAll } from '$app/navigation';
	import logo from '$lib/assets/logo.webp';
	import { site, telHref } from '$lib/config/site';

	type Category = { slug: string; name: string };
	type HeaderUser = { email: string; role?: string | null | undefined };
	let {
		categories = [],
		user = null
	}: { categories?: Category[]; user?: HeaderUser | null } = $props();

	let searchQuery = $state('');

	async function handleSignOut() {
		await signOut();
		await invalidateAll();
		await goto('/');
	}

	function handleSearch(e: SubmitEvent) {
		e.preventDefault();
		const q = searchQuery.trim();
		if (q) goto(`/products?q=${encodeURIComponent(q)}`);
	}
</script>

<header class="sticky top-0 z-40 w-full shadow-sm">
	<!-- Top thin bar: dark brown, desktop only -->
	<div class="hidden bg-[#2B4B1F] text-white/80 md:block">
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
					<DropdownMenu.Root>
						<DropdownMenu.Trigger>
							{#snippet child({ props })}
								<button
									{...props}
									class="flex items-center gap-1.5 transition-colors hover:text-white"
								>
									<User class="size-3.5" />
									My Account
									<ChevronDown class="size-3" />
								</button>
							{/snippet}
						</DropdownMenu.Trigger>
						<DropdownMenu.Content align="end">
							<DropdownMenu.Label>{user.email}</DropdownMenu.Label>
							<DropdownMenu.Separator />
							<DropdownMenu.Item>
								{#snippet child({ props })}
									<a href="/account" {...props}>
										<User class="mr-2 size-4" /> Profile
									</a>
								{/snippet}
							</DropdownMenu.Item>
							<DropdownMenu.Item>
								{#snippet child({ props })}
									<a href="/account/orders" {...props}>
										<Package class="mr-2 size-4" /> Orders
									</a>
								{/snippet}
							</DropdownMenu.Item>
							{#if user.role === 'admin'}
								<DropdownMenu.Separator />
								<DropdownMenu.Item>
									{#snippet child({ props })}
										<a href="/admin" {...props}>Admin Panel</a>
									{/snippet}
								</DropdownMenu.Item>
							{/if}
							<DropdownMenu.Separator />
							<DropdownMenu.Item onSelect={handleSignOut}>
								<LogOut class="mr-2 size-4" /> Sign out
							</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
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
	<div class="bg-[#F6EEDC]">
		<div
			class="mx-auto flex h-21.5 max-w-350 items-center gap-3 px-4 sm:gap-4 sm:px-6 lg:gap-6 lg:px-8"
		>
			<a href="/" class="flex shrink-0 items-center" aria-label="Home">
				<img src={logo} alt={site.name} class="h-11 w-auto sm:h-12 md:h-14" />
			</a>

			<div class="flex flex-1 items-center gap-3">
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<button
								{...props}
								class="hidden shrink-0 items-center gap-2 rounded-full bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800 md:inline-flex"
							>
								<Menu class="size-4" />
								All Categories
							</button>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content align="start" class="w-56">
						<DropdownMenu.Item>
							{#snippet child({ props })}
								<a href="/products" {...props}>All Products</a>
							{/snippet}
						</DropdownMenu.Item>
						{#if categories.length > 0}
							<DropdownMenu.Separator />
							{#each categories as c (c.slug)}
								<DropdownMenu.Item>
									{#snippet child({ props })}
										<a href="/category/{c.slug}" {...props}>{c.name}</a>
									{/snippet}
								</DropdownMenu.Item>
							{/each}
						{/if}
					</DropdownMenu.Content>
				</DropdownMenu.Root>

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

			<a
				href="/cart"
				class="relative shrink-0"
				aria-label="Cart ({$cartCount} items)"
			>
				<span
					class="flex size-11 items-center justify-center rounded-full bg-[#E8B267] text-neutral-900 shadow-sm transition-colors hover:bg-[#DFA755]"
				>
					<ShoppingBag class="size-5" />
				</span>
				<Badge
					class="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-neutral-900 px-1 text-[10px] font-medium text-white"
				>
					{$cartCount}
				</Badge>
			</a>
		</div>
	</div>
</header>
