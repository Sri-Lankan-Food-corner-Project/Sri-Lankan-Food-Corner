<script lang="ts">
	import { site, telHref } from '$lib/config/site';
	import SEO from '$lib/components/SEO.svelte';
	import { SITE_URL } from '$lib/config/seo';
	import {
		Cookie,
		FileText,
		Lock,
		Mail,
		MapPin,
		Phone,
		ShieldCheck,
		UserCheck,
		Users
	} from '@lucide/svelte';

	const lastUpdated = '2026년 7월 7일';
	const lastUpdatedEn = 'July 7, 2026';

	const privacyJsonLd = {
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		name: 'Privacy Policy',
		url: `${SITE_URL}/privacy`,
		description:
			'Privacy policy for Sri Lankan Food Corner — how we collect, use, and protect your personal information.',
		publisher: {
			'@type': 'Organization',
			name: site.name
		}
	};

	const sections = [
		{
			id: 'principles',
			icon: ShieldCheck,
			numeral: 'I',
			titleKr: '개인정보 보호 원칙 및 관리자',
			titleEn: 'Privacy Principles and Manager'
		},
		{
			id: 'collection',
			icon: FileText,
			numeral: 'II',
			titleKr: '개인정보 수집 목적 및 항목',
			titleEn: 'Information Collected and Purpose'
		},
		{
			id: 'cookies',
			icon: Cookie,
			numeral: 'III',
			titleKr: '쿠키 이용',
			titleEn: 'Use of Cookies'
		},
		{
			id: 'sharing',
			icon: Users,
			numeral: 'IV',
			titleKr: '개인정보 제3자 제공',
			titleEn: 'Sharing of Personal Information'
		},
		{
			id: 'retention',
			icon: Lock,
			numeral: 'V',
			titleKr: '정보 보유 및 이용 기간',
			titleEn: 'Period of Retention and Use'
		},
		{
			id: 'rights',
			icon: UserCheck,
			numeral: 'VI',
			titleKr: '정보 주체의 권리 및 보안',
			titleEn: 'Your Rights and Security'
		},
		{
			id: 'changes',
			icon: FileText,
			numeral: 'VII',
			titleKr: '정책 변경',
			titleEn: 'Changes to This Policy'
		},
		{
			id: 'contact',
			icon: Mail,
			numeral: 'VIII',
			titleKr: '문의처',
			titleEn: 'Contact Us'
		}
	];
</script>

