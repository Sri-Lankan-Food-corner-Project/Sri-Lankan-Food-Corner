<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { untrack } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Table from '$lib/components/ui/table';
	import { Search, ChevronLeft, ChevronRight, ArrowRight } from '@lucide/svelte';
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

	function handleRole(e: Event) {
		const value = (e.target as HTMLSelectElement).value;
		updateParams((params) => {
			if (value) params.set('role', value);
			else params.delete('role');
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
		return date.toLocaleDateString('en-GB', {
			day: '2-digit',
			month: 'short',
			year: 'numeric'
		});
	}

	const rangeFrom = $derived((data.page - 1) * data.pageSize + 1);
	const rangeTo = $derived(Math.min(data.page * data.pageSize, data.total));
</script>

<div class="flex items-center justify-between">
	<h1 class="text-2xl font-bold">Customers</h1>
	<p class="text-muted-foreground text-sm">{data.total} total</p>
</div>

<div class="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
	<div class="relative flex-1">
		<Search
			class="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
		/>
		<Input
			type="search"
			placeholder="Search by name, email, phone…"
			value={searchValue}
			oninput={handleSearchInput}
			class="w-full pl-9"
		/>
	</div>
	<select
		value={data.filters.role}
		onchange={handleRole}
		class="border-input bg-background rounded-md border px-3 py-2 text-sm"
	>
		<option value="">All roles</option>
		<option value="customer">Customers</option>
		<option value="admin">Admins</option>
	</select>
</div>

<div class="bg-card mt-4 rounded-md border">
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head>Customer</Table.Head>
				<Table.Head>Phone</Table.Head>
				<Table.Head>Role</Table.Head>
				<Table.Head class="text-right">Orders</Table.Head>
				<Table.Head class="text-right">Total spent</Table.Head>
				<Table.Head>Joined</Table.Head>
				<Table.Head class="w-16 text-right"></Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each data.customers as c (c.id)}
				<Table.Row>
					<Table.Cell>
						<a href="/admin/customers/{c.id}" class="hover:underline">
							<div class="font-medium">{c.name}</div>
							<div class="text-muted-foreground text-xs">{c.email}</div>
						</a>
					</Table.Cell>
					<Table.Cell class="text-sm">{c.phone ?? '—'}</Table.Cell>
					<Table.Cell>
						{#if c.role === 'admin'}
							<span class="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-800">
								Admin
							</span>
						{:else}
							<span class="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-semibold text-neutral-700">
								Customer
							</span>
						{/if}
					</Table.Cell>
					<Table.Cell class="text-right font-medium">{c.orderCount}</Table.Cell>
					<Table.Cell class="text-right font-semibold">{formatPrice(c.totalSpent)}</Table.Cell>
					<Table.Cell class="text-muted-foreground text-sm">{formatDate(c.createdAt)}</Table.Cell>
					<Table.Cell class="text-right">
						<Button href="/admin/customers/{c.id}" variant="ghost" size="icon" aria-label="Open customer">
							<ArrowRight class="size-4" />
						</Button>
					</Table.Cell>
				</Table.Row>
			{:else}
				<Table.Row>
					<Table.Cell colspan={7} class="text-muted-foreground py-8 text-center">
						No customers match this search.
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
