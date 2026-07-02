import { asc, eq, inArray } from 'drizzle-orm';
import { error, fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { db } from '$lib/server/db';
import { products, categories, productImages } from '$lib/server/db/schema';
import { productSchema } from '$lib/schemas/product';
import { uploadProductImage, deleteProductImageByUrl } from '$lib/server/storage/productImages';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const [product] = await db.select().from(products).where(eq(products.id, params.id));
	if (!product) throw error(404, 'Product not found');

	const cats = await db
		.select({ id: categories.id, name: categories.name })
		.from(categories)
		.orderBy(asc(categories.sortOrder), asc(categories.name));

	const images = await db
		.select({ id: productImages.id, imageUrl: productImages.imageUrl })
		.from(productImages)
		.where(eq(productImages.productId, params.id))
		.orderBy(asc(productImages.sortOrder));

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

	return { product, categories: cats, images, form };
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const formData = await request.formData();

		const form = await superValidate(formData, zod(productSchema));
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
		} catch {
			return fail(400, { form: { ...form, message: 'A product with that slug already exists' } });
		}

		// Remove any existing images the admin marked
		const removedIdsRaw = String(formData.get('removedImageIds') ?? '');
		const removedIds = removedIdsRaw.split(',').map((s) => s.trim()).filter(Boolean);
		if (removedIds.length > 0) {
			const rows = await db
				.select({ imageUrl: productImages.imageUrl })
				.from(productImages)
				.where(inArray(productImages.id, removedIds));
			await db.delete(productImages).where(inArray(productImages.id, removedIds));
			await Promise.all(rows.map((r) => deleteProductImageByUrl(r.imageUrl)));
		}

		// Determine next sort order (append after existing images)
		const remaining = await db
			.select({ id: productImages.id })
			.from(productImages)
			.where(eq(productImages.productId, params.id));
		let sortOrder = remaining.length;

		// Upload any new files
		const files = formData
			.getAll('images')
			.filter((f): f is File => f instanceof File && f.size > 0);

		const uploadErrors: string[] = [];
		for (const file of files) {
			try {
				const { imageUrl } = await uploadProductImage(params.id, file);
				await db
					.insert(productImages)
					.values({ productId: params.id, imageUrl, sortOrder: sortOrder++ });
			} catch (e) {
				uploadErrors.push(`${file.name}: ${(e as Error).message ?? String(e)}`);
			}
		}

		if (uploadErrors.length > 0) {
			return fail(500, {
				form: {
					...form,
					message: `Product saved, but ${uploadErrors.length} image(s) failed to upload: ${uploadErrors.join('; ')}`
				}
			});
		}

		throw redirect(303, '/admin/products');
	},

	delete: async ({ params }) => {
		// Grab image URLs so we can wipe them from R2 after DB cascade
		const imgs = await db
			.select({ imageUrl: productImages.imageUrl })
			.from(productImages)
			.where(eq(productImages.productId, params.id));

		await db.delete(products).where(eq(products.id, params.id));

		// Fire-and-forget R2 cleanup — errors here shouldn't block the redirect
		await Promise.all(imgs.map((i) => deleteProductImageByUrl(i.imageUrl)));

		throw redirect(303, '/admin/products');
	}
};
