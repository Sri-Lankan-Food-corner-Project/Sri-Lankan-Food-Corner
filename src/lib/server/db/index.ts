import { drizzle as drizzlePg, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { sql } from 'drizzle-orm';
import postgres from 'postgres';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import { env } from '$env/dynamic/private';
import { building } from '$app/environment';
import * as schema from './schema';

if (!building && !env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const url = building ? '' : env.DATABASE_URL;

// Neon in production (Vercel) → WebSocket driver: fast on serverless cold starts,
// works with callback-style transactions used in checkout / addresses.
// Anything else (local Docker Postgres, etc.) → postgres.js TCP driver.
const isNeon = url.includes('neon.tech');

function buildNeonDb() {
	neonConfig.webSocketConstructor = ws;
	const pool = new Pool({ connectionString: url });
	return drizzleNeon(pool, { schema });
}

function buildLocalDb() {
	const client = postgres(url);
	return drizzlePg(client, { schema });
}

// Both driver outputs share the same runtime PgDatabase interface, but their
// TypeScript generics differ. Cast to a single canonical type (PostgresJsDatabase)
// so callers get concrete `.returning({...})`, `.transaction(async tx => ...)` etc.
// signatures instead of a broken union.
export const db = (isNeon ? buildNeonDb() : buildLocalDb()) as unknown as PostgresJsDatabase<
	typeof schema
>;

// Cheap keepalive query — exported so the warmup endpoint doesn't have to import
// `sql` (which resolves to a different peer-copy of drizzle-orm across files
// under pnpm and trips the type checker).
export const ping = () => db.execute(sql`select 1`);
