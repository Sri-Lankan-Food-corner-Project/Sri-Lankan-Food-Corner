<script lang="ts">
	import { site, telHref } from '$lib/config/site';
	import SEO from '$lib/components/SEO.svelte';
	import { SITE_URL } from '$lib/config/seo';
	import {
		AlertTriangle,
		CalendarX2,
		Clock,
		Info,
		Mail,
		MapPin,
		PackageCheck,
		Phone,
		Snowflake,
		Split,
		Timer,
		Truck,
		Wallet
	} from '@lucide/svelte';

	const lastUpdated = '2026년 7월 7일';
	const lastUpdatedEn = 'July 7, 2026';

	const shippingJsonLd = {
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		name: 'Shipping Policy',
		url: `${SITE_URL}/shipping`,
		description:
			'Shipping policy for Sri Lankan Food Corner — cutoff times, processing and delivery windows, fees, and restrictions.',
		publisher: {
			'@type': 'Organization',
			name: site.name
		}
	};

	const baseFee = site.shipping.weightBasedFee.toLocaleString('ko-KR');
	const freeThreshold = site.shipping.freeShippingThreshold.toLocaleString('ko-KR');

	const sections = [
		{
			id: 'processing',
			icon: Clock,
			numeral: 'I',
			titleKr: '주문 처리 마감 및 예상 소요 기간',
			titleEn: 'Cutoff & Timeline'
		},
		{
			id: 'restrictions',
			icon: AlertTriangle,
			numeral: 'II',
			titleKr: '배송 유의 사항',
			titleEn: 'Restrictions & Holidays'
		},
		{
			id: 'fees',
			icon: Wallet,
			numeral: 'III',
			titleKr: '배송비 안내',
			titleEn: 'Shipping Fees'
		},
		{
			id: 'contact',
			icon: Mail,
			numeral: 'IV',
			titleKr: '문의처',
			titleEn: 'Contact Us'
		}
	];
</script>

<SEO
	title="Shipping Policy | 배송 정책"
	description="Shipping policy for {site.name}. 2 PM same-day cutoff, {baseFee}원 base fee, free shipping over {freeThreshold}원."
	type="website"
	jsonLd={shippingJsonLd}
/>

<!-- Hero -->
<section class="bg-brand-green relative overflow-hidden text-white">
	<div class="pointer-events-none absolute inset-0 opacity-20">
		<div class="bg-brand-amber absolute -top-32 -right-20 size-96 rounded-full blur-3xl"></div>
		<div class="bg-brand-cream absolute -bottom-40 -left-20 size-96 rounded-full blur-3xl"></div>
	</div>

	<div class="relative mx-auto max-w-350 px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
		<p class="text-brand-amber text-xs font-bold tracking-[0.3em] uppercase">
			Legal · 법적 고지
		</p>
		<h1 class="mt-3 max-w-3xl text-3xl leading-tight font-extrabold sm:text-4xl lg:text-5xl">
			배송 정책
			<span class="mt-1 block text-xl font-semibold text-white/80 sm:text-2xl lg:text-3xl">
				Shipping Policy
			</span>
		</h1>
		<p class="mt-4 max-w-2xl text-sm text-white/85 sm:text-base">
			빠르고 친절한 주문 처리 및 배송 안내 — {site.name}에서는 고객님의 주문이 신속하고
			정확하게 도착할 수 있도록 최선을 다하고 있습니다.
		</p>
		<p class="mt-3 text-xs font-medium text-white/70">
			최종 업데이트 · Last updated: {lastUpdated} ({lastUpdatedEn})
		</p>
	</div>
</section>

