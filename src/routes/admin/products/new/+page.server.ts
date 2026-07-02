import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, locals }) => {
		return { ok: true };
	}
};
