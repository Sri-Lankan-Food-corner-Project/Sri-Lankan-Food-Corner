import { writable } from 'svelte/store';

export type ConfirmOptions = {
	title?: string;
	description?: string;
	confirmLabel?: string;
	cancelLabel?: string;
	destructive?: boolean;
};

type ConfirmState = ConfirmOptions & {
	open: boolean;
	resolve: (value: boolean) => void;
};

const state = writable<ConfirmState | null>(null);

export const confirmState = { subscribe: state.subscribe };

/**
 * Show a branded confirm dialog. Returns a Promise resolving to true (confirmed)
 * or false (cancelled / closed).
 *
 *   const ok = await showConfirm({ title: 'Delete this address?', destructive: true });
 *   if (!ok) return;
 */
export function showConfirm(options: ConfirmOptions = {}): Promise<boolean> {
	return new Promise((resolve) => {
		state.set({
			title: options.title ?? 'Are you sure?',
			description: options.description,
			confirmLabel: options.confirmLabel ?? 'Confirm',
			cancelLabel: options.cancelLabel ?? 'Cancel',
			destructive: options.destructive ?? false,
			open: true,
			resolve
		});
	});
}

/** Called by ConfirmDialog when the user confirms or dismisses. */
export function resolveConfirm(value: boolean) {
	state.update((s) => {
		if (s) {
			s.resolve(value);
		}
		return null;
	});
}
