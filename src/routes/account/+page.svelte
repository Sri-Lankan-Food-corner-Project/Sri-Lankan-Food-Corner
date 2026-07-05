<script lang="ts">
	import { formatPrice } from '$lib/utils/formatPrice';
	import { signOut } from '$lib/auth-client';
	import { goto, invalidateAll } from '$app/navigation';
	import {
		ArrowRight,
		LoaderCircle,
		LogOut,
		MapPin,
		Package,
		ShieldCheck,
		User
	} from '@lucide/svelte';

	let { data } = $props();

	let signingOut = $state(false);

	async function handleSignOut() {
		if (signingOut) return;
		signingOut = true;
		try {
			await signOut();
			await invalidateAll();
			await goto('/');
		} finally {
			signingOut = false;
		}
	}
</script>

<div class="space-y-6">
	<div class="bg-brand-cream ring-brand-charcoal/10 rounded-2xl p-6 ring-1">
		<p class="text-sm text-neutral-500">Welcome back,</p>
		<h2 class="mt-1 text-2xl font-extrabold text-neutral-900">{data.user?.name}</h2>
		<p class="mt-1 text-sm text-neutral-600">{data.user?.email}</p>
		{#if data.user?.role === 'admin'}
			<a
				href="/admin"
				class="bg-brand-green mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-green-hover"
			>
				<ShieldCheck class="size-3.5" /> Go to admin dashboard
			</a>
		{/if}
	</div>

	<div class="grid gap-4 sm:grid-cols-2">
		<a
			href="/account/orders"
			class="bg-brand-cream ring-brand-charcoal/10 hover:ring-brand-green group rounded-2xl p-5 ring-1 transition"
		>
			<div class="flex items-center justify-between">
				<Package class="text-brand-green size-6" />
				<ArrowRight class="size-4 text-neutral-400 transition group-hover:translate-x-0.5" />
			</div>
			<h3 class="mt-3 text-base font-bold text-neutral-900">Orders</h3>
			<p class="mt-1 text-xs text-neutral-500">View your order history</p>
		</a>

		<a
			href="/account/addresses"
			class="bg-brand-cream ring-brand-charcoal/10 hover:ring-brand-green group rounded-2xl p-5 ring-1 transition"
		>
			<div class="flex items-center justify-between">
				<MapPin class="text-brand-green size-6" />
				<ArrowRight class="size-4 text-neutral-400 transition group-hover:translate-x-0.5" />
			</div>
			<h3 class="mt-3 text-base font-bold text-neutral-900">Addresses</h3>
			<p class="mt-1 text-xs text-neutral-500">Manage your shipping addresses</p>
		</a>

		<a
			href="/account/details"
			class="bg-brand-cream ring-brand-charcoal/10 hover:ring-brand-green group rounded-2xl p-5 ring-1 transition sm:col-span-2"
		>
			<div class="flex items-center justify-between">
				<User class="text-brand-green size-6" />
				<ArrowRight class="size-4 text-neutral-400 transition group-hover:translate-x-0.5" />
			</div>
			<h3 class="mt-3 text-base font-bold text-neutral-900">Account details</h3>
			<p class="mt-1 text-xs text-neutral-500">Update your name, email, or password</p>
		</a>
	</div>

	{#if data.recentOrders.length > 0}
		<div class="bg-brand-cream ring-brand-charcoal/10 rounded-2xl p-6 ring-1">
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-base font-bold text-neutral-900">Recent orders</h3>
				<a href="/account/orders" class="hover:text-brand-green text-xs font-semibold text-neutral-500">
					View all →
				</a>
			</div>
			<ul class="divide-brand-charcoal/10 divide-y">
				{#each data.recentOrders as o (o.id)}
					<a
						href="/account/orders/{o.orderNumber}"
						class="flex items-center justify-between py-3 transition hover:opacity-70"
					>
						<div>
							<p class="text-sm font-semibold text-neutral-900">Order {o.orderNumber}</p>
							<p class="text-xs text-neutral-500">
								{new Date(o.createdAt).toLocaleDateString('en-GB')} · {o.status}
							</p>
						</div>
						<span class="text-sm font-bold text-neutral-900">{formatPrice(o.totalAmount)}</span>
					</a>
				{/each}
			</ul>
		</div>
	{/if}

	<button
		type="button"
		onclick={handleSignOut}
		disabled={signingOut}
		class="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-red-200 bg-white px-6 py-3 text-sm font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
	>
		{#if signingOut}
			<LoaderCircle class="size-4 animate-spin" aria-hidden="true" />
			<span>Signing out…</span>
		{:else}
			<LogOut class="size-4" aria-hidden="true" />
			<span>Sign out</span>
		{/if}
	</button>
</div>
