<script lang="ts">
	import { ArrowRight, Carrot, Wheat } from '@lucide/svelte';
	import { fade } from 'svelte/transition';
	import banner1 from '$lib/assets/home/banner1.webp';
	import banner2 from '$lib/assets/home/banner2.webp';

	const slides = [
		{
			eyebrow: 'Everything Under One Roof',
			title: 'Vegetables, Meat, Fish, Spices & Rice',
			subtitle: 'එළවලු, මස්, මාලු, කුළුබඩු, සහල් — all in one place.',
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

	let index = $state(0);
	const current = $derived(slides[index]);

	$effect(() => {
		const id = setInterval(() => {
			index = (index + 1) % slides.length;
		}, 5500);
		return () => clearInterval(id);
	});
</script>

<section class="mx-auto max-w-350 px-4 py-8 sm:px-6 lg:px-8">
	<div class="grid gap-4 lg:grid-cols-4">
		<!-- Slider card (left, spans 2 cols on desktop) -->
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
				class="pointer-events-none absolute -right-4 -bottom-6 z-0 hidden h-56 w-56 origin-bottom-right object-contain drop-shadow-2xl transition-transform duration-500 ease-out group-hover:scale-110 sm:block sm:h-64 sm:w-64 lg:h-80 lg:w-80"
			/>
		

			<div class="relative z-10 flex-1">
				{#key index}
					<div
						in:fade={{ duration: 350 }}
						class="absolute inset-0 flex max-w-md flex-col sm:max-w-sm lg:max-w-xs"
					>
						<p
							class="text-brand-amber text-xs font-semibold tracking-widest uppercase"
						>
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

		<!-- Middle card: Fresh produce & meat (amber) -->
		<a
			href="/products"
			class="bg-brand-amber group relative flex min-h-85 flex-col justify-between overflow-hidden rounded-2xl p-8 shadow-sm sm:min-h-100"
		>
			<div
				aria-hidden="true"
				style="background-image: url({banner2});"
				class="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-500 ease-out group-hover:scale-110"
			></div>
			<div
				aria-hidden="true"
				class="absolute inset-0 z-0 bg-black/30"
			></div>
			<div
				aria-hidden="true"
				class="absolute -top-8 -right-8 size-40 rounded-full bg-white/25 blur-2xl"
			></div>

			<div class="relative z-10">
				<p class="text-brand-amber text-xs font-semibold tracking-widest uppercase">
					Fresh Weekly
				</p>
				<h3 class="mt-3 text-2xl leading-tight font-bold text-white sm:text-3xl">
					Vegetables, Meat &amp; Fish
				</h3>
				<p class="mt-2 text-sm text-white/80">එළවලු · මස් · මාලු</p>
			</div>

			<div class="relative z-10 flex items-end justify-between">
				<span
					class="inline-flex items-center gap-2 text-sm font-semibold text-white underline underline-offset-4 group-hover:no-underline"
				>
					Shop Fresh <ArrowRight class="size-4" />
				</span>
				<Carrot class="size-16 text-white/40" strokeWidth={1.25} />
			</div>
		</a>

		<!-- Right card: Spices, rice & staples (dark) -->
		<a
			href="/products"
			class="bg-brand-charcoal group relative flex min-h-85 flex-col justify-between overflow-hidden rounded-2xl p-8 shadow-sm sm:min-h-100"
		>
			<div
				aria-hidden="true"
				class="bg-brand-green/30 absolute -top-8 -right-8 size-40 rounded-full blur-2xl"
			></div>

			<div class="relative z-10">
				<p
					class="text-brand-amber text-xs font-semibold tracking-widest uppercase"
				>
					Pantry Essentials
				</p>
				<h3 class="mt-3 text-2xl leading-tight font-bold text-white sm:text-3xl">
					Spices, Rice &amp; Staples
				</h3>
				<p class="mt-2 text-sm text-white/70">කුළුබඩු · සහල් · අනිකුත් සියල්ල</p>
			</div>

			<div class="relative z-10 flex items-end justify-between">
				<span
					class="text-brand-amber inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4 group-hover:no-underline"
				>
					Buy Now <ArrowRight class="size-4" />
				</span>
				<Wheat class="size-16 text-white/15" strokeWidth={1.25} />
			</div>
		</a>
	</div>
</section>
