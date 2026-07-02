# Sri Lankan Food Corner — E-commerce Project Reference (v2: Neon + Better Auth + R2)

Database schema (Neon Postgres via Drizzle) + SvelteKit folder structure.

This replaces the earlier Supabase-based version. Stack changed from
Supabase (DB + Auth + Storage) to **Neon (DB) + Better Auth (auth) + Cloudflare R2
(images)** to avoid Supabase's free-tier egress limit (5 GB/month), which product
image traffic at ~100 customers/day would exceed.

---

## 1. Database Schema (Neon Postgres, defined via Drizzle ORM)

Schema lives in `src/lib/server/db/schema.ts` — this SQL is the reference shape, but
`schema.ts` is the actual source of truth. Uses `uuid` primary keys.

Note: unlike the old Supabase version, there is **no `auth.users` table built in** —
Better Auth creates and owns its own `user`, `session`, and `account` tables via its
Drizzle adapter. Our own tables (`products`, `orders`, etc.) reference Better Auth's
`user.id`.

```sql
-- ============================
-- USERS / SESSIONS / ACCOUNTS
-- (created and managed by Better Auth's Drizzle adapter —
--  do not hand-edit; run `npx @better-auth/cli generate` after config changes)
-- ============================
-- user, session, account, verification tables — see Better Auth docs for exact shape.
-- Our app adds a `role` column to the user table via Better Auth's additionalFields
-- config: role text not null default 'customer' check (role in ('customer','admin'))

-- ============================
-- CATEGORIES
-- ============================
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  image_url text,           -- Cloudflare R2 public URL
  sort_order int default 0,
  created_at timestamptz default now()
);

-- ============================
-- PRODUCTS
-- ============================
create table products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id) on delete set null,
  name text not null,
  slug text unique not null,
  description text,
  price integer not null,        -- KRW has no subunit, store as whole won
  unit text,                     -- e.g. "500g", "1kg", "1 pack"
  stock_quantity int not null default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================
-- PRODUCT IMAGES (one product can have several)
-- Stored in Cloudflare R2; this table holds the resulting public URLs
-- ============================
create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  image_url text not null,       -- R2 public URL (or custom CDN domain in front of R2)
  sort_order int default 0
);

-- ============================
-- CART ITEMS (persisted cart, only for logged-in users)
-- ============================
create table cart_items (
  id uuid primary key default gen_random_uuid(),
  customer_id text references "user"(id) on delete cascade,   -- Better Auth user.id (text, not uuid)
  product_id uuid references products(id) on delete cascade,
  quantity int not null default 1,
  created_at timestamptz default now(),
  unique (customer_id, product_id)
);

-- ============================
-- ORDERS
-- ============================
create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,     -- e.g. ORD-20260701-0001
  customer_id text references "user"(id),   -- Better Auth user.id
  customer_name text not null,
  customer_phone text not null,
  address_line1 text not null,
  address_line2 text,
  zipcode text not null,
  status text not null default 'pending'
    check (status in ('pending','paid','preparing','shipped','delivered','cancelled','refunded')),
  subtotal integer not null,
  shipping_fee integer not null default 0,
  total_amount integer not null,
  payment_method text,                   -- 'card', 'kakaopay', 'toss', etc.
  payment_status text default 'unpaid' check (payment_status in ('unpaid','paid','failed','refunded')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================
-- ORDER ITEMS (snapshot of product at time of purchase)
-- ============================
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),
  product_name text not null,   -- snapshot, in case product is edited/deleted later
  unit_price integer not null,
  quantity int not null,
  line_total integer not null
);

-- ============================
-- PAYMENTS (raw record of each PG transaction)
-- ============================
create table payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  pg_provider text not null,        -- 'toss', 'portone'
  pg_transaction_id text,
  amount integer not null,
  status text not null,
  raw_response jsonb,
  created_at timestamptz default now()
);
```

**Notes:**
- `price` and all money fields are plain `integer` — KRW doesn't use decimal subunits.
- `order_items` stores a *snapshot* of product name/price so past orders stay accurate even if you edit or delete a product later.
- **No Row Level Security here** — Neon is plain Postgres with no RLS layer like Supabase provided. Every query touching customer or admin data must be explicitly access-checked in application code (in the `+page.server.ts` / `+server.ts` handler), using the session from Better Auth. There is no database-level backstop if this is forgotten.
- Add indexes on `products.category_id`, `orders.customer_id`, `order_items.order_id` once you have real data.
- Better Auth's tables use a `text` primary key (not `uuid`) by default for `user.id` — make sure foreign keys referencing users (`customer_id` in `cart_items` and `orders`) match that type.

---

## 2. SvelteKit Folder Structure

