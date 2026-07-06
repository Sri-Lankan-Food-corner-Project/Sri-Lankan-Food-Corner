// Full DB reset — wipes every row from every table.
// Run with:  pnpm db:reset -- --confirm
// The `--confirm` flag is required so a stray double-click can't drop production data.

import 'dotenv/config';
import ws from 'ws';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { sql } from 'drizzle-orm';
import * as schema from '../src/lib/server/db/schema';

const url = process.env.DATABASE_URL;
if (!url) {
	console.error('DATABASE_URL not set. Add it to .env');
	process.exit(1);
}

if (!process.argv.includes('--confirm')) {
	console.error('\nRefusing to run without --confirm.');
	console.error('This will DELETE every row from every table. Run:');
	console.error('  pnpm db:reset -- --confirm\n');
	process.exit(1);
}

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: url });
const db = drizzle(pool, { schema });

// Delete order matters — parents that block via FK must be cleared first.
// Using TRUNCATE ... CASCADE in one shot is simpler than issuing 13 DELETEs
// in dependency order and won't get out of sync when the schema grows.
async function main() {
	console.log('Resetting database at', new URL(url!).host);

	const tables = [
		// app tables
		'payments',
		'order_items',
		'orders',
		'home_section_products',
		'home_sections',
		'wishlist_items',
		'product_reviews',
		'product_images',
		'products',
		'categories',
		'user_addresses',
		// better auth tables (fresh signup after reset)
		'verification',
		'account',
		'session',
		'"user"' // quoted — `user` is a reserved word in Postgres
	];

	await db.execute(sql.raw(`TRUNCATE TABLE ${tables.join(', ')} RESTART IDENTITY CASCADE;`));

	console.log('All tables cleared.');
	await pool.end();
}

main().catch(async (err) => {
	console.error(err);
	await pool.end();
	process.exit(1);
});
