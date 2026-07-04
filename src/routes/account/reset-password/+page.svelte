<script lang="ts">
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { resetPassword } from '$lib/auth-client';
	import { Lock, Loader2, CircleCheck, KeyRound } from '@lucide/svelte';

	let { data } = $props();

	let newPassword = $state('');
	let confirmPassword = $state('');
	let submitting = $state(false);
	let errorMsg = $state<string | null>(null);
	let done = $state(false);

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		errorMsg = null;

		if (newPassword.length < 8) {
			errorMsg = 'Password must be at least 8 characters.';
			return;
		}
		if (newPassword !== confirmPassword) {
			errorMsg = "Passwords don't match.";
			return;
		}

		submitting = true;
		try {
			const { error } = await resetPassword({
				newPassword,
				token: data.token
			});
			if (error) {
				errorMsg = error.message ?? 'Could not reset the password.';
				return;
			}
			done = true;
			toast.success('Password updated. You can sign in now.');
			// Give the toast a beat, then bounce to home + open sign-in dialog.
			setTimeout(() => goto('/?auth=login'), 1200);
		} catch (err) {
			console.error(err);
			errorMsg = 'Something went wrong. Please request a new reset link.';
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:head>
	<title>Reset password · Sri Lankan Food Corner</title>
</svelte:head>

<section
	class="mx-auto flex min-h-[70vh] w-full max-w-md flex-col items-center justify-center px-4 py-12 sm:px-6"
>
	<div class="w-full rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8">
		{#if done}
			<div class="text-center">
				<div
					class="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-green-100 text-green-700"
				>
					<CircleCheck class="size-8" />
				</div>
				<h1 class="text-xl font-extrabold text-neutral-900 sm:text-2xl">Password updated</h1>
				<p class="mt-2 text-sm text-neutral-600">
					Redirecting you to sign in…
				</p>
			</div>
		{:else}
			<div class="mb-5 flex items-center gap-3">
				<div class="bg-brand-cream text-brand-green flex size-10 items-center justify-center rounded-full">
					<KeyRound class="size-5" />
				</div>
				<div>
					<h1 class="text-lg font-extrabold text-neutral-900 sm:text-xl">Set a new password</h1>
					<p class="text-xs text-neutral-500">Choose something you'll remember.</p>
				</div>
			</div>

			{#if errorMsg}
				<div
					class="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800"
					role="alert"
				>
					{errorMsg}
				</div>
			{/if}

			<form onsubmit={handleSubmit} class="space-y-3">
				<label class="block">
					<span class="mb-1 block text-xs font-semibold text-neutral-700">New password</span>
					<div class="relative">
						<Lock
							class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400"
						/>
						<input
							type="password"
							required
							minlength="8"
							autocomplete="new-password"
							bind:value={newPassword}
							placeholder="At least 8 characters"
							class="focus:border-brand-green focus:ring-brand-green/20 w-full rounded-lg border border-neutral-300 bg-white py-2.5 pr-4 pl-10 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:outline-none"
						/>
					</div>
				</label>

				<label class="block">
					<span class="mb-1 block text-xs font-semibold text-neutral-700">Confirm new password</span>
					<div class="relative">
						<Lock
							class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400"
						/>
						<input
							type="password"
							required
							minlength="8"
							autocomplete="new-password"
							bind:value={confirmPassword}
							class="focus:border-brand-green focus:ring-brand-green/20 w-full rounded-lg border border-neutral-300 bg-white py-2.5 pr-4 pl-10 text-sm text-neutral-900 focus:ring-2 focus:outline-none"
						/>
					</div>
				</label>

				<button
					type="submit"
					disabled={submitting}
					class="bg-brand-charcoal hover:bg-brand-charcoal-hover inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-70"
				>
					{#if submitting}
						<Loader2 class="size-4 animate-spin" />
						Updating…
					{:else}
						Update password
					{/if}
				</button>
			</form>

			<p class="mt-4 text-center text-xs text-neutral-500">
				Trouble? <a href="/?auth=forgot" class="text-brand-green font-semibold underline">Request a new link</a>
			</p>
		{/if}
	</div>
</section>
