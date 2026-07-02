import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	return { categories: [] };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		return { ok: true };
	}
};
