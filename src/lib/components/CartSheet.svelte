<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import * as Sheet from '$lib/components/ui/sheet';
	import { cart, cartSubtotal } from '$lib/stores/cart';
	import { cartOpen } from '$lib/stores/cartUi';
	import { showAuth } from '$lib/stores/authUi';
	import { formatPrice } from '$lib/utils/formatPrice';
	import { Minus, Plus, ShoppingBag, X } from '@lucide/svelte';

	async function goToCheckout() {
		cartOpen.set(false);
		if (page.data.user) {
			goto('/checkout');
			return;
		}
		const ok = await showAuth({
			mode: 'signup',
			title: 'Create an account',
			message: 'Sign in or create your account so we can track your order.'
		});
		if (ok) goto('/checkout');
	}
</script>

<Sheet.Root bind:open={$cartOpen}>
	<Sheet.Content
		side="right"
		showCloseButton={false}
		class="bg-white! flex w-full flex-col gap-0 p-0 text-neutral-900 sm:max-w-md!"
	>
		<Sheet.Header class="flex flex-row items-center justify-between border-b border-black/5 p-5">
			<Sheet.Title class="text-lg font-bold text-neutral-900">Shopping cart</Sheet.Title>
			<Sheet.Description class="sr-only">Review items in your cart</Sheet.Description>
			<Sheet.Close
				class="inline-flex cursor-pointer items-center gap-1.5 text-sm text-neutral-600 transition-colors hover:text-neutral-900"
			>
				<X class="size-4" />
				<span>Close</span>
			</Sheet.Close>
		</Sheet.Header>

		{#if $cart.length === 0}
			<div class="flex flex-1 flex-col items-center justify-center px-6 text-center">
				<ShoppingBag class="size-12 text-neutral-300" />
				<p class="mt-3 text-sm text-neutral-500">Your cart is empty</p>
				<a
					href="/products"
					onclick={() => cartOpen.set(false)}
					class="bg-brand-charcoal hover:bg-brand-charcoal-hover mt-6 inline-flex rounded-full px-5 py-2 text-sm font-semibold text-white transition"
				>
					Browse products
				</a>
			</div>
		{:else}
			<div class="flex-1 overflow-y-auto px-5">
				<ul class="divide-y divide-black/5">
					{#each $cart as line (line.productId)}
						<li class="flex gap-3 py-4">
							<div
								class="bg-brand-sand size-16 shrink-0 overflow-hidden rounded-lg ring-1 ring-black/5"
							>
								{#if line.imageUrl}
									<img src={line.imageUrl} alt="" class="h-full w-full object-cover" />
								{/if}
							</div>
							<div class="flex flex-1 flex-col">
								<div class="flex items-start justify-between gap-2">
									<a
										href="/products/{line.slug}"
										onclick={() => cartOpen.set(false)}
										class="hover:text-brand-green text-sm font-medium text-neutral-900 transition-colors"
									>
										{line.name}
									</a>
									<button
										type="button"
										onclick={() => cart.remove(line.productId)}
										class="shrink-0 text-neutral-400 cursor-pointer transition-colors hover:text-neutral-700"
										aria-label="Remove"
									>
										<X class="size-4" />
									</button>
								</div>
								<div class="mt-2 flex items-center gap-3">
									<div class="inline-flex items-center rounded-full bg-neutral-100 p-1">
										<button
											type="button"
											onclick={() => cart.setQuantity(line.productId, line.quantity - 1)}
											class="flex size-7 cursor-pointer items-center justify-center rounded-full text-neutral-700 transition hover:bg-white"
											aria-label="Decrease"
										>
											<Minus class="size-3" />
										</button>
										<span class="w-7 text-center text-xs font-semibold text-neutral-900">
											{line.quantity}
										</span>
										<button
											type="button"
											onclick={() => cart.setQuantity(line.productId, line.quantity + 1)}
											class="flex size-7 cursor-pointer items-center justify-center rounded-full text-neutral-700 transition hover:bg-white"
											aria-label="Increase"
										>
											<Plus class="size-3" />
										</button>
									</div>
									<p class="text-xs text-neutral-500">
										{line.quantity} ×
										<span class="font-semibold text-neutral-900">
											{formatPrice(line.unitPrice)}
										</span>
									</p>
								</div>
							</div>
						</li>
					{/each}
				</ul>
			</div>

			<div class="space-y-3 border-t border-black/5 p-5">
				<div class="flex items-baseline justify-between">
					<span class="text-base font-bold text-neutral-900">Subtotal:</span>
					<span class="text-lg font-extrabold text-neutral-900">
						{formatPrice($cartSubtotal)}
					</span>
				</div>
				<a
					href="/cart"
					onclick={() => cartOpen.set(false)}
					class="inline-flex w-full items-center justify-center rounded-full bg-neutral-100 px-4 py-2.5 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-200"
				>
					View Cart
				</a>
				<button
					type="button"
					onclick={goToCheckout}
					class="bg-brand-charcoal hover:bg-brand-charcoal-hover inline-flex w-full cursor-pointer items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold text-white transition"
				>
					Checkout
				</button>
			</div>
		{/if}
	</Sheet.Content>
</Sheet.Root>

<style>
	:global([data-slot='sheet-content'][data-side='right'][data-state='open']) {
		animation: sheet-slide-in-right 450ms cubic-bezier(0.32, 0.72, 0, 1);
	}
	:global([data-slot='sheet-content'][data-side='right'][data-state='closed']) {
		animation: sheet-slide-out-right 300ms cubic-bezier(0.32, 0.72, 0, 1);
	}
	:global([data-slot='sheet-overlay'][data-state='open']) {
		animation: sheet-fade-in 400ms ease-out;
	}
	:global([data-slot='sheet-overlay'][data-state='closed']) {
		animation: sheet-fade-out 250ms ease-in;
	}

	@keyframes -global-sheet-slide-in-right {
		from {
			transform: translateX(100%);
		}
		to {
			transform: translateX(0);
		}
	}
	@keyframes -global-sheet-slide-out-right {
		from {
			transform: translateX(0);
		}
		to {
			transform: translateX(100%);
		}
	}
	@keyframes -global-sheet-fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	@keyframes -global-sheet-fade-out {
		from {
			opacity: 1;
		}
		to {
			opacity: 0;
		}
	}
</style>
