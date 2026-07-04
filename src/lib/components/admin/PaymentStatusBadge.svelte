<script lang="ts">
	import { PAYMENT_STATUS_LABELS, type PaymentStatus } from '$lib/schemas/orderStatus';

	type Props = { status: string };
	let { status }: Props = $props();

	const styles: Record<PaymentStatus, string> = {
		unpaid: 'bg-red-100 text-red-800',
		paid: 'bg-green-100 text-green-800',
		refunded: 'bg-neutral-200 text-neutral-700'
	};

	const cls = $derived(styles[status as PaymentStatus] ?? 'bg-neutral-100 text-neutral-700');
	const label = $derived(PAYMENT_STATUS_LABELS[status as PaymentStatus] ?? status);
</script>

<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold {cls}">
	{label}
</span>
