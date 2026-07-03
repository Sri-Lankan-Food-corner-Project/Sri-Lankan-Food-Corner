<script lang="ts">
	import { ArrowRight } from '@lucide/svelte';
	import { fade } from 'svelte/transition';
	import banner1 from '$lib/assets/home/banner1.webp';

	type Slide = {
		eyebrow: string;
		title: string;
		subtitle: string;
		cta: string;
		href: string;
	};

	const slides: Slide[] = [
		{
			eyebrow: 'Everything Under One Roof',
			title: 'Vegetables, Meat, Fish, Spices & Rice',
			subtitle: 'එළවලු, මස්, මාලු, කුළුබඩු, සහල් - all in one place.',
			cta: 'Shop All Products',
			href: '/products'
		},
		{
			eyebrow: '택배 · Home Delivery',
			title: 'Delivered to Your Doorstep',
			subtitle: '택배 මගින් ඔබේ නිවසටම',
			cta: 'Start Shopping',
			href: '/products'
		},
		{
			eyebrow: 'Fresh · Authentic · Weekly',
			title: 'Curated for the Sri Lankan Kitchen',
			subtitle: 'Handpicked ingredients you actually cook with, restocked every week.',
			cta: 'Browse Categories',
			href: '/category'
		}
	];

	const AUTOPLAY_MS = 5500;

	let index = $state(0);
	const current = $derived(slides[index]);

	$effect(() => {
		const id = setInterval(() => {
			index = (index + 1) % slides.length;
		}, AUTOPLAY_MS);
		return () => clearInterval(id);
	});
</script>

<div
	class="bg-brand-charcoal group relative flex min-h-85 flex-col justify-between overflow-hidden rounded-2xl p-8 sm:min-h-100 sm:p-10 lg:col-span-2"
>
	<div
		aria-hidden="true"
		class="bg-brand-amber/10 absolute -right-16 -bottom-16 size-72 rounded-full blur-3xl"
	></div>
	<div
		aria-hidden="true"
		class="bg-brand-green/25 absolute top-6 right-6 size-40 rounded-full blur-3xl"
	></div>

	<img
		src={banner1}
		alt=""
		aria-hidden="true"
		class="pointer-events-none absolute -right-4 -bottom-6 z-0 h-40 w-40 origin-bottom-right object-contain drop-shadow-2xl transition-transform duration-500 ease-out group-hover:scale-110 sm:h-64 sm:w-64 lg:h-80 lg:w-80"
	/>

	<div class="relative z-10 flex-1">
		{#key index}
			<div
				in:fade={{ duration: 350 }}
				class="absolute inset-0 flex max-w-md flex-col sm:max-w-sm lg:max-w-xs"
			>
				<p class="text-brand-amber text-xs font-semibold tracking-widest uppercase">
					{current.eyebrow}
				</p>
				<h2
					class="text-brand-amber mt-3 text-2xl leading-tight font-bold sm:text-3xl lg:text-4xl"
				>
					{current.title}
				</h2>
				<p class="mt-4 text-sm text-white/75 sm:text-base">
					{current.subtitle}
				</p>
				<div class="mt-auto pt-6">
					<a
						href={current.href}
						class="hover:bg-brand-cream inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-medium text-neutral-900 shadow-sm transition-colors"
					>
						{current.cta} <ArrowRight class="size-4" />
					</a>
				</div>
			</div>
		{/key}
	</div>

	<div class="relative z-10 mt-6 flex items-center gap-2">
		{#each slides as _, i (i)}
			<button
				type="button"
				aria-label="Go to slide {i + 1}"
				aria-current={i === index}
				onclick={() => (index = i)}
				class="h-2 rounded-full transition-all duration-300 {i === index
					? 'w-6 bg-white'
					: 'w-2 bg-white/30 hover:bg-white/60'}"
			></button>
		{/each}
	</div>
</div>
