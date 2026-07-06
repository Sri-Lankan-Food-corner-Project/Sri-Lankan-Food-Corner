// Sitemap generated at request time from the DB, so new products/categories appear
// without a build. Cached at the edge for 1 hour to keep Neon quiet.

import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { products, categories } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { SITE_URL } from '$lib/config/seo';

// Static routes that always get indexed. Anything user-specific or admin
// (checkout, account, admin) is excluded — it's noindex on the page anyway.
const STATIC_ROUTES = [
	{ path: '/', priority: 1.0, changefreq: 'daily' },
	{ path: '/products', priority: 0.9, changefreq: 'daily' },
	{ path: '/about', priority: 0.6, changefreq: 'monthly' },
	{ path: '/contact', priority: 0.6, changefreq: 'monthly' }
];

export const GET: RequestHandler = async () => {
	const [activeProducts, allCategories] = await Promise.all([
		db
			.select({ slug: products.slug, updatedAt: products.updatedAt })
			.from(products)
			.where(eq(products.isActive, true)),
		db.select({ slug: categories.slug }).from(categories)
	]);

	const now = new Date().toISOString();

	const urls = [
		...STATIC_ROUTES.map((r) => url(SITE_URL + r.path, now, r.changefreq, r.priority)),
		...allCategories.map((c) => url(`${SITE_URL}/category/${c.slug}`, now, 'weekly', 0.7)),
		...activeProducts.map((p) =>
			url(`${SITE_URL}/products/${p.slug}`, p.updatedAt.toISOString(), 'weekly', 0.8)
		)
	];

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml',
			// Edge cache for 1 hour; browser cache short so admins see updates soon.
			'Cache-Control': 'public, max-age=300, s-maxage=3600'
		}
	});
};

function url(loc: string, lastmod: string, changefreq: string, priority: number): string {
	return `\t<url>
\t\t<loc>${loc}</loc>
\t\t<lastmod>${lastmod}</lastmod>
\t\t<changefreq>${changefreq}</changefreq>
\t\t<priority>${priority}</priority>
\t</url>`;
}
