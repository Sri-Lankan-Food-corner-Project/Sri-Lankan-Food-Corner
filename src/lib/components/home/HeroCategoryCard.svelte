<script lang="ts">
	import { ArrowRight } from '@lucide/svelte';

	type Props = {
		href: string;
		image: string;
		eyebrow: string;
		title: string;
		subtitle: string;
		cta: string;
		bgClass: string;
		blobClass: string;
		tone: 'light' | 'dark';
	};

	let { href, image, eyebrow, title, subtitle, cta, bgClass, blobClass, tone }: Props =
		$props();

	const textClasses = {
		light: {
			eyebrow: 'text-brand-amber',
			title: 'text-white',
			subtitle: 'text-white/80',
			cta: 'text-brand-amber'
		},
		dark: {
			eyebrow: 'text-neutral-900/70',
			title: 'text-neutral-900',
			subtitle: 'text-neutral-900/70',
			cta: 'text-neutral-900'
		}
	} as const;

	const t = $derived(textClasses[tone]);
</script>

<a
	{href}
	class="{bgClass} group relative flex min-h-85 flex-col justify-between overflow-hidden rounded-2xl p-8 shadow-sm sm:min-h-100"
>
	<div
		aria-hidden="true"
		class="{blobClass} absolute -top-8 -right-8 size-40 rounded-full blur-2xl"
	></div>

	<img
		src={image}
		alt=""
		aria-hidden="true"
		class="pointer-events-none absolute -right-4 -bottom-4 z-0 h-48 w-48 origin-bottom-right object-contain drop-shadow-2xl transition-transform duration-500 ease-out group-hover:scale-110 sm:h-56 sm:w-56"
	/>

	<div class="relative z-10">
		<p class="{t.eyebrow} text-xs font-semibold tracking-widest uppercase">
			{eyebrow}
		</p>
		<h3 class="{t.title} mt-3 text-2xl leading-tight font-bold sm:text-3xl">
			{title}
		</h3>
		<p class="{t.subtitle} mt-2 text-sm">{subtitle}</p>
	</div>

	<div class="relative z-10 flex items-end justify-between">
		<span
			class="{t.cta} inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4 group-hover:no-underline"
		>
			{cta} <ArrowRight class="size-4" />
		</span>
	</div>
</a>
