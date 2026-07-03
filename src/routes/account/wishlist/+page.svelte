<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import AddToCartButton from '$lib/components/AddToCartButton.svelte';
	import Pagination from '$lib/components/Pagination.svelte';
	import { cart } from '$lib/stores/cart';
	import { cartOpen } from '$lib/stores/cartUi';
	import { toggleWishlist } from '$lib/stores/wishlist';
	import { formatPrice } from '$lib/utils/formatPrice';
	import { Heart, X } from '@lucide/svelte';

	let { data } = $props();

	let addingId = $state<string | null>(null);

	async function addToCart(item: (typeof data.items)[number]) {
		if (addingId) return;
		addingId = item.id;
		cart.add({
			productId: item.id,
			slug: item.slug,
			name: item.name,
			unitPrice: item.price,
			quantity: 1,
			imageUrl: item.imageUrl ?? undefined
		});
		await new Promise((r) => setTimeout(r, 400));
		addingId = null;
		cartOpen.set(true);
	}

	async function remove(productId: string) {
		try {
			await toggleWishlist(productId);
			await invalidateAll();
			toast.success('Removed from wishlist');
		} catch {
			toast.error('Could not remove. Please try again.');
		}
	}
</script>

<div class="space-y-6">
	{#if data.items.length === 0}
		<div class="bg-brand-cream ring-brand-charcoal/10 rounded-2xl p-10 text-center ring-1">
			<Heart class="text-brand-charcoal/30 mx-auto size-14" />
			<h2 class="mt-4 text-xl font-bold text-neutral-900">Your wishlist is empty</h2>
			<p class="mt-2 text-sm text-neutral-500">
				Tap the heart on any product to save it here for later.
			</p>
			<a
				href="/products"
				class="bg-brand-charcoal hover:bg-brand-charcoal-hover mt-6 inline-flex rounded-full px-6 py-2.5 text-sm font-semibold text-white transition"
			>
				Browse Products
			</a>
		</div>
	{:else}
		<div class="flex items-center justify-between">
			<h2 class="text-lg font-bold text-neutral-900">Saved items</h2>
			<p class="text-xs text-neutral-500">
				{data.pagination.total} item{data.pagination.total === 1 ? '' : 's'}
			</p>
		</div>

		<div class="grid gap-4 sm:grid-cols-2">
			{#each data.items as item (item.id)}
				{@const soldOut = item.stockQuantity === 0}
				<div class="bg-brand-cream ring-brand-charcoal/10 relative rounded-2xl p-4 ring-1">
					<button
						type="button"
						onclick={() => remove(item.id)}
						aria-label="Remove from wishlist"
						class="absolute top-3 right-3 z-10 inline-flex size-8 items-center justify-center rounded-full bg-white/90 text-neutral-500 shadow-sm ring-1 ring-black/5 transition hover:bg-white hover:text-red-500"
					>
						<X class="size-4" />
					</button>

					<div class="flex gap-4">
						<a
							href="/products/{item.slug}"
							class="bg-brand-sand ring-brand-charcoal/10 size-24 shrink-0 overflow-hidden rounded-xl ring-1"
						>
							{#if item.imageUrl}
								<img src={item.imageUrl} alt="" class="h-full w-full object-cover" />
							{/if}
						</a>
						<div class="flex min-w-0 flex-1 flex-col">
							<a
								href="/products/{item.slug}"
								class="hover:text-brand-green line-clamp-2 text-sm font-semibold text-neutral-900 transition-colors"
							>
								{item.name}
							</a>
							{#if item.unit}
								<p class="mt-0.5 line-clamp-1 text-xs text-neutral-500">{item.unit}</p>
							{/if}
							<div class="mt-2 flex items-baseline gap-2">
								{#if item.compareAtPrice && item.compareAtPrice > item.price}
									<span class="text-xs text-neutral-400 line-through">
										{formatPrice(item.compareAtPrice)}
									</span>
								{/if}
								<span class="text-base font-extrabold text-neutral-900">
									{formatPrice(item.price)}
								</span>
							</div>

							<div class="mt-auto pt-3">
								{#if soldOut}
									<span
										class="inline-flex items-center rounded-full bg-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-600"
									>
										Sold Out
									</span>
								{:else}
									<AddToCartButton
										onclick={() => addToCart(item)}
										loading={addingId === item.id}
									/>
								{/if}
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>

		{#if data.pagination.pageCount > 1}
			<div class="mt-6 flex flex-col items-center gap-3">
				<Pagination page={data.pagination.page} pageCount={data.pagination.pageCount} />
				<p class="text-xs text-neutral-500">
					Showing {(data.pagination.page - 1) * data.pagination.pageSize + 1}–{Math.min(
						data.pagination.page * data.pagination.pageSize,
						data.pagination.total
					)} of {data.pagination.total} saved items
				</p>
			</div>
		{/if}
	{/if}
</div>
