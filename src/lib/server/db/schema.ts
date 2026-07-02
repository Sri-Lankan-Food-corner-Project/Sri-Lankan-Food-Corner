import { pgTable, uuid, text, integer, boolean, timestamp, jsonb, unique } from 'drizzle-orm/pg-core';

// ============================
// BETTER AUTH TABLES
// Owned/managed by Better Auth's Drizzle adapter. Do not hand-edit.
// The `role` column below is added via Better Auth's `user.additionalFields`.
// After changing auth config, run: pnpm dlx @better-auth/cli generate
// ============================
export const user = pgTable('user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: boolean('email_verified').notNull().default(false),
	image: text('image'),
	phone: text('phone'),
	role: text('role').notNull().default('customer'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	expiresAt: timestamp('expires_at').notNull(),
	token: text('token').notNull().unique(),
	ipAddress: text('ip_address'),
	userAgent: text('user_agent'),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const account = pgTable('account', {
	id: text('id').primaryKey(),
	accountId: text('account_id').notNull(),
	providerId: text('provider_id').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	accessToken: text('access_token'),
	refreshToken: text('refresh_token'),
	idToken: text('id_token'),
	accessTokenExpiresAt: timestamp('access_token_expires_at'),
	refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
	scope: text('scope'),
	password: text('password'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const verification = pgTable('verification', {
	id: text('id').primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: timestamp('expires_at').notNull(),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
});

// ============================
// APP TABLES
// ============================
export const categories = pgTable('categories', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: text('name').notNull(),
	slug: text('slug').notNull().unique(),
	description: text('description'),
	imageUrl: text('image_url'),
	sortOrder: integer('sort_order').default(0),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

export const products = pgTable('products', {
	id: uuid('id').primaryKey().defaultRandom(),
	categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
	name: text('name').notNull(),
	slug: text('slug').notNull().unique(),
	description: text('description'),
	price: integer('price').notNull(),
	compareAtPrice: integer('compare_at_price'),
	unit: text('unit'),
	stockQuantity: integer('stock_quantity').notNull().default(0),
	isActive: boolean('is_active').notNull().default(true),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const productImages = pgTable('product_images', {
	id: uuid('id').primaryKey().defaultRandom(),
	productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }),
	imageUrl: text('image_url').notNull(),
	sortOrder: integer('sort_order').default(0)
});

export const cartItems = pgTable(
	'cart_items',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		customerId: text('customer_id').references(() => user.id, { onDelete: 'cascade' }),
		productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }),
		quantity: integer('quantity').notNull().default(1),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
	},
	(t) => ({ uniqCustomerProduct: unique().on(t.customerId, t.productId) })
);

export const orders = pgTable('orders', {
	id: uuid('id').primaryKey().defaultRandom(),
	orderNumber: text('order_number').notNull().unique(),
	customerId: text('customer_id').references(() => user.id),
	customerName: text('customer_name').notNull(),
	customerPhone: text('customer_phone').notNull(),
	addressLine1: text('address_line1').notNull(),
	addressLine2: text('address_line2'),
	zipcode: text('zipcode').notNull(),
	status: text('status').notNull().default('pending'),
	subtotal: integer('subtotal').notNull(),
	shippingFee: integer('shipping_fee').notNull().default(0),
	totalAmount: integer('total_amount').notNull(),
	paymentMethod: text('payment_method'),
	paymentStatus: text('payment_status').default('unpaid'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

export const orderItems = pgTable('order_items', {
	id: uuid('id').primaryKey().defaultRandom(),
	orderId: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }),
	productId: uuid('product_id').references(() => products.id),
	productName: text('product_name').notNull(),
	unitPrice: integer('unit_price').notNull(),
	quantity: integer('quantity').notNull(),
	lineTotal: integer('line_total').notNull()
});

export const payments = pgTable('payments', {
	id: uuid('id').primaryKey().defaultRandom(),
	orderId: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }),
	pgProvider: text('pg_provider').notNull(),
	pgTransactionId: text('pg_transaction_id'),
	amount: integer('amount').notNull(),
	status: text('status').notNull(),
	rawResponse: jsonb('raw_response'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});
