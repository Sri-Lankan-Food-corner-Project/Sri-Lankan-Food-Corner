<script lang="ts">
	import { Star } from '@lucide/svelte';

	type Props = {
		/** Current rating (1-5). Use 0 to mean "no rating yet" in interactive mode. */
		value: number;
		/** If true, user can click a star to set the rating. */
		interactive?: boolean;
		/** Callback fired when the user clicks a star. */
		onChange?: (rating: number) => void;
		size?: 'sm' | 'md' | 'lg';
		/** Aria-label prefix used when interactive. */
		label?: string;
	};

	let {
		value,
		interactive = false,
		onChange,
		size = 'md',
		label = 'Rate'
	}: Props = $props();

	let hover = $state(0);

	const dim = $derived(size === 'sm' ? 'size-3.5' : size === 'lg' ? 'size-6' : 'size-4');

	function pick(n: number) {
		if (!interactive) return;
		onChange?.(n);
	}
</script>

<div
	class="inline-flex items-center gap-0.5"
	role={interactive ? 'radiogroup' : undefined}
	aria-label={interactive ? label : undefined}
>
	{#each [1, 2, 3, 4, 5] as n (n)}
		{@const filled = (hover || value) >= n}
		{#if interactive}
			<button
				type="button"
				onclick={() => pick(n)}
				onmouseenter={() => (hover = n)}
				onmouseleave={() => (hover = 0)}
				aria-label={`${label} ${n} of 5`}
				aria-checked={value === n}
				role="radio"
				class="cursor-pointer rounded p-0.5 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-amber"
			>
				<Star class="{dim} {filled ? 'fill-brand-amber text-brand-amber' : 'text-neutral-300'}" />
			</button>
		{:else}
			<Star class="{dim} {filled ? 'fill-brand-amber text-brand-amber' : 'text-neutral-300'}" />
		{/if}
	{/each}
</div>
