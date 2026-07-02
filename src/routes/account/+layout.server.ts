import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

const PUBLIC_ACCOUNT_ROUTES = ['/account/login', '/account/signup'];

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const isPublic = PUBLIC_ACCOUNT_ROUTES.includes(url.pathname);
	if (!isPublic && !locals.user) throw redirect(302, '/account/login');
	return { user: locals.user };
};
