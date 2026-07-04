// Thin Resend wrapper — a single sendMail() so every callsite goes through
// the same env-var check + logging, and provider swaps stay a one-file change.

import { Resend } from 'resend';
import { env } from '$env/dynamic/private';
import { building } from '$app/environment';

let cachedClient: Resend | null = null;

function client(): Resend {
	if (cachedClient) return cachedClient;
	if (!env.RESEND_API_KEY) throw new Error('RESEND_API_KEY is not set');
	cachedClient = new Resend(env.RESEND_API_KEY);
	return cachedClient;
}

export type SendMailInput = {
	to: string;
	subject: string;
	html: string;
	text?: string;
	replyTo?: string;
};

export async function sendMail(input: SendMailInput): Promise<{ id: string | null }> {
	// During prerender/build, don't hit the network.
	if (building) return { id: null };

	if (!env.EMAIL_FROM) throw new Error('EMAIL_FROM is not set');

	const res = await client().emails.send({
		from: env.EMAIL_FROM,
		to: input.to,
		subject: input.subject,
		html: input.html,
		text: input.text,
		replyTo: input.replyTo
	});

	if (res.error) {
		// Log but don't throw — Better Auth's flow shouldn't 500 the user out.
		// Callers can inspect the returned id (null on failure) if they care.
		console.error('[email/resend] send failed:', res.error);
		return { id: null };
	}
	return { id: res.data?.id ?? null };
}
