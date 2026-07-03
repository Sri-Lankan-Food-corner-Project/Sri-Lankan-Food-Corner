import { asc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { categories, wishlistItems } from '$lib/server/db/schema';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const [cats, wishlist] = await Promise.all([
		db
			.select({ slug: categories.slug, name: categories.name })
			.from(categories)
			.orderBy(asc(categories.sortOrder), asc(categories.name)),
		locals.user?.id
			? db
					.select({ productId: wishlistItems.productId })
					.from(wishlistItems)
					.where(eq(wishlistItems.userId, locals.user.id))
			: Promise.resolve([] as { productId: string }[])
	]);

	return {
		user: locals.user,
		categories: cats,
		wishlistIds: wishlist.map((w) => w.productId)
	};
};
