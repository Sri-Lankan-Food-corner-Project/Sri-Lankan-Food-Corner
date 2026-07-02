import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	return { id: params.id };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		return { ok: true };
	}
};
