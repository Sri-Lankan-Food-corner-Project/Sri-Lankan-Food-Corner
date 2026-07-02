// Better Auth browser client — safe to import in .svelte files.
// Wire up with createAuthClient({ baseURL: BETTER_AUTH_URL }) once configured.

export const authClient = {
	signIn: async (_input: unknown) => ({ ok: false }),
	signUp: async (_input: unknown) => ({ ok: false }),
	signOut: async () => ({ ok: false })
};
