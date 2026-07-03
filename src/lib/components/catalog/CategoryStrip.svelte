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

<div class="border-b border-neutral-200 bg-white">
	<div class="mx-auto w-full max-w-350 px-4 sm:px-6 lg:px-8">
		<div class="strip flex gap-2 overflow-x-auto py-4">
			<a
				href={chipHref('')}
				class="shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium whitespace-nowrap transition {activeSlug ===
				''
					? 'bg-brand-charcoal border-brand-charcoal text-white'
					: 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'}"
			>
				All
			</a>
			{#each categories as c (c.slug)}
				<a
					href={chipHref(c.slug)}
					class="shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium whitespace-nowrap transition {activeSlug ===
					c.slug
						? 'bg-brand-charcoal border-brand-charcoal text-white'
						: 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'}"
				>
					{c.name}
				</a>
			{/each}
		</div>
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
