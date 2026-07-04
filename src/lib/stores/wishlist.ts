import { writable, derived, type Readable } from 'svelte/store';

/**
 * Client-side mirror of the user's wishlist product IDs.
 *
 * Seeded from the root layout's server load (`wishlistIds`) and kept in sync via
 * optimistic updates when the heart button is toggled. If the server call fails,
 * we revert to the previous state.
 */
function createWishlist() {
	const { subscribe, set, update } = writable<Set<string>>(new Set());

	return {
		subscribe,

		/** Overwrite the whole set — called by the layout when server data changes. */
		hydrate(ids: string[]) {
			set(new Set(ids));
		},

		/** Non-reactive read, used inside async logic to avoid staleness. */
		snapshot(): Set<string> {
			let current: Set<string> = new Set();
			const unsub = subscribe((v) => (current = v));
			unsub();
			return current;
		},

		add(productId: string) {
			update((s) => {
				const next = new Set(s);
				next.add(productId);
				return next;
			});
		},

		remove(productId: string) {
			update((s) => {
				const next = new Set(s);
				next.delete(productId);
				return next;
			});
		}
	};
}

export const wishlist = createWishlist();

export const wishlistCount: Readable<number> = derived(wishlist, ($w) => $w.size);

/**
 * Toggle a product on the wishlist. Optimistically updates the local store, then
 * calls the API. On error, reverts and rethrows so callers can surface a toast.
 *
 * Throws with `{ needsAuth: true }` if the user isn't logged in, so the UI can
 * prompt them to sign in.
 */
export async function toggleWishlist(productId: string): Promise<boolean> {
	const before = wishlist.snapshot();
	const willAdd = !before.has(productId);

	if (willAdd) wishlist.add(productId);
	else wishlist.remove(productId);

	try {
		const res = await fetch('/api/wishlist', {
			method: willAdd ? 'POST' : 'DELETE',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ productId })
		});
		if (!res.ok) {
			// Revert
			if (willAdd) wishlist.remove(productId);
			else wishlist.add(productId);
			if (res.status === 401) throw Object.assign(new Error('Sign in required'), { needsAuth: true });
			throw new Error('Wishlist update failed');
		}
		return willAdd;
	} catch (err) {
		if (willAdd) wishlist.remove(productId);
		else wishlist.add(productId);
		throw err;
	}
}
