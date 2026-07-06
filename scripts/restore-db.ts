// Restore a Neon backup .dump file (from R2 or local) into a target database.
// Usage:
//   pnpm restore-db -- --file ./food-corner-2026-07-06_180000.dump --url $RESTORE_TARGET_URL --confirm
//
// Restore target should be a SCRATCH database, not production. Point RESTORE_TARGET_URL
// at a Neon branch or a local Docker Postgres to verify the dump is intact.

import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const args = process.argv.slice(2);
function arg(name: string): string | undefined {
	const i = args.indexOf(`--${name}`);
	return i >= 0 ? args[i + 1] : undefined;
}

const file = arg('file');
const url = arg('url') ?? process.env.RESTORE_TARGET_URL;

if (!file || !url) {
	console.error('Usage: pnpm restore-db -- --file <path> --url <postgres-url> --confirm');
	process.exit(1);
}
if (!existsSync(file)) {
	console.error(`Dump file not found: ${file}`);
	process.exit(1);
}
if (!args.includes('--confirm')) {
	console.error(`\nRefusing to run without --confirm.`);
	console.error(`Target host: ${new URL(url).host}`);
	console.error(`Re-run with --confirm to proceed.\n`);
	process.exit(1);
}

console.log(`Restoring ${file} → ${new URL(url).host}`);

// --clean --if-exists: drop objects before recreating (idempotent)
// --no-owner --no-acl: skip Neon-specific ownership
execSync(
	`pg_restore --clean --if-exists --no-owner --no-acl -d "${url}" "${file}"`,
	{ stdio: 'inherit' }
);

console.log('Restore complete.');
