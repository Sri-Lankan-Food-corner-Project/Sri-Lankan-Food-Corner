import { fail } from '@sveltejs/kit';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { userAddresses } from '$lib/server/db/schema';
import type { PageServerLoad, Actions } from './$types';

function str(fd: FormData, key: string): string {
	return (fd.get(key)?.toString() ?? '').trim();
}
function opt(fd: FormData, key: string): string | null {
	const v = str(fd, key);
	return v.length ? v : null;
}
function bool(fd: FormData, key: string): boolean {
	const v = fd.get(key);
	return v === 'on' || v === 'true';
}

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user?.id) return { addresses: [] };
	const addresses = await db
		.select()
		.from(userAddresses)
		.where(eq(userAddresses.userId, locals.user.id))
		.orderBy(desc(userAddresses.isDefault), desc(userAddresses.updatedAt));
	return { addresses };
};

export const actions: Actions = {
	save: async ({ request, locals }) => {
		if (!locals.user?.id) return fail(401, { error: 'You must be logged in.' });
		try {
			const fd = await request.formData();
			const id = opt(fd, 'addressId');
			const fullName = str(fd, 'fullName');
			const phone = str(fd, 'phone');
			const street = str(fd, 'street');
			const city = str(fd, 'city');
			const postcode = str(fd, 'postcode');
			const setDefault = bool(fd, 'isDefault');

			if (!fullName || !phone || !street || !city || !postcode) {
				return fail(400, { error: 'Please fill in all required fields.' });
			}

			const values = {
				userId: locals.user.id,
				label: opt(fd, 'label'),
				fullName,
				phone,
				street,
				houseNumber: opt(fd, 'houseNumber'),
				roomNumber: opt(fd, 'roomNumber'),
				accessCode: opt(fd, 'accessCode'),
				city,
				postcode,
				country: 'KR',
				isDefault: setDefault,
				updatedAt: new Date()
			};

			await db.transaction(async (tx) => {
				if (setDefault) {
					await tx
						.update(userAddresses)
						.set({ isDefault: false })
						.where(eq(userAddresses.userId, locals.user!.id));
				}
				if (id) {
					await tx
						.update(userAddresses)
						.set(values)
						.where(and(eq(userAddresses.id, id), eq(userAddresses.userId, locals.user!.id)));
				} else {
					await tx.insert(userAddresses).values(values);
				}
			});

			return { saved: true };
		} catch (err) {
			console.error('[account/addresses/save]', err);
			return fail(500, { error: 'Could not save the address. Please try again.' });
		}
	},

	delete: async ({ request, locals }) => {
		if (!locals.user?.id) return fail(401, { error: 'You must be logged in.' });
		try {
			const fd = await request.formData();
			const id = str(fd, 'addressId');
			if (!id) return fail(400, { error: 'Missing address id.' });
			await db
				.delete(userAddresses)
				.where(and(eq(userAddresses.id, id), eq(userAddresses.userId, locals.user.id)));
			return { deleted: true };
		} catch (err) {
			console.error('[account/addresses/delete]', err);
			return fail(500, { error: 'Could not delete the address. Please try again.' });
		}
	}
};
