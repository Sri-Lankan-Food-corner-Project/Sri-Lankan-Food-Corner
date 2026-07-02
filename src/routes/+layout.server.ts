import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	// TODO: load categories from db.select().from(categories) once wired up
	return {
		user: locals.user,
		categories: [] as { slug: string; name: string }[]
	};
};
