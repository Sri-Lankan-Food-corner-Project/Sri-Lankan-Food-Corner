import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { PageServerLoad } from './$types';

function isMaintenanceMode(): boolean {
	const v = env.MAINTENANCE_MODE?.trim().toLowerCase();
	return v === 'true' || v === '1' || v === 'on';
}

export const load: PageServerLoad = async () => {
	// When the shop isn't actually closed, /maintenance shouldn't be reachable —
	// it would misleadingly imply an outage. Send stray visitors home.
	if (!isMaintenanceMode()) {
		throw redirect(307, '/');
	}

	// Optional custom message set via env, otherwise the page uses its default text.
	return {
		message: env.MAINTENANCE_MESSAGE ?? null,
		reopenAt: env.MAINTENANCE_REOPEN_AT ?? null
	};
};