<!-- Quick facts strip -->
<section class="bg-brand-cream border-b border-neutral-200">
	<div class="mx-auto max-w-350 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<div class="flex items-start gap-3">
				<div
					class="bg-brand-green/10 text-brand-green flex size-10 shrink-0 items-center justify-center rounded-xl"
				>
					<Timer class="size-5" />
				</div>
				<div>
					<p class="text-[10px] font-bold tracking-widest text-neutral-500 uppercase">
						Same-day cutoff
					</p>
					<p class="mt-0.5 text-sm font-bold text-neutral-900">오후 2시 · 2 PM KST</p>
					<p class="mt-0.5 text-xs text-neutral-500">order before to ship today</p>
				</div>
			</div>
			<div class="flex items-start gap-3">
				<div
					class="bg-brand-amber/15 text-brand-amber flex size-10 shrink-0 items-center justify-center rounded-xl"
				>
					<PackageCheck class="size-5" />
				</div>
				<div>
					<p class="text-[10px] font-bold tracking-widest text-neutral-500 uppercase">
						Processing
					</p>
					<p class="mt-0.5 text-sm font-bold text-neutral-900">0–1 영업일 · Business days</p>
					<p class="mt-0.5 text-xs text-neutral-500">before dispatch</p>
				</div>
			</div>
			<div class="flex items-start gap-3">
				<div
					class="bg-brand-charcoal/10 text-brand-charcoal flex size-10 shrink-0 items-center justify-center rounded-xl"
				>
					<Truck class="size-5" />
				</div>
				<div>
					<p class="text-[10px] font-bold tracking-widest text-neutral-500 uppercase">
						Delivery
					</p>
					<p class="mt-0.5 text-sm font-bold text-neutral-900">3–5 영업일 · Business days</p>
					<p class="mt-0.5 text-xs text-neutral-500">after dispatch</p>
				</div>
			</div>
			<div class="flex items-start gap-3">
				<div
					class="bg-brand-green/10 text-brand-green flex size-10 shrink-0 items-center justify-center rounded-xl"
				>
					<Wallet class="size-5" />
				</div>
				<div>
					<p class="text-[10px] font-bold tracking-widest text-neutral-500 uppercase">
						Free shipping
					</p>
					<p class="mt-0.5 text-sm font-bold text-neutral-900">{freeThreshold}원 이상</p>
					<p class="mt-0.5 text-xs text-neutral-500">Base fee {baseFee}원</p>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Table of contents -->
