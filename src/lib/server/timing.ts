/**
 * Diagnostic wrapper: logs how long a promise takes to resolve.
 * Use to measure a specific DB batch, an auth call, etc. — the label
 * shows up as `[db] categories: 234ms` in the server terminal.
 * Remove or gate behind an env var once you've identified the bottleneck.
 */
export async function timed<T>(label: string, promise: Promise<T> | (() => Promise<T>)): Promise<T> {
	const t0 = performance.now();
	try {
		const result = await (typeof promise === 'function' ? promise() : promise);
		const ms = performance.now() - t0;
		console.log(`[db] ${label}: ${ms.toFixed(0)}ms`);
		return result;
	} catch (e) {
		const ms = performance.now() - t0;
		console.log(`[db] ${label} FAILED in ${ms.toFixed(0)}ms`);
		throw e;
	}
}
