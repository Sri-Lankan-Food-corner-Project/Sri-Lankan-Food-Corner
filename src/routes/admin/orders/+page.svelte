<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { untrack } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Table from '$lib/components/ui/table';
	import { Search, ChevronLeft, ChevronRight, ArrowRight } from '@lucide/svelte';
	import OrderStatusBadge from '$lib/components/admin/OrderStatusBadge.svelte';
	import PaymentStatusBadge from '$lib/components/admin/PaymentStatusBadge.svelte';
	import {
		ORDER_STATUSES,
		PAYMENT_STATUSES,
		ORDER_STATUS_LABELS,
		PAYMENT_STATUS_LABELS
	} from '$lib/schemas/orderStatus';
	import { formatPrice } from '$lib/utils/formatPrice';

	let { data } = $props();

	let searchValue = $state(untrack(() => data.filters.q));
	let searchTimer: ReturnType<typeof setTimeout> | null = null;

	function updateParams(mutate: (params: URLSearchParams) => void) {
		const url = new URL(page.url);
		mutate(url.searchParams);
		url.searchParams.delete('page');
		goto(url.toString(), { replaceState: true, keepFocus: true, noScroll: true });
	}

	function handleSearchInput(e: Event) {
		searchValue = (e.target as HTMLInputElement).value;
		if (searchTimer) clearTimeout(searchTimer);
		searchTimer = setTimeout(() => {
			updateParams((params) => {
				const v = searchValue.trim();
				if (v) params.set('q', v);
				else params.delete('q');
			});
		}, 300);
	}

	function handleStatus(e: Event) {
		const value = (e.target as HTMLSelectElement).value;
		updateParams((params) => {
			if (value) params.set('status', value);
			else params.delete('status');
		});
	}

	function handlePayment(e: Event) {
		const value = (e.target as HTMLSelectElement).value;
		updateParams((params) => {
			if (value) params.set('payment', value);
			else params.delete('payment');
		});
	}

	function goToPage(n: number) {
		const url = new URL(page.url);
		if (n <= 1) url.searchParams.delete('page');
		else url.searchParams.set('page', String(n));
		goto(url.toString());
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

	const rangeFrom = $derived((data.page - 1) * data.pageSize + 1);
	const rangeTo = $derived(Math.min(data.page * data.pageSize, data.total));
</script>

<div class="flex items-center justify-between">
	<h1 class="text-2xl font-bold">Orders</h1>
	<p class="text-muted-foreground text-sm">{data.total} total</p>
</div>

<div class="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
	<div class="relative flex-1">
		<Search
			class="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
		/>
		<Input
			type="search"
			placeholder="Search by order #, name, email, phone…"
			value={searchValue}
			oninput={handleSearchInput}
			class="w-full pl-9"
		/>
	</div>
	<select
		value={data.filters.status}
		onchange={handleStatus}
		class="border-input bg-background rounded-md border px-3 py-2 text-sm"
	>
		<option value="">All statuses</option>
		{#each ORDER_STATUSES as s (s)}
			<option value={s}>{ORDER_STATUS_LABELS[s]}</option>
		{/each}
	</select>
	<select
		value={data.filters.paymentStatus}
		onchange={handlePayment}
		class="border-input bg-background rounded-md border px-3 py-2 text-sm"
	>
		<option value="">All payments</option>
		{#each PAYMENT_STATUSES as s (s)}
			<option value={s}>{PAYMENT_STATUS_LABELS[s]}</option>
		{/each}
	</select>
</div>

<div class="bg-card mt-4 rounded-md border">
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head>Order #</Table.Head>
				<Table.Head>Date</Table.Head>
				<Table.Head>Customer</Table.Head>
				<Table.Head class="text-right">Total</Table.Head>
				<Table.Head>Status</Table.Head>
				<Table.Head>Payment</Table.Head>
				<Table.Head class="w-16 text-right"></Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each data.orders as o (o.id)}
				<Table.Row>
					<Table.Cell class="font-medium">
						<a href="/admin/orders/{o.id}" class="hover:underline">
							{o.orderNumber}
						</a>
					</Table.Cell>
					<Table.Cell class="text-muted-foreground text-sm">{formatDate(o.createdAt)}</Table.Cell>
					<Table.Cell>
						{#if o.customerId}
							<a href="/admin/customers/{o.customerId}" class="block hover:underline">
								<div class="font-medium">{o.customerName}</div>
								<div class="text-muted-foreground text-xs">{o.customerEmail}</div>
							</a>
						{:else}
							<div class="font-medium">{o.customerName}</div>
							<div class="text-muted-foreground text-xs">
								{o.customerEmail}
								<span class="ml-1 rounded-full bg-neutral-200 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-700">
									Guest
								</span>
							</div>
						{/if}
					</Table.Cell>
					<Table.Cell class="text-right font-semibold">{formatPrice(o.totalAmount)}</Table.Cell>
					<Table.Cell><OrderStatusBadge status={o.status} /></Table.Cell>
					<Table.Cell><PaymentStatusBadge status={o.paymentStatus} /></Table.Cell>
					<Table.Cell class="text-right">
						<Button href="/admin/orders/{o.id}" variant="ghost" size="icon" aria-label="Open order">
							<ArrowRight class="size-4" />
						</Button>
					</Table.Cell>
				</Table.Row>
			{:else}
				<Table.Row>
					<Table.Cell colspan={7} class="text-muted-foreground py-8 text-center">
						No orders match these filters.
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>

{#if data.totalPages > 1}
	<div class="mt-4 flex items-center justify-between text-sm text-neutral-600">
		<p>{rangeFrom}–{rangeTo} of {data.total}</p>
		<div class="flex items-center gap-2">
			<Button
				variant="outline"
				size="sm"
				disabled={data.page <= 1}
				onclick={() => goToPage(data.page - 1)}
			>
				<ChevronLeft class="mr-1 size-4" /> Prev
			</Button>
			<span>Page {data.page} of {data.totalPages}</span>
			<Button
				variant="outline"
				size="sm"
				disabled={data.page >= data.totalPages}
				onclick={() => goToPage(data.page + 1)}
			>
				Next <ChevronRight class="ml-1 size-4" />
			</Button>
		</div>
	</div>
{/if}
