import { error, redirect, type Handle, type HandleServerError } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { auth } from '$lib/server/auth';

// Better Auth cookies are all prefixed with `better-auth`, and switch to
// `__Secure-better-auth` when useSecureCookies is on (production HTTPS).
// If the incoming request has neither, the visitor is definitely signed out
// and we can skip the DB round-trip entirely.
const SESSION_COOKIE_REGEX = /(?:^|;\s*)(?:__Secure-)?better-auth\.session_token=/;

// Paths that must keep working even during maintenance so the admin can
// still sign in, fix things, and turn the flag back off.
const MAINTENANCE_ALLOWED_PREFIXES = ['/admin', '/api/auth', '/maintenance', '/favicon'];

function isMaintenanceMode(): boolean {
	const v = env.MAINTENANCE_MODE?.trim().toLowerCase();
	return v === 'true' || v === '1' || v === 'on';
}

export const handle: Handle = async ({ event, resolve }) => {
	// --- Auth (session) ---
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

	// --- Maintenance mode ---
	// If the flag is on, redirect customer routes to /maintenance. Admin,
	// auth endpoints, and the maintenance page itself are always reachable
	// so the shop owner can log in and switch the flag back off.
	if (isMaintenanceMode()) {
		const path = event.url.pathname;
		const allowed = MAINTENANCE_ALLOWED_PREFIXES.some((prefix) => path.startsWith(prefix));
		if (!allowed) {
			// Signed-in admins skip maintenance too — useful for previewing the
			// storefront while the shop is closed.
			const isAdminUser = event.locals.user?.role === 'admin';
			if (!isAdminUser) throw redirect(307, '/maintenance');
		}
	}

	// --- Admin gate ---
	if (event.url.pathname.startsWith('/admin')) {
		if (!event.locals.user) throw redirect(302, '/?auth=login');
		if (event.locals.user.role !== 'admin') throw error(403, 'Forbidden');
	}

	return resolve(event);
};

// Called for any unhandled exception in a load / action / server route.
// Do not leak internals to the client — return a sanitized message and
// log the full detail server-side.
export const handleError: HandleServerError = ({ error: err, event, status }) => {
	const id = crypto.randomUUID();
	console.error(`[${id}] ${event.request.method} ${event.url.pathname} · status ${status}`);
	console.error(err);
	return {
		message: status >= 500 ? 'Something went wrong on our end.' : 'Request failed.',
		id
	};
};
