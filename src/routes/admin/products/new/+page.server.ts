import { asc } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { products, categories } from '$lib/server/db/schema';
import { slugify } from '$lib/utils/slugify';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	const cats = await db
		.select({ id: categories.id, name: categories.name })
		.from(categories)
		.orderBy(asc(categories.sortOrder), asc(categories.name));
	return { categories: cats };
};

function toInt(v: FormDataEntryValue | null): number {
	const n = Number(v);
	return Number.isFinite(n) ? Math.trunc(n) : 0;
}

export const actions: Actions = {
	default: async ({ request }) => {
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
			await db.insert(products).values({
				name,
				slug,
				categoryId: categoryIdRaw || null,
				price,
				unit,
				stockQuantity,
				description,
				isActive
			});
		} catch (e) {
			return fail(400, { error: 'A product with that slug already exists' });
		}

		throw redirect(303, '/admin/products');
	}
};
