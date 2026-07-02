export function isValidEmail(value: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isValidKoreanZipcode(value: string): boolean {
	return /^\d{5}$/.test(value);
}

export function isValidKoreanPhone(value: string): boolean {
	return /^0\d{1,2}-?\d{3,4}-?\d{4}$/.test(value.replace(/\s/g, ''));
}
