import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	return {
		userEmail: locals.user?.email ?? null,
		userName: locals.user?.name ?? null
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		return { ok: true };
	}
};
