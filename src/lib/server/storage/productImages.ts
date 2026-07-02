import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { uploadImage, deleteImage, publicUrl, keyFromPublicUrl } from './r2';

const MAX_WIDTH = 1200;
const WEBP_QUALITY = 80;
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB raw upload cap

export type UploadedProductImage = {
	imageUrl: string;
	key: string;
};

// Resize + convert to WebP, then upload under products/{productId}/{uuid}.webp.
export async function uploadProductImage(
	productId: string,
	file: File
): Promise<UploadedProductImage> {
	if (!file.type.startsWith('image/')) {
		throw new Error(`Not an image: ${file.name}`);
	}
	if (file.size > MAX_FILE_BYTES) {
		throw new Error(`File too large (>${MAX_FILE_BYTES / (1024 * 1024)}MB): ${file.name}`);
	}

	const buf = Buffer.from(await file.arrayBuffer());
	const resized = await sharp(buf)
		.rotate() // honor EXIF orientation
		.resize({ width: MAX_WIDTH, withoutEnlargement: true })
		.webp({ quality: WEBP_QUALITY })
		.toBuffer();

	const key = `products/${productId}/${randomUUID()}.webp`;
	await uploadImage(key, resized, 'image/webp');
	return { imageUrl: publicUrl(key), key };
}

// Delete an image by its stored public URL. Silently no-ops on unknown URLs.
export async function deleteProductImageByUrl(url: string): Promise<void> {
	const key = keyFromPublicUrl(url);
	if (!key) return;
	try {
		await deleteImage(key);
	} catch {
		// Non-fatal — the DB row is still gone, the object will eventually be reaped
		// or can be cleaned up manually. Don't block the user flow on a stray S3 error.
	}
}
