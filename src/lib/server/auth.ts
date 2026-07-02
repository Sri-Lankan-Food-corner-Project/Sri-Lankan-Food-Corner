import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { env } from '$env/dynamic/private';
import { building } from '$app/environment';
import { db } from './db';
import * as schema from './db/schema';

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
		minPasswordLength: 8
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
		updateAge: 60 * 60 * 24 // refresh once per day
	},
	advanced: {
		useSecureCookies: env.BETTER_AUTH_URL?.startsWith('https://') ?? false
	}
});

export type Session = typeof auth.$Infer.Session;
