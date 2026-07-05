import { loadHomeSections } from '$lib/server/homeSections';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	// Deferred / streamed. Hero + marquee are static so the page can render
	// instantly on click-from-anywhere; sliders fill in as the DB responds.
	// Nesting under `streamed` tells SvelteKit not to await this promise before
	// shipping the first HTML.
	return {
		streamed: { sections: loadHomeSections() }
	};
};
