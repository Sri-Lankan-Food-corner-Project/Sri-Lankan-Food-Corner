<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import * as Table from '$lib/components/ui/table';
	import * as Dialog from '$lib/components/ui/dialog';
	import ConfirmDialog from '$lib/components/admin/ConfirmDialog.svelte';
	import OrderStatusBadge from '$lib/components/admin/OrderStatusBadge.svelte';
	import PaymentStatusBadge from '$lib/components/admin/PaymentStatusBadge.svelte';
	import {
		ORDER_STATUSES,
		PAYMENT_STATUSES,
		ORDER_STATUS_LABELS,
		PAYMENT_STATUS_LABELS,
		canTransitionStatus,
		type OrderStatus
	} from '$lib/schemas/orderStatus';
	import { formatPrice } from '$lib/utils/formatPrice';
	import { ArrowLeft, Package, User, MapPin, CreditCard, StickyNote } from '@lucide/svelte';

	let { data } = $props();

	let statusDialogOpen = $state(false);
	let paymentDialogOpen = $state(false);
	let cancelDialogOpen = $state(false);

	let nextStatus = $state<OrderStatus>('preparing');
	let nextPaymentStatus = $state('paid');

	function openStatusDialog() {
		nextStatus = data.order.status as OrderStatus;
		statusDialogOpen = true;
	}
	function openPaymentDialog() {
		nextPaymentStatus = data.order.paymentStatus;
		paymentDialogOpen = true;
	}

	function formatDate(d: Date | string | null) {
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

	const availableStatuses = $derived(
		ORDER_STATUSES.filter(
			(s) => s === data.order.status || canTransitionStatus(data.order.status as OrderStatus, s)
		)
	);

	const isCancelled = $derived(data.order.status === 'cancelled');
	const hasBilling = $derived(!!data.order.billingFullName);
</script>

<!-- Header -->
<div class="flex flex-wrap items-start justify-between gap-3">
	<div class="min-w-0">
		<a
			href="/admin/orders"
			class="text-muted-foreground inline-flex items-center gap-1 text-sm hover:underline"
		>
			<ArrowLeft class="size-4" /> Back to orders
		</a>
		<div class="mt-2 flex flex-wrap items-center gap-2">
			<h1 class="text-2xl font-bold">Order #{data.order.orderNumber}</h1>
			<OrderStatusBadge status={data.order.status} />
			<PaymentStatusBadge status={data.order.paymentStatus} />
		</div>
		<p class="text-muted-foreground mt-1 text-sm">
			Placed {formatDate(data.order.createdAt)}
		</p>
	</div>
	<div class="flex flex-wrap gap-2">
		<Button variant="outline" onclick={openStatusDialog} disabled={isCancelled}>
			Change status
		</Button>
		<Button variant="outline" onclick={openPaymentDialog}>Update payment</Button>
		<Button variant="destructive" onclick={() => (cancelDialogOpen = true)} disabled={isCancelled}>
			Cancel order
		</Button>
	</div>
</div>

<div class="mt-6 grid gap-6 lg:grid-cols-3">
	<!-- LEFT: items + totals -->
	<div class="space-y-6 lg:col-span-2">
		<!-- Items -->
		<section class="bg-card rounded-md border">
			<h2 class="flex items-center gap-2 border-b p-4 text-sm font-semibold">
				<Package class="size-4" /> Items ({data.items.length})
			</h2>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Product</Table.Head>
						<Table.Head class="w-24 text-right">Unit</Table.Head>
						<Table.Head class="w-20 text-right">Qty</Table.Head>
						<Table.Head class="w-28 text-right">Line total</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.items as item (item.id)}
						<Table.Row>
							<Table.Cell>
								<div class="flex items-center gap-3">
									<div class="bg-brand-sand size-12 shrink-0 overflow-hidden rounded ring-1 ring-black/5">
										{#if item.imageUrl}
											<img src={item.imageUrl} alt="" class="h-full w-full object-cover" />
										{/if}
									</div>
									<div>
										<div class="font-medium">{item.productName}</div>
										{#if !item.productId}
											<div class="text-xs text-neutral-400">Product deleted</div>
										{/if}
									</div>
								</div>
							</Table.Cell>
							<Table.Cell class="text-right">{formatPrice(item.unitPrice)}</Table.Cell>
							<Table.Cell class="text-right">{item.quantity}</Table.Cell>
							<Table.Cell class="text-right font-semibold">{formatPrice(item.lineTotal)}</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</section>

		<!-- Payment totals -->
		<section class="bg-card rounded-md border">
			<h2 class="flex items-center gap-2 border-b p-4 text-sm font-semibold">
				<CreditCard class="size-4" /> Payment totals
			</h2>
			<div class="space-y-2 p-4 text-sm">
				<div class="flex justify-between">
					<span class="text-muted-foreground">Subtotal</span>
					<span>{formatPrice(data.order.subtotal)}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-muted-foreground">Shipping ({data.order.shippingMethod})</span>
					<span>{formatPrice(data.order.shippingFee)}</span>
				</div>
				<div class="mt-2 flex justify-between border-t pt-3 text-base font-bold">
					<span>Total</span>
					<span>{formatPrice(data.order.totalAmount)}</span>
				</div>
				<div class="text-muted-foreground pt-2 text-xs">
					Payment method: <span class="font-medium text-neutral-900">{data.order.paymentMethod}</span>
				</div>
			</div>
		</section>

		{#if data.order.deliveryNotes}
			<section class="bg-card rounded-md border">
				<h2 class="flex items-center gap-2 border-b p-4 text-sm font-semibold">
					<StickyNote class="size-4" /> Delivery notes
				</h2>
				<p class="p-4 text-sm whitespace-pre-wrap">{data.order.deliveryNotes}</p>
			</section>
		{/if}
	</div>

	<!-- RIGHT: customer + shipping -->
	<div class="space-y-6">
		<section class="bg-card rounded-md border">
			<h2 class="flex items-center gap-2 border-b p-4 text-sm font-semibold">
				<User class="size-4" /> Customer
			</h2>
			<div class="space-y-1 p-4 text-sm">
				<p class="font-medium">{data.order.shippingFullName}</p>
				<p class="text-neutral-600">
					<a href="mailto:{data.order.customerEmail}" class="hover:underline">
						{data.order.customerEmail}
					</a>
				</p>
				<p class="text-neutral-600">
					<a href="tel:{data.order.customerPhone}" class="hover:underline">
						{data.order.customerPhone}
					</a>
				</p>
			</div>
		</section>

		<section class="bg-card rounded-md border">
			<h2 class="flex items-center gap-2 border-b p-4 text-sm font-semibold">
				<MapPin class="size-4" /> Shipping address
			</h2>
			<div class="space-y-0.5 p-4 text-sm">
				<p>{data.order.shippingFullName}</p>
				<p>{data.order.shippingStreet}</p>
				{#if data.order.shippingHouseNumber}
					<p>House {data.order.shippingHouseNumber}{data.order.shippingRoomNumber ? `, Room ${data.order.shippingRoomNumber}` : ''}</p>
				{/if}
				<p>{data.order.shippingCity}, {data.order.shippingPostcode}</p>
				<p>{data.order.shippingCountry}</p>
				{#if data.order.shippingAccessCode}
					<p class="text-muted-foreground mt-1 text-xs">Access code: {data.order.shippingAccessCode}</p>
				{/if}
			</div>
		</section>

		{#if hasBilling}
			<section class="bg-card rounded-md border">
				<h2 class="flex items-center gap-2 border-b p-4 text-sm font-semibold">
					<MapPin class="size-4" /> Billing address
				</h2>
				<div class="space-y-0.5 p-4 text-sm">
					<p>{data.order.billingFullName}</p>
					<p>{data.order.billingStreet}</p>
					{#if data.order.billingHouseNumber}
						<p>House {data.order.billingHouseNumber}{data.order.billingRoomNumber ? `, Room ${data.order.billingRoomNumber}` : ''}</p>
					{/if}
					<p>{data.order.billingCity}, {data.order.billingPostcode}</p>
					<p>{data.order.billingCountry}</p>
				</div>
			</section>
		{/if}
	</div>
</div>

<!-- Change status dialog -->
<Dialog.Root bind:open={statusDialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Update fulfillment status</Dialog.Title>
			<Dialog.Description>Move this order forward or back through the fulfillment stages.</Dialog.Description>
		</Dialog.Header>
		<form method="POST" action="?/updateStatus" use:enhance={() => async ({ result, update }) => {
				if (result.type === 'success' || result.type === 'redirect') statusDialogOpen = false;
				await update();
			}} class="grid gap-4">
			<div class="grid gap-2">
				<label class="text-sm font-medium">New status</label>
				<select
					name="status"
					bind:value={nextStatus}
					class="border-input bg-background rounded-md border px-3 py-2 text-sm"
				>
					{#each availableStatuses as s (s)}
						<option value={s}>{ORDER_STATUS_LABELS[s]}</option>
					{/each}
				</select>
			</div>
			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => (statusDialogOpen = false)}>
					Cancel
				</Button>
				<Button type="submit">Save</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Update payment status dialog -->
<Dialog.Root bind:open={paymentDialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Update payment status</Dialog.Title>
			<Dialog.Description>
				Only change this after confirming the money movement outside the system.
			</Dialog.Description>
		</Dialog.Header>
		<form method="POST" action="?/updatePaymentStatus" use:enhance={() => async ({ result, update }) => {
				if (result.type === 'success' || result.type === 'redirect') paymentDialogOpen = false;
				await update();
			}} class="grid gap-4">
			<div class="grid gap-2">
				<label class="text-sm font-medium">New payment status</label>
				<select
					name="paymentStatus"
					bind:value={nextPaymentStatus}
					class="border-input bg-background rounded-md border px-3 py-2 text-sm"
				>
					{#each PAYMENT_STATUSES as s (s)}
						<option value={s}>{PAYMENT_STATUS_LABELS[s]}</option>
					{/each}
				</select>
			</div>
			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => (paymentDialogOpen = false)}>
					Cancel
				</Button>
				<Button type="submit">Save</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Cancel confirm -->
<ConfirmDialog
	open={cancelDialogOpen}
	onOpenChange={(v) => (cancelDialogOpen = v)}
	title="Cancel this order?"
	description="Marks the order as cancelled. Payment status is not changed automatically — issue a refund separately if needed."
	confirmLabel="Cancel order"
	variant="destructive"
	action="?/cancel"
/>
