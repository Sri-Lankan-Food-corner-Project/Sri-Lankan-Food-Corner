import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	// All /account/* routes require a signed-in user. Send guests home with the
	// auth modal open — the root layout picks up ?auth=login and shows the dialog.
	if (!locals.user) throw redirect(302, '/?auth=login');
	return { user: locals.user };
};
