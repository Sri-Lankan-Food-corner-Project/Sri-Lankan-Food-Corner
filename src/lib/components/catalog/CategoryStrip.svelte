<script lang="ts">
	import { page as pageState } from '$app/state';
	import { buildFilterHref } from '$lib/utils/productFilters';

	type Category = { slug: string; name: string };

	type Props = {
		categories: Category[];
		/** Slug of the currently active category, or '' for "All". */
		activeSlug: string;
		/**
		 * When true, chips link to /products?category=<slug>.
		 * When false, chips link to /category/<slug> (deep-link).
		 */
		linkAsFilter?: boolean;
	};

	let { categories, activeSlug, linkAsFilter = true }: Props = $props();

	function chipHref(slug: string) {
		if (linkAsFilter) {
			return buildFilterHref(pageState.url, (params) => {
				if (slug) params.set('category', slug);
				else params.delete('category');
				params.delete('page');
			});
		}
		return slug ? `/category/${slug}` : '/products';
	}
</script>

<div class="mx-auto w-full max-w-350 border-b border-neutral-200 bg-white">
	<div class="strip flex gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8">
		<a
			href={chipHref('')}
			class="shrink-0 rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition {activeSlug ===
			''
				? 'bg-brand-green text-white'
				: 'bg-brand-cream text-neutral-800 hover:bg-brand-cream/70'}"
		>
			All
		</a>
		{#each categories as c (c.slug)}
			<a
				href={chipHref(c.slug)}
				class="shrink-0 rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition {activeSlug ===
				c.slug
					? 'bg-brand-green text-white'
					: 'bg-brand-cream text-neutral-800 hover:bg-brand-cream/70'}"
			>
				{c.name}
			</a>
		{/each}
	</div>
</div>

<style>
	.strip {
		scrollbar-width: none;
	}
	.strip::-webkit-scrollbar {
		display: none;
	}
</style>
