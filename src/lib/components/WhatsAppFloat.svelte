<script lang="ts">
	import { page } from '$app/state';
	import WhatsAppIcon from '$lib/components/WhatsAppIcon.svelte';
	import { site, waHref } from '$lib/config/site';

	// Keep the button away from the checkout flow — a floating chat bubble next
	// to the payment CTA is a mis-tap magnet and distracts at the decision moment.
	const hidden = $derived(page.url.pathname.startsWith('/checkout'));

	const href = waHref(`Hello ${site.shortName}! I'd like to ask a question.`);
</script>

{#if !hidden}
	<a
		{href}
		target="_blank"
		rel="noopener noreferrer"
		aria-label="Chat with us on WhatsApp"
		class="wa-float group bg-whatsapp hover:bg-whatsapp-hover focus-visible:ring-whatsapp/50 fixed right-4 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-40 flex items-center rounded-full text-white shadow-[0_6px_20px_rgba(37,211,102,0.45)] transition-colors focus-visible:ring-4 focus-visible:outline-none md:right-6 md:bottom-6"
	>
		<!-- Soft pulse ring drawing the eye without being a full-time strobe. -->
		<span class="wa-ping bg-whatsapp pointer-events-none absolute top-0 left-0 size-14 rounded-full" aria-hidden="true"></span>

		<span class="relative flex size-14 items-center justify-center">
			<WhatsAppIcon class="size-7" />
		</span>

		<!-- Label slides out on hover/focus — desktop only, mobile keeps the compact bubble. -->
		<span
			class="relative hidden max-w-0 overflow-hidden text-sm font-semibold whitespace-nowrap transition-[max-width,padding] duration-300 ease-out group-hover:max-w-40 group-hover:pr-5 group-focus-visible:max-w-40 group-focus-visible:pr-5 md:block"
		>
			Chat with us
		</span>
	</a>
{/if}

<style>
	.wa-float {
		animation: wa-enter 400ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
		animation-delay: 600ms;
	}
	@keyframes wa-enter {
		from {
			transform: scale(0);
			opacity: 0;
		}
		to {
			transform: scale(1);
			opacity: 1;
		}
	}

	.wa-ping {
		animation: wa-ping 3s cubic-bezier(0, 0, 0.2, 1) infinite;
		animation-delay: 1.2s;
	}
	@keyframes wa-ping {
		0% {
			transform: scale(1);
			opacity: 0.5;
		}
		55%,
		100% {
			transform: scale(1.6);
			opacity: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.wa-float {
			animation: none;
		}
		.wa-ping {
			animation: none;
			opacity: 0;
		}
	}
</style>
