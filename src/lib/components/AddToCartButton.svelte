<script lang="ts">
	import { ShoppingCart } from '@lucide/svelte';

	type Props = {
		onclick?: (event: MouseEvent) => void;
		disabled?: boolean;
		label?: string;
		class?: string;
	};

	let {
		onclick,
		disabled = false,
		label = 'Add to Cart',
		class: className = ''
	}: Props = $props();
</script>

<button
	type="button"
	{onclick}
	{disabled}
	class="bg-brand-green hover:bg-brand-green-hover group/btn inline-flex w-full items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60 {className}"
>
	<ShoppingCart
		class="size-4 -ml-6 scale-0 opacity-0 transition-all duration-200 ease-out group-hover/btn:mr-2 group-hover/btn:ml-0 group-hover/btn:scale-100 group-hover/btn:opacity-100"
		aria-hidden="true"
	/>
	<span>{label}</span>
</button>
