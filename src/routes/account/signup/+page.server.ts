import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// Old URL — kept only to redirect bookmarks into the auth-modal flow.
export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) throw redirect(302, '/account');
	throw redirect(302, '/?auth=signup');
};
