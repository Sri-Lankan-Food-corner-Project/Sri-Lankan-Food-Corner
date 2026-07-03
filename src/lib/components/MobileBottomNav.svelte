<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import * as Sheet from '$lib/components/ui/sheet';
	import { Badge } from '$lib/components/ui/badge';
	import { cartCount } from '$lib/stores/cart';
	import { cartOpen } from '$lib/stores/cartUi';
	import { showAuth } from '$lib/stores/authUi';
	import { cn } from '$lib/utils';
	import { Menu, Heart, Home, ShoppingCart, User } from '@lucide/svelte';

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
			'flex flex-col items-center justify-center gap-1 py-2 text-xs',
			active ? 'text-foreground' : 'text-muted-foreground'
		);
	}
</script>

<nav
	class="bg-background fixed right-0 bottom-0 left-0 z-40 border-t md:hidden"
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
			<Sheet.Content side="left" class="w-72 p-0">
				<Sheet.Header class="border-b p-4">
					<Sheet.Title>Categories</Sheet.Title>
				</Sheet.Header>
				<nav class="flex flex-col p-2" aria-label="Categories">
					<a
						href="/"
						onclick={() => (menuOpen = false)}
						class="hover:bg-accent rounded-md px-3 py-2 text-sm">Home</a
					>
					<a
						href="/products"
						onclick={() => (menuOpen = false)}
						class="hover:bg-accent rounded-md px-3 py-2 text-sm">All Products</a
					>
					{#if categories.length > 0}
						<div class="text-muted-foreground mt-4 px-3 pb-1 text-xs font-semibold uppercase">
							Categories
						</div>
					{/if}
					{#each categories as c (c.slug)}
						<a
							href="/category/{c.slug}"
							onclick={() => (menuOpen = false)}
							class="hover:bg-accent rounded-md px-3 py-2 text-sm"
						>
							{c.name}
						</a>
					{/each}
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
						class="absolute -top-2 -right-2 h-4 min-w-4 rounded-full px-1 text-[10px]"
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
