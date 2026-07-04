<script lang="ts">
	import { formatPrice } from '$lib/utils/formatPrice';
	import { ArrowLeft } from '@lucide/svelte';

	let { data } = $props();
	const { order, items } = $derived(data);
</script>

<div class="space-y-6">
	<a
		href="/account/orders"
		class="hover:text-brand-green inline-flex items-center gap-2 text-sm font-medium text-neutral-600 transition-colors"
	>
		<ArrowLeft class="size-4" />
		Back to orders
	</a>

	<div class="bg-brand-cream ring-brand-charcoal/10 rounded-2xl p-6 ring-1">
		<div class="flex flex-wrap items-start justify-between gap-4">
			<div>
				<p class="text-xs font-semibold tracking-wider text-neutral-500 uppercase">Order</p>
				<h2 class="mt-1 text-xl font-extrabold text-neutral-900">{order.orderNumber}</h2>
			</div>
			<div class="text-right">
				<p class="text-xs font-semibold tracking-wider text-neutral-500 uppercase">Status</p>
				<p class="mt-1 text-sm font-semibold text-neutral-900 capitalize">
					{order.status} · {order.paymentStatus}
				</p>
			</div>
		</div>

		<div
			class="border-brand-charcoal/10 bg-brand-sand mt-5 grid grid-cols-2 gap-4 rounded-xl border p-4 text-sm sm:grid-cols-4"
		>
			<div>
				<p class="text-xs text-neutral-500">Date</p>
				<p class="mt-1 font-semibold text-neutral-900">
					{new Date(order.createdAt).toLocaleDateString('en-GB')}
				</p>
			</div>
			<div>
				<p class="text-xs text-neutral-500">Total</p>
				<p class="mt-1 font-semibold text-neutral-900">{formatPrice(order.totalAmount)}</p>
			</div>
			<div>
				<p class="text-xs text-neutral-500">Payment</p>
				<p class="mt-1 font-semibold text-neutral-900">
					{order.paymentMethod === 'bank' ? 'Bank Transfer' : 'Card / Toss'}
				</p>
			</div>
			<div>
				<p class="text-xs text-neutral-500">Shipping</p>
				<p class="mt-1 font-semibold text-neutral-900 capitalize">{order.shippingMethod}</p>
			</div>
		</div>

		<div class="mt-6 grid gap-4 sm:grid-cols-2">
			<div class="border-brand-charcoal/10 rounded-xl border bg-white p-4 text-sm">
				<h3 class="text-xs font-bold tracking-wider text-neutral-500 uppercase">
					Shipping Address
				</h3>
				<div class="mt-2 space-y-0.5 text-neutral-900">
					<p class="font-semibold">{order.shippingFullName}</p>
					<p>{order.shippingStreet}</p>
					{#if order.shippingHouseNumber || order.shippingRoomNumber}
						<p class="text-neutral-600">
							{[order.shippingHouseNumber, order.shippingRoomNumber].filter(Boolean).join(' · ')}
						</p>
					{/if}
					<p>{order.shippingCity} {order.shippingPostcode}</p>
					<p class="pt-1 text-xs text-neutral-500">{order.customerPhone}</p>
				</div>
			</div>

			<div class="border-brand-charcoal/10 rounded-xl border bg-white p-4 text-sm">
				<h3 class="text-xs font-bold tracking-wider text-neutral-500 uppercase">
					Billing Address
				</h3>
				<div class="mt-2 space-y-0.5 text-neutral-900">
					{#if order.billingFullName}
						<p class="font-semibold">{order.billingFullName}</p>
						<p>{order.billingStreet}</p>
						{#if order.billingHouseNumber || order.billingRoomNumber}
							<p class="text-neutral-600">
								{[order.billingHouseNumber, order.billingRoomNumber].filter(Boolean).join(' · ')}
							</p>
						{/if}
						<p>{order.billingCity} {order.billingPostcode}</p>
					{:else}
						<p class="text-neutral-500">Same as shipping</p>
					{/if}
				</div>
			</div>
		</div>

		<div class="mt-6">
			<h3 class="text-sm font-bold text-neutral-900">Items</h3>
			<ul class="divide-brand-charcoal/10 mt-3 divide-y">
				{#each items as item (item.id)}
					<li class="flex items-center justify-between py-3 text-sm">
						<div>
							<p class="font-medium text-neutral-900">{item.productName}</p>
							<p class="text-xs text-neutral-500">
								{item.quantity} × {formatPrice(item.unitPrice)}
							</p>
						</div>
						<span class="font-semibold text-neutral-900">{formatPrice(item.lineTotal)}</span>
					</li>
				{/each}
			</ul>
			<div class="border-brand-charcoal/10 mt-2 space-y-2 border-t pt-3 text-sm">
				<div class="flex justify-between text-neutral-600">
					<span>Subtotal</span>
					<span>{formatPrice(order.subtotal)}</span>
				</div>
				<div class="flex justify-between text-neutral-600">
					<span>Shipping</span>
					<span>{order.shippingFee === 0 ? 'Free' : formatPrice(order.shippingFee)}</span>
				</div>
				<div class="flex justify-between text-base font-bold text-neutral-900">
					<span>Total</span>
					<span>{formatPrice(order.totalAmount)}</span>
				</div>
			</div>
		</div>
	</div>
</div>
