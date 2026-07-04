import { fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import type { PageServerLoad, Actions } from './$types';

function str(fd: FormData, key: string): string {
	return (fd.get(key)?.toString() ?? '').trim();
}

export const load: PageServerLoad = async ({ locals }) => {
	return { user: locals.user };
};

export const actions: Actions = {
	update: async ({ request, locals }) => {
		if (!locals.user?.id) return fail(401, { error: 'You must be logged in.' });
		try {
			const fd = await request.formData();
			const name = str(fd, 'name');
			const phone = str(fd, 'phone');

			if (!name) return fail(400, { error: 'Name is required.' });

			await db
				.update(user)
				.set({ name, phone: phone || null, updatedAt: new Date() })
				.where(eq(user.id, locals.user.id));

			return { saved: true };
		} catch (err) {
			console.error('[account/details/update]', err);
			return fail(500, { error: 'Could not update your details. Please try again.' });
		}
	}
};
