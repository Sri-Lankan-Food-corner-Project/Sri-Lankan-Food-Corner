export type OrderStatus =
	| 'pending'
	| 'paid'
	| 'preparing'
	| 'shipped'
	| 'delivered'
	| 'cancelled'
	| 'refunded';

export type PaymentStatus = 'unpaid' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'bank' | 'toss';
export type ShippingMethod = 'weight' | 'pickup';

export type Order = {
	id: string;
	orderNumber: string;
	customerId: string | null;

	customerEmail: string;
	customerPhone: string;

	shippingFullName: string;
	shippingStreet: string;
	shippingHouseNumber: string | null;
	shippingRoomNumber: string | null;
	shippingAccessCode: string | null;
	shippingCity: string;
	shippingPostcode: string;
	shippingCountry: string;
	deliveryNotes: string | null;

	billingFullName: string | null;
	billingStreet: string | null;
	billingHouseNumber: string | null;
	billingRoomNumber: string | null;
	billingCity: string | null;
	billingPostcode: string | null;
	billingCountry: string | null;

	shippingMethod: ShippingMethod;
	status: OrderStatus;

	subtotal: number;
	shippingFee: number;
	totalAmount: number;

	paymentMethod: PaymentMethod;
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

export type UserAddress = {
	id: string;
	userId: string;
	label: string | null;
	fullName: string;
	phone: string;
	street: string;
	houseNumber: string | null;
	roomNumber: string | null;
	accessCode: string | null;
	city: string;
	postcode: string;
	country: string;
	isDefault: boolean;
	createdAt: Date;
	updatedAt: Date;
};
