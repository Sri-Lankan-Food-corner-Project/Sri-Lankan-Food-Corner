<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Menu, LayoutGrid, ChevronRight } from '@lucide/svelte';

	type Category = { slug: string; name: string };
	let { categories = [] }: { categories?: Category[] } = $props();

	const itemClass =
		'flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-sm !text-neutral-700 cursor-pointer focus:!bg-[#F6EEDC] focus:!text-neutral-900 outline-none transition-colors [&_svg.chev]:opacity-0 focus:[&_svg.chev]:opacity-100';
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<button
				{...props}
				class="hidden shrink-0 items-center gap-2 rounded-full bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800 md:inline-flex"
			>
				<Menu class="size-4" />
				All Categories
			</button>
		{/snippet}
	</DropdownMenu.Trigger>

	<DropdownMenu.Content
		align="start"
		sideOffset={10}
		class="!min-w-64 !rounded-xl !border !border-black/5 !bg-white !p-0 !text-neutral-800 !shadow-xl !ring-0 overflow-hidden"
	>
		<div class="border-b border-black/5 bg-[#F6EEDC] px-4 py-2.5">
			<p class="text-[10px] font-semibold tracking-wider text-neutral-500 uppercase">
				Browse
			</p>
		</div>

		<div class="p-1.5">
			<DropdownMenu.Item class={itemClass}>
				{#snippet child({ props })}
					<a href="/products" {...props}>
						<span class="flex items-center gap-2.5">
							<LayoutGrid class="size-4 text-neutral-500" />
							<span class="font-medium">All Products</span>
						</span>
						<ChevronRight class="chev size-3.5 text-neutral-400 transition-opacity" />
					</a>
				{/snippet}
			</DropdownMenu.Item>

			{#if categories.length > 0}
				<div class="my-1.5 h-px bg-black/5"></div>
				<p class="px-3 pt-1 pb-1.5 text-[10px] font-semibold tracking-wider text-neutral-500 uppercase">
					Categories
				</p>
				{#each categories as c (c.slug)}
					<DropdownMenu.Item class={itemClass}>
						{#snippet child({ props })}
							<a href="/category/{c.slug}" {...props}>
								<span>{c.name}</span>
								<ChevronRight class="chev size-3.5 text-neutral-400 transition-opacity" />
							</a>
						{/snippet}
					</DropdownMenu.Item>
				{/each}
			{/if}
		</div>
	</DropdownMenu.Content>
</DropdownMenu.Root>
