// Explicitly not requiring auth — resetting your password is inherently a
// signed-out flow. Overrides the /account/* layout guard.
export const load = () => ({});
