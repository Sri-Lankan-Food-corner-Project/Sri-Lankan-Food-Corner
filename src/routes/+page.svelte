<script lang="ts">
	import HeroBanner from '$lib/components/home/HeroBanner.svelte';
	import FeatureMarquee from '$lib/components/home/FeatureMarquee.svelte';
	import ProductSlider from '$lib/components/home/ProductSlider.svelte';

	let { data } = $props();
</script>

<HeroBanner />
<FeatureMarquee />

{#each data.sections as section (section.id)}
	<ProductSlider
		title={section.title}
		subtitle={section.subtitle}
		products={section.products}
	/>
{/each}
