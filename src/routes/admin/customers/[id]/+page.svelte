<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import * as Table from '$lib/components/ui/table';
	import * as Dialog from '$lib/components/ui/dialog';
	import OrderStatusBadge from '$lib/components/admin/OrderStatusBadge.svelte';
	import PaymentStatusBadge from '$lib/components/admin/PaymentStatusBadge.svelte';
	import { formatPrice } from '$lib/utils/formatPrice';
	import {
		ArrowLeft,
		ArrowRight,
		Mail,
		Phone,
		MapPin,
		ShieldCheck,
		BadgeCheck,
		Calendar,
		ShoppingBag,
		Wallet,
		TrendingUp
	} from '@lucide/svelte';

	let { data } = $props();

	let roleDialogOpen = $state(false);
	let nextRole = $state(data.customer.role);

	function openRoleDialog() {
		nextRole = data.customer.role;
		roleDialogOpen = true;
	}

	function formatDate(d: Date | string | null) {
		if (!d) return '—';
		const date = typeof d === 'string' ? new Date(d) : d;
		return date.toLocaleDateString('en-GB', {
			day: '2-digit',
			month: 'short',
			year: 'numeric'
		});
	}

	function formatDateTime(d: Date | string | null) {
		if (!d) return '—';
		const date = typeof d === 'string' ? new Date(d) : d;
		return date.toLocaleString('en-GB', {
			day: '2-digit',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	const isSelf = $derived(page.data.user?.id === data.customer.id);
</script>

<!-- Header -->
<div class="flex flex-wrap items-start justify-between gap-3">
	<div class="min-w-0">
		<a
			href="/admin/customers"
			class="text-muted-foreground inline-flex items-center gap-1 text-sm hover:underline"
		>
			<ArrowLeft class="size-4" /> Back to customers
		</a>
		<div class="mt-2 flex flex-wrap items-center gap-2">
			<h1 class="text-2xl font-bold">{data.customer.name}</h1>
			{#if data.customer.role === 'admin'}
				<span class="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-800">
					<ShieldCheck class="size-3" /> Admin
				</span>
			{/if}
			{#if data.customer.emailVerified}
				<span class="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
					<BadgeCheck class="size-3" /> Verified
				</span>
			{/if}
		</div>
	</div>
	<div class="flex gap-2">
		<Button variant="outline" onclick={openRoleDialog} disabled={isSelf}>
			Change role
		</Button>
	</div>
</div>

<!-- Stat cards -->
<div class="mt-6 grid gap-4 sm:grid-cols-3">
	<div class="bg-card rounded-md border p-4">
		<div class="text-muted-foreground flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
			<ShoppingBag class="size-3.5" /> Orders
		</div>
		<div class="mt-2 text-2xl font-bold">{data.stats.totalOrders}</div>
		<div class="text-muted-foreground text-xs">{data.stats.paidOrders} paid</div>
	</div>
	<div class="bg-card rounded-md border p-4">
		<div class="text-muted-foreground flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
			<Wallet class="size-3.5" /> Lifetime spend
		</div>
		<div class="mt-2 text-2xl font-bold">{formatPrice(data.stats.totalSpent)}</div>
	</div>
	<div class="bg-card rounded-md border p-4">
		<div class="text-muted-foreground flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
			<TrendingUp class="size-3.5" /> Avg order value
		</div>
		<div class="mt-2 text-2xl font-bold">{formatPrice(data.stats.avgOrderValue)}</div>
	</div>
</div>

<div class="mt-6 grid gap-6 lg:grid-cols-3">
	<!-- LEFT: recent orders -->
	<div class="lg:col-span-2 space-y-6">
		<section class="bg-card rounded-md border">
			<div class="flex items-center justify-between border-b p-4">
				<h2 class="flex items-center gap-2 text-sm font-semibold">
					<ShoppingBag class="size-4" /> Orders ({data.orders.length})
				</h2>
			</div>
			{#if data.orders.length === 0}
				<p class="text-muted-foreground p-6 text-center text-sm">No orders yet.</p>
			{:else}
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Order</Table.Head>
							<Table.Head>Date</Table.Head>
							<Table.Head class="text-right">Total</Table.Head>
							<Table.Head>Status</Table.Head>
							<Table.Head>Payment</Table.Head>
							<Table.Head class="w-12"></Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each data.orders as o (o.id)}
							<Table.Row>
								<Table.Cell class="font-medium">
									<a href="/admin/orders/{o.id}" class="hover:underline">{o.orderNumber}</a>
								</Table.Cell>
								<Table.Cell class="text-muted-foreground text-sm">
									{formatDateTime(o.createdAt)}
								</Table.Cell>
								<Table.Cell class="text-right font-semibold">
									{formatPrice(o.totalAmount)}
								</Table.Cell>
								<Table.Cell><OrderStatusBadge status={o.status} /></Table.Cell>
								<Table.Cell><PaymentStatusBadge status={o.paymentStatus} /></Table.Cell>
								<Table.Cell class="text-right">
									<Button href="/admin/orders/{o.id}" variant="ghost" size="icon" aria-label="Open order">
										<ArrowRight class="size-4" />
									</Button>
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			{/if}
			{#if data.orders.length === 20}
				<p class="text-muted-foreground border-t px-4 py-2 text-xs">
					Showing the 20 most recent orders.
				</p>
			{/if}
		</section>
	</div>

	<!-- RIGHT: profile + addresses -->
	<div class="space-y-6">
		<section class="bg-card rounded-md border">
			<h2 class="border-b p-4 text-sm font-semibold">Contact</h2>
			<div class="space-y-3 p-4 text-sm">
				<div class="flex items-center gap-2">
					<Mail class="text-muted-foreground size-4" />
					<a href="mailto:{data.customer.email}" class="hover:underline">
						{data.customer.email}
					</a>
				</div>
				{#if data.customer.phone}
					<div class="flex items-center gap-2">
						<Phone class="text-muted-foreground size-4" />
						<a href="tel:{data.customer.phone}" class="hover:underline">
							{data.customer.phone}
						</a>
					</div>
				{/if}
				<div class="text-muted-foreground flex items-center gap-2 pt-2 text-xs">
					<Calendar class="size-3.5" />
					Joined {formatDate(data.customer.createdAt)}
				</div>
			</div>
		</section>

		<section class="bg-card rounded-md border">
			<h2 class="flex items-center gap-2 border-b p-4 text-sm font-semibold">
				<MapPin class="size-4" /> Saved addresses ({data.addresses.length})
			</h2>
			{#if data.addresses.length === 0}
				<p class="text-muted-foreground p-4 text-sm">No saved addresses.</p>
			{:else}
				<ul class="divide-y">
					{#each data.addresses as addr (addr.id)}
						<li class="p-4 text-sm">
							<div class="flex items-center justify-between gap-2">
								<span class="font-medium">
									{addr.label ?? 'Address'}
								</span>
								{#if addr.isDefault}
									<span class="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">
										Default
									</span>
								{/if}
							</div>
							<div class="text-muted-foreground mt-1 space-y-0.5 text-xs">
								<p>{addr.fullName} · {addr.phone}</p>
								<p>{addr.street}</p>
								{#if addr.houseNumber}
									<p>House {addr.houseNumber}{addr.roomNumber ? `, Room ${addr.roomNumber}` : ''}</p>
								{/if}
								<p>{addr.city}, {addr.postcode} · {addr.country}</p>
							</div>
						</li>
					{/each}
				</ul>
			{/if}
		</section>
	</div>
</div>

<!-- Role dialog -->
<Dialog.Root bind:open={roleDialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Change customer role</Dialog.Title>
			<Dialog.Description>
				Admins can access the admin panel and manage products, orders, and other users. Only change this for people you trust.
			</Dialog.Description>
		</Dialog.Header>
		<form
			method="POST"
			action="?/setRole"
			use:enhance={() =>
				async ({ result, update }) => {
					if (result.type === 'success' || result.type === 'redirect') roleDialogOpen = false;
					await update();
				}}
			class="grid gap-4"
		>
			<div class="grid gap-2">
				<label class="text-sm font-medium">Role</label>
				<select
					name="role"
					bind:value={nextRole}
					class="border-input bg-background rounded-md border px-3 py-2 text-sm"
				>
					<option value="customer">Customer</option>
					<option value="admin">Admin</option>
				</select>
			</div>
			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => (roleDialogOpen = false)}>
					Cancel
				</Button>
				<Button type="submit">Save</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
