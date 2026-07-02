// Cloudflare R2 (S3-compatible) upload/delete helpers.
// Uses the standard AWS S3 SDK against R2's endpoint.
// Never call these from a browser context — credentials must stay server-side.

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { env } from '$env/dynamic/private';
import { building } from '$app/environment';

let cachedClient: S3Client | null = null;

function client(): S3Client {
	if (cachedClient) return cachedClient;
	if (!env.R2_ACCOUNT_ID || !env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY) {
		throw new Error('R2 credentials are not set');
	}
	cachedClient = new S3Client({
		region: 'auto',
		endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
		credentials: {
			accessKeyId: env.R2_ACCESS_KEY_ID,
			secretAccessKey: env.R2_SECRET_ACCESS_KEY
		}
	});
	return cachedClient;
}

function bucket(): string {
	if (!env.R2_BUCKET_NAME) throw new Error('R2_BUCKET_NAME is not set');
	return env.R2_BUCKET_NAME;
}

export async function uploadImage(
	key: string,
	body: Buffer | Uint8Array,
	contentType: string
): Promise<void> {
	await client().send(
		new PutObjectCommand({
			Bucket: bucket(),
			Key: key,
			Body: body,
			ContentType: contentType,
			CacheControl: 'public, max-age=31536000, immutable'
		})
	);
}

export async function deleteImage(key: string): Promise<void> {
	await client().send(new DeleteObjectCommand({ Bucket: bucket(), Key: key }));
}

// Given a public URL previously produced by publicUrl(), extract the R2 key.
// Returns null if the URL isn't from our bucket.
export function keyFromPublicUrl(url: string): string | null {
	if (building || !env.R2_PUBLIC_URL) return null;
	const base = env.R2_PUBLIC_URL.replace(/\/$/, '');
	if (!url.startsWith(base + '/')) return null;
	return url.slice(base.length + 1);
}

export function publicUrl(key: string): string {
	if (!env.R2_PUBLIC_URL) throw new Error('R2_PUBLIC_URL is not set');
	return `${env.R2_PUBLIC_URL.replace(/\/$/, '')}/${key}`;
}
