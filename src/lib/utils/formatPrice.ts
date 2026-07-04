const krw = new Intl.NumberFormat('ko-KR', {
	style: 'currency',
	currency: 'KRW',
	maximumFractionDigits: 0
});

export function formatPrice(amount: number): string {
	return krw.format(amount);
}
