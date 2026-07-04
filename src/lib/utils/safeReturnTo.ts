/**
 * Sanitize an untrusted `returnTo` URL so it can only navigate within our own
 * app. Prevents phishing links like `?returnTo=//evil.com/steal-cookies` from
 * bouncing an authenticated user off-site after login.
 *
 * Rules:
 *   - Must start with `/`
 *   - Must NOT start with `//` or `/\` (protocol-relative — points to another host)
 *   - Fallback to `/` for anything else, including null / undefined
 */
export function safeReturnTo(raw: string | null | undefined): string {
	if (!raw) return '/';
	// Protocol-relative or backslash-tricks → treat as unsafe
	if (raw.startsWith('//') || raw.startsWith('/\\')) return '/';
	if (!raw.startsWith('/')) return '/';
	return raw;
}
