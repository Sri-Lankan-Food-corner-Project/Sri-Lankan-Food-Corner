<script lang="ts">
	import { ArrowRight, LayoutGrid } from '@lucide/svelte';
</script>

<section class="mx-auto max-w-350 px-4 py-16 text-center sm:px-6 lg:px-8">
	<span
		class="bg-brand-cream text-brand-green inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wider uppercase"
	>
		Asian Mart · Dangjin, South Korea
	</span>

	<h1 class="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
		Sri Lankan Food Corner
	</h1>
	<p class="text-muted-foreground mx-auto mt-4 max-w-xl">
		Sri Lankan groceries, fresh vegetables, and pantry staples — delivered across South
		Korea.
	</p>

	<div class="mt-8 flex flex-wrap justify-center gap-3">
		<a
			href="/products"
			class="bg-brand-green hover:bg-brand-green-hover inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors"
		>
			Shop Products <ArrowRight class="size-4" />
		</a>
		<a
			href="/category"
			class="bg-brand-amber hover:bg-brand-amber-hover inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-neutral-900 shadow-sm transition-colors"
		>
			<LayoutGrid class="size-4" /> Browse Categories
		</a>
	</div>
</section>
