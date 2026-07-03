<script lang="ts">
	import { page } from '$app/state';
	import { formatPrice } from '$lib/utils/formatPrice';
	import { site } from '$lib/config/site';
	import { ArrowRight, CheckCircle2, Clock } from '@lucide/svelte';

	let { data } = $props();
	const { order, items } = $derived(data);
	const pendingToss = $derived(page.url.searchParams.get('pending') === 'toss');
</script>

<section class="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
	<nav
		aria-label="Checkout progress"
		class="mb-8 flex flex-wrap items-center justify-center gap-2 text-sm sm:gap-5 sm:text-base"
	>
		<span class="font-medium text-neutral-400">Shopping Cart</span>
		<ArrowRight class="size-4 text-neutral-400 sm:size-5" />
		<span class="font-medium text-neutral-400">Checkout</span>
		<ArrowRight class="size-4 text-neutral-400 sm:size-5" />
		<span class="decoration-2 font-bold text-neutral-900 underline underline-offset-4">
			Order Complete
		</span>
	</nav>

	<div class="bg-brand-cream ring-brand-charcoal/10 rounded-2xl p-6 ring-1 sm:p-8">
		<div class="text-center">
			{#if pendingToss}
				<Clock class="mx-auto size-14 text-amber-500" />
				<h1 class="mt-4 text-2xl font-extrabold text-neutral-900">
					Payment in progress
				</h1>
				<p class="mt-2 text-sm text-neutral-600">
					Complete the payment on the next screen to confirm your order.
				</p>
			{:else}
				<CheckCircle2 class="text-brand-green mx-auto size-14" />
				<h1 class="mt-4 text-2xl font-extrabold text-neutral-900">
					Thank you for your order!
				</h1>
				<p class="mt-2 text-sm text-neutral-600">
					We've received your order and sent a confirmation to
					<strong class="text-neutral-900">{order.customerEmail}</strong>.
				</p>
			{/if}
		</div>

		<div
			class="border-brand-charcoal/10 bg-brand-sand mt-6 grid grid-cols-2 gap-4 rounded-xl border p-4 text-sm sm:grid-cols-4"
		>
			<div>
				<p class="text-xs text-neutral-500">Order</p>
				<p class="mt-1 font-semibold text-neutral-900 break-all">{order.orderNumber}</p>
			</div>
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
		</div>

		{#if order.paymentMethod === 'bank' && order.paymentStatus === 'unpaid'}
			<div
				class="border-brand-charcoal/10 mt-5 rounded-xl border bg-white p-5 text-sm"
			>
				<h2 class="font-bold text-neutral-900">Bank Transfer Instructions</h2>
				<p class="mt-2 text-xs leading-relaxed text-neutral-600">
					Please transfer <strong class="text-neutral-900">{formatPrice(order.totalAmount)}</strong>
					to the account below and use your Order ID
					<strong class="text-neutral-900">{order.orderNumber}</strong>
					as the reference. Your order ships once payment clears.
				</p>
				<div class="border-brand-charcoal/10 mt-4 grid gap-2 border-t pt-4">
					<div class="flex justify-between gap-2">
						<span class="text-neutral-500">Bank</span>
						<span class="font-semibold text-neutral-900">{site.bank.name}</span>
					</div>
					<div class="flex justify-between gap-2">
						<span class="text-neutral-500">Account Holder</span>
						<span class="font-semibold text-neutral-900">{site.bank.accountHolder}</span>
					</div>
					<div class="flex justify-between gap-2">
						<span class="text-neutral-500">Account Number</span>
						<span class="font-semibold text-neutral-900">{site.bank.accountNumber}</span>
					</div>
				</div>
			</div>
		{/if}

		<div class="mt-6 grid gap-4 sm:grid-cols-2">
			<div
				class="border-brand-charcoal/10 rounded-xl border bg-white p-4 text-sm"
			>
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
					<p class="text-neutral-500">South Korea</p>
					<p class="pt-1 text-xs text-neutral-500">{order.customerPhone}</p>
				</div>
			</div>

			<div
				class="border-brand-charcoal/10 rounded-xl border bg-white p-4 text-sm"
			>
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
						<p class="text-neutral-500">South Korea</p>
					{:else}
						<p class="text-neutral-500">Same as shipping address</p>
					{/if}
				</div>
			</div>
		</div>

		<div class="mt-6">
			<h3 class="text-sm font-bold text-neutral-900">Order Items</h3>
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

			<div
				class="border-brand-charcoal/10 mt-2 space-y-2 border-t pt-3 text-sm"
			>
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

		<div class="mt-8 flex flex-col gap-3 sm:flex-row">
			<a
				href="/products"
				class="border-brand-charcoal/20 hover:bg-brand-sand inline-flex flex-1 items-center justify-center rounded-full border bg-white px-6 py-3 text-sm font-semibold text-neutral-900 transition"
			>
				Continue Shopping
			</a>
			<a
				href="/account/orders"
				class="bg-brand-charcoal hover:bg-brand-charcoal-hover inline-flex flex-1 items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-white transition"
			>
				View My Orders
			</a>
		</div>
	</div>
</section>
