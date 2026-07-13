/**
 * Format an order/account timestamp for display (e.g. "13/07/2026").
 * Some `createdAt` columns are nullable in the Drizzle types (defaultNow()
 * without notNull()), so this guards against null instead of letting
 * `new Date(null)` silently render 01/01/1970.
 */
export function formatDate(d: Date | string | null | undefined): string {
	if (!d) return '—';
	const date = typeof d === 'string' ? new Date(d) : d;
	return date.toLocaleDateString('en-GB');
}
