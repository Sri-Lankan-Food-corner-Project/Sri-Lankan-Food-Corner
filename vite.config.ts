import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-vercel';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			// Pin the Vercel function region to Singapore (sin1) so it's co-located
			// with Neon Singapore. Closest Vercel PoP to both Sri Lanka and Korea
			// that also has Neon in-region.
			adapter: adapter({
				runtime: 'nodejs22.x',
				regions: ['sin1']
			})
		})
	]
});
