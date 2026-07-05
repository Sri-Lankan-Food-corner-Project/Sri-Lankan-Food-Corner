<script lang="ts">
	type Props = {
		title: string;
		subtitle?: string | null;
		breadcrumb?: { label: string; href: string }[];
	};
	let { title, subtitle = null, breadcrumb = [] }: Props = $props();
</script>

<!-- Skeleton for ProductListingLayout while streamed data is in flight.
     Shows title + subtitle + breadcrumb immediately so the header doesn't jump. -->
<section class="mx-auto w-full max-w-350 px-4 py-8 sm:px-6 lg:px-8">
	{#if breadcrumb.length > 0}
		<nav class="mb-3 text-xs text-neutral-500" aria-label="Breadcrumb">
			<ol class="flex flex-wrap items-center gap-1">
				{#each breadcrumb as crumb, i (crumb.href)}
					<li class="flex items-center gap-1">
						{#if i > 0}
							<span aria-hidden="true">›</span>
						{/if}
						<a href={crumb.href} class="hover:underline">{crumb.label}</a>
					</li>
				{/each}
			</ol>
		</nav>
	{/if}

	<div class="flex flex-wrap items-end justify-between gap-3">
		<div class="min-w-0">
			<h1 class="text-3xl font-extrabold tracking-tight text-neutral-900 capitalize sm:text-4xl">
				{title}
			</h1>
			{#if subtitle}
				<p class="mt-2 max-w-2xl text-sm text-neutral-500 sm:text-base">{subtitle}</p>
			{/if}
		</div>
		<div class="h-4 w-16 animate-pulse rounded bg-neutral-200"></div>
	</div>

	<!-- Filter bar skeleton -->
	<div class="mt-6">
		<div class="flex flex-wrap gap-2">
			{#each [0, 1, 2, 3] as i (i)}
				<div class="h-9 w-24 animate-pulse rounded-full bg-neutral-200"></div>
			{/each}
		</div>
	</div>

	<!-- Product grid skeleton -->
	<div class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
		{#each [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as i (i)}
			<div class="animate-pulse space-y-2">
				<div class="aspect-square rounded-xl bg-neutral-200"></div>
				<div class="h-4 w-3/4 rounded bg-neutral-200"></div>
				<div class="h-3 w-1/2 rounded bg-neutral-200"></div>
			</div>
		{/each}
	</div>
</section>
