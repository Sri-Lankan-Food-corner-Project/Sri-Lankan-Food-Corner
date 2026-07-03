/**
 * Generate a human-readable order number: SLF-YYYYMMDD-XXXXXX
 *
 *   SLF        — Sri Lankan Food Corner prefix
 *   YYYYMMDD   — order date
 *   XXXXXX     — 6 uppercase alphanumeric chars (random, low collision at ~100/day)
 *
 * Uniqueness is enforced at the DB level by `orders.orderNumber.unique()`;
 * this generator just makes collisions vanishingly rare.
 */
export function generateOrderNumber(now: Date = new Date()): string {
	const yyyy = now.getFullYear();
	const mm = String(now.getMonth() + 1).padStart(2, '0');
	const dd = String(now.getDate()).padStart(2, '0');

	const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I,O,0,1 — avoid look-alikes
	let suffix = '';
	for (let i = 0; i < 6; i++) {
		suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
	}

	return `SLF-${yyyy}${mm}${dd}-${suffix}`;
}
