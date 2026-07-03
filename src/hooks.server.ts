import { error, redirect, type Handle } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
	const authSession = await auth.api.getSession({ headers: event.request.headers });
	event.locals.user = authSession?.user ?? null;
	event.locals.session = authSession?.session ?? null;

	if (event.url.pathname.startsWith('/admin')) {
		if (!event.locals.user) throw redirect(302, '/?auth=login');
		if (event.locals.user.role !== 'admin') throw error(403, 'Forbidden');
	}

	return resolve(event);
};
