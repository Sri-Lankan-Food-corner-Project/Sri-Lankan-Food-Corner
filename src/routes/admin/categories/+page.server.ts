import { asc, eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { db } from '$lib/server/db';
import { categories } from '$lib/server/db/schema';
import { categorySchema } from '$lib/schemas/category';
import { slugify } from '$lib/utils/slugify';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	const rows = await db
		.select()
		.from(categories)
		.orderBy(asc(categories.sortOrder), asc(categories.name));

	const createForm = await superValidate(zod(categorySchema));
	const editForm = await superValidate(zod(categorySchema));

	return { categories: rows, createForm, editForm };
};

export const actions: Actions = {
	create: async ({ request }) => {
		const form = await superValidate(request, zod(categorySchema));
		if (!form.valid) return fail(400, { form });

		const slug = slugify(form.data.slug || form.data.name);
		if (!slug) return fail(400, { form: { ...form, message: 'Invalid slug' } });

		try {
			await db.insert(categories).values({
				name: form.data.name,
				slug,
				description: form.data.description ?? null,
				sortOrder: form.data.sortOrder
			});
		} catch (e) {
			return fail(400, { form: { ...form, message: 'A category with that slug already exists' } });
		}
		return { form };
	},

	update: async ({ request }) => {
		const form = await superValidate(request, zod(categorySchema));
		if (!form.valid) return fail(400, { form });
		if (!form.data.id) return fail(400, { form: { ...form, message: 'Missing id' } });

		const slug = slugify(form.data.slug || form.data.name);

		try {
			await db
				.update(categories)
				.set({
					name: form.data.name,
					slug,
					description: form.data.description ?? null,
					sortOrder: form.data.sortOrder
				})
				.where(eq(categories.id, form.data.id));
		} catch (e) {
			return fail(400, { form: { ...form, message: 'A category with that slug already exists' } });
		}
		return { form };
	},

	delete: async ({ request }) => {
		const form = await request.formData();
		const id = String(form.get('id') ?? '');
		if (!id) return fail(400, { error: 'Missing id' });
		await db.delete(categories).where(eq(categories.id, id));
		return { ok: true };
	}
};
