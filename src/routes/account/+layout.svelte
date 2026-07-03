<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { signOut } from '$lib/auth-client';
	import { LayoutDashboard, LogOut, MapPin, Package, User } from '@lucide/svelte';

	let { data, children } = $props();

	const nav = [
		{ href: '/account', label: 'Dashboard', icon: LayoutDashboard, match: (p: string) => p === '/account' },
		{ href: '/account/orders', label: 'Orders', icon: Package, match: (p: string) => p.startsWith('/account/orders') },
		{ href: '/account/addresses', label: 'Addresses', icon: MapPin, match: (p: string) => p.startsWith('/account/addresses') },
		{ href: '/account/details', label: 'Account details', icon: User, match: (p: string) => p.startsWith('/account/details') }
	];

	const currentPath = $derived(page.url.pathname);
	const currentLabel = $derived(nav.find((n) => n.match(currentPath))?.label ?? 'My Account');
	const isPublic = $derived(currentPath.startsWith('/account/login') || currentPath.startsWith('/account/signup'));

	async function logout() {
		await signOut();
		toast.success('Signed out');
		goto('/');
	}
</script>

{#if isPublic || !data.user}
	{@render children()}
{:else}
	<section class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
		<header>
			<h1 class="text-3xl font-extrabold text-neutral-900 sm:text-4xl">My account</h1>
			<nav aria-label="Breadcrumb" class="mt-2 flex items-center gap-2 text-sm text-neutral-500">
				<a href="/" class="hover:text-brand-green transition-colors">Home</a>
				<span class="text-neutral-300">/</span>
				<span class="text-neutral-900">{currentLabel}</span>
			</nav>
		</header>

		<div class="mt-8 grid gap-6 lg:grid-cols-[260px_1fr]">
			<aside
				class="bg-brand-cream ring-brand-charcoal/10 h-fit rounded-2xl p-4 ring-1 lg:sticky lg:top-24"
			>
				<p class="mb-3 border-b border-brand-charcoal/10 px-2 pb-3 text-xs font-bold tracking-widest text-neutral-500 uppercase">
					My Account
				</p>
				<ul class="space-y-1">
					{#each nav as item (item.href)}
						{@const active = item.match(currentPath)}
						<li>
							<a
								href={item.href}
								class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition {active
									? 'bg-brand-charcoal text-white'
									: 'text-neutral-700 hover:bg-white'}"
							>
								<item.icon class="size-4" />
								{item.label}
							</a>
						</li>
					{/each}
					<li>
						<button
							type="button"
							onclick={logout}
							class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-white"
						>
							<LogOut class="size-4" />
							Logout
						</button>
					</li>
				</ul>
			</aside>

			<div>
				{@render children()}
			</div>
		</div>
	</section>
{/if}
