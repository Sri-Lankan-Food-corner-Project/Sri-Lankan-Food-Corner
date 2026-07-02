<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Card from '$lib/components/ui/card';
	import { signIn } from '$lib/auth-client';

	let email = $state('');
	let password = $state('');
	let submitting = $state(false);
	let errorMsg = $state<string | null>(null);

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		submitting = true;
		errorMsg = null;
		const { error } = await signIn.email({ email, password, callbackURL: '/account' });
		submitting = false;
		if (error) {
			errorMsg = error.message ?? 'Login failed';
			return;
		}
		await invalidateAll();
		await goto('/account');
	}
</script>

<div class="mx-auto max-w-md px-4 py-12">
	<Card.Root>
		<Card.Header>
			<Card.Title>Log in</Card.Title>
			<Card.Description>Welcome back to Sri Lankan Food Corner.</Card.Description>
		</Card.Header>
		<Card.Content>
			<form class="grid gap-4" onsubmit={handleSubmit}>
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
						autocomplete="current-password"
					/>
				</div>
				{#if errorMsg}
					<p class="text-destructive text-sm">{errorMsg}</p>
				{/if}
				<Button type="submit" disabled={submitting}>
					{submitting ? 'Signing in...' : 'Sign in'}
				</Button>
			</form>
		</Card.Content>
		<Card.Footer class="justify-center">
			<p class="text-muted-foreground text-sm">
				No account?
				<a href="/account/signup" class="text-foreground underline">Sign up</a>
			</p>
		</Card.Footer>
	</Card.Root>
</div>
