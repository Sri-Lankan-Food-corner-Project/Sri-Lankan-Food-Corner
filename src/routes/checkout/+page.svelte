<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto, invalidateAll } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { cart, cartSubtotal } from '$lib/stores/cart';
	import { showConfirm } from '$lib/stores/confirm';
	import { showAuth } from '$lib/stores/authUi';
	import { formatPrice } from '$lib/utils/formatPrice';
	import { site } from '$lib/config/site';
	import type { UserAddress } from '$lib/types/order';
	import {
		ArrowRight,
		Building2,
		CircleCheck,
		CreditCard,
		Pencil,
		Plus,
		ShieldCheck,
		ShoppingBag,
		ShoppingCart,
		Star,
		Trash2
	} from '@lucide/svelte';

	let { data, form } = $props();

	// If the server tells us the session expired between page-load and submit,
	// re-open the auth modal so the customer can log back in without leaving
	// the checkout page (their form state is preserved in the DOM).
	$effect(() => {
		if (!form || !('sessionExpired' in form) || !form.sessionExpired) return;
		(async () => {
			const ok = await showAuth({
				mode: 'login',
				title: 'Please sign in to place your order',
				message: 'Your session expired. Sign back in to continue — your order details are safe.'
			});
			if (ok) {
				// Fresh session — refresh the page so the load function reruns
				// with the new session and any address-book data is up to date.
				await invalidateAll();
			} else {
				await goto('/cart');
			}
		})();
	});

	let shippingMethod = $state<'weight' | 'pickup'>('weight');
	let paymentMethod = $state<'bank' | 'toss'>('bank');
	let billingDifferent = $state(false);
	let submitting = $state(false);

	// Address book state
	// svelte-ignore state_referenced_locally
	let selectedAddressId = $state<string>(
		data.addresses.find((a) => a.isDefault)?.id ?? data.addresses[0]?.id ?? 'new'
	);
	let editingId = $state<string | null>(null);
	let saveNewAddress = $state(false);
	let savingAddress = $state(false);
	let addressError = $state<string | null>(null);

	// Edit form state — populated when the user clicks Edit on a saved address.
	type EditForm = {
		label: string;
		fullName: string;
		phone: string;
		street: string;
		houseNumber: string;
		roomNumber: string;
		accessCode: string;
		city: string;
		postcode: string;
		isDefault: boolean;
	};
	let editForm = $state<EditForm>({
		label: '',
		fullName: '',
		phone: '',
		street: '',
		houseNumber: '',
		roomNumber: '',
		accessCode: '',
		city: '',
		postcode: '',
		isDefault: false
	});

	// Main form fields — bound to shipping inputs
	// svelte-ignore state_referenced_locally
	let email = $state(data.userEmail ?? '');
	let phone = $state('');
	// svelte-ignore state_referenced_locally
	let fullName = $state(data.userName ?? '');
	let street = $state('');
	let houseNumber = $state('');
	let roomNumber = $state('');
	let accessCode = $state('');
	let city = $state('');
	let postcode = $state('');
	let notes = $state('');

	// If the currently-selected address gets deleted server-side, fall back.
	$effect(() => {
		if (selectedAddressId !== 'new' && !data.addresses.find((a) => a.id === selectedAddressId)) {
			selectedAddressId = data.addresses[0]?.id ?? 'new';
		}
	});

	// Sync visible form fields to whichever address is selected.
	$effect(() => {
		if (selectedAddressId === 'new') {
			fullName = data.userName ?? '';
			phone = '';
			street = '';
			houseNumber = '';
			roomNumber = '';
			accessCode = '';
			city = '';
			postcode = '';
			return;
		}
		const a = data.addresses.find((x) => x.id === selectedAddressId);
		if (!a) return;
		fullName = a.fullName;
		phone = a.phone;
		street = a.street;
		houseNumber = a.houseNumber ?? '';
		roomNumber = a.roomNumber ?? '';
		accessCode = a.accessCode ?? '';
		city = a.city;
		postcode = a.postcode;
	});

	function startEdit(a: UserAddress) {
		editForm = {
			label: a.label ?? '',
			fullName: a.fullName,
			phone: a.phone,
			street: a.street,
			houseNumber: a.houseNumber ?? '',
			roomNumber: a.roomNumber ?? '',
			accessCode: a.accessCode ?? '',
			city: a.city,
			postcode: a.postcode,
			isDefault: a.isDefault
		};
		editingId = a.id;
		addressError = null;
	}

	async function saveEdit() {
		if (!editingId || savingAddress) return;
		savingAddress = true;
		addressError = null;
		try {
			const fd = new FormData();
			fd.set('addressId', editingId);
			fd.set('label', editForm.label);
			fd.set('fullName', editForm.fullName);
			fd.set('phone', editForm.phone);
			fd.set('street', editForm.street);
			fd.set('houseNumber', editForm.houseNumber);
			fd.set('roomNumber', editForm.roomNumber);
			fd.set('accessCode', editForm.accessCode);
			fd.set('city', editForm.city);
			fd.set('postcode', editForm.postcode);
			if (editForm.isDefault) fd.set('isDefault', 'on');

			const res = await fetch('?/saveAddress', { method: 'POST', body: fd });
			const raw = await res.json();
			const parsed = raw?.data ? JSON.parse(raw.data) : null;
			if (parsed?.addressError) {
				addressError = parsed.addressError;
				toast.error(parsed.addressError);
				return;
			}
			editingId = null;
			await invalidateAll();
			toast.success('Address updated');
		} catch (err) {
			console.error(err);
			addressError = 'Could not save. Please try again.';
			toast.error('Could not save. Please try again.');
		} finally {
			savingAddress = false;
		}
	}

	async function deleteAddress(id: string) {
		const ok = await showConfirm({
			title: 'Delete this address?',
			description: 'This will remove the address from your address book. This cannot be undone.',
			confirmLabel: 'Delete',
			destructive: true
		});
		if (!ok) return;
		try {
			const fd = new FormData();
			fd.set('addressId', id);
			await fetch('?/deleteAddress', { method: 'POST', body: fd });
			await invalidateAll();
			toast.success('Address deleted');
		} catch (err) {
			console.error(err);
			toast.error('Could not delete. Please try again.');
		}
	}

	const shippingFee = $derived(shippingMethod === 'pickup' ? 0 : site.shipping.weightBasedFee);
	const total = $derived($cartSubtotal + shippingFee);
	const cartPayload = $derived(
		JSON.stringify($cart.map((l) => ({ productId: l.productId, quantity: l.quantity })))
	);
