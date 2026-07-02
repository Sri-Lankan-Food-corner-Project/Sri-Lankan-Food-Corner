<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';

	type Props = {
		open: boolean;
		onOpenChange: (open: boolean) => void;
		title: string;
		description?: string;
		confirmLabel?: string;
		cancelLabel?: string;
		variant?: 'default' | 'destructive';
		action: string;
		hiddenFields?: Record<string, string>;
		onConfirmed?: () => void;
	};

	let {
		open,
		onOpenChange,
		title,
		description,
		confirmLabel = 'Confirm',
		cancelLabel = 'Cancel',
		variant = 'default',
		action,
		hiddenFields = {},
		onConfirmed
	}: Props = $props();

	let submitting = $state(false);
</script>

<Dialog.Root {open} {onOpenChange}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>{title}</Dialog.Title>
			{#if description}
				<Dialog.Description>{description}</Dialog.Description>
			{/if}
		</Dialog.Header>
		<form
			method="POST"
			{action}
			use:enhance={() => {
				submitting = true;
				return async ({ result, update }) => {
					submitting = false;
					if (result.type === 'success' || result.type === 'redirect') {
						onConfirmed?.();
						onOpenChange(false);
					}
					await update();
				};
			}}
		>
			{#each Object.entries(hiddenFields) as [k, v] (k)}
				<input type="hidden" name={k} value={v} />
			{/each}
			<Dialog.Footer>
				<Button
					type="button"
					variant="outline"
					onclick={() => onOpenChange(false)}
					disabled={submitting}
				>
					{cancelLabel}
				</Button>
				<Button type="submit" {variant} disabled={submitting}>
					{submitting ? 'Working…' : confirmLabel}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
