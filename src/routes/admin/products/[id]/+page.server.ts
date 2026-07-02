import { asc, eq } from 'drizzle-orm';
import { error, fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { products, categories } from '$lib/server/db/schema';
import { slugify } from '$lib/utils/slugify';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const [product] = await db.select().from(products).where(eq(products.id, params.id));
	if (!product) throw error(404, 'Product not found');

	const cats = await db
		.select({ id: categories.id, name: categories.name })
		.from(categories)
		.orderBy(asc(categories.sortOrder), asc(categories.name));

	return { product, categories: cats };
};

function toInt(v: FormDataEntryValue | null): number {
	const n = Number(v);
	return Number.isFinite(n) ? Math.trunc(n) : 0;
}

export const actions: Actions = {
	update: async ({ request, params }) => {
		const form = await request.formData();
		const name = String(form.get('name') ?? '').trim();
		const slugRaw = String(form.get('slug') ?? '').trim();
		const categoryIdRaw = String(form.get('categoryId') ?? '');
		const price = toInt(form.get('price'));
		const unit = String(form.get('unit') ?? '').trim() || null;
		const stockQuantity = toInt(form.get('stockQuantity'));
		const description = String(form.get('description') ?? '').trim() || null;
		const isActive = form.get('isActive') === 'on';

		if (!name) return fail(400, { error: 'Name is required' });
		const slug = slugRaw ? slugify(slugRaw) : slugify(name);
		if (!slug) return fail(400, { error: 'Slug could not be generated from name' });
		if (price < 0) return fail(400, { error: 'Price must be non-negative' });

		try {
			await db
				.update(products)
				.set({
					name,
					slug,
					categoryId: categoryIdRaw || null,
					price,
					unit,
					stockQuantity,
					description,
					isActive,
					updatedAt: new Date()
				})
				.where(eq(products.id, params.id));
		} catch (e) {
			return fail(400, { error: 'A product with that slug already exists' });
		}

		throw redirect(303, '/admin/products');
	},

	delete: async ({ params }) => {
		await db.delete(products).where(eq(products.id, params.id));
		throw redirect(303, '/admin/products');
	}
};
