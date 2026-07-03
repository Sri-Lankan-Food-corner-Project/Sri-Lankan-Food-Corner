<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import { invalidateAll } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { signIn, signUp } from '$lib/auth-client';
	import { authState, resolveAuth, setAuthMode } from '$lib/stores/authUi';
	import { formatKoreanMobile, isValidKoreanPhoneE164 } from '$lib/utils/validators';
	import { Loader2, Lock, Mail, Phone, User as UserIcon, X } from '@lucide/svelte';

	let loginEmail = $state('');
	let loginPassword = $state('');
	let signupName = $state('');
	let signupEmail = $state('');
	let signupPhoneDisplay = $state('');
	let signupPassword = $state('');
	let signupAgreed = $state(false);
	const signupPhoneE164 = $derived(`+82${signupPhoneDisplay.replace(/\D/g, '')}`);

	let submitting = $state(false);
	let errorMsg = $state<string | null>(null);

	function handlePhoneInput(e: Event) {
		signupPhoneDisplay = formatKoreanMobile((e.target as HTMLInputElement).value);
	}

	function onOpenChange(open: boolean) {
		if (!open) resolveAuth(false);
	}

	function switchTo(mode: 'login' | 'signup') {
		errorMsg = null;
		setAuthMode(mode);
	}

	async function handleLogin(e: SubmitEvent) {
		e.preventDefault();
		submitting = true;
		errorMsg = null;
		try {
			const { error } = await signIn.email({ email: loginEmail, password: loginPassword });
			if (error) {
				errorMsg = error.message ?? 'Login failed';
				return;
			}
			await invalidateAll();
			toast.success('Welcome back!');
			resolveAuth(true);
		} catch (err) {
			console.error(err);
			errorMsg = 'Login failed. Please try again.';
		} finally {
			submitting = false;
		}
	}

	async function handleSignup(e: SubmitEvent) {
		e.preventDefault();
		errorMsg = null;

		if (!isValidKoreanPhoneE164(signupPhoneE164)) {
			errorMsg = 'Please enter a valid Korean mobile number (e.g. 10-1234-5678).';
			return;
		}
		if (!signupAgreed) {
			errorMsg = 'Please agree to the Terms & Privacy Policy.';
			return;
		}

		submitting = true;
		try {
			const { error } = await signUp.email({
				name: signupName,
				email: signupEmail,
				password: signupPassword,
				phone: signupPhoneE164
			});
			if (error) {
				errorMsg = error.message ?? 'Sign up failed';
				return;
			}
			await invalidateAll();
			toast.success('Welcome to Sri Lankan Food Corner!');
			resolveAuth(true);
		} catch (err) {
			console.error(err);
			errorMsg = 'Sign up failed. Please try again.';
		} finally {
			submitting = false;
		}
	}
</script>

