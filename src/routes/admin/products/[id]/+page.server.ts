import { asc, eq } from 'drizzle-orm';
import { error, fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { db } from '$lib/server/db';
import { products, categories } from '$lib/server/db/schema';
import { productSchema } from '$lib/schemas/product';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const [product] = await db.select().from(products).where(eq(products.id, params.id));
	if (!product) throw error(404, 'Product not found');

	const cats = await db
		.select({ id: categories.id, name: categories.name })
		.from(categories)
		.orderBy(asc(categories.sortOrder), asc(categories.name));

	const form = await superValidate(
		{
			name: product.name,
			slug: product.slug,
			categoryId: product.categoryId,
			price: product.price,
			compareAtPrice: product.compareAtPrice,
			unit: product.unit,
			stockQuantity: product.stockQuantity,
			description: product.description,
			isActive: product.isActive
		},
		zod(productSchema)
	);

	return { product, categories: cats, form };
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const form = await superValidate(request, zod(productSchema));
		if (!form.valid) return fail(400, { form });

		try {
			await db
				.update(products)
				.set({
					name: form.data.name,
					slug: form.data.slug,
					categoryId: form.data.categoryId ?? null,
					price: form.data.price,
					compareAtPrice: form.data.compareAtPrice ?? null,
					unit: form.data.unit ?? null,
					stockQuantity: form.data.stockQuantity,
					description: form.data.description ?? null,
					isActive: form.data.isActive ?? true,
					updatedAt: new Date()
				})
				.where(eq(products.id, params.id));
		} catch (e) {
			return fail(400, { form: { ...form, message: 'A product with that slug already exists' } });
		}

		throw redirect(303, '/admin/products');
	},

	delete: async ({ params }) => {
		await db.delete(products).where(eq(products.id, params.id));
		throw redirect(303, '/admin/products');
	}
};
