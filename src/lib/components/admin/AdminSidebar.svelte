<script lang="ts">
	import { page } from '$app/state';
	import { goto, invalidateAll } from '$app/navigation';
	import {
		LayoutDashboard,
		Package,
		FolderTree,
		ShoppingBag,
		LogOut,
		Store
	} from '@lucide/svelte';
	import { cn } from '$lib/utils';
	import { signOut } from '$lib/auth-client';

	type SidebarUser = { name?: string | null; email?: string | null } | null;

	let {
		user = null,
		onNavigate
	}: { user?: SidebarUser; onNavigate?: () => void } = $props();

	const items = [
		{ href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
		{ href: '/admin/products', label: 'Products', icon: Package },
		{ href: '/admin/categories', label: 'Categories', icon: FolderTree },
		{ href: '/admin/orders', label: 'Orders', icon: ShoppingBag }
	];

	function initials(name?: string | null) {
		if (!name) return 'A';
		return name
			.split(/\s+/)
			.map((s) => s[0])
			.slice(0, 2)
			.join('')
			.toUpperCase();
	}

	async function handleSignOut() {
		await signOut();
		await invalidateAll();
		await goto('/');
	}
</script>

<div class="bg-sidebar text-sidebar-foreground flex h-full flex-col">
	<!-- Brand -->
	<div class="border-sidebar-border flex items-center justify-between border-b px-5 py-4">
		<a href="/admin" onclick={() => onNavigate?.()} class="text-base font-semibold tracking-tight">
			Food Corner
		</a>
	</div>

	<!-- Nav -->
	<nav class="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Admin">
		{#each items as item (item.href)}
			{@const active =
				item.href === '/admin'
					? page.url.pathname === '/admin'
					: page.url.pathname.startsWith(item.href)}
			<a
				href={item.href}
				onclick={() => onNavigate?.()}
				class={cn(
					'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
					active
						? 'bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-border/60 border shadow-sm'
						: 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
				)}
			>
				<item.icon class={cn('size-4 shrink-0', active && 'text-primary')} />
				<span class="truncate">{item.label}</span>
			</a>
		{/each}

		<div class="text-sidebar-foreground/50 px-3 pt-6 pb-2 text-xs font-semibold uppercase">
			Shortcuts
		</div>
		<a
			href="/"
			onclick={() => onNavigate?.()}
			class="text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm"
		>
			<Store class="size-4 shrink-0" />
			<span class="truncate">View storefront</span>
		</a>
	</nav>

	<!-- User section -->
	<div class="border-sidebar-border border-t p-3">
		<div class="flex items-center gap-3">
			<div
				class="bg-primary text-primary-foreground flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
			>
				{initials(user?.name)}
			</div>
			<div class="min-w-0 flex-1">
				<p class="truncate text-sm font-medium">{user?.name ?? 'Admin'}</p>
				<p class="text-sidebar-foreground/60 truncate text-xs">{user?.email ?? ''}</p>
			</div>
			<button
				type="button"
				onclick={handleSignOut}
				aria-label="Sign out"
				class="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground rounded-md p-2 transition-colors"
			>
				<LogOut class="size-4" />
			</button>
		</div>
	</div>
</div>
