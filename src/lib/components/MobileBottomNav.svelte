<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import * as Sheet from '$lib/components/ui/sheet';
	import { Badge } from '$lib/components/ui/badge';
	import { cartCount } from '$lib/stores/cart';
	import { cartOpen } from '$lib/stores/cartUi';
	import { showAuth } from '$lib/stores/authUi';
	import { cn } from '$lib/utils';
	import {
		Menu,
		Heart,
		Home,
		ShoppingCart,
		User,
		ChevronRight,
		LayoutGrid,
		X,
		Info,
		Phone
	} from '@lucide/svelte';

	type Category = { slug: string; name: string };
	type NavUser = { email: string; role?: string | null | undefined };
	let {
		categories = [],
		user = null
	}: {
		categories?: Category[];
		user?: NavUser | null;
	} = $props();

	async function guarded(href: string) {
		if (user) {
			goto(href);
			return;
		}
		const ok = await showAuth({ mode: 'login' });
		if (ok) goto(href);
	}

	let menuOpen = $state(false);

	function isActive(path: string) {
		return page.url.pathname === path;
	}

	function itemClass(active: boolean) {
		return cn(
			'flex flex-col items-center justify-center gap-1 py-2 text-xs transition-colors',
			active ? 'text-brand-charcoal font-semibold' : 'text-neutral-500 hover:text-neutral-900'
		);
	}

	const linkClass =
		'flex w-full items-center justify-between gap-2 rounded-md px-3 py-2.5 text-sm text-neutral-700 cursor-pointer hover:bg-brand-charcoal hover:text-white [&_svg.chev]:opacity-0 hover:[&_svg.chev]:opacity-100 hover:[&_svg]:text-white transition-colors';
</script>

<nav
	class="fixed right-0 bottom-0 left-0 z-40 border-t border-black/5 bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
	aria-label="Mobile"
>
	<div class="mx-auto grid max-w-7xl grid-cols-5">
		<Sheet.Root bind:open={menuOpen}>
			<Sheet.Trigger>
				{#snippet child({ props })}
					<button {...props} class={itemClass(false)} aria-label="Open menu">
						<Menu class="size-5" />
						<span>Menu</span>
					</button>
				{/snippet}
			</Sheet.Trigger>
			<Sheet.Content
				side="left"
				showCloseButton={false}
				class="bg-white! flex w-80 max-w-[85vw] flex-col gap-0 p-0 text-neutral-900"
			>
				<Sheet.Header class="flex flex-row items-center justify-between border-b border-black/5 p-5">
					<Sheet.Title class="text-lg font-bold text-neutral-900">Categories</Sheet.Title>
					<Sheet.Description class="sr-only">Browse product categories</Sheet.Description>
					<Sheet.Close
						class="inline-flex items-center gap-1.5 text-sm text-neutral-600 transition-colors hover:text-neutral-900"
					>
						<X class="size-4" />
						<span>Close</span>
					</Sheet.Close>
				</Sheet.Header>

				<div class="bg-brand-green px-5 py-2.5">
					<p class="text-[10px] font-semibold tracking-wider text-white/80 uppercase">
						Browse
					</p>
				</div>

				<nav class="flex-1 overflow-y-auto p-2" aria-label="Categories">
					<a href="/" onclick={() => (menuOpen = false)} class={linkClass}>
						<span class="flex items-center gap-2.5">
							<Home class="size-4 text-neutral-500" />
							<span class="font-medium">Home</span>
						</span>
						<ChevronRight class="chev size-3.5 text-neutral-400 transition-opacity" />
					</a>
					<a href="/products" onclick={() => (menuOpen = false)} class={linkClass}>
						<span class="flex items-center gap-2.5">
							<LayoutGrid class="size-4 text-neutral-500" />
							<span class="font-medium">All Products</span>
						</span>
						<ChevronRight class="chev size-3.5 text-neutral-400 transition-opacity" />
					</a>

					{#if categories.length > 0}
						<div class="my-2 h-px bg-black/5"></div>
						<p class="px-3 pt-1 pb-1.5 text-[10px] font-semibold tracking-wider text-neutral-500 uppercase">
							Categories
						</p>
						{#each categories as c (c.slug)}
							<a
								href="/category/{c.slug}"
								onclick={() => (menuOpen = false)}
								class={linkClass}
							>
								<span>{c.name}</span>
								<ChevronRight class="chev size-3.5 text-neutral-400 transition-opacity" />
							</a>
						{/each}
					{/if}

					<div class="my-2 h-px bg-black/5"></div>
					<p class="px-3 pt-1 pb-1.5 text-[10px] font-semibold tracking-wider text-neutral-500 uppercase">
						Info
					</p>
					<a href="/about" onclick={() => (menuOpen = false)} class={linkClass}>
						<span class="flex items-center gap-2.5">
							<Info class="size-4 text-neutral-500" />
							<span class="font-medium">About Us</span>
						</span>
						<ChevronRight class="chev size-3.5 text-neutral-400 transition-opacity" />
					</a>
					<a href="/contact" onclick={() => (menuOpen = false)} class={linkClass}>
						<span class="flex items-center gap-2.5">
							<Phone class="size-4 text-neutral-500" />
							<span class="font-medium">Contact Us</span>
						</span>
						<ChevronRight class="chev size-3.5 text-neutral-400 transition-opacity" />
					</a>
				</nav>
			</Sheet.Content>
		</Sheet.Root>

		<button
			type="button"
			onclick={() => guarded('/account/wishlist')}
			class={itemClass(isActive('/account/wishlist'))}
		>
			<Heart class="size-5" />
			<span>Wishlist</span>
		</button>

		<a href="/" class={itemClass(isActive('/'))}>
			<Home class="size-5" />
			<span>Home</span>
		</a>

		<button type="button" onclick={() => cartOpen.set(true)} class={itemClass(false)}>
			<span class="relative">
				<ShoppingCart class="size-5" />
				{#if $cartCount > 0}
					<Badge
						class="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-neutral-900 px-1 text-[10px] text-white"
					>
						{$cartCount}
					</Badge>
				{/if}
			</span>
			<span>Cart</span>
		</button>

		<button
			type="button"
			onclick={() => guarded('/account')}
			class={itemClass(page.url.pathname.startsWith('/account'))}
		>
			<User class="size-5" />
			<span>Account</span>
		</button>
	</div>
</nav>

<style>
	:global([data-slot='sheet-content'][data-side='left'][data-state='open']) {
		animation: sheet-slide-in-left 450ms cubic-bezier(0.32, 0.72, 0, 1);
	}
	:global([data-slot='sheet-content'][data-side='left'][data-state='closed']) {
		animation: sheet-slide-out-left 300ms cubic-bezier(0.32, 0.72, 0, 1);
	}

	@keyframes -global-sheet-slide-in-left {
		from {
			transform: translateX(-100%);
		}
		to {
			transform: translateX(0);
		}
	}
	@keyframes -global-sheet-slide-out-left {
		from {
			transform: translateX(0);
		}
		to {
			transform: translateX(-100%);
		}
	}
</style>
