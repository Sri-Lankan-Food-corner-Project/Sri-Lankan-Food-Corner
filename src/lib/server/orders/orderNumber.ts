import { randomBytes } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { orders } from '$lib/server/db/schema';

/**
 * Alphabet with no look-alikes (no I, O, 0, 1, l) — makes numbers safer to
 * read aloud, type from a bank slip, or scribble on paper.
 */
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const LENGTH = 6;

/**
 * Generate a single random candidate. Uses `crypto.randomBytes` (CSPRNG) so the
 * distribution is uniform and unpredictable — better than Math.random for both
 * collision resistance and un-guessability.
 */
function generate(): string {
	const bytes = randomBytes(LENGTH);
	let out = '';
	for (let i = 0; i < LENGTH; i++) {
		out += ALPHABET[bytes[i] % ALPHABET.length];
	}
	return out;
}

/**
 * Produce an order number that is guaranteed unique in the `orders` table.
 *
 * We check-then-insert with a small retry loop. Given 32⁶ ≈ 1 billion possible
 * values, 5 retries is astronomically more than enough at this store's scale.
 * If the very rare all-collide case ever fires, we extend the length rather
 * than throwing at the customer.
 *
 * Small SELECT→INSERT race window remains: two concurrent orders could pick the
 * same candidate. That's caught by the DB's UNIQUE constraint on
 * `order_number`, and the caller can retry `placeOrder` — but at 100/day the
 * probability of the same 1-in-a-billion pick within milliseconds is essentially
 * zero.
 */
export async function generateOrderNumber(): Promise<string> {
	for (let attempt = 0; attempt < 5; attempt++) {
		const candidate = generate();
		const [existing] = await db
			.select({ id: orders.id })
			.from(orders)
			.where(eq(orders.orderNumber, candidate))
			.limit(1);
		if (!existing) return candidate;
	}
	// Fallback — extend to 8 chars if we somehow lost 5 lotteries in a row.
	return generate() + generate().substring(0, 2);
}