<section class="bg-brand-sand border-b border-neutral-200">
	<div class="mx-auto max-w-350 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
		<p class="text-brand-green text-xs font-bold tracking-[0.3em] uppercase">Sections</p>
		<h2 class="mt-2 text-lg font-bold text-neutral-900 sm:text-xl">On this page</h2>
		<ul class="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
			{#each sections as s}
				<li>
					<a
						href={`#${s.id}`}
						class="ring-brand-charcoal/10 hover:ring-brand-green group flex items-center gap-3 rounded-xl bg-white p-3 ring-1 transition"
					>
						<div
							class="bg-brand-green/10 text-brand-green flex size-9 shrink-0 items-center justify-center rounded-lg"
						>
							<s.icon class="size-4" />
						</div>
						<div class="min-w-0">
							<p class="text-[10px] font-bold tracking-widest text-neutral-500 uppercase">
								{s.numeral}
							</p>
							<p class="truncate text-sm font-semibold text-neutral-900">
								{s.titleEn}
							</p>
						</div>
					</a>
				</li>
			{/each}
		</ul>
	</div>
</section>

<!-- Body -->
<article class="mx-auto max-w-350 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
	<div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-12">
		<div
			class="divide-y divide-neutral-200 [&>section]:scroll-mt-24 [&>section]:py-14 [&>section:first-child]:pt-0 [&>section:last-child]:pb-0"
		>
			<!-- I. Processing -->
			<section id="processing">
				<p class="text-brand-green text-xs font-bold tracking-[0.3em] uppercase">Section I</p>
				<h2 class="mt-2 text-2xl font-extrabold text-neutral-900 sm:text-3xl">
					주문 처리 마감 및 예상 소요 기간
					<span class="mt-0.5 block text-base font-semibold text-neutral-500 sm:text-lg">
						Order Cutoff &amp; Timeline
					</span>
				</h2>

				<ul class="mt-6 space-y-3">
					<li class="flex items-start gap-4 rounded-2xl bg-white p-5 ring-1 ring-black/5">
						<div
							class="bg-brand-green/10 text-brand-green flex size-10 shrink-0 items-center justify-center rounded-xl"
						>
							<Timer class="size-5" />
						</div>
						<div class="min-w-0">
							<p class="text-sm font-bold text-neutral-900">
								당일 발송 마감 · Same-day cutoff
							</p>
							<p class="mt-1 text-sm leading-relaxed text-neutral-600">
								오후 <strong class="text-neutral-900">2시 이전</strong>에 주문해 주시면,
								당일 바로 처리하여 발송해 드립니다.
								<span class="mt-1 block text-xs text-neutral-500">
									Orders placed before 2 PM KST ship the same day.
								</span>
							</p>
						</div>
					</li>

					<li class="flex items-start gap-4 rounded-2xl bg-white p-5 ring-1 ring-black/5">
						<div
							class="bg-brand-amber/15 text-brand-amber flex size-10 shrink-0 items-center justify-center rounded-xl"
						>
							<PackageCheck class="size-5" />
						</div>
						<div class="min-w-0">
							<p class="text-sm font-bold text-neutral-900">
								주문 준비 기간 · Processing time
							</p>
							<p class="mt-1 text-sm leading-relaxed text-neutral-600">
								주문은 보통 <strong class="text-neutral-900">0–1 영업일 이내</strong>에
								꼼꼼하게 준비되어 처리됩니다.
								<span class="mt-1 block text-xs text-neutral-500">
									Orders are picked and packed within 0–1 business days.
								</span>
							</p>
						</div>
					</li>

					<li class="flex items-start gap-4 rounded-2xl bg-white p-5 ring-1 ring-black/5">
						<div
							class="bg-brand-charcoal/10 text-brand-charcoal flex size-10 shrink-0 items-center justify-center rounded-xl"
						>
							<Truck class="size-5" />
						</div>
						<div class="min-w-0">
							<p class="text-sm font-bold text-neutral-900">
								배송 예상 기간 · Delivery estimate
							</p>
							<p class="mt-1 text-sm leading-relaxed text-neutral-600">
								발송 후 상품 도착까지는 <strong class="text-neutral-900"
									>3–5 영업일</strong
								>
								정도 여유를 두고 기다려 주시면 감사하겠습니다.
								<span class="mt-1 block text-xs text-neutral-500">
									Please allow 3–5 business days after dispatch for delivery.
								</span>
							</p>
						</div>
					</li>
				</ul>
			</section>

			<!-- II. Restrictions -->
			<section id="restrictions">
				<p class="text-brand-green text-xs font-bold tracking-[0.3em] uppercase">Section II</p>
				<h2 class="mt-2 text-2xl font-extrabold text-neutral-900 sm:text-3xl">
					배송 유의 사항
					<span class="mt-0.5 block text-base font-semibold text-neutral-500 sm:text-lg">
						Restrictions &amp; Holidays
					</span>
				</h2>

				<div class="mt-6 grid gap-4 sm:grid-cols-2">
					<div class="rounded-2xl bg-white p-5 ring-1 ring-black/5">
						<div
							class="bg-brand-amber/15 text-brand-amber flex size-10 items-center justify-center rounded-xl"
						>
							<CalendarX2 class="size-5" />
						</div>
						<h3 class="mt-4 text-base font-bold text-neutral-900">
							배송 휴무일
							<span class="block text-xs font-semibold text-neutral-500">
								Non-delivery days
							</span>
						</h3>
						<p class="mt-2 text-sm leading-relaxed text-neutral-600">
							원활한 배송을 위해 <strong class="text-neutral-900">주말(토/일)</strong>과
							<strong class="text-neutral-900">법정 공휴일</strong>에는 배송 업무가
							쉬어갑니다.
						</p>
						<p class="mt-1 text-xs text-neutral-500">
							We do not ship on weekends or Korean public holidays.
						</p>
					</div>

					<div class="rounded-2xl bg-white p-5 ring-1 ring-black/5">
						<div
							class="bg-brand-green/10 text-brand-green flex size-10 items-center justify-center rounded-xl"
						>
							<MapPin class="size-5" />
						</div>
						<h3 class="mt-4 text-base font-bold text-neutral-900">
							주소 제한
							<span class="block text-xs font-semibold text-neutral-500">
								Address restrictions
							</span>
						</h3>
						<p class="mt-2 text-sm leading-relaxed text-neutral-600">
							죄송하지만, 택배 및 화물 운송 서비스는 <strong class="text-neutral-900"
								>PO Box (우체국 사서함)</strong
							>
							주소로 배송이 불가한 점 양해 부탁드립니다.
						</p>
						<p class="mt-1 text-xs text-neutral-500">
							Couriers do not deliver to PO Box addresses.
						</p>
					</div>

					<div class="rounded-2xl bg-white p-5 ring-1 ring-black/5 sm:col-span-2">
						<div
							class="bg-brand-charcoal/10 text-brand-charcoal flex size-10 items-center justify-center rounded-xl"
						>
							<Split class="size-5" />
						</div>
						<h3 class="mt-4 text-base font-bold text-neutral-900">
							분할 배송
							<span class="block text-xs font-semibold text-neutral-500">
								Separate shipment
							</span>
						</h3>
						<p class="mt-2 text-sm leading-relaxed text-neutral-600">
							고객님의 신속한 수령을 위해, 여러 상품을 함께 주문하신 경우 따로 나누어
							배송될 수 있습니다.
						</p>
						<p class="mt-1 text-xs text-neutral-500">
							Multi-item orders may arrive in separate shipments so nothing is delayed by
							a single slow item.
						</p>
					</div>
				</div>
			</section>

			<!-- III. Fees -->
			<section id="fees">
				<p class="text-brand-green text-xs font-bold tracking-[0.3em] uppercase">Section III</p>
				<h2 class="mt-2 text-2xl font-extrabold text-neutral-900 sm:text-3xl">
					배송비 안내
					<span class="mt-0.5 block text-base font-semibold text-neutral-500 sm:text-lg">
						Shipping Fees
					</span>
				</h2>

				<div class="mt-6 grid gap-4 sm:grid-cols-2">
					<div
						class="border-brand-green/30 bg-brand-green/5 rounded-2xl border p-5"
					>
						<p class="text-brand-green text-xs font-bold tracking-widest uppercase">
							Base fee · 기본 배송비
						</p>
						<p class="mt-2 text-3xl font-extrabold text-neutral-900">
							{baseFee}<span class="text-lg font-bold text-neutral-500">원~</span>
						</p>
						<p class="mt-2 text-sm text-neutral-600">
							배송비는 주문 상품의 <strong class="text-neutral-900">무게에 따라</strong>
							산정되며, 기본 배송비는 <strong class="text-neutral-900">{baseFee}원</strong>부터
							시작됩니다.
						</p>
					</div>

					<div
						class="border-brand-amber/50 bg-brand-amber/15 rounded-2xl border p-5"
					>
						<p class="text-xs font-bold tracking-widest text-neutral-900 uppercase">
							Free shipping · 무료배송
						</p>
						<p class="mt-2 text-3xl font-extrabold text-neutral-900">
							{freeThreshold}<span class="text-lg font-bold text-neutral-500">원 이상</span>
						</p>
						<p class="mt-2 text-sm text-neutral-600">
							주문 금액이 <strong class="text-neutral-900">{freeThreshold}원 이상</strong>인
							경우 무료배송 혜택이 적용됩니다.
						</p>
					</div>
				</div>

				<div
					class="mt-5 flex items-start gap-3 rounded-2xl bg-white p-5 ring-1 ring-black/5"
				>
					<div
						class="bg-brand-green/10 text-brand-green flex size-10 shrink-0 items-center justify-center rounded-xl"
					>
						<Snowflake class="size-5" />
					</div>
					<div>
						<p class="text-sm font-bold text-neutral-900">
							신선 · 냉동/냉장 상품 포장
							<span class="block text-xs font-semibold text-neutral-500">
								Fresh &amp; cold-chain packaging
							</span>
						</p>
						<p class="mt-2 text-sm leading-relaxed text-neutral-600">
							신선 식품 및 냉동/냉장 상품의 경우, 품질 유지를 위해
							<strong class="text-neutral-900">별도의 포장 방법</strong>이 적용될 수
							있습니다.
						</p>
						<p class="mt-1 text-xs text-neutral-500">
							Fresh, chilled, and frozen items may ship with dedicated cold packaging to
							protect quality.
						</p>
					</div>
				</div>
			</section>

			<!-- IV. Contact -->
			<section id="contact">
				<p class="text-brand-green text-xs font-bold tracking-[0.3em] uppercase">Section IV</p>
				<h2 class="mt-2 text-2xl font-extrabold text-neutral-900 sm:text-3xl">
					문의처
					<span class="mt-0.5 block text-base font-semibold text-neutral-500 sm:text-lg">
						Contact Us
					</span>
				</h2>
				<p class="mt-4 text-base leading-relaxed text-neutral-600">
					배송 관련 문의사항이 있으시면 아래로 연락해 주십시오.
				</p>

				<div class="mt-6 rounded-2xl bg-white ring-1 ring-black/5">
					<dl class="divide-y divide-neutral-100">
						<div class="grid gap-1 p-4 sm:grid-cols-[200px_1fr] sm:gap-4">
							<dt class="text-sm font-semibold text-neutral-500">상호명 · Business</dt>
							<dd class="text-sm font-medium text-neutral-900">{site.name}</dd>
						</div>
						<div class="grid gap-1 p-4 sm:grid-cols-[200px_1fr] sm:gap-4">
							<dt class="text-sm font-semibold text-neutral-500">주소 · Address</dt>
							<dd class="text-sm font-medium text-neutral-900">
								{site.address.kr} ({site.address.postcode})
								<span class="mt-0.5 block text-xs text-neutral-500">
									{site.address.en}
								</span>
							</dd>
						</div>
						<div class="grid gap-1 p-4 sm:grid-cols-[200px_1fr] sm:gap-4">
							<dt class="text-sm font-semibold text-neutral-500">전화 · Phone</dt>
							<dd class="text-sm font-medium text-neutral-900">
								<a href={telHref(site.phone.primary)} class="hover:text-brand-green">
									{site.phone.primary}
								</a>
								{#if site.phone.secondary}
									<span class="text-neutral-400"> / </span>
									<a href={telHref(site.phone.secondary)} class="hover:text-brand-green">
										{site.phone.secondary}
									</a>
								{/if}
							</dd>
						</div>
						<div class="grid gap-1 p-4 sm:grid-cols-[200px_1fr] sm:gap-4">
							<dt class="text-sm font-semibold text-neutral-500">이메일 · Email</dt>
							<dd class="text-sm font-medium text-neutral-900">
								<a href={`mailto:${site.email}`} class="hover:text-brand-green">
									{site.email}
								</a>
							</dd>
						</div>
					</dl>
				</div>
			</section>
		</div>

		<!-- Sidebar contact card -->
		<aside class="lg:sticky lg:top-24 lg:self-start">
			<div class="bg-brand-green relative overflow-hidden rounded-3xl p-6 text-white sm:p-8">
				<div
					class="bg-brand-amber/25 pointer-events-none absolute -top-24 -right-16 size-64 rounded-full blur-3xl"
				></div>
				<div class="relative">
					<p class="text-brand-amber text-xs font-bold tracking-[0.3em] uppercase">
						Track an order
					</p>
					<h3 class="mt-2 text-xl font-extrabold sm:text-2xl">
						Where&apos;s my order?
					</h3>
					<p class="mt-3 text-sm leading-relaxed text-white/80">
						주문 상태는 계정에서 실시간으로 확인하실 수 있습니다. 배송 관련 문의는 아래로
						연락 주세요.
					</p>

					<div class="mt-6 space-y-3">
						<a
							href="/account/orders"
							class="flex items-start gap-3 rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm transition hover:bg-white/15"
						>
							<Info class="mt-0.5 size-4 shrink-0" />
							<div class="min-w-0">
								<p class="text-[10px] font-bold tracking-wider text-white/60 uppercase">
									My orders
								</p>
								<p class="mt-0.5 text-sm font-semibold">View order status</p>
							</div>
						</a>
						<a
							href={`mailto:${site.email}`}
							class="flex items-start gap-3 rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm transition hover:bg-white/15"
						>
							<Mail class="mt-0.5 size-4 shrink-0" />
							<div class="min-w-0">
								<p class="text-[10px] font-bold tracking-wider text-white/60 uppercase">
									Email
								</p>
								<p class="mt-0.5 truncate text-sm font-semibold">{site.email}</p>
							</div>
						</a>
						<a
							href={telHref(site.phone.primary)}
							class="flex items-start gap-3 rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm transition hover:bg-white/15"
						>
							<Phone class="mt-0.5 size-4 shrink-0" />
							<div class="min-w-0">
								<p class="text-[10px] font-bold tracking-wider text-white/60 uppercase">
									Phone
								</p>
								<p class="mt-0.5 text-sm font-semibold">{site.phone.primary}</p>
							</div>
						</a>
					</div>
				</div>
			</div>
		</aside>
	</div>
</article>
