// Toss Payments helpers. Test/sandbox mode by default.
// NEVER mark an order paid from client code — only after this file
// verifies the transaction via Toss's server-to-server API.

import { env } from '$env/dynamic/private';

export async function confirmPayment(_paymentKey: string, _orderId: string, _amount: number) {
	if (!env.TOSS_SECRET_KEY) throw new Error('TOSS_SECRET_KEY is not set');
	throw new Error('Toss confirmation not implemented');
}
