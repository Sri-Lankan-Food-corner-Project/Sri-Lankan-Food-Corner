import { asc } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { categories } from '$lib/server/db/schema';

// In-memory TTL cache for the storefront category list. Categories change
// rarely (only via /admin/categories) but the layout reads them on every
// navigation for the header nav + footer. Caching for a minute cuts one DB
// round-trip per nav to near-zero cost.
//
// On Vercel serverless each function instance has its own memory, so the cache
// is per-instance — cold starts miss and query normally. That's fine at this
// scale. If admin edits categories, callers can invalidate manually via
// `invalidateCategoriesCache()`.

export type StoreCategory = { slug: string; name: string };

const CACHE_TTL_MS = 60_000;

let cache: { data: StoreCategory[]; expiresAt: number } | null = null;

export async function getCachedCategories(): Promise<StoreCategory[]> {
	if (cache && Date.now() < cache.expiresAt) {
		return cache.data;
	}
	const rows = await db
		.select({ slug: categories.slug, name: categories.name })
		.from(categories)
		.orderBy(asc(categories.sortOrder), asc(categories.name));
	cache = { data: rows, expiresAt: Date.now() + CACHE_TTL_MS };
	return rows;
}

/** Call after an admin edits, creates, or deletes a category. */
export function invalidateCategoriesCache(): void {
	cache = null;
}
