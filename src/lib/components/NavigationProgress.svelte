<script lang="ts">
	import { navigating } from '$app/state';
	import { onMount, onDestroy } from 'svelte';

	// Only reveal the bar when a navigation is still in flight after this delay.
	// Fast navigations (client-side, cached data) usually finish in <100ms — a bar
	// that flashes for 50ms is worse UX than no bar at all.
	const DELAY_MS = 200;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let bp: any = null;
	let timeout: ReturnType<typeof setTimeout> | null = null;
	let running = false;

	onMount(async () => {
		const mod = await import('@bprogress/core');
		await import('@bprogress/core/css');
		bp = mod.BProgress;
		bp.configure({
			showSpinner: false,
			minimum: 0.15,
			trickleSpeed: 200,
			easing: 'ease',
			speed: 250
		});
	});

	onDestroy(() => {
		if (timeout) clearTimeout(timeout);
		if (bp && running) bp.done();
	});

	$effect(() => {
		if (!bp) return;

		if (navigating.to) {
			// Navigation just started — arm the delayed reveal.
			timeout = setTimeout(() => {
				bp.start();
				running = true;
				timeout = null;
			}, DELAY_MS);
		} else {
			// Navigation finished (or was faster than DELAY_MS and never revealed).
			if (timeout) {
				clearTimeout(timeout);
				timeout = null;
			}
			if (running) {
				bp.done();
				running = false;
			}
		}
	});
</script>

<style>
	/* Match the brand palette instead of BProgress's default blue. */
	:global(#bprogress .bar) {
		background: #E8B267 !important;
		height: 2px !important;
	}
	:global(#bprogress .peg) {
		box-shadow:
			0 0 10px #E8B267,
			0 0 5px #E8B267 !important;
	}
</style>
