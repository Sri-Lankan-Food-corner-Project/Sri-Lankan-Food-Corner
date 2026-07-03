<script lang="ts">
	import banner2 from '$lib/assets/home/banner2.webp';
	import banner3 from '$lib/assets/home/banner33.webp';
	import HeroSlider from './HeroSlider.svelte';
	import HeroCategoryCard from './HeroCategoryCard.svelte';
</script>

<section class="mx-auto max-w-350 px-4 py-8 sm:px-6 lg:px-8">
	<div class="grid gap-4 lg:grid-cols-4">
		<HeroSlider />

		<HeroCategoryCard
			href="/products"
			image={banner2}
			eyebrow="Fresh Weekly"
			title="Vegetables, Meat & Fish"
			subtitle="එළවලු · මස් · මාලු"
			cta="Shop Fresh"
			bgClass="bg-brand-green"
			blobClass="bg-brand-amber/20"
			tone="light"
		/>

		<HeroCategoryCard
			href="/products"
			image={banner3}
			eyebrow="Pantry Essentials"
			title="Spices, Rice & Staples"
			subtitle="කුළුබඩු · සහල් · අනිකුත් සියල්ල"
			cta="Buy Now"
			bgClass="bg-brand-amber"
			blobClass="bg-brand-charcoal/15"
			tone="dark"
		/>
	</div>
</section>