<DialogPrimitive.Root open={$authState.open} {onOpenChange}>
	<DialogPrimitive.Portal>
		<DialogPrimitive.Overlay
			class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0"
		/>
		<DialogPrimitive.Content
			class="fixed z-50 flex w-full max-h-[95dvh] flex-col overflow-hidden bg-white shadow-2xl
				bottom-0 left-1/2 -translate-x-1/2 rounded-t-3xl
				data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom-4 data-[state=closed]:fade-out-0
				data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom-4 data-[state=open]:fade-in-0
				sm:bottom-auto sm:top-1/2 sm:max-w-md sm:-translate-y-1/2 sm:rounded-2xl
				sm:data-[state=closed]:slide-out-to-bottom-0 sm:data-[state=closed]:zoom-out-95
				sm:data-[state=open]:slide-in-from-bottom-0 sm:data-[state=open]:zoom-in-95"
		>
			<DialogPrimitive.Title class="sr-only">
				{$authState.mode === 'login' ? 'Sign in' : 'Create account'}
			</DialogPrimitive.Title>
			<DialogPrimitive.Description class="sr-only">
				{$authState.message ?? 'Sign in or create an account to continue.'}
			</DialogPrimitive.Description>

			<div class="bg-brand-green relative px-6 py-6 text-white">
				<button
					type="button"
					onclick={() => resolveAuth(false)}
					aria-label="Close"
					class="absolute top-4 right-4 inline-flex size-8 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
				>
					<X class="size-4" />
				</button>
				<h2 class="text-xl font-extrabold sm:text-2xl">
					{$authState.title ?? ($authState.mode === 'login' ? 'Welcome back' : 'Create account')}
				</h2>
				<p class="mt-1 text-xs text-white/80 sm:text-sm">
					{$authState.message ??
						($authState.mode === 'login'
							? 'Sign in to your Sri Lankan Food Corner account.'
							: 'Get faster checkout, saved addresses and wishlist.')}
				</p>
			</div>

			<div class="overflow-y-auto p-5 sm:p-6">
				<div class="bg-brand-cream ring-brand-charcoal/10 flex gap-1 rounded-full p-1 ring-1">
					<button
						type="button"
						onclick={() => switchTo('login')}
						class="flex-1 rounded-full px-4 py-1.5 text-xs font-semibold transition sm:text-sm {$authState.mode ===
						'login'
							? 'bg-brand-charcoal text-white shadow-sm'
							: 'text-neutral-700 hover:text-neutral-900'}"
					>
						Sign in
					</button>
					<button
						type="button"
						onclick={() => switchTo('signup')}
						class="flex-1 rounded-full px-4 py-1.5 text-xs font-semibold transition sm:text-sm {$authState.mode ===
						'signup'
							? 'bg-brand-charcoal text-white shadow-sm'
							: 'text-neutral-700 hover:text-neutral-900'}"
					>
						Register
					</button>
				</div>

				{#if errorMsg}
					<div
						class="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800"
						role="alert"
					>
						{errorMsg}
					</div>
				{/if}

				{#if $authState.mode === 'login'}
					<form onsubmit={handleLogin} class="mt-4 space-y-3">
						<label class="block">
							<span class="mb-1 block text-xs font-semibold text-neutral-700">Email</span>
							<div class="relative">
								<Mail
									class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400"
								/>
								<input
									type="email"
									required
									autocomplete="email"
									bind:value={loginEmail}
									placeholder="you@example.com"
									class="focus:border-brand-green focus:ring-brand-green/20 w-full rounded-lg border border-neutral-300 bg-white py-2.5 pr-4 pl-10 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:outline-none"
								/>
							</div>
						</label>
						<label class="block">
							<span class="mb-1 block text-xs font-semibold text-neutral-700">Password</span>
							<div class="relative">
								<Lock
									class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400"
								/>
								<input
									type="password"
									required
									autocomplete="current-password"
									bind:value={loginPassword}
									class="focus:border-brand-green focus:ring-brand-green/20 w-full rounded-lg border border-neutral-300 bg-white py-2.5 pr-4 pl-10 text-sm text-neutral-900 focus:ring-2 focus:outline-none"
								/>
							</div>
						</label>
						<button
							type="submit"
							disabled={submitting}
							class="bg-brand-charcoal hover:bg-brand-charcoal-hover inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white transition disabled:opacity-70"
						>
							{#if submitting}
								<Loader2 class="size-4 animate-spin" />
								Signing in…
							{:else}
								Sign in
							{/if}
						</button>
						<p class="text-center text-xs text-neutral-600">
							New here?
							<button
								type="button"
								onclick={() => switchTo('signup')}
								class="text-brand-green font-semibold underline hover:no-underline"
							>
								Create an account
							</button>
						</p>
					</form>
				{:else}
					<form onsubmit={handleSignup} class="mt-4 space-y-3">
						<label class="block">
							<span class="mb-1 block text-xs font-semibold text-neutral-700">Full name</span>
							<div class="relative">
								<UserIcon
									class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400"
								/>
								<input
									type="text"
									required
									autocomplete="name"
									bind:value={signupName}
									placeholder="Hong Gildong"
									class="focus:border-brand-green focus:ring-brand-green/20 w-full rounded-lg border border-neutral-300 bg-white py-2.5 pr-4 pl-10 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:outline-none"
								/>
							</div>
						</label>
						<label class="block">
							<span class="mb-1 block text-xs font-semibold text-neutral-700">Email</span>
							<div class="relative">
								<Mail
									class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400"
								/>
								<input
									type="email"
									required
									autocomplete="email"
									bind:value={signupEmail}
									placeholder="you@example.com"
									class="focus:border-brand-green focus:ring-brand-green/20 w-full rounded-lg border border-neutral-300 bg-white py-2.5 pr-4 pl-10 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:outline-none"
								/>
							</div>
						</label>
						<label class="block">
							<span class="mb-1 block text-xs font-semibold text-neutral-700">Mobile number</span>
							<div class="flex">
								<span
									class="inline-flex items-center gap-1 rounded-l-lg border border-r-0 border-neutral-300 bg-neutral-100 px-3 text-xs text-neutral-600"
								>
									<Phone class="size-3.5" /> +82
								</span>
								<input
									type="tel"
									inputmode="numeric"
									required
									autocomplete="tel-national"
									value={signupPhoneDisplay}
									oninput={handlePhoneInput}
									placeholder="10-1234-5678"
									class="focus:border-brand-green focus:ring-brand-green/20 w-full rounded-r-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:outline-none"
								/>
							</div>
						</label>
						<label class="block">
							<span class="mb-1 block text-xs font-semibold text-neutral-700">Password</span>
							<div class="relative">
								<Lock
									class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400"
								/>
								<input
									type="password"
									required
									minlength={8}
									autocomplete="new-password"
									bind:value={signupPassword}
									placeholder="At least 8 characters"
									class="focus:border-brand-green focus:ring-brand-green/20 w-full rounded-lg border border-neutral-300 bg-white py-2.5 pr-4 pl-10 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:outline-none"
								/>
							</div>
						</label>

						<label class="flex items-start gap-2 text-[11px] leading-snug text-neutral-600">
							<input
								type="checkbox"
								bind:checked={signupAgreed}
								class="text-brand-green focus:ring-brand-green mt-0.5 size-4 rounded border-neutral-300"
							/>
							<span>
								I agree to the
								<a href="/terms" class="text-brand-green underline">Terms</a>
								and
								<a href="/privacy" class="text-brand-green underline">Privacy Policy</a>.
							</span>
						</label>

						<button
							type="submit"
							disabled={submitting || !signupAgreed}
							class="bg-brand-charcoal hover:bg-brand-charcoal-hover inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white transition disabled:opacity-70"
						>
							{#if submitting}
								<Loader2 class="size-4 animate-spin" />
								Creating account…
							{:else}
								Create account
							{/if}
						</button>
						<p class="text-center text-xs text-neutral-600">
							Already have an account?
							<button
								type="button"
								onclick={() => switchTo('login')}
								class="text-brand-green font-semibold underline hover:no-underline"
							>
								Sign in
							</button>
						</p>
					</form>
				{/if}
			</div>
		</DialogPrimitive.Content>
	</DialogPrimitive.Portal>
</DialogPrimitive.Root>
