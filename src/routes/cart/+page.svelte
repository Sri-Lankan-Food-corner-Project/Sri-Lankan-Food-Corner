<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { cart, cartSubtotal } from '$lib/stores/cart';
	import { showAuth } from '$lib/stores/authUi';
	import { formatPrice } from '$lib/utils/formatPrice';
	import {
		ArrowRight,
		CircleCheck,
		CreditCard,
		Minus,
		Plus,
		ShoppingCart,
		ShoppingBag,
		X
	} from '@lucide/svelte';

	async function goToCheckout() {
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

<section class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
	<nav
		aria-label="Checkout progress"
		class="mb-8 flex flex-wrap items-center justify-center gap-2 text-sm sm:gap-5 sm:text-base"
	>
		<span
			class="decoration-2 inline-flex items-center gap-2 font-bold text-neutral-900 underline underline-offset-4"
		>
			<ShoppingCart class="size-4 sm:size-5" />
			Shopping Cart
		</span>
		<ArrowRight class="size-4 text-neutral-400 sm:size-5" />
		<span class="inline-flex items-center gap-2 font-medium text-neutral-400">
			<CreditCard class="size-4 sm:size-5" />
			Checkout
		</span>
		<ArrowRight class="size-4 text-neutral-400 sm:size-5" />
		<span class="inline-flex items-center gap-2 font-medium text-neutral-400">
			<CircleCheck class="size-4 sm:size-5" />
			Order Complete
		</span>
	</nav>

	{#if $cart.length === 0}
		<div class="bg-brand-cream ring-brand-charcoal/10 mx-auto max-w-md rounded-2xl p-10 text-center ring-1">
			<ShoppingBag class="text-brand-charcoal/30 mx-auto size-14" />
			<h2 class="mt-4 text-xl font-bold text-neutral-900">Your cart is empty</h2>
			<p class="mt-2 text-sm text-neutral-500">Add products to your cart to get started.</p>
			<a
				href="/products"
				class="bg-brand-charcoal hover:bg-brand-charcoal-hover mt-6 inline-flex rounded-full px-6 py-2.5 text-sm font-semibold text-white transition"
			>
				Continue Shopping
			</a>
		</div>
	{:else}
		<div class="grid gap-6 lg:grid-cols-[1fr_360px]">
			<div class="rounded-2xl bg-brand-cream p-4 ring-1 ring-brand-charcoal/10 sm:p-6">
				<div class="hidden lg:block">
					<table class="w-full">
						<thead>
							<tr class="border-b border-brand-charcoal/10 text-left text-sm font-bold text-neutral-900">
								<th class="pb-4"></th>
								<th class="pb-4">Product</th>
								<th class="pb-4 text-center">Price</th>
								<th class="pb-4 text-center">Quantity</th>
								<th class="pb-4 text-right">Subtotal</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-brand-charcoal/10">
							{#each $cart as line (line.productId)}
								<tr>
									<td class="py-6">
										<button
											type="button"
											onclick={() => cart.remove(line.productId)}
											class="text-neutral-400 transition-colors hover:text-neutral-900"
											aria-label="Remove"
										>
											<X class="size-4" />
										</button>
									</td>
									<td class="py-6">
										<div class="flex items-center gap-4">
											<div
												class="bg-brand-sand size-16 shrink-0 overflow-hidden rounded-lg ring-1 ring-black/5"
											>
												{#if line.imageUrl}
													<img src={line.imageUrl} alt="" class="h-full w-full object-cover" />
												{/if}
											</div>
											<a
												href="/products/{line.slug}"
												class="hover:text-brand-green text-sm font-medium text-neutral-900 transition-colors"
											>
												{line.name}
											</a>
										</div>
									</td>
									<td class="py-6 text-center text-sm text-neutral-600">
										{formatPrice(line.unitPrice)}
									</td>
									<td class="py-6">
										<div class="flex justify-center">
											<div class="inline-flex items-center rounded-full bg-brand-sand p-1">
												<button
													type="button"
													onclick={() => cart.setQuantity(line.productId, line.quantity - 1)}
													class="flex size-8 items-center justify-center rounded-full text-neutral-700 transition hover:bg-white/70"
													aria-label="Decrease"
												>
													<Minus class="size-3.5" />
												</button>
												<span class="w-9 text-center text-sm font-semibold text-neutral-900">
													{line.quantity}
												</span>
												<button
													type="button"
													onclick={() => cart.setQuantity(line.productId, line.quantity + 1)}
													class="flex size-8 items-center justify-center rounded-full text-neutral-700 transition hover:bg-white/70"
													aria-label="Increase"
												>
													<Plus class="size-3.5" />
												</button>
											</div>
										</div>
									</td>
									<td class="py-6 text-right text-sm font-bold text-neutral-900">
										{formatPrice(line.unitPrice * line.quantity)}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

				<ul class="divide-y divide-brand-charcoal/10 lg:hidden">
					{#each $cart as line (line.productId)}
						<li class="flex gap-3 py-4">
							<div
								class="bg-brand-sand size-20 shrink-0 overflow-hidden rounded-lg ring-1 ring-black/5"
							>
								{#if line.imageUrl}
									<img src={line.imageUrl} alt="" class="h-full w-full object-cover" />
								{/if}
							</div>
							<div class="flex flex-1 flex-col">
								<div class="flex items-start justify-between gap-2">
									<a
										href="/products/{line.slug}"
										class="hover:text-brand-green text-sm font-medium text-neutral-900 transition-colors"
									>
										{line.name}
									</a>
									<button
										type="button"
										onclick={() => cart.remove(line.productId)}
										class="shrink-0 text-neutral-400 transition-colors hover:text-neutral-900"
										aria-label="Remove"
									>
										<X class="size-4" />
									</button>
								</div>
								<p class="mt-1 text-xs text-neutral-500">{formatPrice(line.unitPrice)}</p>
								<div class="mt-auto flex items-center justify-between pt-3">
									<div class="inline-flex items-center rounded-full bg-brand-sand p-1">
										<button
											type="button"
											onclick={() => cart.setQuantity(line.productId, line.quantity - 1)}
											class="flex size-7 items-center justify-center rounded-full text-neutral-700 transition hover:bg-white/70"
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
											class="flex size-7 items-center justify-center rounded-full text-neutral-700 transition hover:bg-white/70"
											aria-label="Increase"
										>
											<Plus class="size-3" />
										</button>
									</div>
									<p class="text-sm font-bold text-neutral-900">
										{formatPrice(line.unitPrice * line.quantity)}
									</p>
								</div>
							</div>
						</li>
					{/each}
				</ul>

			</div>

			<aside class="bg-brand-cream ring-brand-charcoal/10 rounded-2xl p-6 ring-1 lg:sticky lg:top-24 lg:self-start">
				<h2 class="text-xl font-bold text-neutral-900">Cart Totals</h2>

				<div
					class="mt-5 flex items-center justify-between border-t border-brand-charcoal/10 pt-5 text-sm"
				>
					<span class="text-neutral-600">Subtotal</span>
					<span class="font-semibold text-neutral-900">{formatPrice($cartSubtotal)}</span>
				</div>

				<div class="mt-4 flex items-start justify-between border-t border-brand-charcoal/10 pt-4 text-sm">
					<span class="text-neutral-600">Shipping</span>
					<span class="text-right text-xs text-neutral-500">Calculated at checkout</span>
				</div>

				<div class="mt-4 flex items-center justify-between border-t border-brand-charcoal/10 pt-4">
					<span class="text-base font-bold text-neutral-900">Total</span>
					<span class="text-lg font-extrabold text-neutral-900">
						{formatPrice($cartSubtotal)}
					</span>
				</div>

				<button
					type="button"
					onclick={goToCheckout}
					class="bg-brand-charcoal hover:bg-brand-charcoal-hover mt-6 inline-flex w-full cursor-pointer items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-white transition"
				>
					Proceed To Checkout
				</button>
			</aside>
		</div>
	{/if}
</section>