<SEO
	title="Privacy Policy | 개인정보처리방침"
	description="How {site.name} collects, uses, and protects your personal information. Compliant with Korea's Personal Information Protection Act (PIPA)."
	type="website"
	jsonLd={privacyJsonLd}
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
			개인정보처리방침
			<span class="mt-1 block text-xl font-semibold text-white/80 sm:text-2xl lg:text-3xl">
				Privacy Policy
			</span>
		</h1>
		<p class="mt-4 max-w-2xl text-sm text-white/85 sm:text-base">
			{site.name} respects your privacy. This policy explains what we collect, how we use it,
			and the rights you have under Korea&apos;s Personal Information Protection Act (PIPA).
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
			<!-- I. Principles -->
			<section id="principles">
				<p class="text-brand-green text-xs font-bold tracking-[0.3em] uppercase">Section I</p>
				<h2 class="mt-2 text-2xl font-extrabold text-neutral-900 sm:text-3xl">
					개인정보 보호 원칙 및 관리자
					<span class="mt-0.5 block text-base font-semibold text-neutral-500 sm:text-lg">
						Privacy Principles and Manager
					</span>
				</h2>

				<h3 class="mt-8 text-lg font-bold text-neutral-900">
					1.1 정책 개요 및 준수 법규 · Policy Overview and Compliance
				</h3>
				<p class="mt-3 text-base leading-relaxed text-neutral-600">
					스리랑칸 푸드 코너({site.name}, &ldquo;당사&rdquo;)는 귀하의 개인정보 보호를 위해
					최선을 다하고 있습니다. 본 개인정보처리방침은 당사 웹사이트 방문 시 귀하의 정보를
					수집, 이용, 공개 및 보호하는 방법을 설명합니다.
				</p>
				<p class="mt-3 text-base leading-relaxed text-neutral-600">
					본 정책은 대한민국 <strong class="text-neutral-900">개인정보 보호법 (PIPA)</strong>을
					준수합니다.
				</p>

				<h3 class="mt-8 text-lg font-bold text-neutral-900">
					1.2 개인정보 보호 책임자 · Personal Information Manager
				</h3>
				<p class="mt-3 text-base leading-relaxed text-neutral-600">
					다음은 개인정보 처리에 대한 전반적인 관리 및 관련 불만 처리를 담당하는 개인정보 보호
					책임자 정보입니다.
				</p>

				<div class="mt-5 rounded-2xl bg-white ring-1 ring-black/5">
					<dl class="divide-y divide-neutral-100">
						<div class="grid gap-1 p-4 sm:grid-cols-[180px_1fr] sm:gap-4">
							<dt class="text-sm font-semibold text-neutral-500">성명 · Name</dt>
							<dd class="text-sm font-medium text-neutral-900">
								{site.business.representative}
							</dd>
						</div>
						<div class="grid gap-1 p-4 sm:grid-cols-[180px_1fr] sm:gap-4">
							<dt class="text-sm font-semibold text-neutral-500">연락처 · Phone</dt>
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
						<div class="grid gap-1 p-4 sm:grid-cols-[180px_1fr] sm:gap-4">
							<dt class="text-sm font-semibold text-neutral-500">이메일 · Email</dt>
							<dd class="text-sm font-medium text-neutral-900">
								<a href={`mailto:${site.email}`} class="hover:text-brand-green">
									{site.email}
								</a>
							</dd>
						</div>
						<div class="grid gap-1 p-4 sm:grid-cols-[180px_1fr] sm:gap-4">
							<dt class="text-sm font-semibold text-neutral-500">사업장 주소 · Address</dt>
							<dd class="text-sm font-medium text-neutral-900">
								{site.address.kr} ({site.address.postcode})
								<span class="mt-0.5 block text-xs text-neutral-500">
									{site.address.en}
								</span>
							</dd>
						</div>
					</dl>
				</div>
			</section>

			<!-- II. Collection -->
			<section id="collection">
				<p class="text-brand-green text-xs font-bold tracking-[0.3em] uppercase">Section II</p>
				<h2 class="mt-2 text-2xl font-extrabold text-neutral-900 sm:text-3xl">
					개인정보 수집 목적 및 항목
					<span class="mt-0.5 block text-base font-semibold text-neutral-500 sm:text-lg">
						Information Collected and Purpose
					</span>
				</h2>

				<h3 class="mt-8 text-lg font-bold text-neutral-900">
					2.1 정보 수집 항목 및 시점 · What We Collect and When
				</h3>
				<p class="mt-3 text-base leading-relaxed text-neutral-600">
					당사는 귀하가 사이트에 회원가입하거나, 주문을 하거나, 상품 리뷰를 남길 때 정보를
					수집합니다.
				</p>

				<div class="mt-5 overflow-hidden rounded-2xl bg-white ring-1 ring-black/5">
					<div class="overflow-x-auto">
						<table class="w-full text-left text-sm">
							<thead class="bg-brand-cream text-neutral-900">
								<tr>
									<th class="px-4 py-3 text-xs font-bold tracking-wider uppercase"
										>수집 항목 · What</th
									>
									<th class="px-4 py-3 text-xs font-bold tracking-wider uppercase"
										>수집 시점 · When</th
									>
									<th class="px-4 py-3 text-xs font-bold tracking-wider uppercase"
										>이용 목적 · Purpose</th
									>
								</tr>
							</thead>
							<tbody class="divide-y divide-neutral-100">
								<tr>
									<td class="px-4 py-3 font-medium text-neutral-900"
										>성명, 주소, 이메일, 전화번호</td
									>
									<td class="px-4 py-3 text-neutral-600">회원가입 및 주문 시</td>
									<td class="px-4 py-3 text-neutral-600">계정 정보 저장, 주문 발송</td>
								</tr>
								<tr>
									<td class="px-4 py-3 font-medium text-neutral-900"
										>주문 정보 (결제 주소, 배송 주소 포함)</td
									>
									<td class="px-4 py-3 text-neutral-600">주문 및 결제 시</td>
									<td class="px-4 py-3 text-neutral-600"
										>주문 처리, 결제 진행, 사기 방지, 법적 준수</td
									>
								</tr>
								<tr>
									<td class="px-4 py-3 font-medium text-neutral-900"
										>열람 제품, IP 주소, 브라우저 유형</td
									>
									<td class="px-4 py-3 text-neutral-600">사이트 방문 시</td>
									<td class="px-4 py-3 text-neutral-600">배송비 산정 및 서비스 개선</td>
								</tr>
								<tr>
									<td class="px-4 py-3 font-medium text-neutral-900">리뷰 내용</td>
									<td class="px-4 py-3 text-neutral-600">상품 리뷰 작성 시</td>
									<td class="px-4 py-3 text-neutral-600">상품 리뷰 게시 및 관리</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</section>

			<!-- III. Cookies -->
			<section id="cookies">
				<p class="text-brand-green text-xs font-bold tracking-[0.3em] uppercase">Section III</p>
				<h2 class="mt-2 text-2xl font-extrabold text-neutral-900 sm:text-3xl">
					쿠키 이용
					<span class="mt-0.5 block text-base font-semibold text-neutral-500 sm:text-lg">
						Use of Cookies
					</span>
				</h2>
				<p class="mt-4 text-base leading-relaxed text-neutral-600">
					당사 웹사이트는 귀하의 경험을 향상시키기 위해 쿠키를 사용합니다. 쿠키는 웹사이트가
					귀하의 브라우저를 인식하고 특정 정보를 저장하기 위해 사용하는 작은 파일입니다.
				</p>

				<h3 class="mt-8 text-lg font-bold text-neutral-900">
					3.1 쿠키 사용 목적 · Purpose of Using Cookies
				</h3>
				<ul class="mt-3 space-y-2 text-base leading-relaxed text-neutral-600">
					<li class="flex gap-3">
						<span class="bg-brand-green mt-2 size-1.5 shrink-0 rounded-full"></span>
						<span>장바구니에 담긴 상품을 기억하고 처리하기 위함</span>
					</li>
					<li class="flex gap-3">
						<span class="bg-brand-green mt-2 size-1.5 shrink-0 rounded-full"></span>
						<span>사용자가 계정을 생성하고 로그인할 경우 로그인 정보 및 화면 설정 저장</span>
					</li>
					<li class="flex gap-3">
						<span class="bg-brand-green mt-2 size-1.5 shrink-0 rounded-full"></span>
						<span class="text-neutral-500">
							(임시 쿠키는 브라우저 종료 시 삭제됨)
						</span>
					</li>
				</ul>
			</section>

			<!-- IV. Sharing -->
			<section id="sharing">
				<p class="text-brand-green text-xs font-bold tracking-[0.3em] uppercase">Section IV</p>
				<h2 class="mt-2 text-2xl font-extrabold text-neutral-900 sm:text-3xl">
					개인정보 제3자 제공
					<span class="mt-0.5 block text-base font-semibold text-neutral-500 sm:text-lg">
						Sharing of Personal Information
					</span>
				</h2>

				<h3 class="mt-8 text-lg font-bold text-neutral-900">
					4.1 정보 공유 제한 및 목적 · Limits and Purpose of Sharing
				</h3>
				<p class="mt-3 text-base leading-relaxed text-neutral-600">
					당사는 귀하의 개인정보를 판매하거나 거래하지 않습니다. 서비스 제공에 필수적인
					제3자 파트너에게만 정보를 공유하며, 이들은 개인정보를 기밀로 유지해야 하고 다른
					목적으로 이용할 수 없습니다.
				</p>

				<h3 class="mt-8 text-lg font-bold text-neutral-900">
					4.2 공유 대상 · Recipients of Shared Information
				</h3>
				<div class="mt-4 grid gap-4 sm:grid-cols-2">
					<div class="rounded-2xl bg-white p-5 ring-1 ring-black/5">
						<div
							class="bg-brand-amber/15 text-brand-amber flex size-10 items-center justify-center rounded-xl"
						>
							<Lock class="size-5" />
						</div>
						<h4 class="mt-4 text-base font-bold text-neutral-900">결제 대행사</h4>
						<p class="text-xs font-semibold tracking-wider text-neutral-500 uppercase">
							Payment Processors
						</p>
						<p class="mt-2 text-sm leading-relaxed text-neutral-600">
							결제 처리를 위해 주문 및 결제 정보를 공유 (예: 계좌이체 확인을 위한 은행 정보)
						</p>
					</div>
					<div class="rounded-2xl bg-white p-5 ring-1 ring-black/5">
						<div
							class="bg-brand-green/10 text-brand-green flex size-10 items-center justify-center rounded-xl"
						>
							<Users class="size-5" />
						</div>
						<h4 class="mt-4 text-base font-bold text-neutral-900">배송 업체</h4>
						<p class="text-xs font-semibold tracking-wider text-neutral-500 uppercase">
							Delivery Partners
						</p>
						<p class="mt-2 text-sm leading-relaxed text-neutral-600">
							주문 발송을 위해 성명 및 배송 주소를 공유
						</p>
					</div>
				</div>
			</section>

			<!-- V. Retention -->
			<section id="retention">
				<p class="text-brand-green text-xs font-bold tracking-[0.3em] uppercase">Section V</p>
				<h2 class="mt-2 text-2xl font-extrabold text-neutral-900 sm:text-3xl">
					정보 보유 및 이용 기간
					<span class="mt-0.5 block text-base font-semibold text-neutral-500 sm:text-lg">
						Period of Retention and Use
					</span>
				</h2>
				<p class="mt-4 text-base leading-relaxed text-neutral-600">
					당사는 법률에서 더 긴 보유 기간을 요구하거나 허용하지 않는 한, 본 정책에 명시된
					목적 달성을 위해 필요한 기간 동안만 개인정보를 보유합니다.
				</p>

				<div class="mt-5 overflow-hidden rounded-2xl bg-white ring-1 ring-black/5">
					<div class="overflow-x-auto">
						<table class="w-full text-left text-sm">
							<thead class="bg-brand-cream text-neutral-900">
								<tr>
									<th class="px-4 py-3 text-xs font-bold tracking-wider uppercase"
										>보존 기록 · Record</th
									>
									<th class="px-4 py-3 text-xs font-bold tracking-wider uppercase"
										>보존 기간 · Period</th
									>
									<th class="px-4 py-3 text-xs font-bold tracking-wider uppercase"
										>관련 법규 · Basis</th
									>
								</tr>
							</thead>
							<tbody class="divide-y divide-neutral-100">
								<tr>
									<td class="px-4 py-3 font-medium text-neutral-900"
										>계약 또는 청약 철회 관련 기록</td
									>
									<td class="px-4 py-3 text-neutral-600">5년</td>
									<td class="px-4 py-3 text-neutral-600"
										>전자상거래 등에서의 소비자 보호에 관한 법률</td
									>
								</tr>
								<tr>
									<td class="px-4 py-3 font-medium text-neutral-900"
										>대금 결제 및 재화 공급 관련 기록</td
									>
									<td class="px-4 py-3 text-neutral-600">5년</td>
									<td class="px-4 py-3 text-neutral-600"
										>전자상거래 등에서의 소비자 보호에 관한 법률</td
									>
								</tr>
								<tr>
									<td class="px-4 py-3 font-medium text-neutral-900"
										>소비자 불만 또는 분쟁 처리 기록</td
									>
									<td class="px-4 py-3 text-neutral-600">3년</td>
									<td class="px-4 py-3 text-neutral-600"
										>전자상거래 등에서의 소비자 보호에 관한 법률</td
									>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</section>

			<!-- VI. Rights -->
			<section id="rights">
				<p class="text-brand-green text-xs font-bold tracking-[0.3em] uppercase">Section VI</p>
				<h2 class="mt-2 text-2xl font-extrabold text-neutral-900 sm:text-3xl">
					정보 주체의 권리 및 보안
					<span class="mt-0.5 block text-base font-semibold text-neutral-500 sm:text-lg">
						Your Rights and Security
					</span>
				</h2>

				<h3 class="mt-8 text-lg font-bold text-neutral-900">
					6.1 정보 주체의 권리 · Your Rights
				</h3>
				<p class="mt-3 text-base leading-relaxed text-neutral-600">
					귀하는 언제든지 자신의 개인정보에 접근하고, 수정하거나 삭제를 요청할 권리가
					있습니다. 사이트 계정이 있는 경우
					<a href="/account" class="text-brand-green font-semibold underline hover:no-underline">
						로그인
					</a>하여 개인 정보를 확인 및 수정할 수 있습니다.
				</p>
				<p class="mt-3 text-base leading-relaxed text-neutral-600">
					또한 개인정보 보호 책임자에게 연락하여 당사가 보유한 귀하의 모든 개인정보 삭제를
					요청할 수 있습니다.
				</p>

				<h3 class="mt-8 text-lg font-bold text-neutral-900">
					6.2 정보 보안 · Security Measures
				</h3>
				<p class="mt-3 text-base leading-relaxed text-neutral-600">
					당사는 귀하가 주문하거나 개인정보를 입력·제출·접근할 때 개인정보의 안전을 유지하기
					위한 다양한 보안 조치를 이행합니다.
				</p>
			</section>

			<!-- VII. Changes -->
			<section id="changes">
				<p class="text-brand-green text-xs font-bold tracking-[0.3em] uppercase">Section VII</p>
				<h2 class="mt-2 text-2xl font-extrabold text-neutral-900 sm:text-3xl">
					정책 변경
					<span class="mt-0.5 block text-base font-semibold text-neutral-500 sm:text-lg">
						Changes to This Policy
					</span>
				</h2>
				<p class="mt-4 text-base leading-relaxed text-neutral-600">
					당사는 본 개인정보처리방침을 수시로 업데이트할 수 있습니다. 변경 사항은 이 페이지에
					새로운 정책을 게시함으로써 안내됩니다.
				</p>
			</section>

			<!-- VIII. Contact -->
			<section id="contact">
				<p class="text-brand-green text-xs font-bold tracking-[0.3em] uppercase">Section VIII</p>
				<h2 class="mt-2 text-2xl font-extrabold text-neutral-900 sm:text-3xl">
					문의처
					<span class="mt-0.5 block text-base font-semibold text-neutral-500 sm:text-lg">
						Contact Us
					</span>
				</h2>
				<p class="mt-4 text-base leading-relaxed text-neutral-600">
					본 개인정보처리방침에 대한 질문이나 우려 사항이 있으시면 아래로 연락해 주십시오.
				</p>

				<div class="mt-6 rounded-2xl bg-white ring-1 ring-black/5">
					<dl class="divide-y divide-neutral-100">
						<div class="grid gap-1 p-4 sm:grid-cols-[200px_1fr] sm:gap-4">
							<dt class="text-sm font-semibold text-neutral-500">상호명 · Business</dt>
							<dd class="text-sm font-medium text-neutral-900">
								{site.name} (스리랑칸 푸드 코너)
							</dd>
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
			<div
				class="bg-brand-green relative overflow-hidden rounded-3xl p-6 text-white sm:p-8"
			>
				<div
					class="bg-brand-amber/25 pointer-events-none absolute -top-24 -right-16 size-64 rounded-full blur-3xl"
				></div>
				<div class="relative">
					<p class="text-brand-amber text-xs font-bold tracking-[0.3em] uppercase">
						Need help?
					</p>
					<h3 class="mt-2 text-xl font-extrabold sm:text-2xl">
						Get in touch with our privacy team.
					</h3>
					<p class="mt-3 text-sm leading-relaxed text-white/80">
						개인정보 관련 문의는 아래 연락처로 문의해 주십시오.
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
							href={site.mapUrl}
							target="_blank"
							rel="noopener"
							class="flex items-start gap-3 rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm transition hover:bg-white/15"
						>
							<MapPin class="mt-0.5 size-4 shrink-0" />
							<div class="min-w-0">
								<p class="text-[10px] font-bold tracking-wider text-white/60 uppercase">
									Store
								</p>
								<p class="mt-0.5 text-sm font-semibold">{site.address.en}</p>
							</div>
						</a>
					</div>
				</div>
			</div>
		</aside>
	</div>
</article>
