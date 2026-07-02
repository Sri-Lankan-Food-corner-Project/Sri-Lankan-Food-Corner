import { error, redirect, type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// TODO: read Better Auth session and populate event.locals.user
	event.locals.user = null as App.Locals['user'];

	if (event.url.pathname.startsWith('/admin')) {
		if (!event.locals.user) throw redirect(302, '/account/login');
		if (event.locals.user.role !== 'admin') throw error(403, 'Forbidden');
	}

	return resolve(event);
};
