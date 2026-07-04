import { z } from 'zod';

// Fulfillment status — tracks the physical progression of the order.
// `cancelled` is a terminal state; anything else can move to `cancelled`.
export const ORDER_STATUSES = [
	'pending',
	'preparing',
	'shipped',
	'delivered',
	'cancelled'
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
	pending: 'Pending',
	preparing: 'Preparing',
	shipped: 'Shipped',
	delivered: 'Delivered',
	cancelled: 'Cancelled'
};

// Payment status — tracks the money.
export const PAYMENT_STATUSES = ['unpaid', 'paid', 'refunded'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
	unpaid: 'Unpaid',
	paid: 'Paid',
	refunded: 'Refunded'
};

export const updateOrderStatusSchema = z.object({
	id: z.string().uuid(),
	status: z.enum(ORDER_STATUSES)
});

export const updatePaymentStatusSchema = z.object({
	id: z.string().uuid(),
	paymentStatus: z.enum(PAYMENT_STATUSES)
});

/** Whether the admin should be allowed to transition from `from` → `to`. */
export function canTransitionStatus(from: OrderStatus, to: OrderStatus): boolean {
	if (from === to) return false;
	if (from === 'delivered') return to === 'cancelled'; // rare — refund flow
	if (from === 'cancelled') return false; // terminal
	return true;
}
