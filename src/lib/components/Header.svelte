<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { cartCount } from '$lib/stores/cart';
	import { ShoppingCart, User, LogOut, Package } from '@lucide/svelte';
	import { signOut } from '$lib/auth-client';
	import { goto, invalidateAll } from '$app/navigation';

	type Category = { slug: string; name: string };
	type HeaderUser = { email: string; role?: string | null | undefined };
	let { categories = [], user = null }: { categories?: Category[]; user?: HeaderUser | null } = $props();

	async function handleSignOut() {
		await signOut();
		await invalidateAll();
		await goto('/');
	}
</script>

<header class="bg-background sticky top-0 z-40 w-full border-b">
	<div class="mx-auto flex h-16 max-w-350 items-center justify-between px-4 sm:px-6 lg:px-8">
		<div class="flex items-center gap-4">
			<a href="/" class="text-lg font-bold tracking-tight">
				Sri Lankan Food Corner
			</a>

			<nav class="ml-6 hidden items-center gap-4 md:flex">
				<a href="/products" class="text-muted-foreground hover:text-foreground text-sm">Products</a>
				{#each categories.slice(0, 5) as c (c.slug)}
					<a href="/category/{c.slug}" class="text-muted-foreground hover:text-foreground text-sm">
						{c.name}
					</a>
				{/each}
			</nav>
		</div>

		<div class="flex items-center gap-2">
			<Button href="/cart" variant="ghost" size="icon" class="relative hidden md:inline-flex">
				<ShoppingCart class="size-5" />
				{#if $cartCount > 0}
					<Badge class="absolute -top-1 -right-1 h-5 min-w-5 rounded-full px-1 text-xs">
						{$cartCount}
					</Badge>
				{/if}
				<span class="sr-only">Cart</span>
			</Button>

			{#if user}
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<Button {...props} variant="ghost" size="icon">
								<User class="size-5" />
								<span class="sr-only">Account</span>
							</Button>
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
				<Button href="/account/login" variant="ghost" size="sm">Login</Button>
				<Button href="/account/signup" size="sm">Sign up</Button>
			{/if}
		</div>
	</div>
</header>
