export type OrderStatus =
	| 'pending'
	| 'paid'
	| 'preparing'
	| 'shipped'
	| 'delivered'
	| 'cancelled'
	| 'refunded';

export type PaymentStatus = 'unpaid' | 'paid' | 'failed' | 'refunded';

export type Order = {
	id: string;
	orderNumber: string;
	customerId: string | null;
	customerName: string;
	customerPhone: string;
	addressLine1: string;
	addressLine2: string | null;
	zipcode: string;
	status: OrderStatus;
	subtotal: number;
	shippingFee: number;
	totalAmount: number;
	paymentMethod: string | null;
	paymentStatus: PaymentStatus;
	createdAt: Date;
	updatedAt: Date;
};

export type OrderItem = {
	id: string;
	orderId: string;
	productId: string | null;
	productName: string;
	unitPrice: number;
	quantity: number;
	lineTotal: number;
};
