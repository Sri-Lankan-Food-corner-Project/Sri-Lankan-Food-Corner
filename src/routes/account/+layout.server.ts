import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	// All /account/* routes require a signed-in user. Send guests home with the
	// auth modal open — the root layout picks up ?auth=login and shows the dialog.
	// `returnTo` preserves the URL they were trying to reach so we can jump
	// them straight back there after they log in.
	if (!locals.user) {
		const returnTo = encodeURIComponent(url.pathname + url.search);
		throw redirect(302, `/?auth=login&returnTo=${returnTo}`);
	}
	return { user: locals.user };
};
