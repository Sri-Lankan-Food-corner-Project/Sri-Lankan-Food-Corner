<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { formatPrice } from '$lib/utils/formatPrice';
	import { cart, type CartLine } from '$lib/stores/cart';
	import { Trash2 } from '@lucide/svelte';

	let { line }: { line: CartLine } = $props();

	function updateQty(e: Event) {
		const value = Number((e.target as HTMLInputElement).value);
		cart.setQuantity(line.productId, Number.isFinite(value) ? value : 0);
	}
</script>

<div class="flex items-center gap-4 border-b py-4">
	<div class="bg-muted size-16 shrink-0 overflow-hidden rounded">
		{#if line.imageUrl}
			<img src={line.imageUrl} alt={line.name} class="h-full w-full object-cover" />
		{/if}
	</div>
	<div class="flex-1">
		<a href="/products/{line.slug}" class="text-sm font-medium hover:underline">{line.name}</a>
		<p class="text-muted-foreground text-xs">{formatPrice(line.unitPrice)}</p>
	</div>
	<Input
		type="number"
		min="0"
		value={line.quantity}
		oninput={updateQty}
		class="w-20"
	/>
	<div class="w-24 text-right text-sm font-semibold">
		{formatPrice(line.unitPrice * line.quantity)}
	</div>
	<Button variant="ghost" size="icon" onclick={() => cart.remove(line.productId)}>
		<Trash2 class="size-4" />
		<span class="sr-only">Remove</span>
	</Button>
</div>
