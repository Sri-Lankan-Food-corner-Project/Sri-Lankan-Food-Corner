<script lang="ts">
	import { page } from '$app/state';
	import { LayoutDashboard, Package, FolderTree, ShoppingBag } from '@lucide/svelte';
	import { cn } from '$lib/utils';

	const items = [
		{ href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
		{ href: '/admin/products', label: 'Products', icon: Package },
		{ href: '/admin/categories', label: 'Categories', icon: FolderTree },
		{ href: '/admin/orders', label: 'Orders', icon: ShoppingBag }
	];
</script>

<aside class="bg-sidebar text-sidebar-foreground w-60 shrink-0 border-r">
	<div class="border-b px-6 py-4">
		<a href="/admin" class="text-base font-semibold">Admin</a>
	</div>
	<nav class="flex flex-col gap-1 p-3">
		{#each items as item (item.href)}
			{@const active =
				item.href === '/admin'
					? page.url.pathname === '/admin'
					: page.url.pathname.startsWith(item.href)}
			<a
				href={item.href}
				class={cn(
					'flex items-center gap-2 rounded-md px-3 py-2 text-sm',
					active
						? 'bg-sidebar-accent text-sidebar-accent-foreground'
						: 'hover:bg-sidebar-accent/50'
				)}
			>
				<item.icon class="size-4" />
				{item.label}
			</a>
		{/each}
	</nav>
</aside>
