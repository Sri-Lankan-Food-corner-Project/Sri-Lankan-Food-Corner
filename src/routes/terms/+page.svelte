<script lang="ts">
	import { site, telHref } from '$lib/config/site';
	import SEO from '$lib/components/SEO.svelte';
	import { SITE_URL } from '$lib/config/seo';
	import {
		BookOpen,
		FileText,
		Gavel,
		Mail,
		Package,
		Phone,
		RefreshCw,
		Scale,
		ShieldAlert,
		Sparkles,
		UserCircle
	} from '@lucide/svelte';

	const lastUpdated = '2026년 7월 7일';
	const lastUpdatedEn = 'July 7, 2026';

	const termsJsonLd = {
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		name: 'Terms and Conditions',
		url: `${SITE_URL}/terms`,
		description:
			'Terms and conditions for using Sri Lankan Food Corner — governing the use of our online store, accounts, orders, and payments.',
		publisher: {
			'@type': 'Organization',
			name: site.name
		}
	};

	const sections = [
		{
			id: 'agreement',
			icon: BookOpen,
			numeral: 'I',
			titleKr: '목적 및 동의',
			titleEn: 'Purpose & Acceptance'
		},
		{
			id: 'definitions',
			icon: FileText,
			numeral: 'II',
			titleKr: '정의',
			titleEn: 'Definitions'
		},
		{
			id: 'account',
			icon: UserCircle,
			numeral: 'III',
			titleKr: '회원가입 및 계정',
			titleEn: 'Account & Membership'
		},
		{
			id: 'orders',
			icon: Package,
			numeral: 'IV',
			titleKr: '주문 및 결제',
			titleEn: 'Orders & Payment'
		},
		{
			id: 'returns',
			icon: RefreshCw,
			numeral: 'V',
			titleKr: '취소·반품·환불',
			titleEn: 'Cancellation & Refund'
		},
		{
			id: 'conduct',
			icon: ShieldAlert,
			numeral: 'VI',
			titleKr: '이용자의 의무',
			titleEn: "User's Obligations"
		},
		{
			id: 'ip',
			icon: Sparkles,
			numeral: 'VII',
			titleKr: '지식재산권',
			titleEn: 'Intellectual Property'
		},
		{
			id: 'liability',
			icon: Scale,
			numeral: 'VIII',
			titleKr: '책임의 제한',
			titleEn: 'Limitation of Liability'
		},
		{
			id: 'law',
			icon: Gavel,
			numeral: 'IX',
			titleKr: '준거법 및 관할',
			titleEn: 'Governing Law'
		},
		{
			id: 'contact',
			icon: Mail,
			numeral: 'X',
			titleKr: '문의처',
			titleEn: 'Contact Us'
		}
	];
</script>

<SEO
	title="Terms and Conditions | 이용약관"
	description="Terms and conditions governing the use of {site.name} — account, orders, payments, refunds, and liability."
	type="website"
	jsonLd={termsJsonLd}
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
			이용약관
			<span class="mt-1 block text-xl font-semibold text-white/80 sm:text-2xl lg:text-3xl">
				Terms and Conditions
			</span>
		</h1>
		<p class="mt-4 max-w-2xl text-sm text-white/85 sm:text-base">
			본 약관은 {site.name} 웹사이트 이용에 관한 조건과 절차, 회원과 회사의 권리·의무 및
			책임 사항을 규정합니다.
		</p>
		<p class="mt-3 text-xs font-medium text-white/70">
			최종 업데이트 · Last updated: {lastUpdated} ({lastUpdatedEn})
		</p>
	</div>
</section>

