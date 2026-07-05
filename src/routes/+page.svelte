<script lang="ts">
	import HeroBanner from '$lib/components/home/HeroBanner.svelte';
	import FeatureMarquee from '$lib/components/home/FeatureMarquee.svelte';
	import ProductSlider from '$lib/components/home/ProductSlider.svelte';

	let { data } = $props();
</script>

<HeroBanner />
<FeatureMarquee />

{#await data.streamed.sections}
	<!-- Skeleton — mirrors the ProductSlider layout so the page doesn't jump
	     when real data lands. Two placeholder rows is enough visual weight. -->
	{#each [0, 1] as row (row)}
		<section class="mx-auto w-full max-w-350 py-6">
			<div class="flex items-end justify-between gap-4 px-4 sm:px-6 lg:px-8">
				<div class="animate-pulse space-y-2">
					<div class="h-6 w-40 rounded bg-neutral-200"></div>
					<div class="h-3 w-56 rounded bg-neutral-200"></div>
				</div>
				<div class="h-4 w-16 animate-pulse rounded bg-neutral-200"></div>
			</div>
			<div class="mt-4 flex gap-3 overflow-hidden px-4 sm:gap-4 sm:px-6 lg:px-8">
				{#each [0, 1, 2, 3, 4] as i (i)}
					<div class="w-[45%] shrink-0 sm:w-[32%] md:w-[24%] lg:w-[19%]">
						<div class="animate-pulse space-y-2">
							<div class="aspect-square rounded-xl bg-neutral-200"></div>
							<div class="h-4 w-3/4 rounded bg-neutral-200"></div>
							<div class="h-3 w-1/2 rounded bg-neutral-200"></div>
						</div>
					</div>
				{/each}
			</div>
		</section>
	{/each}
{:then sections}
	{#each sections as section (section.id)}
		<ProductSlider
			title={section.title}
			subtitle={section.subtitle}
			products={section.products}
			viewAllHref={section.viewAllHref}
		/>
	{/each}
{/await}
