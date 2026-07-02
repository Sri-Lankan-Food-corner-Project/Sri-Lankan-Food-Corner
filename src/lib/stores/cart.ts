import { writable, derived, type Readable } from 'svelte/store';

export type CartLine = {
	productId: string;
	slug: string;
	name: string;
	unitPrice: number;
	quantity: number;
	imageUrl?: string;
};

function createCart() {
	const { subscribe, update, set } = writable<CartLine[]>([]);

	return {
		subscribe,
		add(line: CartLine) {
			update((lines) => {
				const existing = lines.find((l) => l.productId === line.productId);
				if (existing) {
					existing.quantity += line.quantity;
					return [...lines];
				}
				return [...lines, line];
			});
		},
		setQuantity(productId: string, quantity: number) {
			update((lines) =>
				lines
					.map((l) => (l.productId === productId ? { ...l, quantity } : l))
					.filter((l) => l.quantity > 0)
			);
		},
		remove(productId: string) {
			update((lines) => lines.filter((l) => l.productId !== productId));
		},
		clear() {
			set([]);
		}
	};
}

export const cart = createCart();

export const cartCount: Readable<number> = derived(cart, ($cart) =>
	$cart.reduce((sum, l) => sum + l.quantity, 0)
);

export const cartSubtotal: Readable<number> = derived(cart, ($cart) =>
	$cart.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0)
);
