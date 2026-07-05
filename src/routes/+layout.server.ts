import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { wishlistItems } from '$lib/server/db/schema';
import { getCachedCategories } from '$lib/server/categoriesCache';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const [cats, wishlist] = await Promise.all([
		getCachedCategories(),
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
