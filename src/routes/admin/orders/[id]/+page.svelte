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
		PAYMENT_METHOD_LABELS,
		canTransitionStatus,
		type OrderStatus
	} from '$lib/schemas/orderStatus';
	import { formatPrice } from '$lib/utils/formatPrice';
	import { site, waHrefTo } from '$lib/config/site';
	import WhatsAppIcon from '$lib/components/WhatsAppIcon.svelte';
	import {
		ArrowLeft,
		Package,
		User,
		MapPin,
		CreditCard,
		StickyNote,
		Landmark,
		AlertTriangle
	} from '@lucide/svelte';

	let { data } = $props();

	let statusDialogOpen = $state(false);
	let paymentDialogOpen = $state(false);
	let cancelDialogOpen = $state(false);

	// Per-item cancellation dialog state
	type OrderItem = (typeof data.items)[number];
	let cancelItemTarget = $state<OrderItem | null>(null);
	let cancelItemReason = $state('');
	let cancelItemZeroStock = $state(false);
	let cancelItemError = $state('');

	function openCancelItemDialog(item: OrderItem) {
		cancelItemTarget = item;
		cancelItemReason = '';
		cancelItemZeroStock = false;
		cancelItemError = '';
	}

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

	// Item-level cancellation only makes sense before the parcel leaves.
	const canEditItems = $derived(
		data.order.status === 'pending' || data.order.status === 'preparing'
	);
	const activeItems = $derived(data.items.filter((i) => !i.cancelledAt));
	const cancelledItems = $derived(data.items.filter((i) => i.cancelledAt));
	const cancelledValue = $derived(cancelledItems.reduce((sum, i) => sum + i.lineTotal, 0));

	// Pre-written WhatsApp message so the admin can tell the customer about the
	// change in one tap — lists the cancelled items and the new total, with
	// transfer-or-refund guidance based on payment status.
	const waNotifyHref = $derived.by(() => {
		if (cancelledItems.length === 0) return null;
		const names = cancelledItems.map((i) => `*${i.productName}*`).join(', ');
		const lines = [
			`Hello ${data.order.shippingFullName}! This is ${site.name} regarding your order ${data.order.orderNumber}.`,
			`Unfortunately we had to cancel: ${names}.`,
			`Your updated total is *${formatPrice(data.order.totalAmount)}*.`,
			data.order.paymentStatus === 'paid'
				? 'Since you have already paid, we will refund the difference — please reply with your bank account details.'
				: `If you have not transferred yet, please transfer the updated amount to ${site.bank.name} ${site.bank.accountNumber} (${site.bank.accountHolder}) with reference ${data.order.orderNumber}.`,
			'Sorry for the inconvenience, and thank you for your understanding!'
		];
		return waHrefTo(data.order.customerPhone, lines.join('\n'));
	});
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
			<h1 class="text-2xl font-bold">Order {data.order.orderNumber}</h1>
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
				<Package class="size-4" /> Items ({activeItems.length}{cancelledItems.length
					? ` · ${cancelledItems.length} cancelled`
					: ''})
			</h2>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Product</Table.Head>
						<Table.Head class="w-24 text-right">Unit</Table.Head>
						<Table.Head class="w-20 text-right">Qty</Table.Head>
						<Table.Head class="w-28 text-right">Line total</Table.Head>
						{#if canEditItems}
							<Table.Head class="w-24"></Table.Head>
						{/if}
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.items as item (item.id)}
						<Table.Row class={item.cancelledAt ? 'opacity-60' : ''}>
							<Table.Cell>
								<div class="flex items-center gap-3">
									<div class="bg-brand-sand size-12 shrink-0 overflow-hidden rounded ring-1 ring-black/5">
										{#if item.imageUrl}
											<img
												src={item.imageUrl}
												alt=""
												class="h-full w-full object-cover {item.cancelledAt ? 'grayscale' : ''}"
											/>
										{/if}
									</div>
									<div>
										<div class="font-medium {item.cancelledAt ? 'line-through' : ''}">
											{item.productName}
										</div>
										{#if item.cancelledAt}
											<div class="text-xs font-medium text-red-600 dark:text-red-400">
												Cancelled{item.cancelReason ? ` — ${item.cancelReason}` : ''}
											</div>
										{:else if !item.productId}
											<div class="text-xs text-neutral-400">Product deleted</div>
										{/if}
									</div>
								</div>
							</Table.Cell>
							<Table.Cell class="text-right">{formatPrice(item.unitPrice)}</Table.Cell>
							<Table.Cell class="text-right">{item.quantity}</Table.Cell>
							<Table.Cell class="text-right font-semibold {item.cancelledAt ? 'line-through' : ''}">
								{formatPrice(item.lineTotal)}
							</Table.Cell>
							{#if canEditItems}
								<Table.Cell class="text-right">
									{#if !item.cancelledAt && activeItems.length > 1}
										<Button
											variant="ghost"
											size="sm"
											class="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40"
											onclick={() => openCancelItemDialog(item)}
										>
											Cancel item
										</Button>
									{/if}
								</Table.Cell>
							{/if}
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</section>

		{#if cancelledItems.length > 0}
			<!-- Money changed after the customer placed (and maybe paid) the order —
			     remind the admin to settle the difference and offer a one-tap
			     WhatsApp message so the customer isn't left guessing. -->
			<div
				class="flex flex-wrap items-start justify-between gap-3 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
			>
				<div class="flex items-start gap-2.5">
					<AlertTriangle class="mt-0.5 size-4 shrink-0" />
					<div>
						<p class="font-semibold">
							{formatPrice(cancelledValue)} in items cancelled — order total is now
							{formatPrice(data.order.totalAmount)}.
						</p>
						<p class="mt-1 text-xs">
							{#if data.order.paymentStatus === 'paid'}
								The customer already paid the original amount — refund
								<span class="font-semibold">{formatPrice(cancelledValue)}</span> by bank transfer.
							{:else}
								If the customer hasn't transferred yet, ask them to send the new total instead.
							{/if}
						</p>
					</div>
				</div>
				{#if waNotifyHref}
					<a
						href={waNotifyHref}
						target="_blank"
						rel="noopener noreferrer"
						class="bg-whatsapp hover:bg-whatsapp-hover inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors"
					>
						<WhatsAppIcon class="size-4" />
						Notify customer on WhatsApp
					</a>
				{/if}
			</div>
		{/if}

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
				<div class="text-muted-foreground flex justify-between pt-2 text-xs">
					<span>Payment method</span>
					<span class="text-foreground font-medium">
						{PAYMENT_METHOD_LABELS[data.order.paymentMethod] ?? data.order.paymentMethod}
					</span>
				</div>
			</div>
		</section>

		{#if data.order.paymentMethod === 'bank'}
			<!-- Bank transfer details — what the customer was told to send money to.
			     Admin uses this to reconcile incoming transfers. -->
			<section class="bg-card rounded-md border">
				<h2 class="flex items-center gap-2 border-b p-4 text-sm font-semibold">
					<Landmark class="size-4" /> Bank transfer details
				</h2>
				<div class="space-y-2 p-4 text-sm">
					<p class="text-muted-foreground text-xs">
						Customer was instructed to transfer
						<span class="text-foreground font-semibold">{formatPrice(data.order.totalAmount)}</span>
						with order number
						<span class="text-foreground font-semibold">{data.order.orderNumber}</span>
						as the reference.
					</p>
					<div class="mt-3 space-y-1.5 border-t pt-3">
						<div class="flex justify-between">
							<span class="text-muted-foreground">Bank</span>
							<span class="font-medium">{site.bank.name}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-muted-foreground">Account holder</span>
							<span class="font-medium">{site.bank.accountHolder}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-muted-foreground">Account number</span>
							<span class="font-mono font-medium">{site.bank.accountNumber}</span>
						</div>
					</div>
					{#if data.order.paymentStatus === 'unpaid'}
						<p class="mt-3 rounded-md bg-amber-50 p-2 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
							Once the transfer is confirmed, click <span class="font-semibold">Update payment</span> and set to <span class="font-semibold">Paid</span>.
						</p>
					{/if}
				</div>
			</section>
		{/if}

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
			<div class="flex items-center justify-between border-b p-4">
				<h2 class="flex items-center gap-2 text-sm font-semibold">
					<User class="size-4" /> Customer
				</h2>
				{#if data.order.customerId}
					<a
						href="/admin/customers/{data.order.customerId}"
						class="text-primary text-xs font-medium hover:underline"
					>
						View profile →
					</a>
				{:else}
					<span class="rounded-full bg-neutral-200 px-2 py-0.5 text-[10px] font-semibold text-neutral-700">
						Guest
					</span>
				{/if}
			</div>
			<div class="space-y-1 p-4 text-sm">
				<p class="font-medium">{data.order.shippingFullName}</p>
				<p class="text-muted-foreground">
					<a href="mailto:{data.order.customerEmail}" class="hover:underline">
						{data.order.customerEmail}
					</a>
				</p>
				<p class="text-muted-foreground">
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

<!-- Cancel single item dialog -->
<Dialog.Root
	open={cancelItemTarget !== null}
	onOpenChange={(v) => {
		if (!v) cancelItemTarget = null;
	}}
>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Cancel “{cancelItemTarget?.productName}”?</Dialog.Title>
			<Dialog.Description>
				The item stays on the order with a strikethrough, and the totals are recalculated.
				The reason you write here is shown to the customer.
			</Dialog.Description>
		</Dialog.Header>
		<form
			method="POST"
			action="?/cancelItem"
			use:enhance={() =>
				async ({ result, update }) => {
					if (result.type === 'failure') {
						cancelItemError = String(result.data?.error ?? 'Could not cancel the item.');
						return;
					}
					if (result.type === 'success' || result.type === 'redirect') cancelItemTarget = null;
					await update();
				}}
			class="grid gap-4"
		>
			<input type="hidden" name="itemId" value={cancelItemTarget?.id ?? ''} />
			<div class="grid gap-2">
				<label class="text-sm font-medium" for="cancel-item-reason">Reason (shown to customer)</label>
				<input
					id="cancel-item-reason"
					name="reason"
					bind:value={cancelItemReason}
					required
					placeholder="e.g. Out of stock at the moment"
					class="border-input bg-background rounded-md border px-3 py-2 text-sm"
				/>
			</div>
			{#if cancelItemTarget?.productId}
				<label class="flex items-start gap-2.5 text-sm">
					<input
						type="checkbox"
						name="zeroStock"
						bind:checked={cancelItemZeroStock}
						class="mt-0.5 rounded border-neutral-300"
					/>
					<span>
						Also set this product's stock to 0
						<span class="text-muted-foreground block text-xs">
							Stops new orders for it until you restock. Use this when the item isn't actually in
							the store.
						</span>
					</span>
				</label>
			{/if}
			<p class="text-muted-foreground rounded-md bg-neutral-50 p-2.5 text-xs dark:bg-neutral-900">
				{#if data.order.paymentStatus === 'paid'}
					This order is already <span class="font-semibold">paid</span> — after cancelling, refund
					the item amount ({formatPrice(cancelItemTarget?.lineTotal ?? 0)}) by bank transfer.
				{:else}
					This order is <span class="font-semibold">unpaid</span> — the customer should transfer
					the new, lower total. You can notify them on WhatsApp after saving.
				{/if}
			</p>
			{#if cancelItemError}
				<p class="rounded-md bg-red-50 p-2.5 text-xs font-medium text-red-700 dark:bg-red-950/40 dark:text-red-300">
					{cancelItemError}
				</p>
			{/if}
			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => (cancelItemTarget = null)}>
					Keep item
				</Button>
				<Button type="submit" variant="destructive">Cancel item</Button>
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
