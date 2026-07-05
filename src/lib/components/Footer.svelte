<script lang="ts">
	import logo from '$lib/assets/logo2.webp';
	import { site, telHref } from '$lib/config/site';
	import { MapPin } from '@lucide/svelte';

	type Category = { slug: string; name: string };
	let { categories = [] }: { categories?: Category[] } = $props();

	const popular = $derived(categories.slice(0, 6));
	const year = new Date().getFullYear();
</script>

<footer class="mt-16 bg-brand-charcoal text-white/85">
	<div
		class="mx-auto grid max-w-350 gap-10 px-4 py-14 sm:px-6 lg:grid-cols-4 lg:px-8"
	>
		<!-- Brand / about -->
		<div>
			<img src={logo} alt={site.name} class="h-14 w-auto sm:h-16 md:h-30" />
			<p class="mt-5 text-sm leading-relaxed text-white/70">
				{site.description}
			</p>

			<div class="mt-6">
				<p class="text-xs font-semibold tracking-widest text-white/60 uppercase">
					Follow Us
				</p>
				<div class="mt-3 flex items-center gap-4 text-white/75">
					{#if site.social.facebook}
						<a
							href={site.social.facebook}
							target="_blank"
							rel="noopener"
							aria-label="Facebook"
							class="transition-colors hover:text-white"
						>
							<svg viewBox="0 0 24 24" fill="currentColor" class="size-5">
								<path
									d="M9.101 23.691v-7.98H6.627v-3.667h2.474V10.464c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036c-.373-.017-.62-.026-.733-.026-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"
								/>
							</svg>
						</a>
					{/if}
					{#if site.social.tiktok}
						<a
							href={site.social.tiktok}
							target="_blank"
							rel="noopener"
							aria-label="TikTok"
							class="transition-colors hover:text-white"
						>
							<svg viewBox="0 0 24 24" fill="currentColor" class="size-5">
								<path
									d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.87a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.3z"
								/>
							</svg>
						</a>
					{/if}
					{#if site.social.youtube}
						<a
							href={site.social.youtube}
							target="_blank"
							rel="noopener"
							aria-label="YouTube"
							class="transition-colors hover:text-white"
						>
							<svg viewBox="0 0 24 24" fill="currentColor" class="size-5">
								<path
									d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
								/>
							</svg>
						</a>
					{/if}
					{#if site.social.instagram}
						<a
							href={site.social.instagram}
							target="_blank"
							rel="noopener"
							aria-label="Instagram"
							class="transition-colors hover:text-white"
						>
							<svg viewBox="0 0 24 24" fill="currentColor" class="size-5">
								<path
									d="M12 2.163c3.204 0 3.584.012 4.849.07 3.253.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.849.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849C2.381 3.924 3.896 2.38 7.151 2.233 8.416 2.175 8.796 2.163 12 2.163Zm0-2.163C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12s.014 3.668.072 4.948c.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24s3.668-.014 4.948-.072c4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948s-.014-3.668-.072-4.948C23.732 2.702 21.31.278 16.948.072 15.668.014 15.259 0 12 0Zm0 5.838a6.163 6.163 0 1 0 0 12.326 6.163 6.163 0 0 0 0-12.326ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881Z"
								/>
							</svg>
						</a>
					{/if}
				</div>
			</div>
		</div>

		<!-- Popular Categories -->
		<div>
			<h4 class="text-base font-semibold text-white">Popular Categories</h4>
			<ul class="mt-5 space-y-3 text-sm text-white/75">
				{#if popular.length > 0}
					{#each popular as c (c.slug)}
						<li>
							<a href="/category/{c.slug}" class="transition-colors hover:text-white">
								{c.name}
							</a>
						</li>
					{/each}
				{:else}
					<li>
						<a href="/products" class="transition-colors hover:text-white">All Products</a>
					</li>
				{/if}
			</ul>
		</div>

		<!-- Useful Links -->
		<div>
			<h4 class="text-base font-semibold text-white">Useful Links</h4>
			<ul class="mt-5 space-y-3 text-sm text-white/75">
				<li><a href="/about" class="transition-colors hover:text-white">About Us</a></li>
				<li>
					<a href="/contact" class="transition-colors hover:text-white">Contact Us</a>
				</li>
				<li>
					<a href="/privacy" class="transition-colors hover:text-white">Privacy Policy</a>
				</li>
				<li>
					<a href="/returns" class="transition-colors hover:text-white">Returns Policy</a>
				</li>
				<li>
					<a href="/shipping" class="transition-colors hover:text-white">Shipping Policy</a>
				</li>
				<li>
					<a href="/disclaimer" class="transition-colors hover:text-white">Disclaimer</a>
				</li>
			</ul>
		</div>

		<!-- Contact us -->
		<div>
			<h4 class="text-base font-semibold text-white">Contact us</h4>
			<div class="mt-5 space-y-5 text-sm text-white/75">
				<div>
					<p class="font-medium text-white">Email (이메일 문의):</p>
					<a
						href="mailto:{site.email}"
						class="mt-1 inline-block break-all transition-colors hover:text-white"
					>
						{site.email}
					</a>
				</div>

				<div>
					<p class="font-medium text-white">Phone Number (전화번호):</p>
					<a
						href={telHref(site.phone.primary)}
						class="mt-1 block transition-colors hover:text-white"
					>
						{site.phone.primary}
					</a>
					<a
						href={telHref(site.phone.secondary)}
						class="block transition-colors hover:text-white"
					>
						{site.phone.secondary}
					</a>
				</div>

				<div>
					<p class="font-medium text-white">Address:</p>
					<p class="mt-1 leading-relaxed">
						<span class="text-white">(EN):</span>
						{site.address.en}
					</p>
					<p class="leading-relaxed">
						<span class="text-white">(KR):</span>
						{site.address.kr}
					</p>
					<a
						href={site.mapUrl}
						target="_blank"
						rel="noopener"
						class="mt-2 inline-flex items-center gap-1.5 text-white/90 underline underline-offset-2 hover:text-white"
					>
						<MapPin class="size-3.5" /> View on Google Maps
					</a>
				</div>
			</div>
		</div>
	</div>

	<!-- Korean business info strip -->
	<div class="border-t border-white/10">
		<div
			class="mx-auto max-w-350 px-4 py-6 text-xs text-white/60 sm:px-6 lg:px-8"
		>
			<div class="flex flex-wrap items-center gap-x-4 gap-y-1.5">
				<span>
					<span class="text-white/80">회사명:</span>
					{site.name}
				</span>
				<span class="text-white/25">|</span>
				<span>
					<span class="text-white/80">대표자:</span>
					{site.business.representative}
				</span>
				<span class="text-white/25">|</span>
				<span>
					<span class="text-white/80">사업자등록번호:</span>
					{site.business.registrationNumber}
				</span>
			</div>
			<div class="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5">
				<span>
					<span class="text-white/80">주소:</span>
					{site.address.kr}
				</span>
				<span class="text-white/25">|</span>
				<span>
					<span class="text-white/80">고객센터:</span>
					{site.phone.primary}
				</span>
				<span class="text-white/25">|</span>
				<span>
					<span class="text-white/80">이메일:</span>
					{site.email}
				</span>
			</div>
		</div>
	</div>

	<!-- Copyright bar -->
	<div class="border-t border-white/10">
		<div
			class="mx-auto flex max-w-350 flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-white/60 sm:flex-row sm:px-6 lg:px-8"
		>
			<p>© {year} {site.name}. All Rights Reserved.</p>
			<div class="flex items-center gap-5">
				<a href="/terms" class="transition-colors hover:text-white">
					Terms and Conditions
				</a>
			
			</div>
		</div>
	</div>
</footer>
