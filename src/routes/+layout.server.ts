import { asc } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { categories } from '$lib/server/db/schema';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const cats = await db
		.select({ slug: categories.slug, name: categories.name })
		.from(categories)
		.orderBy(asc(categories.sortOrder), asc(categories.name));

	return {
		user: locals.user,
		categories: cats
	};
};
