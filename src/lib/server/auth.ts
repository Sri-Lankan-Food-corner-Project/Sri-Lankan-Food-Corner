// Better Auth server instance.
// Wire up with drizzleAdapter(db) and add the `role` additionalField
// (default 'customer', check ['customer','admin']) — see CLAUDE.md.

export const auth = {
	handler: async (_request: Request): Promise<Response> => {
		return new Response('Better Auth not configured', { status: 501 });
	}
};
