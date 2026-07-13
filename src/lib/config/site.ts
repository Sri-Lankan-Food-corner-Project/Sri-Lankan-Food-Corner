/**
 * Central site configuration — business, contact, and social details.
 * Update values here and they propagate to the header, footer, and anywhere else
 * they're referenced. Keeps hard-coded business info out of components.
 */
export const site = {
	name: 'Sri Lankan Food Corner',
	shortName: 'Food Corner',
	tagline: 'Food corner',
	description:
		'Sri Lankan groceries, fresh vegetables, and pantry staples, delivered across South Korea.',

	// TODO: replace with the real customer-facing email once confirmed with the client
	email: 'srilankanfoodsrestaurant@gmail.com',

	phone: {
		primary: '+82 10-6369-3340',
		secondary: '+82 10-2738-6732'
	},

	// Number that receives WhatsApp chats — floating chat button + product inquiry links.
	whatsapp: '+82 10-6369-3340',

	address: {
		en: '574 Deokpyeong-ro, Hapdeok-eup, Dangjin-si, Chungcheongnam-do, 31811 (1F)',
		kr: '충청남도 당진시 합덕읍 덕평로 574, 1층',
		postcode: '31811'
	},

	mapUrl: 'https://maps.app.goo.gl/sygmtcVijJSnEoH66',

	business: {
		registrationNumber: '413-42-01068',
		representative: 'GUNAWARDANA LIYANAGE LAL CHANDANA',
		liquorLicense: '311-5-35120',
		openedDate: '2023-07-29'
	},

	bank: {
		name: 'NongHyup Bank (농협은행)',
		accountHolder: 'GUNAWARDANA LIYANAGE LAL CHANDANA',
		accountNumber: '301-0338-3017-51'
	},

	shipping: {
		weightBasedFee: 3500, // KRW
		freeShippingThreshold: 50000 // KRW — optional, orders above this are free
	},

	// Fill in the real profile URLs when available.
	social: {
		facebook:
			'https://m.facebook.com/profile.php?id=61550018936373&mibextid=wwXIfr&mibextid=wwXIfr',
		tiktok: 'https://www.tiktok.com/',
		youtube: 'https://www.youtube.com/',
		instagram: ''
	}
} as const;

/** Strip spaces/dashes so a phone string can be used as a `tel:` href. */
export function telHref(phone: string): string {
	return `tel:${phone.replace(/[\s-]/g, '')}`;
}

/**
 * Build a WhatsApp chat link for the shop's number, optionally pre-filling a
 * message. wa.me expects the number in international format with digits only
 * ('+82 10-6369-3340' → '821063693340'). Works in both the WhatsApp app
 * (mobile) and WhatsApp Web (desktop).
 */
export function waHref(message?: string): string {
	const digits = site.whatsapp.replace(/\D/g, '');
	return message
		? `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
		: `https://wa.me/${digits}`;
}
