export const SORT_OPTIONS = [
	{ value: 'newest', label: 'Newest' },
	{ value: 'price-asc', label: 'Price: low to high' },
	{ value: 'price-desc', label: 'Price: high to low' },
	{ value: 'discount', label: 'Biggest discount' }
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]['value'];

export const PAGE_SIZE = 24;

export type ListingFilters = {
	q: string;
	category: string;
	min: number | null;
	max: number | null;
	sort: SortValue;
	instock: boolean;
	page: number;
};

function parseIntOrNull(value: string | null): number | null {
	if (!value) return null;
	const n = parseInt(value, 10);
	return Number.isFinite(n) && n >= 0 ? n : null;
}

function isSortValue(v: string | null): v is SortValue {
	return SORT_OPTIONS.some((o) => o.value === v);
}

export function parseListingFilters(url: URL): ListingFilters {
	const p = url.searchParams;
	const rawSort = p.get('sort');
	const rawPage = parseInt(p.get('page') ?? '1', 10);
	return {
		q: (p.get('q') ?? '').trim(),
		category: (p.get('category') ?? '').trim(),
		min: parseIntOrNull(p.get('min')),
		max: parseIntOrNull(p.get('max')),
		sort: isSortValue(rawSort) ? rawSort : 'newest',
		instock: p.get('instock') === '1',
		page: Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1
	};
}

export function buildFilterHref(
	currentUrl: URL,
	mutate: (params: URLSearchParams) => void
): string {
	const url = new URL(currentUrl);
	mutate(url.searchParams);
	return url.pathname + (url.search ? url.search : '');
}
