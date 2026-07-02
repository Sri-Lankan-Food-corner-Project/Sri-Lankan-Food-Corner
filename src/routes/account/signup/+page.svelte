<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Card from '$lib/components/ui/card';
	import { signUp } from '$lib/auth-client';

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let submitting = $state(false);
	let errorMsg = $state<string | null>(null);

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		submitting = true;
		errorMsg = null;
		const { error } = await signUp.email({ name, email, password, callbackURL: '/account' });
		submitting = false;
		if (error) {
			errorMsg = error.message ?? 'Sign up failed';
			return;
		}
		await goto('/account');
	}
</script>

<div class="mx-auto max-w-md px-4 py-12">
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
				{#if errorMsg}
					<p class="text-destructive text-sm">{errorMsg}</p>
				{/if}
				<Button type="submit" disabled={submitting}>
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
