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

export const wishlistItems = pgTable(
	'wishlist_items',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		productId: uuid('product_id')
			.notNull()
			.references(() => products.id, { onDelete: 'cascade' }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(t) => ({ uniqUserProduct: unique().on(t.userId, t.productId) })
);

export const userAddresses = pgTable('user_addresses', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	label: text('label'), // optional — "Home", "Office", …
	fullName: text('full_name').notNull(),
	phone: text('phone').notNull(),
	street: text('street').notNull(),
	houseNumber: text('house_number'),
	roomNumber: text('room_number'),
	accessCode: text('access_code'),
	city: text('city').notNull(),
	postcode: text('postcode').notNull(),
	country: text('country').notNull().default('KR'),
	isDefault: boolean('is_default').notNull().default(false),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const orders = pgTable('orders', {
	id: uuid('id').primaryKey().defaultRandom(),
	orderNumber: text('order_number').notNull().unique(),
	customerId: text('customer_id').references(() => user.id),

	// Contact snapshot
	customerEmail: text('customer_email').notNull(),
	customerPhone: text('customer_phone').notNull(),

	// Shipping address snapshot (Korean address structure)
	shippingFullName: text('shipping_full_name').notNull(),
	shippingStreet: text('shipping_street').notNull(),
	shippingHouseNumber: text('shipping_house_number'),
	shippingRoomNumber: text('shipping_room_number'),
	shippingAccessCode: text('shipping_access_code'),
	shippingCity: text('shipping_city').notNull(),
	shippingPostcode: text('shipping_postcode').notNull(),
	shippingCountry: text('shipping_country').notNull().default('KR'),
	deliveryNotes: text('delivery_notes'),

	// Billing address snapshot (all null = same as shipping)
	billingFullName: text('billing_full_name'),
	billingStreet: text('billing_street'),
	billingHouseNumber: text('billing_house_number'),
	billingRoomNumber: text('billing_room_number'),
	billingCity: text('billing_city'),
	billingPostcode: text('billing_postcode'),
	billingCountry: text('billing_country'),

	// Fulfillment
	shippingMethod: text('shipping_method').notNull(), // 'weight' | 'pickup'
	status: text('status').notNull().default('pending'),

	// Money — KRW integers
	subtotal: integer('subtotal').notNull(),
	shippingFee: integer('shipping_fee').notNull().default(0),
	totalAmount: integer('total_amount').notNull(),

	// Payment
	paymentMethod: text('payment_method').notNull(), // 'bank' | 'toss'
	paymentStatus: text('payment_status').notNull().default('unpaid'),

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

// Homepage sliders — admin-managed rows on the storefront home page.
// `type` picks how products are resolved at render time:
//   'manual'      → explicit list from home_section_products
//   'category'    → newest products in categoryId
//   'newest'      → newest active products
//   'discounted'  → active products where compare_at_price > price
export const homeSections = pgTable('home_sections', {
	id: uuid('id').primaryKey().defaultRandom(),
	title: text('title').notNull(),
	subtitle: text('subtitle'),
	type: text('type').notNull(),
	categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
	limit: integer('limit').notNull().default(12),
	sortOrder: integer('sort_order').notNull().default(0),
	isActive: boolean('is_active').notNull().default(true),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const homeSectionProducts = pgTable(
	'home_section_products',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		sectionId: uuid('section_id')
			.notNull()
			.references(() => homeSections.id, { onDelete: 'cascade' }),
		productId: uuid('product_id')
			.notNull()
			.references(() => products.id, { onDelete: 'cascade' }),
		sortOrder: integer('sort_order').notNull().default(0)
	},
	(t) => ({ uniqSectionProduct: unique().on(t.sectionId, t.productId) })
);

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
