<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import * as Card from '$lib/components/ui/card';
	import { signUp } from '$lib/auth-client';
	import { formatKoreanMobile, isValidKoreanPhoneE164 } from '$lib/utils/validators';

	let name = $state('');
	let email = $state('');
	let phoneDisplay = $state(''); // formatted view, e.g. "10-1234-5678"
	let password = $state('');
	let agreed = $state(false);
	let submitting = $state(false);
	let errorMsg = $state<string | null>(null);

	const phoneE164 = $derived(`+82${phoneDisplay.replace(/\D/g, '')}`);

	function handlePhoneInput(e: Event) {
		phoneDisplay = formatKoreanMobile((e.target as HTMLInputElement).value);
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		errorMsg = null;

		if (!isValidKoreanPhoneE164(phoneE164)) {
			errorMsg = 'Please enter a valid Korean mobile number (e.g. 10-1234-5678).';
			return;
		}
		if (!agreed) {
			errorMsg = 'You must agree to the Terms of Use & Privacy Policy to continue.';
			return;
		}

		submitting = true;
		const { error } = await signUp.email({
			name,
			email,
			password,
			phone: phoneE164,
			callbackURL: '/account'
		});
		submitting = false;

		if (error) {
			errorMsg = error.message ?? 'Sign up failed';
			return;
		}
		await invalidateAll();
		await goto('/account');
	}
</script>

<div class="mx-auto max-w-md px-4 py-12 sm:px-6 lg:px-8">
	<Card.Root>
		<Card.Header>
			<Card.Title>Create your account</Card.Title>
			<Card.Description>Start ordering from Sri Lankan Food Corner.</Card.Description>
		</Card.Header>
		<Card.Content>
			<form class="grid gap-4" onsubmit={handleSubmit}>
				<div class="grid gap-2">
					<Label for="name">Name</Label>
					<Input id="name" bind:value={name} required autocomplete="name" />
				</div>
				<div class="grid gap-2">
					<Label for="email">Email</Label>
					<Input id="email" type="email" bind:value={email} required autocomplete="email" />
				</div>
				<div class="grid gap-2">
					<Label for="phone">Mobile phone</Label>
					<div class="flex">
						<span
							class="border-input bg-muted text-muted-foreground inline-flex items-center rounded-l-md border border-r-0 px-3 text-sm"
						>
							+82
						</span>
						<Input
							id="phone"
							type="tel"
							inputmode="numeric"
							value={phoneDisplay}
							oninput={handlePhoneInput}
							placeholder="10-1234-5678"
							required
							autocomplete="tel-national"
							class="rounded-l-none"
						/>
					</div>
				</div>
				<div class="grid gap-2">
					<Label for="password">Password</Label>
					<Input
						id="password"
						type="password"
						bind:value={password}
						required
						minlength={8}
						autocomplete="new-password"
					/>
					<p class="text-muted-foreground text-xs">At least 8 characters.</p>
				</div>

				<div class="flex items-start gap-2">
					<Checkbox id="terms" bind:checked={agreed} class="mt-0.5" />
					<label for="terms" class="text-muted-foreground text-sm leading-snug select-none">
						By continuing, I agree to the <a
							href="/terms"
							class="text-foreground underline">Terms of Use</a
						>
						&amp;
						<a href="/privacy" class="text-foreground underline">Privacy Policy</a>.
					</label>
				</div>

				{#if errorMsg}
					<p class="text-destructive text-sm">{errorMsg}</p>
				{/if}

				<Button type="submit" disabled={submitting || !agreed}>
					{submitting ? 'Creating account...' : 'Create account'}
				</Button>
			</form>
		</Card.Content>
		<Card.Footer class="justify-center">
			<p class="text-muted-foreground text-sm">
				Already have an account?
				<a href="/account/login" class="text-foreground underline">Log in</a>
			</p>
		</Card.Footer>
	</Card.Root>
</div>
