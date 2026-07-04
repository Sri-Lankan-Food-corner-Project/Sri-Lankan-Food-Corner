<script lang="ts">
	import { ORDER_STATUS_LABELS, type OrderStatus } from '$lib/schemas/orderStatus';

	type Props = { status: string };
	let { status }: Props = $props();

	const styles: Record<OrderStatus, string> = {
		pending: 'bg-amber-100 text-amber-800',
		preparing: 'bg-blue-100 text-blue-800',
		shipped: 'bg-indigo-100 text-indigo-800',
		delivered: 'bg-green-100 text-green-800',
		cancelled: 'bg-neutral-200 text-neutral-700'
	};

	const cls = $derived(styles[status as OrderStatus] ?? 'bg-neutral-100 text-neutral-700');
	const label = $derived(ORDER_STATUS_LABELS[status as OrderStatus] ?? status);
</script>

<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold {cls}">
	{label}
</span>
