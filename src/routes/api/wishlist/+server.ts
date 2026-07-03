import { error, json } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { wishlistItems } from '$lib/server/db/schema';
import type { RequestHandler } from './$types';

/**
 * POST /api/wishlist  { productId }   → add to wishlist (idempotent via UNIQUE)
 * DELETE /api/wishlist { productId }  → remove from wishlist
 */

async function readProductId(request: Request): Promise<string | null> {
	try {
		const body = await request.json();
		return typeof body?.productId === 'string' ? body.productId : null;
	} catch {
		return null;
	}
}

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user?.id) throw error(401, 'You must be signed in.');
	const productId = await readProductId(request);
	if (!productId) throw error(400, 'Missing productId.');

	try {
		await db
			.insert(wishlistItems)
			.values({ userId: locals.user.id, productId })
			.onConflictDoNothing();
	} catch (err) {
		console.error('[api/wishlist POST]', err);
		throw error(500, 'Could not add to wishlist.');
	}

	return json({ ok: true });
};

export const DELETE: RequestHandler = async ({ request, locals }) => {
	if (!locals.user?.id) throw error(401, 'You must be signed in.');
	const productId = await readProductId(request);
	if (!productId) throw error(400, 'Missing productId.');

	try {
		await db
			.delete(wishlistItems)
			.where(
				and(eq(wishlistItems.userId, locals.user.id), eq(wishlistItems.productId, productId))
			);
	} catch (err) {
		console.error('[api/wishlist DELETE]', err);
		throw error(500, 'Could not remove from wishlist.');
	}

	return json({ ok: true });
};
