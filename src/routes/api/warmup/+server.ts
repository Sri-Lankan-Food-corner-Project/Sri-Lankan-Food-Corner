import { json } from '@sveltejs/kit';
import { ping } from '$lib/server/db';

// Pinged every ~4 minutes by an external cron (cron-job.org / UptimeRobot)
// to keep the Neon compute from auto-suspending after 5 minutes of idle.
export const GET = async () => {
	await ping();
	return json({ ok: true, at: new Date().toISOString() });
};
