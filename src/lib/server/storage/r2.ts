// Cloudflare R2 (S3-compatible) upload/delete helpers.
// Uses the standard AWS S3 SDK against R2's endpoint.
// Never call these from a browser context — credentials must stay server-side.

import { env } from '$env/dynamic/private';

export async function uploadImage(_key: string, _body: Buffer | Uint8Array, _contentType: string) {
	throw new Error('R2 upload not configured');
}

export async function deleteImage(_key: string) {
	throw new Error('R2 delete not configured');
}

export function publicUrl(key: string) {
	if (!env.R2_PUBLIC_URL) throw new Error('R2_PUBLIC_URL is not set');
	return `${env.R2_PUBLIC_URL.replace(/\/$/, '')}/${key}`;
}
