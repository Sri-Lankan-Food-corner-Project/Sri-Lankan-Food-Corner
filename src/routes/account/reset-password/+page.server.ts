import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const token = url.searchParams.get('token');
	// No token in the URL → the link is malformed / expired-strip. Send them
	// home with the auth dialog so they can request a fresh reset.
	if (!token) throw redirect(302, '/?auth=forgot');
	return { token };
};
