import { asc } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { db } from '$lib/server/db';
import { products, categories, productImages } from '$lib/server/db/schema';
import { productSchema } from '$lib/schemas/product';
import { uploadProductImage } from '$lib/server/storage/productImages';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	const cats = await db
		.select({ id: categories.id, name: categories.name })
		.from(categories)
		.orderBy(asc(categories.sortOrder), asc(categories.name));

	const form = await superValidate(zod(productSchema));
	return { categories: cats, form };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();

		const form = await superValidate(formData, zod(productSchema));
		if (!form.valid) return fail(400, { form });

		const files = formData.getAll('images').filter((f): f is File => f instanceof File && f.size > 0);

		let productId: string;
		try {
			const [inserted] = await db
				.insert(products)
				.values({
					name: form.data.name,
					slug: form.data.slug,
					categoryId: form.data.categoryId ?? null,
					price: form.data.price,
					compareAtPrice: form.data.compareAtPrice ?? null,
					unit: form.data.unit ?? null,
					stockQuantity: form.data.stockQuantity,
					description: form.data.description ?? null,
					isActive: form.data.isActive ?? true
				})
				.returning({ id: products.id });
			productId = inserted.id;
		} catch {
			return fail(400, { form: { ...form, message: 'A product with that slug already exists' } });
		}

		const uploadErrors: string[] = [];
		let sortOrder = 0;
		for (const file of files) {
			try {
				const { imageUrl } = await uploadProductImage(productId, file);
				await db
					.insert(productImages)
					.values({ productId, imageUrl, sortOrder: sortOrder++ });
			} catch (e) {
				uploadErrors.push(`${file.name}: ${(e as Error).message ?? String(e)}`);
			}
		}

		if (uploadErrors.length > 0) {
			return fail(500, {
				form: {
					...form,
					message: `Product created, but ${uploadErrors.length} image(s) failed to upload: ${uploadErrors.join('; ')}`
				}
			});
		}

		throw redirect(303, '/admin/products');
	}
};
