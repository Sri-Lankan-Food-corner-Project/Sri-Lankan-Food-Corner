<script lang="ts">
	import {
		Soup,
		Leaf,
		ShoppingBasket,
		BadgeCheck,
		BadgePercent,
		Truck,
		ShieldCheck,
		Headphones
	} from '@lucide/svelte';
	import type { Component } from 'svelte';

	type Item = { icon: Component; label: string };

	const items: Item[] = [
		{ icon: BadgePercent, label: 'Low Prices Than Other Stores' },
		{ icon: Truck, label: 'Fast, Safe & Secure Delivery' },
		{ icon: Leaf, label: 'Fresh Products Every Day' },
		{ icon: ShieldCheck, label: 'Safe Payment With Toss' },
		{ icon: Headphones, label: '24/7 Customer Support' },
		{ icon: Soup, label: 'Authentic Sri Lankan Food' },
		{ icon: ShoppingBasket, label: 'Everyday Grocery Items' },
		{ icon: BadgeCheck, label: 'Quality You Can Trust' }
	];
</script>

<section class="mx-auto max-w-350 px-4 pb-8 sm:px-6 lg:px-8">
	<div class="bg-brand-cream marquee relative h-16 overflow-hidden rounded-2xl">
		<div class="marquee-track absolute inset-y-0 flex items-center gap-12 pr-12">
			{#each [...items, ...items] as item, i (i)}
				<div class="flex shrink-0 items-center gap-3">
					<item.icon
						class="text-brand-green size-5 sm:size-6"
						strokeWidth={1.75}
					/>
					<span
						class="text-brand-green text-sm font-semibold whitespace-nowrap sm:text-base"
					>
						{item.label}
					</span>
				</div>
			{/each}
		</div>
	</div>
</section>

<style>
	@keyframes marquee {
		from {
			transform: translateX(0);
		}
		to {
			transform: translateX(-50%);
		}
	}
	.marquee-track {
		animation: marquee 40s linear infinite;
		will-change: transform;
	}
	.marquee:hover .marquee-track {
		animation-play-state: paused;
	}
	@media (prefers-reduced-motion: reduce) {
		.marquee-track {
			animation: none;
		}
	}
</style>
