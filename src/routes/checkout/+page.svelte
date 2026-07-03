<script lang="ts">
	import { cart, cartSubtotal } from '$lib/stores/cart';
	import { formatPrice } from '$lib/utils/formatPrice';
	import { site } from '$lib/config/site';
	import { ArrowRight, Building2, CreditCard, ShieldCheck, ShoppingBag, X } from '@lucide/svelte';

	let { data } = $props();

	let shippingMethod = $state<'weight' | 'pickup'>('weight');
	let paymentMethod = $state<'bank' | 'toss'>('bank');
	let billingDifferent = $state(false);
	let submitting = $state(false);

	const shippingFee = $derived(shippingMethod === 'pickup' ? 0 : site.shipping.weightBasedFee);
	const total = $derived($cartSubtotal + shippingFee);

	async function placeOrder(e: SubmitEvent) {
		e.preventDefault();
		if (submitting) return;
		submitting = true;
		// TODO: wire up to /api/checkout — collect form data, send cart + address + payment method
		await new Promise((r) => setTimeout(r, 800));
		submitting = false;
	}
</script>

<section class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
	<nav
		aria-label="Checkout progress"
		class="mb-8 flex flex-wrap items-center justify-center gap-2 text-sm sm:gap-5 sm:text-base"
	>
		<a href="/cart" class="hover:text-brand-green font-medium text-neutral-400 transition-colors">
			Shopping Cart
		</a>
		<ArrowRight class="size-4 text-neutral-400 sm:size-5" />
		<span class="decoration-2 font-bold text-neutral-900 underline underline-offset-4">
			Checkout
		</span>
		<ArrowRight class="size-4 text-neutral-400 sm:size-5" />
		<span class="font-medium text-neutral-400">Order Complete</span>
	</nav>

	{#if $cart.length === 0}
		<div
			class="bg-brand-cream ring-brand-charcoal/10 mx-auto max-w-md rounded-2xl p-10 text-center ring-1"
		>
			<ShoppingBag class="text-brand-charcoal/30 mx-auto size-14" />
			<h2 class="mt-4 text-xl font-bold text-neutral-900">Your cart is empty</h2>
			<p class="mt-2 text-sm text-neutral-500">Add products before checking out.</p>
			<a
				href="/products"
				class="bg-brand-charcoal hover:bg-brand-charcoal-hover mt-6 inline-flex rounded-full px-6 py-2.5 text-sm font-semibold text-white transition"
			>
				Continue Shopping
			</a>
		</div>
	{:else}
		<form onsubmit={placeOrder} class="grid gap-6 lg:grid-cols-[1fr_400px]">
			<div class="space-y-6">
				<!-- Contact -->
				<section
					class="bg-brand-cream ring-brand-charcoal/10 rounded-2xl p-5 ring-1 sm:p-6"
				>
					<h2 class="text-lg font-bold text-neutral-900">Contact</h2>
					<p class="mt-1 text-xs text-neutral-500">
						연락처 · We'll send your order confirmation here
					</p>

					<div class="mt-5 grid gap-4 sm:grid-cols-2">
						<div>
							<label for="email" class="mb-1.5 block text-xs font-medium text-neutral-700">
								이메일 / Email <span class="text-red-500">*</span>
							</label>
							<input
								id="email"
								name="email"
								type="email"
								required
								value={data.userEmail ?? ''}
								placeholder="you@example.com"
								class="focus:ring-brand-green/30 focus:border-brand-green w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:outline-none"
							/>
						</div>
						<div>
							<label for="phone" class="mb-1.5 block text-xs font-medium text-neutral-700">
								휴대폰 번호 / Mobile <span class="text-red-500">*</span>
							</label>
							<input
								id="phone"
								name="phone"
								type="tel"
								required
								placeholder="010-0000-0000"
								class="focus:ring-brand-green/30 focus:border-brand-green w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:outline-none"
							/>
						</div>
					</div>
				</section>

				<!-- Delivery Address -->
				<section
					class="bg-brand-cream ring-brand-charcoal/10 rounded-2xl p-5 ring-1 sm:p-6"
				>
					<div class="flex items-start justify-between gap-3">
						<div>
							<h2 class="text-lg font-bold text-neutral-900">Delivery Address</h2>
							<p class="mt-1 text-xs text-neutral-500">배송지 · South Korea only</p>
						</div>
						<span
							class="bg-brand-sand inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-neutral-700"
						>
							🇰🇷 South Korea
						</span>
					</div>

					<div class="mt-5 grid gap-4 sm:grid-cols-2">
						<div class="sm:col-span-2">
							<label
								for="fullName"
								class="mb-1.5 block text-xs font-medium text-neutral-700"
							>
								전체 이름 / Full Name <span class="text-red-500">*</span>
							</label>
							<input
								id="fullName"
								name="fullName"
								type="text"
								required
								value={data.userName ?? ''}
								placeholder="홍길동 / Hong Gildong"
								class="focus:ring-brand-green/30 focus:border-brand-green w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:outline-none"
							/>
						</div>

						<div class="sm:col-span-2">
							<label
								for="street"
								class="mb-1.5 block text-xs font-medium text-neutral-700"
							>
								도로명 주소 / Street Address <span class="text-red-500">*</span>
							</label>
							<input
								id="street"
								name="street"
								type="text"
								required
								placeholder="예: 서대구로 123"
								class="focus:ring-brand-green/30 focus:border-brand-green w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:outline-none"
							/>
						</div>

						<div>
							<label for="houseNumber" class="mb-1.5 block text-xs font-medium text-neutral-700">
								번지 / House Number
							</label>
							<input
								id="houseNumber"
								name="houseNumber"
								type="text"
								placeholder="123-4"
								class="focus:ring-brand-green/30 focus:border-brand-green w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:outline-none"
							/>
						</div>

						<div>
							<label for="roomNumber" class="mb-1.5 block text-xs font-medium text-neutral-700">
								동·호수 / Room / Unit
							</label>
							<input
								id="roomNumber"
								name="roomNumber"
								type="text"
								placeholder="101동 1203호"
								class="focus:ring-brand-green/30 focus:border-brand-green w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:outline-none"
							/>
						</div>

						<div>
							<label for="city" class="mb-1.5 block text-xs font-medium text-neutral-700">
								시 / 군 / 구 · Town / City <span class="text-red-500">*</span>
							</label>
							<input
								id="city"
								name="city"
								type="text"
								required
								placeholder="서울특별시 강남구"
								class="focus:ring-brand-green/30 focus:border-brand-green w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:outline-none"
							/>
						</div>

						<div>
							<label for="postcode" class="mb-1.5 block text-xs font-medium text-neutral-700">
								우편번호 / Postcode <span class="text-red-500">*</span>
							</label>
							<input
								id="postcode"
								name="postcode"
								type="text"
								required
								inputmode="numeric"
								placeholder="12345"
								class="focus:ring-brand-green/30 focus:border-brand-green w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:outline-none"
							/>
						</div>

						<div class="sm:col-span-2">
							<label for="accessCode" class="mb-1.5 block text-xs font-medium text-neutral-700">
								공동현관 비밀번호 / Building Access Code
								<span class="text-neutral-400">(optional)</span>
							</label>
							<input
								id="accessCode"
								name="accessCode"
								type="text"
								placeholder="#1234"
								class="focus:ring-brand-green/30 focus:border-brand-green w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:outline-none"
							/>
						</div>

						<div class="sm:col-span-2">
							<label for="notes" class="mb-1.5 block text-xs font-medium text-neutral-700">
								배송 요청사항 / Delivery Notes
								<span class="text-neutral-400">(optional)</span>
							</label>
							<textarea
								id="notes"
								name="notes"
								rows="2"
								placeholder="문 앞에 놓아주세요 / Leave at the door"
								class="focus:ring-brand-green/30 focus:border-brand-green w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:outline-none"
							></textarea>
						</div>
					</div>
				</section>

				<!-- Billing Address -->
				<section
					class="bg-brand-cream ring-brand-charcoal/10 rounded-2xl p-5 ring-1 sm:p-6"
				>
					<label class="flex cursor-pointer items-start gap-3">
						<input
							type="checkbox"
							name="billingDifferent"
							bind:checked={billingDifferent}
							class="text-brand-green focus:ring-brand-green mt-0.5 size-4 rounded border-neutral-300"
						/>
						<div class="flex-1">
							<p class="text-sm font-semibold text-neutral-900">
								Ship to a different billing address?
							</p>
							<p class="mt-0.5 text-xs text-neutral-500">
								청구지 주소가 배송지와 다른 경우 · Uncheck to bill to the shipping address
							</p>
						</div>
					</label>

					{#if billingDifferent}
						<div class="border-brand-charcoal/10 mt-5 grid gap-4 border-t pt-5 sm:grid-cols-2">
							<div class="sm:col-span-2">
								<label
									for="billingFullName"
									class="mb-1.5 block text-xs font-medium text-neutral-700"
								>
									전체 이름 / Full Name <span class="text-red-500">*</span>
								</label>
								<input
									id="billingFullName"
									name="billingFullName"
									type="text"
									required
									placeholder="홍길동 / Hong Gildong"
									class="focus:ring-brand-green/30 focus:border-brand-green w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:outline-none"
								/>
							</div>

							<div class="sm:col-span-2">
								<label
									for="billingStreet"
									class="mb-1.5 block text-xs font-medium text-neutral-700"
								>
									도로명 주소 / Street Address <span class="text-red-500">*</span>
								</label>
								<input
									id="billingStreet"
									name="billingStreet"
									type="text"
									required
									placeholder="예: 서대구로 123"
									class="focus:ring-brand-green/30 focus:border-brand-green w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:outline-none"
								/>
							</div>

							<div>
								<label
									for="billingHouseNumber"
									class="mb-1.5 block text-xs font-medium text-neutral-700"
								>
									번지 / House Number
								</label>
								<input
									id="billingHouseNumber"
									name="billingHouseNumber"
									type="text"
									placeholder="123-4"
									class="focus:ring-brand-green/30 focus:border-brand-green w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:outline-none"
								/>
							</div>

							<div>
								<label
									for="billingRoomNumber"
									class="mb-1.5 block text-xs font-medium text-neutral-700"
								>
									동·호수 / Room / Unit
								</label>
								<input
									id="billingRoomNumber"
									name="billingRoomNumber"
									type="text"
									placeholder="101동 1203호"
									class="focus:ring-brand-green/30 focus:border-brand-green w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:outline-none"
								/>
							</div>

							<div>
								<label
									for="billingCity"
									class="mb-1.5 block text-xs font-medium text-neutral-700"
								>
									시 / 군 / 구 · Town / City <span class="text-red-500">*</span>
								</label>
								<input
									id="billingCity"
									name="billingCity"
									type="text"
									required
									placeholder="서울특별시 강남구"
									class="focus:ring-brand-green/30 focus:border-brand-green w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:outline-none"
								/>
							</div>

							<div>
								<label
									for="billingPostcode"
									class="mb-1.5 block text-xs font-medium text-neutral-700"
								>
									우편번호 / Postcode <span class="text-red-500">*</span>
								</label>
								<input
									id="billingPostcode"
									name="billingPostcode"
									type="text"
									required
									inputmode="numeric"
									placeholder="12345"
									class="focus:ring-brand-green/30 focus:border-brand-green w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:outline-none"
								/>
							</div>
						</div>
					{/if}
				</section>

				<!-- Shipping Method -->
				<section
					class="bg-brand-cream ring-brand-charcoal/10 rounded-2xl p-5 ring-1 sm:p-6"
				>
					<h2 class="text-lg font-bold text-neutral-900">Shipping Method</h2>
					<p class="mt-1 text-xs text-neutral-500">배송 방법</p>

					<div class="mt-4 space-y-3">
						<label
							class="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white p-4 transition {shippingMethod ===
							'weight'
								? 'border-brand-green ring-brand-green/20 ring-2'
								: 'hover:border-neutral-300'}"
						>
							<div class="flex items-center gap-3">
								<input
									type="radio"
									name="shippingMethod"
									value="weight"
									bind:group={shippingMethod}
									class="text-brand-green focus:ring-brand-green size-4 border-neutral-300"
								/>
								<div>
									<p class="text-sm font-semibold text-neutral-900">Weight Based Shipping</p>
									<p class="text-xs text-neutral-500">Delivered within 2-3 business days</p>
								</div>
							</div>
							<span class="text-sm font-bold text-neutral-900">
								{formatPrice(site.shipping.weightBasedFee)}
							</span>
						</label>

						<label
							class="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white p-4 transition {shippingMethod ===
							'pickup'
								? 'border-brand-green ring-brand-green/20 ring-2'
								: 'hover:border-neutral-300'}"
						>
							<div class="flex items-center gap-3">
								<input
									type="radio"
									name="shippingMethod"
									value="pickup"
									bind:group={shippingMethod}
									class="text-brand-green focus:ring-brand-green size-4 border-neutral-300"
								/>
								<div>
									<p class="text-sm font-semibold text-neutral-900">Local Pickup</p>
									<p class="text-xs text-neutral-500">Pick up in-store · Dangjin, Chungcheongnam-do</p>
								</div>
							</div>
							<span class="text-sm font-bold text-neutral-900">Free</span>
						</label>
					</div>
				</section>

				<!-- Payment Method -->
				<section
					class="bg-brand-cream ring-brand-charcoal/10 rounded-2xl p-5 ring-1 sm:p-6"
				>
					<h2 class="text-lg font-bold text-neutral-900">Payment Method</h2>
					<p class="mt-1 text-xs text-neutral-500">결제 방법</p>

					<div class="mt-4 space-y-3">
						<div
							class="rounded-xl border bg-white p-4 transition {paymentMethod === 'bank'
								? 'border-brand-green ring-brand-green/20 ring-2'
								: 'border-neutral-200'}"
						>
							<label class="flex cursor-pointer items-center gap-3">
								<input
									type="radio"
									name="paymentMethod"
									value="bank"
									bind:group={paymentMethod}
									class="text-brand-green focus:ring-brand-green size-4 border-neutral-300"
								/>
								<Building2 class="size-5 text-neutral-700" />
								<div class="flex-1">
									<p class="text-sm font-semibold text-neutral-900">Direct Bank Transfer</p>
									<p class="text-xs text-neutral-500">계좌 이체 · No card fee</p>
								</div>
							</label>

							{#if paymentMethod === 'bank'}
								<div class="bg-brand-sand mt-4 space-y-2 rounded-lg p-4 text-xs">
									<p class="leading-relaxed text-neutral-600">
										Make your payment directly into our bank account. Please use your <strong
											class="text-neutral-900">Order ID</strong
										> as the payment reference. Your order will not be shipped until the funds have cleared
										in our account.
									</p>
									<div class="border-brand-charcoal/10 mt-3 grid gap-1.5 border-t pt-3">
										<div class="flex justify-between gap-2">
											<span class="text-neutral-500">Bank</span>
											<span class="font-semibold text-neutral-900">{site.bank.name}</span>
										</div>
										<div class="flex justify-between gap-2">
											<span class="text-neutral-500">Account Holder</span>
											<span class="font-semibold text-neutral-900">{site.bank.accountHolder}</span>
										</div>
										<div class="flex justify-between gap-2">
											<span class="text-neutral-500">Account Number</span>
											<span class="font-semibold text-neutral-900">{site.bank.accountNumber}</span>
										</div>
									</div>
								</div>
							{/if}
						</div>

						<label
							class="flex cursor-pointer items-center gap-3 rounded-xl border bg-white p-4 transition {paymentMethod ===
							'toss'
								? 'border-brand-green ring-brand-green/20 ring-2'
								: 'border-neutral-200 hover:border-neutral-300'}"
						>
							<input
								type="radio"
								name="paymentMethod"
								value="toss"
								bind:group={paymentMethod}
								class="text-brand-green focus:ring-brand-green size-4 border-neutral-300"
							/>
							<CreditCard class="size-5 text-neutral-700" />
							<div class="flex-1">
								<p class="text-sm font-semibold text-neutral-900">
									Card / Toss Payments
								</p>
								<p class="text-xs text-neutral-500">
									신용카드 · KakaoPay · NaverPay · 계좌이체
								</p>
							</div>
						</label>
					</div>
				</section>
			</div>

			<!-- Order Summary Sidebar -->
			<aside class="lg:sticky lg:top-24 lg:self-start">
				<div class="bg-brand-cream ring-brand-charcoal/10 rounded-2xl p-6 ring-1">
					<h2 class="text-lg font-bold text-neutral-900">Your Order</h2>

					<div
						class="border-brand-charcoal/10 mt-5 flex items-center justify-between border-b pb-3 text-xs font-bold text-neutral-900"
					>
						<span>Product</span>
						<span>Subtotal</span>
					</div>

					<ul class="divide-brand-charcoal/10 divide-y">
						{#each $cart as line (line.productId)}
							<li class="flex items-center gap-3 py-3">
								<div
									class="bg-brand-sand ring-brand-charcoal/10 size-11 shrink-0 overflow-hidden rounded-lg ring-1"
								>
									{#if line.imageUrl}
										<img src={line.imageUrl} alt="" class="h-full w-full object-cover" />
									{/if}
								</div>
								<div class="min-w-0 flex-1">
									<p class="truncate text-xs font-medium text-neutral-900">
										{line.name}
									</p>
									<p class="text-xs text-neutral-500">×{line.quantity}</p>
								</div>
								<span class="shrink-0 text-xs font-semibold text-neutral-900">
									{formatPrice(line.unitPrice * line.quantity)}
								</span>
							</li>
						{/each}
					</ul>

					<div
						class="border-brand-charcoal/10 mt-2 flex items-center justify-between border-t pt-4 text-sm"
					>
						<span class="text-neutral-600">Subtotal</span>
						<span class="font-semibold text-neutral-900">{formatPrice($cartSubtotal)}</span>
					</div>

					<div
						class="border-brand-charcoal/10 mt-3 flex items-center justify-between border-t pt-3 text-sm"
					>
						<span class="text-neutral-600">Shipping</span>
						<span class="font-semibold text-neutral-900">
							{shippingFee === 0 ? 'Free' : formatPrice(shippingFee)}
						</span>
					</div>

					<div
						class="border-brand-charcoal/10 mt-3 flex items-center justify-between border-t pt-4"
					>
						<span class="text-base font-bold text-neutral-900">Total</span>
						<span class="text-lg font-extrabold text-neutral-900">{formatPrice(total)}</span>
					</div>

					<button
						type="submit"
						disabled={submitting}
						class="bg-brand-charcoal hover:bg-brand-charcoal-hover mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-70"
					>
						{#if submitting}
							Placing order…
						{:else}
							Place Order · {formatPrice(total)}
						{/if}
					</button>

					<p class="mt-4 flex items-start gap-2 text-[11px] leading-relaxed text-neutral-500">
						<ShieldCheck class="mt-0.5 size-3.5 shrink-0 text-neutral-500" />
						<span>
							Your personal data will be used to process your order, support your experience
							throughout this website, and for other purposes described in our
							<a href="/privacy" class="text-brand-green underline hover:no-underline">
								privacy policy
							</a>.
						</span>
					</p>
				</div>
			</aside>
		</form>
	{/if}
</section>