</script>

<section class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
	<nav
		aria-label="Checkout progress"
		class="mb-8 flex flex-wrap items-center justify-center gap-2 text-sm sm:gap-5 sm:text-base"
	>
		<a
			href="/cart"
			class="hover:text-brand-green inline-flex items-center gap-2 font-medium text-neutral-400 transition-colors"
		>
			<ShoppingCart class="size-4 sm:size-5" />
			Shopping Cart
		</a>
		<ArrowRight class="size-4 text-neutral-400 sm:size-5" />
		<span
			class="decoration-2 inline-flex items-center gap-2 font-bold text-neutral-900 underline underline-offset-4"
		>
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
		<form
			method="POST"
			action="?/placeOrder"
			use:enhance={() => {
				submitting = true;
				return async ({ result, update }) => {
					// Redirect first, then let the success page clear the cart.
					// Clearing before update() causes an empty-cart flash on this page.
					await update();
					if (result.type === 'failure') {
						toast.error(String(result.data?.error ?? 'Could not place your order.'));
					}
					submitting = false;
				};
			}}
			class="grid gap-6 lg:grid-cols-[1fr_400px]"
		>
			<input type="hidden" name="cart" value={cartPayload} />

			<div class="space-y-6">
				{#if form?.error}
					<div
						class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
						role="alert"
					>
						{form.error}
					</div>
				{/if}

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
								bind:value={email}
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
								bind:value={phone}
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

					{#if data.addresses.length > 0}
						<div class="mt-5 space-y-3">
							<p class="text-xs font-semibold tracking-wider text-neutral-500 uppercase">
								Saved Addresses
							</p>

							{#if addressError}
								<div
									class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800"
									role="alert"
								>
									{addressError}
								</div>
							{/if}

							{#each data.addresses as a (a.id)}
								<div
									class="rounded-xl border bg-white transition {selectedAddressId === a.id
										? 'border-brand-green ring-brand-green/20 ring-2'
										: 'border-neutral-200 hover:border-neutral-300'}"
								>
									<div class="flex items-start gap-3 p-4">
										<label class="flex flex-1 cursor-pointer items-start gap-3">
											<input
												type="radio"
												name="_addressPicker"
												value={a.id}
												bind:group={selectedAddressId}
												class="text-brand-green focus:ring-brand-green mt-1 size-4 border-neutral-300"
											/>
											<div class="min-w-0 flex-1">
												<div class="flex flex-wrap items-center gap-2">
													<p class="text-sm font-semibold text-neutral-900">
														{a.label ?? a.fullName}
													</p>
													{#if a.isDefault}
														<span
															class="bg-brand-green/10 text-brand-green inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
														>
															<Star class="size-3 fill-current" /> Default
														</span>
													{/if}
												</div>
												<p class="mt-1 text-xs text-neutral-600">{a.fullName} · {a.phone}</p>
												<p class="mt-0.5 text-xs text-neutral-600">
													{a.street}{a.houseNumber ? `, ${a.houseNumber}` : ''}{a.roomNumber
														? `, ${a.roomNumber}`
														: ''}
												</p>
												<p class="text-xs text-neutral-600">{a.city} {a.postcode}</p>
											</div>
										</label>
										<div class="flex shrink-0 gap-1">
											<button
												type="button"
												onclick={() => (editingId === a.id ? (editingId = null) : startEdit(a))}
												class="rounded-lg p-1.5 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
												aria-label="Edit address"
											>
												<Pencil class="size-3.5" />
											</button>
											<button
												type="button"
												onclick={() => deleteAddress(a.id)}
												class="rounded-lg p-1.5 text-neutral-500 transition hover:bg-red-50 hover:text-red-600"
												aria-label="Delete address"
											>
												<Trash2 class="size-3.5" />
											</button>
										</div>
									</div>

									{#if editingId === a.id}
										<div
											class="border-brand-charcoal/10 grid gap-3 border-t bg-neutral-50/50 p-4 sm:grid-cols-2"
										>
											<label class="block sm:col-span-2">
												<span class="mb-1 block text-xs font-medium text-neutral-700">
													Label <span class="text-neutral-400">(optional)</span>
												</span>
												<input
													type="text"
													autocomplete="off"
													bind:value={editForm.label}
													placeholder="Home / Office"
													class="focus:border-brand-green w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
												/>
											</label>
											<input
												type="text"
												required
												autocomplete="off"
												bind:value={editForm.fullName}
												placeholder="Full Name"
												class="focus:border-brand-green rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
											/>
											<input
												type="tel"
												required
												autocomplete="off"
												bind:value={editForm.phone}
												placeholder="Phone"
												class="focus:border-brand-green rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
											/>
											<input
												type="text"
												required
												autocomplete="off"
												bind:value={editForm.street}
												placeholder="Street"
												class="focus:border-brand-green rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none sm:col-span-2"
											/>
											<input
												type="text"
												autocomplete="off"
												bind:value={editForm.houseNumber}
												placeholder="House number"
												class="focus:border-brand-green rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
											/>
											<input
												type="text"
												autocomplete="off"
												bind:value={editForm.roomNumber}
												placeholder="Room / Unit"
												class="focus:border-brand-green rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
											/>
											<input
												type="text"
												required
												autocomplete="off"
												bind:value={editForm.city}
												placeholder="City"
												class="focus:border-brand-green rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
											/>
											<input
												type="text"
												required
												autocomplete="off"
												bind:value={editForm.postcode}
												placeholder="Postcode"
												class="focus:border-brand-green rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
											/>
											<input
												type="text"
												autocomplete="off"
												bind:value={editForm.accessCode}
												placeholder="Access code"
												class="focus:border-brand-green rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none sm:col-span-2"
											/>
											<label class="flex items-center gap-2 text-xs text-neutral-700 sm:col-span-2">
												<input
													type="checkbox"
													bind:checked={editForm.isDefault}
													class="text-brand-green focus:ring-brand-green size-4 rounded border-neutral-300"
												/>
												Set as default address
											</label>
											<div class="flex justify-end gap-2 sm:col-span-2">
												<button
													type="button"
													onclick={() => (editingId = null)}
													class="rounded-full border border-neutral-300 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50"
												>
													Cancel
												</button>
												<button
													type="button"
													onclick={saveEdit}
													disabled={savingAddress}
													class="bg-brand-charcoal hover:bg-brand-charcoal-hover rounded-full px-4 py-2 text-xs font-semibold text-white transition disabled:opacity-70"
												>
													{savingAddress ? 'Saving…' : 'Save Changes'}
												</button>
											</div>
										</div>
									{/if}
								</div>
							{/each}

							<label
								class="flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition {selectedAddressId ===
								'new'
									? 'border-brand-green bg-white ring-brand-green/20 ring-2'
									: 'border-dashed border-neutral-300 hover:border-neutral-400 hover:bg-white'}"
							>
								<input
									type="radio"
									name="_addressPicker"
									value="new"
									bind:group={selectedAddressId}
									class="text-brand-green focus:ring-brand-green size-4 border-neutral-300"
								/>
								<Plus class="text-brand-green size-4" />
								<span class="text-sm font-semibold text-neutral-900">Use a new address</span>
							</label>
						</div>
					{/if}

					{#if selectedAddressId === 'new' || data.addresses.length === 0}
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
									bind:value={fullName}
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
									bind:value={street}
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
									bind:value={houseNumber}
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
									bind:value={roomNumber}
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
									bind:value={city}
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
									bind:value={postcode}
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
									bind:value={accessCode}
									placeholder="#1234"
									class="focus:ring-brand-green/30 focus:border-brand-green w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:outline-none"
								/>
							</div>

							{#if data.userEmail}
								<label
									class="bg-brand-sand ring-brand-charcoal/10 mt-1 flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-medium text-neutral-700 ring-1 sm:col-span-2"
								>
									<input
										type="checkbox"
										name="saveAddress"
										bind:checked={saveNewAddress}
										class="text-brand-green focus:ring-brand-green size-4 rounded border-neutral-300"
									/>
									Save this address to my address book
								</label>
							{/if}
						</div>
					{:else}
						<!-- Saved address selected — pass its values through as hidden inputs -->
						<input type="hidden" name="fullName" value={fullName} />
						<input type="hidden" name="street" value={street} />
						<input type="hidden" name="houseNumber" value={houseNumber} />
						<input type="hidden" name="roomNumber" value={roomNumber} />
						<input type="hidden" name="city" value={city} />
						<input type="hidden" name="postcode" value={postcode} />
						<input type="hidden" name="accessCode" value={accessCode} />
					{/if}

					<div class="mt-5">
						<label for="notes" class="mb-1.5 block text-xs font-medium text-neutral-700">
							배송 요청사항 / Delivery Notes
							<span class="text-neutral-400">(optional)</span>
						</label>
						<textarea
							id="notes"
							name="notes"
							rows="2"
							bind:value={notes}
							placeholder="문 앞에 놓아주세요 / Leave at the door"
							class="focus:ring-brand-green/30 focus:border-brand-green w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:outline-none"
						></textarea>
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

						<!-- Card / Toss will unlock in phase 2 once PG approval clears.
						     Left as a disabled preview so customers see it's coming. -->
						<div
							class="flex cursor-not-allowed items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4 opacity-60"
							aria-disabled="true"
						>
							<input
								type="radio"
								name="paymentMethod"
								value="toss"
								disabled
								class="size-4 border-neutral-300"
							/>
							<CreditCard class="size-5 text-neutral-400" />
							<div class="flex-1">
								<p class="text-sm font-semibold text-neutral-500">
									Card / Toss Payments <span class="ml-1 rounded-full bg-neutral-200 px-2 py-0.5 text-[10px] font-bold tracking-wider text-neutral-600 uppercase">Coming soon</span>
								</p>
								<p class="text-xs text-neutral-400">
									신용카드 · KakaoPay · NaverPay · 계좌이체
								</p>
							</div>
						</div>
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
						class="bg-brand-charcoal cursor-pointer hover:bg-brand-charcoal-hover mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-70"
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
