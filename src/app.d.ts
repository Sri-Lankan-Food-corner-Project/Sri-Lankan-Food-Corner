import type { Session } from '$lib/server/auth';

declare global {
	namespace App {
		interface Error {
			message: string;
			id?: string;
		}
		interface Locals {
			user: Session['user'] | null;
			session: Session['session'] | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
