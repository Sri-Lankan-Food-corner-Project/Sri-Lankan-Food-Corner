import { loadHomeSections } from '$lib/server/homeSections';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const sections = await loadHomeSections();
	return { sections };
};
