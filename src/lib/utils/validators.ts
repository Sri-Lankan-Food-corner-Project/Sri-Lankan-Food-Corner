export function isValidEmail(value: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isValidKoreanZipcode(value: string): boolean {
	return /^\d{5}$/.test(value);
}

// Korean mobile phone, stored as E.164 (+82 then 9 or 10 digits starting with 1).
// e.g. +821012345678 for 010-1234-5678.
export function isValidKoreanPhoneE164(value: string): boolean {
	return /^\+821\d{8,9}$/.test(value);
}

// Formats a raw digit string for display as XX-XXXX-XXXX (Korean mobile).
// Accepts up to 10 digits after the country code (drops a leading 0 if present).
export function formatKoreanMobile(raw: string): string {
	const digits = raw.replace(/\D/g, '').replace(/^0+/, '').slice(0, 10);
	if (digits.length <= 2) return digits;
	if (digits.length <= 6) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
	return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6)}`;
}
