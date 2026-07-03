<script lang="ts">
	import { Loader2, ShoppingCart } from '@lucide/svelte';

	type Props = {
		onclick?: (event: MouseEvent) => void;
		disabled?: boolean;
		loading?: boolean;
		label?: string;
		class?: string;
	};

	let {
		onclick,
		disabled = false,
		loading = false,
		label = 'Add to Cart',
		class: className = ''
	}: Props = $props();
</script>

<button
	type="button"
	{onclick}
	disabled={disabled || loading}
	class="bg-brand-charcoal hover:bg-brand-charcoal-hover group/btn inline-flex w-full cursor-pointer items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-70 {className}"
>
	{#if loading}
		<Loader2 class="mr-2 size-4 animate-spin" aria-hidden="true" />
		<span>Adding…</span>
	{:else}
		<ShoppingCart
			class="size-4 -ml-6 scale-0 opacity-0 transition-all duration-200 ease-out group-hover/btn:mr-2 group-hover/btn:ml-0 group-hover/btn:scale-100 group-hover/btn:opacity-100"
			aria-hidden="true"
		/>
		<span>{label}</span>
	{/if}
</button>
