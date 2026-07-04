<script lang="ts">
	import StatCard from '$lib/components/admin/StatCard.svelte';
	import RevenueChart from '$lib/components/admin/RevenueChart.svelte';
	import OrderStatusBadge from '$lib/components/admin/OrderStatusBadge.svelte';
	import PaymentStatusBadge from '$lib/components/admin/PaymentStatusBadge.svelte';
	import { formatPrice } from '$lib/utils/formatPrice';
	import {
		Banknote,
		ShoppingBag,
		Users,
		Clock,
		AlertTriangle,
		Package,
		ArrowRight
	} from '@lucide/svelte';

	let { data } = $props();

	function formatDateTime(d: Date | string | null) {
		if (!d) return '—';
		const date = typeof d === 'string' ? new Date(d) : d;
		return date.toLocaleString('en-GB', {
			day: '2-digit',
			month: 'short',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<div class="flex flex-wrap items-center justify-between gap-3">
	<h1 class="text-2xl font-bold sm:text-3xl">Dashboard</h1>
</div>

<!-- Stat cards — 1 col mobile, 2 tablet, 4 desktop -->
<div class="mt-6 grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
	<StatCard
		label="Revenue (paid)"
		value={formatPrice(data.stats.totalRevenue)}
		hint={`${formatPrice(data.stats.todayRevenue)} today · ${formatPrice(data.stats.weekRevenue)} this week`}
		icon={Banknote}
		accent="green"
	/>
	<StatCard
		label="Orders"
		value={String(data.stats.totalOrders)}
		hint={`${data.stats.todayOrders} today`}
		icon={ShoppingBag}
		accent="blue"
		href="/admin/orders"
	/>
	<StatCard
		label="Pending orders"
		value={String(data.stats.pendingOrders)}
		hint={data.stats.pendingOrders > 0 ? 'Needs your attention' : 'All caught up'}
		icon={Clock}
		accent={data.stats.pendingOrders > 0 ? 'amber' : 'default'}
		href="/admin/orders?status=pending"
	/>
	<StatCard
		label="Customers"
		value={String(data.stats.totalCustomers)}
		hint={`+${data.stats.newCustomersThisWeek} this week`}
		icon={Users}
		accent="default"
		href="/admin/customers"
	/>
</div>

<!-- Secondary row — smaller stats about revenue-at-risk & inventory -->
<div class="mt-4 grid gap-3 sm:grid-cols-2">
	<StatCard
		label="Unpaid orders"
		value={String(data.stats.unpaidOrders)}
		hint={data.stats.unpaidOrders > 0 ? `${formatPrice(data.stats.unpaidAmount)} awaiting payment` : 'Nothing owed'}
		icon={AlertTriangle}
		accent={data.stats.unpaidOrders > 0 ? 'red' : 'default'}
		href="/admin/orders?payment=unpaid"
	/>
	<StatCard
		label="Low stock"
		value={String(data.stats.lowStockCount)}
		hint={data.stats.lowStockCount > 0 ? 'Items with fewer than 5 in stock' : 'Everything stocked'}
		icon={Package}
		accent={data.stats.lowStockCount > 0 ? 'amber' : 'default'}
		href="/admin/products"
	/>
</div>

<!-- Chart -->
<div class="mt-6">
	<RevenueChart data={data.chart} />
</div>

<!-- New orders -->
<div class="bg-card mt-6 rounded-lg border">
	<div class="flex items-center justify-between border-b p-4">
		<h2 class="text-sm font-semibold">New orders</h2>
		<a href="/admin/orders" class="text-primary text-xs font-medium hover:underline">
			View all →
		</a>
	</div>

	{#if data.recentOrders.length === 0}
		<p class="text-muted-foreground p-6 text-center text-sm">No orders yet.</p>
	{:else}
		<!-- Desktop table (hidden on mobile) -->
		<div class="hidden overflow-x-auto md:block">
			<table class="w-full text-sm">
				<thead class="text-muted-foreground border-b text-left text-xs uppercase tracking-wider">
					<tr>
						<th class="p-3">Order</th>
						<th class="p-3">Date</th>
						<th class="p-3">Customer</th>
						<th class="p-3 text-right">Total</th>
						<th class="p-3">Status</th>
						<th class="p-3">Payment</th>
						<th class="w-12"></th>
					</tr>
				</thead>
				<tbody class="divide-y">
					{#each data.recentOrders as o (o.id)}
						<tr>
							<td class="p-3 font-medium">
								<a href="/admin/orders/{o.id}" class="hover:underline">
									{o.orderNumber}
								</a>
							</td>
							<td class="text-muted-foreground p-3 text-xs">{formatDateTime(o.createdAt)}</td>
							<td class="p-3">
								{#if o.customerId}
									<a href="/admin/customers/{o.customerId}" class="hover:underline">
										{o.customerName}
									</a>
								{:else}
									{o.customerName}
								{/if}
							</td>
							<td class="p-3 text-right font-semibold">{formatPrice(o.totalAmount)}</td>
							<td class="p-3"><OrderStatusBadge status={o.status} /></td>
							<td class="p-3"><PaymentStatusBadge status={o.paymentStatus} /></td>
							<td class="p-3 text-right">
								<a
									href="/admin/orders/{o.id}"
									class="text-muted-foreground hover:text-foreground inline-flex size-8 items-center justify-center rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
									aria-label="Open order"
								>
									<ArrowRight class="size-4" />
								</a>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<!-- Mobile card list (hidden on desktop) -->
		<ul class="divide-y md:hidden">
			{#each data.recentOrders as o (o.id)}
				<li>
					<a
						href="/admin/orders/{o.id}"
						class="flex items-start gap-3 p-4 transition hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
					>
						<div class="min-w-0 flex-1">
							<div class="flex items-center gap-2">
								<span class="font-semibold">{o.orderNumber}</span>
								<span class="text-muted-foreground text-xs">{formatDateTime(o.createdAt)}</span>
							</div>
							<div class="mt-1 truncate text-sm">{o.customerName}</div>
							<div class="mt-2 flex flex-wrap items-center gap-1.5">
								<OrderStatusBadge status={o.status} />
								<PaymentStatusBadge status={o.paymentStatus} />
							</div>
						</div>
						<div class="text-right">
							<div class="font-semibold">{formatPrice(o.totalAmount)}</div>
							<ArrowRight class="text-muted-foreground mt-2 ml-auto size-4" />
						</div>
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</div>
