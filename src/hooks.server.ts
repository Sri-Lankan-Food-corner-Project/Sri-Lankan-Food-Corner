import { error, redirect, type Handle } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';

// Better Auth cookies are all prefixed with `better-auth`, and switch to
// `__Secure-better-auth` when useSecureCookies is on (production HTTPS).
// If the incoming request has neither, the visitor is definitely signed out
// and we can skip the DB round-trip entirely.
const SESSION_COOKIE_REGEX = /(?:^|;\s*)(?:__Secure-)?better-auth\.session_token=/;

export const handle: Handle = async ({ event, resolve }) => {
	const cookieHeader = event.request.headers.get('cookie') ?? '';
	const mightBeSignedIn = SESSION_COOKIE_REGEX.test(cookieHeader);

	if (!mightBeSignedIn) {
		event.locals.user = null;
		event.locals.session = null;
	} else {
		const authSession = await auth.api.getSession({ headers: event.request.headers });
		event.locals.user = authSession?.user ?? null;
		event.locals.session = authSession?.session ?? null;
	}

	if (event.url.pathname.startsWith('/admin')) {
		if (!event.locals.user) throw redirect(302, '/?auth=login');
		if (event.locals.user.role !== 'admin') throw error(403, 'Forbidden');
	}

	return resolve(event);
};
