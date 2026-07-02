import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	return { items: [] };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		return { ok: true };
	}
};