```
src/
├── routes/
│   ├── +layout.svelte              # global layout (header, footer, cart icon)
│   ├── +layout.server.ts           # loads categories for nav, cart count
│   ├── +page.svelte                # homepage
│   ├── +page.server.ts
│   │
│   ├── products/
│   │   ├── +page.svelte            # all products / filters
│   │   ├── +page.server.ts
│   │   └── [slug]/
│   │       ├── +page.svelte        # product detail page
│   │       └── +page.server.ts
│   │
│   ├── category/
│   │   └── [slug]/
│   │       ├── +page.svelte
│   │       └── +page.server.ts
│   │
│   ├── cart/
│   │   ├── +page.svelte
│   │   └── +page.server.ts
│   │
│   ├── checkout/
│   │   ├── +page.svelte
│   │   ├── +page.server.ts         # create order, call payment API
│   │   ├── success/+page.svelte
│   │   └── fail/+page.svelte
│   │
│   ├── account/
│   │   ├── +layout.server.ts       # requires login (checks Better Auth session)
│   │   ├── +page.svelte            # profile
│   │   ├── orders/
│   │   │   ├── +page.svelte        # order history
│   │   │   └── [id]/+page.svelte   # order detail
│   │   ├── login/
│   │   │   ├── +page.svelte
│   │   │   └── +page.server.ts
│   │   └── signup/
│   │       ├── +page.svelte
│   │       └── +page.server.ts
│   │
│   ├── admin/
│   │   ├── +layout.server.ts       # requires role = 'admin' (Better Auth session)
│   │   ├── +layout.svelte          # admin sidebar/nav
│   │   ├── +page.svelte            # dashboard (order count, revenue)
│   │   ├── products/
│   │   │   ├── +page.svelte        # product list
│   │   │   ├── +page.server.ts
│   │   │   ├── new/
│   │   │   │   ├── +page.svelte
│   │   │   │   └── +page.server.ts # handles image upload to R2
│   │   │   └── [id]/
│   │   │       ├── +page.svelte    # edit product
│   │   │       └── +page.server.ts
│   │   ├── categories/
│   │   │   ├── +page.svelte
│   │   │   └── +page.server.ts
│   │   └── orders/
│   │       ├── +page.svelte        # order list, filter by status
│   │       ├── +page.server.ts
│   │       └── [id]/
│   │           ├── +page.svelte    # order detail, update status
│   │           └── +page.server.ts
│   │
│   └── api/
│       ├── auth/
│       │   └── [...all]/
│       │       └── +server.ts      # Better Auth catch-all route handler
│       ├── checkout/
│       │   └── +server.ts          # create order + initiate payment
│       └── payment/
│           └── webhook/
│               └── +server.ts      # PG callback: verify + confirm payment
│
├── lib/
│   ├── server/
│   │   ├── db/
│   │   │   ├── schema.ts           # Drizzle table definitions (app tables + Better Auth tables)
│   │   │   └── index.ts            # Drizzle client (connects to Neon via DATABASE_URL)
│   │   ├── auth.ts                 # Better Auth server instance/config
│   │   ├── storage/
│   │   │   └── r2.ts               # Cloudflare R2 upload/delete helper functions (S3-compatible API)
│   │   └── payment/
│   │       └── toss.ts             # Toss Payments helper functions
│   ├── auth-client.ts              # Better Auth browser client (login/signup/session calls)
│   ├── components/
│   │   ├── ProductCard.svelte
│   │   ├── CartItem.svelte
│   │   ├── Header.svelte
│   │   ├── Footer.svelte
│   │   └── admin/
│   │       ├── AdminSidebar.svelte
│   │       └── ProductForm.svelte
│   ├── stores/
│   │   └── cart.ts                 # Svelte store for cart state
│   ├── utils/
│   │   ├── formatPrice.ts          # e.g. ₩12,000 formatting
│   │   └── validators.ts
│   └── types/
│       ├── product.ts
│       └── order.ts
│
├── app.html
└── hooks.server.ts                 # Better Auth session check, protects /admin routes

.env                                # DATABASE_URL, BETTER_AUTH_SECRET,
                                     # R2_* credentials, TOSS_SECRET_KEY, etc. — never commit this
```

**Key points:**
- `hooks.server.ts` reads the Better Auth session on every request and blocks `/admin/*` routes for non-admins — this is your main security gate, and there is no RLS layer behind it as a backstop, so it must never be skipped or bypassed.
- `lib/server/` code never reaches the browser — this is where secret keys (R2 access keys, Toss/PortOne secret key, Better Auth secret) live.
- Keep `lib/auth-client.ts` (browser-safe, only calls Better Auth's public endpoints) separate from `lib/server/auth.ts` (server-only, holds the actual auth config/secret).
- The `api/payment/webhook` endpoint is critical: never mark an order "paid" from the frontend — always confirm server-side after the PG sends its callback.
- Product image uploads flow: admin form → `+page.server.ts` action → `lib/server/storage/r2.ts` → R2 bucket → public URL saved to `product_images.image_url`. The browser never talks to R2 directly.

---

## Suggested next steps
1. Create the Neon project and run `npx drizzle-kit push` to create the schema.
2. Set up Better Auth (`npx @better-auth/cli generate` to create its tables via the Drizzle adapter), configure the `role` additional field.
3. Set up the Cloudflare R2 bucket, generate S3-compatible API credentials, and write `lib/server/storage/r2.ts`.
4. Scaffold the SvelteKit routes (empty pages first, just get navigation working).
5. Build product listing + detail pages pulling from Neon via Drizzle.
6. Build the admin product CRUD (including R2 image upload) before checkout — you'll need it to add test products anyway.
7. Wire up cart → checkout → Toss Payments (test mode) → webhook → order status update.
8. Set up a scheduled `pg_dump` GitHub Action for backups beyond Neon's free 6-hour PITR window.
