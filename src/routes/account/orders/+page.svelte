<script lang="ts">
	import { formatPrice } from '$lib/utils/formatPrice';
	import { AlertCircle, ArrowRight, Package } from '@lucide/svelte';

	let { data } = $props();

	function statusColor(status: string) {
		switch (status) {
			case 'delivered':
				return 'bg-brand-green/10 text-brand-green';
			case 'shipped':
			case 'preparing':
				return 'bg-brand-amber/20 text-amber-800';
			case 'cancelled':
			case 'refunded':
				return 'bg-red-100 text-red-700';
			default:
				return 'bg-neutral-200 text-neutral-700';
		}
	}
</script>

{#if data.orders.length === 0}
	<div
		class="bg-brand-amber flex items-center justify-between gap-4 rounded-xl px-5 py-4 text-neutral-900"
	>
		<div class="flex items-center gap-3">
			<AlertCircle class="size-5 shrink-0" />
			<p class="text-sm font-medium">No order has been made yet.</p>
		</div>
		<a
			href="/products"
			class="shrink-0 text-sm font-bold underline underline-offset-2 hover:no-underline"
		>
			Browse Products
		</a>
	</div>
{:else}
	<div class="bg-brand-cream ring-brand-charcoal/10 overflow-hidden rounded-2xl ring-1">
		<div class="hidden lg:block">
			<table class="w-full">
				<thead>
					<tr
						class="border-b border-brand-charcoal/10 text-left text-xs font-bold tracking-wider text-neutral-500 uppercase"
					>
						<th class="px-5 py-3">Order</th>
						<th class="px-5 py-3">Date</th>
						<th class="px-5 py-3">Status</th>
						<th class="px-5 py-3 text-right">Total</th>
						<th class="px-5 py-3"></th>
					</tr>
				</thead>
				<tbody class="divide-y divide-brand-charcoal/10">
					{#each data.orders as o (o.id)}
						<tr class="text-sm">
							<td class="px-5 py-4 font-semibold text-neutral-900">{o.orderNumber}</td>
							<td class="px-5 py-4 text-neutral-600">
								{new Date(o.createdAt).toLocaleDateString('en-GB')}
							</td>
							<td class="px-5 py-4">
								<span
									class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize {statusColor(
										o.status
									)}"
								>
									{o.status}
								</span>
							</td>
							<td class="px-5 py-4 text-right font-bold text-neutral-900">
								{formatPrice(o.totalAmount)}
							</td>
							<td class="px-5 py-4 text-right">
								<a
									href="/account/orders/{o.orderNumber}"
									class="hover:text-brand-green inline-flex items-center gap-1 text-xs font-semibold text-neutral-700"
								>
									View <ArrowRight class="size-3" />
								</a>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<ul class="divide-y divide-brand-charcoal/10 lg:hidden">
			{#each data.orders as o (o.id)}
				<a
					href="/account/orders/{o.orderNumber}"
					class="block px-5 py-4 transition hover:bg-white/40"
				>
					<div class="flex items-start justify-between gap-3">
						<div>
							<p class="text-sm font-semibold text-neutral-900">{o.orderNumber}</p>
							<p class="mt-0.5 text-xs text-neutral-500">
								{new Date(o.createdAt).toLocaleDateString('en-GB')}
							</p>
						</div>
						<span
							class="inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize {statusColor(
								o.status
							)}"
						>
							{o.status}
						</span>
					</div>
					<div class="mt-2 flex items-center justify-between">
						<Package class="text-brand-green size-4" />
						<span class="text-sm font-bold text-neutral-900">
							{formatPrice(o.totalAmount)}
						</span>
					</div>
				</a>
			{/each}
		</ul>
	</div>
{/if}
