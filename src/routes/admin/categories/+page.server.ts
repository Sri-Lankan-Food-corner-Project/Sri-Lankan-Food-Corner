import { fail } from '@sveltejs/kit';
import { asc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { categories } from '$lib/server/db/schema';
import { slugify } from '$lib/utils/slugify';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	const rows = await db
		.select()
		.from(categories)
		.orderBy(asc(categories.sortOrder), asc(categories.name));
	return { categories: rows };
};

function parseSortOrder(value: FormDataEntryValue | null): number {
	const n = Number(value);
	return Number.isFinite(n) ? n : 0;
}

export const actions: Actions = {
	create: async ({ request }) => {
		const form = await request.formData();
		const name = String(form.get('name') ?? '').trim();
		const slugInput = String(form.get('slug') ?? '').trim();
		const description = String(form.get('description') ?? '').trim() || null;
		const sortOrder = parseSortOrder(form.get('sortOrder'));

		if (!name) return fail(400, { error: 'Name is required' });
		const slug = slugInput ? slugify(slugInput) : slugify(name);
		if (!slug) return fail(400, { error: 'Slug could not be generated from name' });

		try {
			await db.insert(categories).values({ name, slug, description, sortOrder });
		} catch (e) {
			return fail(400, { error: 'A category with that slug already exists' });
		}
		return { ok: true };
	},

	update: async ({ request }) => {
		const form = await request.formData();
		const id = String(form.get('id') ?? '');
		const name = String(form.get('name') ?? '').trim();
		const slug = slugify(String(form.get('slug') ?? '').trim() || name);
		const description = String(form.get('description') ?? '').trim() || null;
		const sortOrder = parseSortOrder(form.get('sortOrder'));

		if (!id || !name || !slug) return fail(400, { error: 'Missing required fields' });

		try {
			await db
				.update(categories)
				.set({ name, slug, description, sortOrder })
				.where(eq(categories.id, id));
		} catch (e) {
			return fail(400, { error: 'A category with that slug already exists' });
		}
		return { ok: true };
	},

	delete: async ({ request }) => {
		const form = await request.formData();
		const id = String(form.get('id') ?? '');
		if (!id) return fail(400, { error: 'Missing id' });
		await db.delete(categories).where(eq(categories.id, id));
		return { ok: true };
	}
};
