<script lang="ts">
	import { page } from '$app/state';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { ChevronDown, LayoutDashboard, MapPin, Package, User } from '@lucide/svelte';

	let { data, children } = $props();

	const nav = [
		{
			href: '/account',
			label: 'Dashboard',
			icon: LayoutDashboard,
			match: (p: string) => p === '/account'
		},
		{
			href: '/account/orders',
			label: 'Orders',
			icon: Package,
			match: (p: string) => p.startsWith('/account/orders')
		},
		{
			href: '/account/addresses',
			label: 'Addresses',
			icon: MapPin,
			match: (p: string) => p.startsWith('/account/addresses')
		},
		{
			href: '/account/details',
			label: 'Account details',
			icon: User,
			match: (p: string) => p.startsWith('/account/details')
		}
	];

	const currentPath = $derived(page.url.pathname);
	const currentItem = $derived(nav.find((n) => n.match(currentPath)) ?? nav[0]);
	const currentLabel = $derived(currentItem.label);
	const isPublic = $derived(
		currentPath.startsWith('/account/login') || currentPath.startsWith('/account/signup')
	);

	const menuItemClass =
		'flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-neutral-700! cursor-pointer focus:bg-brand-charcoal! focus:text-white! focus:[&_svg]:text-white! outline-none transition-colors';
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

		<!-- Mobile: dropdown selector -->
		<div class="mt-6 lg:hidden">
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					{#snippet child({ props })}
						<button
							{...props}
							class="bg-brand-cream ring-brand-charcoal/10 flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-semibold text-neutral-900 ring-1 transition hover:bg-white"
						>
							<span class="inline-flex items-center gap-3">
								<currentItem.icon class="size-4" />
								{currentLabel}
							</span>
							<ChevronDown class="size-4 text-neutral-500" />
						</button>
					{/snippet}
				</DropdownMenu.Trigger>

				<DropdownMenu.Content
					align="start"
					sideOffset={8}
					class="w-[calc(100vw-2rem)] rounded-xl! border! border-black/5! bg-white! p-0! text-neutral-800! shadow-xl! ring-0! overflow-hidden sm:min-w-64! sm:w-auto!"
				>
					<div class="bg-brand-green border-b border-black/10 px-4 py-2.5">
						<p class="text-[10px] font-semibold tracking-wider text-white/80 uppercase">
							My Account
						</p>
					</div>
					<div class="p-1.5">
						{#each nav as item (item.href)}
							{@const active = item.match(currentPath)}
							<DropdownMenu.Item class={menuItemClass}>
								{#snippet child({ props })}
									<a
										href={item.href}
										{...props}
										class="{menuItemClass} {active
											? 'bg-brand-charcoal/5 font-semibold text-neutral-900!'
											: ''}"
									>
										<item.icon class="size-4 text-neutral-500" />
										<span class="flex-1">{item.label}</span>
									</a>
								{/snippet}
							</DropdownMenu.Item>
						{/each}
					</div>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>

		<div class="mt-6 grid gap-6 lg:mt-8 lg:grid-cols-[260px_1fr]">
			<!-- Desktop: sidebar -->
			<aside
				class="bg-brand-cream ring-brand-charcoal/10 hidden h-fit rounded-2xl p-4 ring-1 lg:sticky lg:top-24 lg:block"
			>
				<p
					class="border-brand-charcoal/10 mb-3 border-b px-2 pb-3 text-xs font-bold tracking-widest text-neutral-500 uppercase"
				>
					My Account
				</p>
				<ul class="space-y-1">
					{#each nav as item (item.href)}
						{@const active = item.match(currentPath)}
						<li>
							<a
								href={item.href}
								class="hover:bg-brand-charcoal hover:text-white flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition {active
									? 'bg-brand-charcoal text-white'
									: 'text-neutral-700'}"
							>
								<item.icon class="size-4" />
								{item.label}
							</a>
						</li>
					{/each}
				</ul>
			</aside>

			<div>
				{@render children()}
			</div>
		</div>
	</section>
{/if}
