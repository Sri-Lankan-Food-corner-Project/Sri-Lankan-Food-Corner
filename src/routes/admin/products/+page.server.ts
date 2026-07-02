import { desc, eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { products, categories } from '$lib/server/db/schema';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	const rows = await db
		.select({
			id: products.id,
			name: products.name,
			slug: products.slug,
			price: products.price,
			unit: products.unit,
			stockQuantity: products.stockQuantity,
			isActive: products.isActive,
			categoryName: categories.name
		})
		.from(products)
		.leftJoin(categories, eq(products.categoryId, categories.id))
		.orderBy(desc(products.createdAt));

	return { products: rows };
};

export const actions: Actions = {
	delete: async ({ request }) => {
		const form = await request.formData();
		const id = String(form.get('id') ?? '');
		if (!id) return fail(400, { error: 'Missing id' });
		await db.delete(products).where(eq(products.id, id));
		return { ok: true };
	}
};
