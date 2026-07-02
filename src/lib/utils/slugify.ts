// URL-friendly slug from any string. Keeps ASCII letters/digits, replaces
// everything else with a single dash, trims dashes from ends.
export function slugify(input: string): string {
	return input
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}
