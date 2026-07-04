import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { env } from '$env/dynamic/private';
import { building } from '$app/environment';
import { db } from './db';
import * as schema from './db/schema';
import { sendMail } from './email/resend';
import { renderPasswordResetEmail } from './email/templates/passwordReset';

export const auth = betterAuth({
	baseURL: building ? '' : env.BETTER_AUTH_URL,
	basePath: '/api/auth',
	secret: building ? 'build' : env.BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, {
		provider: 'pg',
		schema: {
			user: schema.user,
			session: schema.session,
			account: schema.account,
			verification: schema.verification
		}
	}),
	emailAndPassword: {
		enabled: true,
		autoSignIn: true,
		minPasswordLength: 8,
		// Called by Better Auth when the user requests a password reset.
		// The `url` includes a signed token that the /reset-password page
		// posts back to Better Auth to actually change the password.
		sendResetPassword: async ({ user, url }) => {
			const { html, text } = renderPasswordResetEmail({
				name: user.name,
				resetUrl: url,
				validForMinutes: 60
			});
			await sendMail({
				to: user.email,
				subject: 'Reset your Food Corner password',
				html,
				text
			});
		}
	},
	user: {
		additionalFields: {
			phone: {
				type: 'string',
				required: true,
				input: true
			},
			role: {
				type: 'string',
				required: false,
				defaultValue: 'customer',
				// don't accept role from signup form — only server code/admin promotes users
				input: false
			}
		}
	},
	session: {
		expiresIn: 60 * 60 * 24 * 30, // 30 days
		updateAge: 60 * 60 * 24, // refresh once per day
		// Cache the resolved session in an encrypted cookie for 5 minutes so
		// getSession() doesn't hit the DB on every navigation. Sign-out and
		// role changes still invalidate immediately (the cookie is overwritten
		// on those flows).
		cookieCache: {
			enabled: true,
			maxAge: 60 * 5
		}
	},
	advanced: {
		useSecureCookies: env.BETTER_AUTH_URL?.startsWith('https://') ?? false
	}
});

export type Session = typeof auth.$Infer.Session;
