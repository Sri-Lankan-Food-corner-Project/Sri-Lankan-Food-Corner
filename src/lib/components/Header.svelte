<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import * as Sheet from '$lib/components/ui/sheet';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { cartCount } from '$lib/stores/cart';
	import { ShoppingCart, Menu, User, LogOut, Package } from '@lucide/svelte';

	type Category = { slug: string; name: string };
	let { categories = [], user = null }: { categories?: Category[]; user?: { email: string; role: string } | null } = $props();
</script>

<header class="bg-background sticky top-0 z-40 w-full border-b">
	<div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
		<div class="flex items-center gap-4">
			<Sheet.Root>
				<Sheet.Trigger>
					{#snippet child({ props })}
						<Button {...props} variant="ghost" size="icon" class="md:hidden">
							<Menu class="size-5" />
							<span class="sr-only">Open menu</span>
						</Button>
					{/snippet}
				</Sheet.Trigger>
				<Sheet.Content side="left" class="w-72">
					<Sheet.Header>
						<Sheet.Title>Categories</Sheet.Title>
					</Sheet.Header>
					<nav class="mt-4 flex flex-col gap-1 px-4">
						<a href="/" class="hover:bg-accent rounded-md px-3 py-2 text-sm">Home</a>
						<a href="/products" class="hover:bg-accent rounded-md px-3 py-2 text-sm">All Products</a>
						{#each categories as c (c.slug)}
							<a href="/category/{c.slug}" class="hover:bg-accent rounded-md px-3 py-2 text-sm">
								{c.name}
							</a>
						{/each}
					</nav>
				</Sheet.Content>
			</Sheet.Root>

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
			<Button href="/cart" variant="ghost" size="icon" class="relative">
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
						<DropdownMenu.Item>
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
