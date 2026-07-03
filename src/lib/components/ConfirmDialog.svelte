<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { confirmState, resolveConfirm } from '$lib/stores/confirm';
	import { AlertTriangle } from '@lucide/svelte';

	function onOpenChange(open: boolean) {
		if (!open) resolveConfirm(false);
	}
</script>

<Dialog.Root open={$confirmState?.open ?? false} {onOpenChange}>
	<Dialog.Content class="bg-white! sm:max-w-md!" showCloseButton={false}>
		<div class="flex gap-4">
			{#if $confirmState?.destructive}
				<div
					class="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600"
				>
					<AlertTriangle class="size-5" />
				</div>
			{/if}
			<div class="flex-1">
				<Dialog.Header class="text-left">
					<Dialog.Title class="text-base font-bold text-neutral-900">
						{$confirmState?.title ?? ''}
					</Dialog.Title>
					{#if $confirmState?.description}
						<Dialog.Description class="text-sm text-neutral-600">
							{$confirmState.description}
						</Dialog.Description>
					{/if}
				</Dialog.Header>
			</div>
		</div>

		<Dialog.Footer class="mt-4 flex-row justify-end gap-2 sm:justify-end">
			<button
				type="button"
				onclick={() => resolveConfirm(false)}
				class="rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
			>
				{$confirmState?.cancelLabel ?? 'Cancel'}
			</button>
			<button
				type="button"
				onclick={() => resolveConfirm(true)}
				class="rounded-full px-4 py-2 text-sm font-semibold text-white transition {$confirmState?.destructive
					? 'bg-red-600 hover:bg-red-700'
					: 'bg-brand-charcoal hover:bg-brand-charcoal-hover'}"
			>
				{$confirmState?.confirmLabel ?? 'Confirm'}
			</button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
