<script lang="ts">
	import { site, telHref } from '$lib/config/site';
	import SEO from '$lib/components/SEO.svelte';
	import { SITE_URL } from '$lib/config/seo';
	import {
		AlertTriangle,
		CheckCircle2,
		ClipboardList,
		Mail,
		MapPin,
		Package,
		Phone,
		RotateCcw,
		Truck,
		Wallet,
		XCircle
	} from '@lucide/svelte';

	const lastUpdated = '2026년 7월 7일';
	const lastUpdatedEn = 'July 7, 2026';

	const returnsJsonLd = {
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		name: 'Return and Refund Policy',
		url: `${SITE_URL}/returns`,
		description:
			'Return and refund policy for Sri Lankan Food Corner. Compliant with Korea’s Act on Consumer Protection in Electronic Commerce.',
		publisher: {
			'@type': 'Organization',
			name: site.name
		}
	};

	const sections = [
		{
			id: 'overview',
			icon: ClipboardList,
			numeral: 'I',
			titleKr: '정책 개요',
			titleEn: 'Policy Overview'
		},
		{
			id: 'eligibility',
			icon: CheckCircle2,
			numeral: 'II',
			titleKr: '반품 자격 및 불가 품목',
			titleEn: 'Eligibility & Non-Returnable'
		},
		{
			id: 'process',
			icon: RotateCcw,
			numeral: 'III',
			titleKr: '절차 및 환불',
			titleEn: 'Process and Refunds'
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
	title="Returns & Refunds | 반품 및 환불 정책"
	description="Return and refund policy for {site.name}. 7-day return window, conditions, non-returnable items, and refund process."
	type="website"
	jsonLd={returnsJsonLd}
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
			반품 및 환불 정책
			<span class="mt-1 block text-xl font-semibold text-white/80 sm:text-2xl lg:text-3xl">
				Return &amp; Refund Policy
			</span>
		</h1>
		<p class="mt-4 max-w-2xl text-sm text-white/85 sm:text-base">
			{site.name} follows Korea&apos;s Act on Consumer Protection in Electronic Commerce.
			Below are the conditions under which returns and refunds are processed.
		</p>
		<p class="mt-3 text-xs font-medium text-white/70">
			최종 업데이트 · Last updated: {lastUpdated} ({lastUpdatedEn})
		</p>
	</div>
</section>

<!-- Quick facts strip -->
<section class="bg-brand-cream border-b border-neutral-200">
	<div class="mx-auto max-w-350 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
		<div class="grid gap-4 sm:grid-cols-3">
			<div class="flex items-start gap-3">
				<div
					class="bg-brand-green/10 text-brand-green flex size-10 shrink-0 items-center justify-center rounded-xl"
				>
					<RotateCcw class="size-5" />
				</div>
				<div>
					<p class="text-[10px] font-bold tracking-widest text-neutral-500 uppercase">
						Return window
					</p>
					<p class="mt-0.5 text-sm font-bold text-neutral-900">7일 이내 · Within 7 days</p>
					<p class="mt-0.5 text-xs text-neutral-500">from delivery</p>
				</div>
			</div>
			<div class="flex items-start gap-3">
				<div
					class="bg-brand-amber/15 text-brand-amber flex size-10 shrink-0 items-center justify-center rounded-xl"
				>
					<Wallet class="size-5" />
				</div>
				<div>
					<p class="text-[10px] font-bold tracking-widest text-neutral-500 uppercase">
						Refund time
					</p>
					<p class="mt-0.5 text-sm font-bold text-neutral-900">
						7영업일 이내 · Within 7 business days
					</p>
					<p class="mt-0.5 text-xs text-neutral-500">after inspection</p>
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
						Return shipping
					</p>
					<p class="mt-0.5 text-sm font-bold text-neutral-900">고객 부담 · Buyer pays</p>
					<p class="mt-0.5 text-xs text-neutral-500">unless item is damaged/incorrect</p>
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
			<!-- I. Overview -->
			<section id="overview">
				<p class="text-brand-green text-xs font-bold tracking-[0.3em] uppercase">Section I</p>
				<h2 class="mt-2 text-2xl font-extrabold text-neutral-900 sm:text-3xl">
					정책 개요
					<span class="mt-0.5 block text-base font-semibold text-neutral-500 sm:text-lg">
						Policy Overview
					</span>
				</h2>

				<h3 class="mt-8 text-lg font-bold text-neutral-900">
					A. 일반 규정 · General Provisions
				</h3>
				<p class="mt-3 text-base leading-relaxed text-neutral-600">
					{site.name}는 고객 만족을 위해 노력합니다. 본 정책은 대한민국
					<strong class="text-neutral-900">
						「전자상거래 등에서의 소비자보호에 관한 법률」
					</strong>
					에 따라 반품 및 환불이 처리되는 조건을 명시합니다.
				</p>
			</section>

			<!-- II. Eligibility -->
			<section id="eligibility">
				<p class="text-brand-green text-xs font-bold tracking-[0.3em] uppercase">Section II</p>
				<h2 class="mt-2 text-2xl font-extrabold text-neutral-900 sm:text-3xl">
					반품 자격 및 불가 품목
					<span class="mt-0.5 block text-base font-semibold text-neutral-500 sm:text-lg">
						Eligibility and Non-Returnable Items
					</span>
				</h2>

				<h3 class="mt-8 text-lg font-bold text-neutral-900">
					1. 일반 반품 기간 · General Return Window
				</h3>
				<div
					class="border-brand-green/30 bg-brand-green/5 mt-4 flex items-start gap-3 rounded-2xl border p-4"
				>
					<div
						class="bg-brand-green/10 text-brand-green flex size-10 shrink-0 items-center justify-center rounded-xl"
					>
						<RotateCcw class="size-5" />
					</div>
					<p class="text-base leading-relaxed text-neutral-700">
						주문 상품 <strong class="text-neutral-900">수령일로부터 7일 이내</strong>에
						반품 또는 교환을 요청할 권리가 있습니다.
						<span class="mt-1 block text-sm text-neutral-500">
							You may request a return or exchange within 7 days of receiving your order.
						</span>
					</p>
				</div>

				<h3 class="mt-10 text-lg font-bold text-neutral-900">
					2. 유효한 반품 조건 · Conditions for a Valid Return
				</h3>
				<p class="mt-3 text-base leading-relaxed text-neutral-600">
					반품 자격을 얻으려면 상품은 <strong class="text-neutral-900">사용하지 않고,
					개봉하지 않은 상태로,</strong> 수령했을 때와 동일한 상태여야 합니다. 상품은 원래
					포장에 들어있어야 하며, 모든 반품에는 유효한 영수증 또는 구매 증빙 자료가
					필요합니다.
				</p>

				<h3 class="mt-10 text-lg font-bold text-neutral-900">
					3. 반품 불가 품목 · Non-Returnable Items
				</h3>
				<p class="mt-3 text-base leading-relaxed text-neutral-600">
					건강 및 안전 규정으로 인해 다음 유형의 상품은 반품이 불가능합니다:
				</p>

				<div class="mt-5 grid gap-3 sm:grid-cols-2">
					<div class="flex items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-black/5">
						<XCircle class="mt-0.5 size-5 shrink-0 text-red-500" />
						<div>
							<p class="text-sm font-bold text-neutral-900">
								변질되기 쉬운 상품
							</p>
							<p class="mt-0.5 text-xs text-neutral-500">
								Perishable goods — fresh vegetables, fruits, dairy
							</p>
						</div>
					</div>
					<div class="flex items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-black/5">
						<XCircle class="mt-0.5 size-5 shrink-0 text-red-500" />
						<div>
							<p class="text-sm font-bold text-neutral-900">냉동 식품</p>
							<p class="mt-0.5 text-xs text-neutral-500">Frozen food items</p>
						</div>
					</div>
					<div class="flex items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-black/5">
						<XCircle class="mt-0.5 size-5 shrink-0 text-red-500" />
						<div>
							<p class="text-sm font-bold text-neutral-900">개봉 또는 소비된 식품</p>
							<p class="mt-0.5 text-xs text-neutral-500">Opened or consumed food items</p>
						</div>
					</div>
					<div class="flex items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-black/5">
						<XCircle class="mt-0.5 size-5 shrink-0 text-red-500" />
						<div>
							<p class="text-sm font-bold text-neutral-900">
								유통기한 임박·경과 상품 (사전 고지된 경우)
							</p>
							<p class="mt-0.5 text-xs text-neutral-500">
								Items near or past expiry (when disclosed at purchase)
							</p>
						</div>
					</div>
				</div>
			</section>

			<!-- III. Process -->
			<section id="process">
				<p class="text-brand-green text-xs font-bold tracking-[0.3em] uppercase">Section III</p>
				<h2 class="mt-2 text-2xl font-extrabold text-neutral-900 sm:text-3xl">
					절차 및 환불
					<span class="mt-0.5 block text-base font-semibold text-neutral-500 sm:text-lg">
						Process and Refunds
					</span>
				</h2>

				<h3 class="mt-8 text-lg font-bold text-neutral-900">
					4. 반품 절차: 문의 및 발송 · Return Process: Contact and Shipment
				</h3>

				<!-- Steps -->
				<ol class="mt-5 space-y-4">
					<li class="flex items-start gap-4 rounded-2xl bg-white p-5 ring-1 ring-black/5">
						<div
							class="bg-brand-green flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-extrabold text-white"
						>
							1
						</div>
						<div class="min-w-0">
							<p class="text-sm font-bold text-neutral-900">
								문의 · Contact us
							</p>
							<p class="mt-1 text-sm leading-relaxed text-neutral-600">
								반품을 시작하려면 <strong class="text-neutral-900">주문 번호</strong>와
								<strong class="text-neutral-900">반품 사유</strong>를 명시하여 아래로 먼저
								문의해야 합니다.
							</p>
							<div class="mt-3 flex flex-wrap gap-2">
								<a
									href={`mailto:${site.email}`}
									class="ring-brand-green/20 hover:bg-brand-green/5 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-neutral-900 ring-1 transition"
								>
									<Mail class="size-3.5" />
									{site.email}
								</a>
								<a
									href={telHref(site.phone.primary)}
									class="ring-brand-green/20 hover:bg-brand-green/5 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-neutral-900 ring-1 transition"
								>
									<Phone class="size-3.5" />
									{site.phone.primary}
								</a>
								{#if site.phone.secondary}
									<a
										href={telHref(site.phone.secondary)}
										class="ring-brand-green/20 hover:bg-brand-green/5 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-neutral-900 ring-1 transition"
									>
										<Phone class="size-3.5" />
										{site.phone.secondary}
									</a>
								{/if}
							</div>
						</div>
					</li>

					<li class="flex items-start gap-4 rounded-2xl bg-white p-5 ring-1 ring-black/5">
						<div
							class="bg-brand-green flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-extrabold text-white"
						>
							2
						</div>
						<div class="min-w-0">
							<p class="text-sm font-bold text-neutral-900">
								상품 발송 · Ship the item back
							</p>
							<p class="mt-1 text-sm leading-relaxed text-neutral-600">
								반품이 승인되면, 아래 주소로 상품을 반송해야 하며
								<strong class="text-neutral-900">배송 비용은 고객 부담</strong>입니다.
							</p>
							<div
								class="bg-brand-cream/70 mt-3 flex items-start gap-3 rounded-xl p-4"
							>
								<MapPin class="text-brand-green mt-0.5 size-5 shrink-0" />
								<div class="text-sm">
									<p class="font-bold text-neutral-900">{site.name}</p>
									<p class="mt-0.5 text-neutral-700">
										{site.address.kr} ({site.address.postcode})
									</p>
									<p class="mt-0.5 text-xs text-neutral-500">{site.address.en}</p>
								</div>
							</div>
						</div>
					</li>
				</ol>

				<h3 class="mt-10 text-lg font-bold text-neutral-900">
					배송 비용 · Shipping Costs
				</h3>
				<div
					class="mt-4 flex items-start gap-3 rounded-2xl border border-amber-300/60 bg-amber-50 p-4"
				>
					<AlertTriangle class="mt-0.5 size-5 shrink-0 text-amber-600" />
					<p class="text-sm leading-relaxed text-neutral-700">
						반품 배송 비용은 <strong class="text-neutral-900">고객이 부담</strong>해야
						하며,
						<strong class="text-neutral-900">최초 배송비는 환불되지 않습니다.</strong>
						<span class="mt-1 block text-xs text-neutral-500">
							Return shipping is at the buyer&apos;s expense; the original shipping fee is
							non-refundable.
						</span>
					</p>
				</div>

				<h3 class="mt-10 text-lg font-bold text-neutral-900">
					5. 환불 처리 · Refunds
				</h3>
				<p class="mt-3 text-base leading-relaxed text-neutral-600">
					반품된 상품을 수령하고 검사한 후, 환불 승인 또는 거부 여부를 이메일로
					안내드립니다. 승인될 경우, <strong class="text-neutral-900">7영업일 이내에</strong>
					원래 결제 수단 또는 계좌 이체로 환불이 진행됩니다.
				</p>

				<h3 class="mt-10 text-lg font-bold text-neutral-900">
					6. 손상되거나 잘못된 품목 · Damaged or Incorrect Items
				</h3>
				<div
					class="border-brand-green/30 bg-brand-green/5 mt-4 flex items-start gap-3 rounded-2xl border p-4"
				>
					<Package class="text-brand-green mt-0.5 size-5 shrink-0" />
					<div class="text-sm leading-relaxed text-neutral-700">
						<p>
							손상되거나 잘못된 상품을 받은 경우,
							<strong class="text-neutral-900">해당 상품의 사진</strong>과
							<strong class="text-neutral-900">주문 번호</strong>를 첨부하여 아래
							이메일로 즉시 문의해 주십시오.
						</p>
						<p class="mt-2">
							<a
								href={`mailto:${site.email}`}
								class="text-brand-green inline-flex items-center gap-2 font-semibold underline hover:no-underline"
							>
								<Mail class="size-4" />
								{site.email}
							</a>
						</p>
						<p class="mt-2 text-neutral-600">교환 또는 환불을 신속히 처리해 드립니다.</p>
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
					본 반품 및 환불 정책에 대한 질문이 있으시면 아래로 연락해 주십시오.
				</p>

				<div class="mt-6 rounded-2xl bg-white ring-1 ring-black/5">
					<dl class="divide-y divide-neutral-100">
						<div class="grid gap-1 p-4 sm:grid-cols-[200px_1fr] sm:gap-4">
							<dt class="text-sm font-semibold text-neutral-500">상호명 · Business</dt>
							<dd class="text-sm font-medium text-neutral-900">{site.name}</dd>
						</div>
						<div class="grid gap-1 p-4 sm:grid-cols-[200px_1fr] sm:gap-4">
							<dt class="text-sm font-semibold text-neutral-500">사업자등록번호 · Reg. No.</dt>
							<dd class="text-sm font-medium text-neutral-900">
								{site.business.registrationNumber}
							</dd>
						</div>
						<div class="grid gap-1 p-4 sm:grid-cols-[200px_1fr] sm:gap-4">
							<dt class="text-sm font-semibold text-neutral-500">대표자 · Representative</dt>
							<dd class="text-sm font-medium text-neutral-900">
								{site.business.representative}
							</dd>
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
						Start a return
					</p>
					<h3 class="mt-2 text-xl font-extrabold sm:text-2xl">
						Need to return an order?
					</h3>
					<p class="mt-3 text-sm leading-relaxed text-white/80">
						주문 번호와 반품 사유를 함께 보내주시면 승인 후 반송 주소를 안내드립니다.
					</p>

					<div class="mt-6 space-y-3">
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
						<a
							href="/account/orders"
							class="flex items-start gap-3 rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm transition hover:bg-white/15"
						>
							<ClipboardList class="mt-0.5 size-4 shrink-0" />
							<div class="min-w-0">
								<p class="text-[10px] font-bold tracking-wider text-white/60 uppercase">
									Find order no.
								</p>
								<p class="mt-0.5 text-sm font-semibold">View my orders</p>
							</div>
						</a>
					</div>
				</div>
			</div>
		</aside>
	</div>
</article>
