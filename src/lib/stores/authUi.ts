import { writable } from 'svelte/store';

export type AuthMode = 'login' | 'signup' | 'forgot';

type AuthState = {
	open: boolean;
	mode: AuthMode;
	title?: string;
	message?: string;
	resolve?: (success: boolean) => void;
};

const state = writable<AuthState>({ open: false, mode: 'login' });

export const authState = { subscribe: state.subscribe };

/**
 * Open the auth modal. Returns a Promise resolving to `true` when the user
 * successfully logs in / signs up, or `false` if they dismiss the dialog.
 *
 *   const ok = await showAuth({ mode: 'signup', message: 'Sign in to save this item' });
 *   if (ok) await toggleWishlist(productId);
 */
export function showAuth(opts: {
	mode?: AuthMode;
	title?: string;
	message?: string;
} = {}): Promise<boolean> {
	return new Promise((resolve) => {
		state.set({
			open: true,
			mode: opts.mode ?? 'login',
			title: opts.title,
			message: opts.message,
			resolve
		});
	});
}

export function setAuthMode(mode: AuthMode) {
	state.update((s) => ({ ...s, mode }));
}

/** Called by the dialog when it closes (success or cancel). */
export function resolveAuth(success: boolean) {
	state.update((s) => {
		s.resolve?.(success);
		return { open: false, mode: s.mode };
	});
}
