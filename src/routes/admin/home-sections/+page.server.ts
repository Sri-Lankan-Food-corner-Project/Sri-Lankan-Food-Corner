import { and, asc, eq, inArray } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { db } from '$lib/server/db';
import {
	categories,
	homeSectionProducts,
	homeSections,
	productImages,
	products
} from '$lib/server/db/schema';
import { homeSectionSchema } from '$lib/schemas/homeSection';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	const [sections, cats, allProducts] = await Promise.all([
		db
			.select({
				id: homeSections.id,
				title: homeSections.title,
				subtitle: homeSections.subtitle,
				type: homeSections.type,
				categoryId: homeSections.categoryId,
				categoryName: categories.name,
				limit: homeSections.limit,
				sortOrder: homeSections.sortOrder,
				isActive: homeSections.isActive
			})
			.from(homeSections)
			.leftJoin(categories, eq(homeSections.categoryId, categories.id))
			.orderBy(asc(homeSections.sortOrder), asc(homeSections.createdAt)),
		db
			.select({ id: categories.id, name: categories.name })
			.from(categories)
			.orderBy(asc(categories.sortOrder), asc(categories.name)),
		db
			.select({
				id: products.id,
				name: products.name,
				slug: products.slug,
				price: products.price,
				isActive: products.isActive
			})
			.from(products)
			.where(eq(products.isActive, true))
			.orderBy(asc(products.name))
	]);

	const productIds = allProducts.map((p) => p.id);
	const productImgs = productIds.length
		? await db
				.select({ productId: productImages.productId, imageUrl: productImages.imageUrl })
				.from(productImages)
				.where(inArray(productImages.productId, productIds))
				.orderBy(asc(productImages.sortOrder))
		: [];
	const imgByProduct = new Map<string, string>();
	for (const img of productImgs) {
		if (img.productId && !imgByProduct.has(img.productId)) {
			imgByProduct.set(img.productId, img.imageUrl);
		}
	}
	const productsWithImage = allProducts.map((p) => ({
		...p,
		imageUrl: imgByProduct.get(p.id) ?? null
	}));

	const picks = await db
		.select({
			sectionId: homeSectionProducts.sectionId,
			productId: homeSectionProducts.productId,
			sortOrder: homeSectionProducts.sortOrder,
			productName: products.name
		})
		.from(homeSectionProducts)
		.innerJoin(products, eq(homeSectionProducts.productId, products.id))
		.orderBy(asc(homeSectionProducts.sortOrder));

	const picksBySection = new Map<
		string,
		{ productId: string; productName: string; sortOrder: number }[]
	>();
	for (const p of picks) {
		const list = picksBySection.get(p.sectionId) ?? [];
		list.push({ productId: p.productId, productName: p.productName, sortOrder: p.sortOrder });
		picksBySection.set(p.sectionId, list);
	}

	const sectionsWithPicks = sections.map((s) => ({
		...s,
		picks: picksBySection.get(s.id) ?? []
	}));

	const createForm = await superValidate(zod(homeSectionSchema));
	const editForm = await superValidate(zod(homeSectionSchema));

	return {
		sections: sectionsWithPicks,
		categories: cats,
		products: productsWithImage,
		createForm,
		editForm
	};
};

export const actions: Actions = {
	create: async ({ request }) => {
		const form = await superValidate(request, zod(homeSectionSchema));
		if (!form.valid) return fail(400, { form });

		await db.insert(homeSections).values({
			title: form.data.title,
			subtitle: form.data.subtitle ?? null,
			type: form.data.type,
			categoryId: form.data.type === 'category' ? (form.data.categoryId ?? null) : null,
			limit: form.data.limit,
			sortOrder: form.data.sortOrder,
			isActive: form.data.isActive
		});
		return { form };
	},

	update: async ({ request }) => {
		const form = await superValidate(request, zod(homeSectionSchema));
		if (!form.valid) return fail(400, { form });
		if (!form.data.id) return fail(400, { form: { ...form, message: 'Missing id' } });

		await db
			.update(homeSections)
			.set({
				title: form.data.title,
				subtitle: form.data.subtitle ?? null,
				type: form.data.type,
				categoryId: form.data.type === 'category' ? (form.data.categoryId ?? null) : null,
				limit: form.data.limit,
				sortOrder: form.data.sortOrder,
				isActive: form.data.isActive,
				updatedAt: new Date()
			})
			.where(eq(homeSections.id, form.data.id));
		return { form };
	},

	delete: async ({ request }) => {
		const form = await request.formData();
		const id = String(form.get('id') ?? '');
		if (!id) return fail(400, { error: 'Missing id' });
		await db.delete(homeSections).where(eq(homeSections.id, id));
		return { ok: true };
	},

	move: async ({ request }) => {
		const form = await request.formData();
		const id = String(form.get('id') ?? '');
		const direction = String(form.get('direction') ?? '');
		if (!id || (direction !== 'up' && direction !== 'down')) {
			return fail(400, { error: 'Bad request' });
		}
		const all = await db
			.select({ id: homeSections.id, sortOrder: homeSections.sortOrder })
			.from(homeSections)
			.orderBy(asc(homeSections.sortOrder));
		const idx = all.findIndex((r) => r.id === id);
		if (idx === -1) return fail(404, { error: 'Not found' });
		const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
		if (swapIdx < 0 || swapIdx >= all.length) return { ok: true };
		const me = all[idx];
		const other = all[swapIdx];

		await db
			.update(homeSections)
			.set({ sortOrder: other.sortOrder, updatedAt: new Date() })
			.where(eq(homeSections.id, me.id));
		await db
			.update(homeSections)
			.set({ sortOrder: me.sortOrder, updatedAt: new Date() })
			.where(eq(homeSections.id, other.id));
		return { ok: true };
	},

	addProduct: async ({ request }) => {
		const form = await request.formData();
		const sectionId = String(form.get('sectionId') ?? '');
		const productId = String(form.get('productId') ?? '');
		if (!sectionId || !productId) return fail(400, { error: 'Missing ids' });

		const existing = await db
			.select({ maxSort: homeSectionProducts.sortOrder })
			.from(homeSectionProducts)
			.where(eq(homeSectionProducts.sectionId, sectionId))
			.orderBy(asc(homeSectionProducts.sortOrder));
		const nextSort =
			existing.length === 0 ? 0 : Math.max(...existing.map((e) => e.maxSort)) + 1;

		try {
			await db.insert(homeSectionProducts).values({
				sectionId,
				productId,
				sortOrder: nextSort
			});
		} catch {
			return fail(400, { error: 'Product already in this section' });
		}
		return { ok: true };
	},

	removeProduct: async ({ request }) => {
		const form = await request.formData();
		const sectionId = String(form.get('sectionId') ?? '');
		const productId = String(form.get('productId') ?? '');
		if (!sectionId || !productId) return fail(400, { error: 'Missing ids' });
		await db
			.delete(homeSectionProducts)
			.where(
				and(
					eq(homeSectionProducts.sectionId, sectionId),
					eq(homeSectionProducts.productId, productId)
				)
			);
		return { ok: true };
	}
};