<!-- Table of contents -->
<section class="bg-brand-sand border-b border-neutral-200">
	<div class="mx-auto max-w-350 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
		<p class="text-brand-green text-xs font-bold tracking-[0.3em] uppercase">Sections</p>
		<h2 class="mt-2 text-lg font-bold text-neutral-900 sm:text-xl">On this page</h2>
		<ul class="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
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
			<!-- I. Purpose & Acceptance -->
			<section id="agreement">
				<p class="text-brand-green text-xs font-bold tracking-[0.3em] uppercase">Section I</p>
				<h2 class="mt-2 text-2xl font-extrabold text-neutral-900 sm:text-3xl">
					목적 및 동의
					<span class="mt-0.5 block text-base font-semibold text-neutral-500 sm:text-lg">
						Purpose &amp; Acceptance
					</span>
				</h2>
				<p class="mt-4 text-base leading-relaxed text-neutral-600">
					본 약관은 {site.name}(&ldquo;당사&rdquo;)가 운영하는 온라인 쇼핑몰에서 제공하는
					서비스의 이용조건 및 절차, 회원과 당사의 권리·의무·책임사항을 규정합니다.
					서비스를 이용하시는 경우 본 약관에 동의한 것으로 간주됩니다.
				</p>
				<p class="mt-3 text-base leading-relaxed text-neutral-600">
					By accessing or placing an order with {site.name}, you agree to be bound by these
					Terms and Conditions and all applicable Korean laws, including the
					<strong class="text-neutral-900">
						Act on Consumer Protection in Electronic Commerce
					</strong>.
				</p>
			</section>

			<!-- II. Definitions -->
			<section id="definitions">
				<p class="text-brand-green text-xs font-bold tracking-[0.3em] uppercase">Section II</p>
				<h2 class="mt-2 text-2xl font-extrabold text-neutral-900 sm:text-3xl">
					정의
					<span class="mt-0.5 block text-base font-semibold text-neutral-500 sm:text-lg">
						Definitions
					</span>
				</h2>
				<div class="mt-5 rounded-2xl bg-white ring-1 ring-black/5">
					<dl class="divide-y divide-neutral-100">
						<div class="grid gap-1 p-4 sm:grid-cols-[220px_1fr] sm:gap-4">
							<dt class="text-sm font-semibold text-neutral-900">&ldquo;서비스&rdquo; · Service</dt>
							<dd class="text-sm text-neutral-600">
								당사가 웹사이트 및 관련 채널을 통해 제공하는 상품 판매 및 배송 서비스
								일체.
							</dd>
						</div>
						<div class="grid gap-1 p-4 sm:grid-cols-[220px_1fr] sm:gap-4">
							<dt class="text-sm font-semibold text-neutral-900">&ldquo;회원&rdquo; · Member</dt>
							<dd class="text-sm text-neutral-600">
								약관에 동의하고 회원가입을 완료한 개인 또는 법인.
							</dd>
						</div>
						<div class="grid gap-1 p-4 sm:grid-cols-[220px_1fr] sm:gap-4">
							<dt class="text-sm font-semibold text-neutral-900">&ldquo;주문&rdquo; · Order</dt>
							<dd class="text-sm text-neutral-600">
								회원이 서비스에서 상품 구매 의사를 표시한 행위.
							</dd>
						</div>
						<div class="grid gap-1 p-4 sm:grid-cols-[220px_1fr] sm:gap-4">
							<dt class="text-sm font-semibold text-neutral-900">
								&ldquo;콘텐츠&rdquo; · Content
							</dt>
							<dd class="text-sm text-neutral-600">
								서비스에 게시된 텍스트, 이미지, 상표, 디자인 등 모든 자료.
							</dd>
						</div>
					</dl>
				</div>
			</section>

			<!-- III. Account -->
			<section id="account">
				<p class="text-brand-green text-xs font-bold tracking-[0.3em] uppercase">Section III</p>
				<h2 class="mt-2 text-2xl font-extrabold text-neutral-900 sm:text-3xl">
					회원가입 및 계정
					<span class="mt-0.5 block text-base font-semibold text-neutral-500 sm:text-lg">
						Account &amp; Membership
					</span>
				</h2>

				<h3 class="mt-8 text-lg font-bold text-neutral-900">
					3.1 가입 자격 · Eligibility
				</h3>
				<p class="mt-3 text-base leading-relaxed text-neutral-600">
					회원가입은 만 14세 이상의 개인 또는 법인이 신청할 수 있으며, 정확한 정보를
					제공해야 합니다.
				</p>

				<h3 class="mt-8 text-lg font-bold text-neutral-900">
					3.2 계정 보안 · Account Security
				</h3>
				<p class="mt-3 text-base leading-relaxed text-neutral-600">
					회원은 <strong class="text-neutral-900">본인의 계정 정보</strong>(비밀번호 포함)를
					안전하게 관리할 책임이 있으며, 계정 도용이 의심되는 경우 즉시 당사에 통지해야
					합니다.
				</p>

				<h3 class="mt-8 text-lg font-bold text-neutral-900">
					3.3 계정 해지 · Termination
				</h3>
				<p class="mt-3 text-base leading-relaxed text-neutral-600">
					회원은 언제든지 계정 해지를 요청할 수 있으며, 당사는 약관 위반 시 사전 통지 후
					계정을 해지할 수 있습니다.
				</p>
			</section>

			<!-- IV. Orders -->
			<section id="orders">
				<p class="text-brand-green text-xs font-bold tracking-[0.3em] uppercase">Section IV</p>
				<h2 class="mt-2 text-2xl font-extrabold text-neutral-900 sm:text-3xl">
					주문 및 결제
					<span class="mt-0.5 block text-base font-semibold text-neutral-500 sm:text-lg">
						Orders &amp; Payment
					</span>
				</h2>

				<h3 class="mt-8 text-lg font-bold text-neutral-900">
					4.1 주문 성립 · Order Confirmation
				</h3>
				<p class="mt-3 text-base leading-relaxed text-neutral-600">
					주문은 회원의 결제 완료 및 당사의 주문 확인 통지가 있을 때 성립합니다. 재고 부족,
					가격 오류 등 부득이한 사유가 있는 경우 당사는 주문을 거절하거나 취소할 수
					있습니다.
				</p>

				<h3 class="mt-8 text-lg font-bold text-neutral-900">
					4.2 가격 및 통화 · Pricing
				</h3>
				<p class="mt-3 text-base leading-relaxed text-neutral-600">
					모든 가격은 <strong class="text-neutral-900">대한민국 원(KRW)</strong>으로
					표시되며, 부가가치세가 포함된 금액입니다. 배송비는 별도로 부과될 수 있습니다.
				</p>

				<h3 class="mt-8 text-lg font-bold text-neutral-900">
					4.3 결제 수단 · Payment Methods
				</h3>
				<p class="mt-3 text-base leading-relaxed text-neutral-600">
					당사는 계좌이체 및 승인된 결제 대행사를 통해 결제를 처리합니다. 결제 정보는
					당사의
					<a href="/privacy" class="text-brand-green font-semibold underline hover:no-underline">
						개인정보처리방침
					</a>
					에 따라 안전하게 처리됩니다.
				</p>

				<h3 class="mt-8 text-lg font-bold text-neutral-900">
					4.4 배송 · Delivery
				</h3>
				<p class="mt-3 text-base leading-relaxed text-neutral-600">
					배송 조건, 소요 기간 및 배송비에 관한 사항은
					<a
						href="/shipping"
						class="text-brand-green font-semibold underline hover:no-underline"
					>
						배송 정책
					</a>
					을 참조하시기 바랍니다.
				</p>
			</section>

			<!-- V. Cancellation & Refund -->
			<section id="returns">
				<p class="text-brand-green text-xs font-bold tracking-[0.3em] uppercase">Section V</p>
				<h2 class="mt-2 text-2xl font-extrabold text-neutral-900 sm:text-3xl">
					취소 · 반품 · 환불
					<span class="mt-0.5 block text-base font-semibold text-neutral-500 sm:text-lg">
						Cancellation, Returns &amp; Refunds
					</span>
				</h2>
				<p class="mt-4 text-base leading-relaxed text-neutral-600">
					회원은 「전자상거래 등에서의 소비자보호에 관한 법률」에 따라 상품 수령일로부터
					<strong class="text-neutral-900">7일 이내</strong>에 반품 또는 교환을 요청할 수
					있습니다. 다만 신선·냉동·개봉 식품 등 반품이 제한되는 품목이 있습니다.
				</p>

				<div
					class="border-brand-green/30 bg-brand-green/5 mt-5 flex items-start gap-3 rounded-2xl border p-4"
				>
					<RefreshCw class="text-brand-green mt-0.5 size-5 shrink-0" />
					<p class="text-sm leading-relaxed text-neutral-700">
						자세한 조건, 절차 및 환불 처리 기간은
						<a
							href="/returns"
							class="text-brand-green font-semibold underline hover:no-underline"
						>
							반품 및 환불 정책
						</a>
						을 확인해 주십시오.
						<span class="mt-1 block text-xs text-neutral-500">
							See the Return &amp; Refund Policy for full conditions and process.
						</span>
					</p>
				</div>
			</section>

			<!-- VI. User Conduct -->
			<section id="conduct">
				<p class="text-brand-green text-xs font-bold tracking-[0.3em] uppercase">Section VI</p>
				<h2 class="mt-2 text-2xl font-extrabold text-neutral-900 sm:text-3xl">
					이용자의 의무
					<span class="mt-0.5 block text-base font-semibold text-neutral-500 sm:text-lg">
						User&apos;s Obligations
					</span>
				</h2>
				<p class="mt-4 text-base leading-relaxed text-neutral-600">
					회원은 다음 행위를 해서는 안 됩니다:
				</p>
				<ul class="mt-4 space-y-3 text-base leading-relaxed text-neutral-600">
					<li class="flex gap-3">
						<span class="bg-brand-green mt-2 size-1.5 shrink-0 rounded-full"></span>
						<span>허위 정보 등록 또는 타인의 정보 도용</span>
					</li>
					<li class="flex gap-3">
						<span class="bg-brand-green mt-2 size-1.5 shrink-0 rounded-full"></span>
						<span>서비스 운영을 방해하거나 정보를 무단으로 수집하는 행위</span>
					</li>
					<li class="flex gap-3">
						<span class="bg-brand-green mt-2 size-1.5 shrink-0 rounded-full"></span>
						<span>당사 또는 제3자의 지식재산권을 침해하는 행위</span>
					</li>
					<li class="flex gap-3">
						<span class="bg-brand-green mt-2 size-1.5 shrink-0 rounded-full"></span>
						<span>법령 또는 공공질서·미풍양속을 위반하는 행위</span>
					</li>
				</ul>
			</section>

			<!-- VII. IP -->
			<section id="ip">
				<p class="text-brand-green text-xs font-bold tracking-[0.3em] uppercase">Section VII</p>
				<h2 class="mt-2 text-2xl font-extrabold text-neutral-900 sm:text-3xl">
					지식재산권
					<span class="mt-0.5 block text-base font-semibold text-neutral-500 sm:text-lg">
						Intellectual Property
					</span>
				</h2>
				<p class="mt-4 text-base leading-relaxed text-neutral-600">
					서비스에 게시된 상표, 로고, 이미지, 텍스트 등 모든 콘텐츠에 대한 지식재산권은
					당사 또는 정당한 권리자에게 있습니다. 회원은 사전 서면 동의 없이 이를 복제,
					배포, 상업적으로 이용할 수 없습니다.
				</p>
				<p class="mt-3 text-base leading-relaxed text-neutral-600">
					All content displayed on {site.name} — including trademarks, logos, images, and
					product descriptions — is the property of {site.name} or its licensors and is
					protected by copyright and trademark law.
				</p>
			</section>

			<!-- VIII. Liability -->
			<section id="liability">
				<p class="text-brand-green text-xs font-bold tracking-[0.3em] uppercase">Section VIII</p>
				<h2 class="mt-2 text-2xl font-extrabold text-neutral-900 sm:text-3xl">
					책임의 제한
					<span class="mt-0.5 block text-base font-semibold text-neutral-500 sm:text-lg">
						Limitation of Liability
					</span>
				</h2>
				<p class="mt-4 text-base leading-relaxed text-neutral-600">
					당사는 천재지변, 통신 장애, 결제 대행사 오류 등
					<strong class="text-neutral-900">당사의 귀책사유 없이 발생한 손해</strong>에
					대해서는 책임을 지지 않습니다. 관련 법령이 허용하는 최대 범위 내에서, 당사의
					책임은 해당 주문 금액을 초과하지 않습니다.
				</p>
				<p class="mt-3 text-base leading-relaxed text-neutral-600">
					Nothing in these terms limits our liability where limitation is not permitted by
					applicable Korean consumer-protection law.
				</p>
			</section>

			<!-- IX. Governing Law -->
			<section id="law">
				<p class="text-brand-green text-xs font-bold tracking-[0.3em] uppercase">Section IX</p>
				<h2 class="mt-2 text-2xl font-extrabold text-neutral-900 sm:text-3xl">
					준거법 및 관할
					<span class="mt-0.5 block text-base font-semibold text-neutral-500 sm:text-lg">
						Governing Law &amp; Jurisdiction
					</span>
				</h2>
				<p class="mt-4 text-base leading-relaxed text-neutral-600">
					본 약관은 <strong class="text-neutral-900">대한민국 법률</strong>에 따라
					해석되며, 서비스 이용과 관련하여 발생한 분쟁은 관련 법령에 따른 관할 법원의
					판결에 따릅니다.
				</p>
				<p class="mt-3 text-base leading-relaxed text-neutral-600">
					These Terms are governed by the laws of the Republic of Korea. Disputes will be
					resolved by the competent Korean courts as determined under applicable law.
				</p>
			</section>

			<!-- X. Contact -->
			<section id="contact">
				<p class="text-brand-green text-xs font-bold tracking-[0.3em] uppercase">Section X</p>
				<h2 class="mt-2 text-2xl font-extrabold text-neutral-900 sm:text-3xl">
					문의처
					<span class="mt-0.5 block text-base font-semibold text-neutral-500 sm:text-lg">
						Contact Us
					</span>
				</h2>
				<p class="mt-4 text-base leading-relaxed text-neutral-600">
					본 약관에 대한 문의는 아래로 연락해 주십시오.
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

		<!-- Sidebar related links -->
		<aside class="lg:sticky lg:top-24 lg:self-start">
			<div class="bg-brand-green relative overflow-hidden rounded-3xl p-6 text-white sm:p-8">
				<div
					class="bg-brand-amber/25 pointer-events-none absolute -top-24 -right-16 size-64 rounded-full blur-3xl"
				></div>
				<div class="relative">
					<p class="text-brand-amber text-xs font-bold tracking-[0.3em] uppercase">
						Related policies
					</p>
					<h3 class="mt-2 text-xl font-extrabold sm:text-2xl">
						Read alongside the terms.
					</h3>
					<p class="mt-3 text-sm leading-relaxed text-white/80">
						이용약관과 함께 개인정보처리방침 및 배송·반품 정책도 확인해 주십시오.
					</p>

					<div class="mt-6 space-y-3">
						<a
							href="/privacy"
							class="flex items-start gap-3 rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm transition hover:bg-white/15"
						>
							<FileText class="mt-0.5 size-4 shrink-0" />
							<div class="min-w-0">
								<p class="text-[10px] font-bold tracking-wider text-white/60 uppercase">
									Privacy
								</p>
								<p class="mt-0.5 text-sm font-semibold">개인정보처리방침</p>
							</div>
						</a>
						<a
							href="/returns"
							class="flex items-start gap-3 rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm transition hover:bg-white/15"
						>
							<RefreshCw class="mt-0.5 size-4 shrink-0" />
							<div class="min-w-0">
								<p class="text-[10px] font-bold tracking-wider text-white/60 uppercase">
									Returns
								</p>
								<p class="mt-0.5 text-sm font-semibold">반품 및 환불 정책</p>
							</div>
						</a>
						<a
							href="/shipping"
							class="flex items-start gap-3 rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm transition hover:bg-white/15"
						>
							<Package class="mt-0.5 size-4 shrink-0" />
							<div class="min-w-0">
								<p class="text-[10px] font-bold tracking-wider text-white/60 uppercase">
									Shipping
								</p>
								<p class="mt-0.5 text-sm font-semibold">배송 정책</p>
							</div>
						</a>
						<a
							href={`mailto:${site.email}`}
							class="flex items-start gap-3 rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm transition hover:bg-white/15"
						>
							<Mail class="mt-0.5 size-4 shrink-0" />
							<div class="min-w-0">
								<p class="text-[10px] font-bold tracking-wider text-white/60 uppercase">
									Questions?
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
