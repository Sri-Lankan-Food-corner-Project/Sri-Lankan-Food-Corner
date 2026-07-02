# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project Overview

E-commerce website for **Sri Lankan Food Corner (Asian Mart)** — a Sri Lankan grocery
store based in Dangjin, South Korea, selling Sri Lankan food items, fresh vegetables,
and groceries. The site has two parts in one codebase:

1. **Storefront** — public-facing shop (browse products, cart, checkout).
2. **Admin panel** — protected `/admin` routes for the shop owner to manage products,
   categories, and orders.

Traffic expectation: up to ~100 customers/day. Stack was deliberately chosen to stay
free/low-cost at this traffic level by avoiding Supabase's egress-based pricing model
(images were the main cost driver — see "Why this stack" below).

## Tech Stack

- **Framework:** SvelteKit (full-stack — frontend pages and backend API routes in one
  app, deployed as a single Vercel project). There is no separate backend service —
  `+page.server.ts` / `+server.ts` API routes ARE the backend. Do not split this into
  a separate backend project; it adds latency (extra network hop) and cost (second
  hosting bill) with no benefit at this scale.
- **Hosting:** Vercel (`adapter-vercel`)
- **Database:** Neon (serverless Postgres)
- **ORM:** Drizzle ORM — connects directly to Neon via its pooled connection string
- **Auth:** Better Auth (self-hosted, open-source auth library) — NOT Supabase Auth,
  NOT Clerk. Sessions and user table are managed by Better Auth inside our own Neon
  database.
- **File storage:** Cloudflare R2 (product images) — chosen specifically because R2
  has **zero egress fees**, unlike Supabase Storage/Neon, which is what image-heavy
  traffic would otherwise cost money on.
- **Payments:** Toss Payments (Korea). Start in test/sandbox mode. Go-live requires the
  client's Korean business registration number and PG approval (3–4 week process) —
  do not assume production payment keys are available.
- **Styling:** not finalized yet — Tailwind CSS is the working assumption unless told
  otherwise.

### Why this stack (context for future decisions)

This project originally used Supabase (DB + Auth + Storage in one). It was migrated
away from Supabase because at ~100 customers/day, Supabase's free-tier egress limit
(5 GB/month) would be exceeded almost entirely by product image traffic — Supabase
Pro would cost $25/month just to fix that one bottleneck. Splitting responsibilities
across Neon (DB), Better Auth (auth), and Cloudflare R2 (images, no egress fee) solves
the actual bottleneck (image egress) for close to $0/month, at the cost of more
services to configure. Do not casually add Supabase back in — the reason it was
removed still applies.

## Folder Structure

```
src/
├── routes/
│   ├── +layout.svelte / +layout.server.ts   # global nav, cart count, categories
│   ├── products/[slug]/                      # product detail
│   ├── category/[slug]/
│   ├── cart/
│   ├── checkout/  (+ success/ and fail/)
│   ├── account/   (login, signup, order history — requires auth)
│   ├── admin/     (products, categories, orders — requires role = 'admin')
│   └── api/
│       ├── auth/[...all]/+server.ts          # Better Auth catch-all handler
│       ├── checkout/+server.ts               # create order, start payment
│       └── payment/webhook/+server.ts        # verify payment server-side
├── lib/
│   ├── server/
│   │   ├── db/
│   │   │   ├── schema.ts     # Drizzle table definitions — source of truth for DB shape
│   │   │   └── index.ts      # Drizzle client (connects to Neon via DATABASE_URL)
│   │   ├── auth.ts           # Better Auth server config (session, providers)
│   │   ├── storage/r2.ts     # Cloudflare R2 upload/delete helper functions
│   │   └── payment/toss.ts   # Toss Payments helper functions
│   ├── auth-client.ts        # Better Auth browser client (login/signup calls)
│   ├── components/
│   ├── stores/cart.ts
│   ├── utils/
│   └── types/
└── hooks.server.ts           # session check (via Better Auth), protects /admin routes
```

## Database Rules

- Schema lives in `src/lib/server/db/schema.ts` (Drizzle). Treat this file as the
  single source of truth — don't hand-edit the database schema directly in the Neon
  console without updating this file and generating a migration.
- Migrations: `npx drizzle-kit generate` then `npx drizzle-kit push` (or `migrate` once
  the project is live and you want reviewable migration files).
- **Money is stored as `integer`, in KRW.** Korean won has no decimal subunit — never
  use `numeric`/`decimal` or treat prices as floats.
- `order_items` stores a **snapshot** of `product_name` and `unit_price` at time of
  purchase. Never join back to the live `products` table to display historical order
  data — the product may have changed or been deleted since.
- `orders.status` and `orders.payment_status` are separate: `status` tracks fulfillment
  (pending → preparing → shipped → delivered), `payment_status` tracks the money
  (unpaid → paid → refunded).
- There is no Row Level Security here (Neon is plain Postgres, no RLS layer like
  Supabase provided). **All access control must happen in application code** — every
  query in `+page.server.ts` / `+server.ts` that touches user-specific or admin-only
  data must explicitly check the session/role. This is more important here than it
  was under Supabase, because there is no database-level safety net anymore.

## Auth Rules (Better Auth)

- Better Auth manages its own tables (users, sessions, accounts) inside the same Neon
  database, defined via its Drizzle adapter — keep these in `schema.ts` alongside the
  app's own tables.
- Session check happens in `hooks.server.ts` on every request, populating
  `locals.user`. This is the single security gate for `/admin/*` and `/account/*`
  routes — there is no RLS backstop, so this check must never be skipped.
- Admin access is a `role` field on the user record (`role === 'admin'`), same pattern
  as before. Every admin route/query must explicitly check this — do not assume a
  route is protected just because it lives under `/admin/` in the folder structure;
  the check has to actually run in `+layout.server.ts` or the individual load
  function/action.
- Password reset, email verification, and session expiry are handled by Better Auth's
  built-in flows — do not hand-roll these.

## Image Storage Rules (Cloudflare R2)

- Product images are uploaded via `lib/server/storage/r2.ts`, which wraps R2's S3-
  compatible API (R2 is API-compatible with AWS S3, so the standard S3 SDK works).
- Always resize/compress images before upload (target: max ~1200px wide, WebP/JPEG).
  R2 doesn't do this automatically — this is on us, unlike Cloudinary.
- Never expose R2 write credentials to the browser. Uploads from the admin panel go
  through a server route (`+server.ts`) that holds the R2 credentials — the browser
  only ever sends the raw file to our own server, never directly to R2.
- Public image URLs are served either directly from the R2 public bucket URL or via a
  custom domain/CDN in front of it — confirm which before wiring up `image_url` fields.

## Payments Rules

- Never mark an order `paid` from client-side code. Payment confirmation only happens
  in `api/payment/webhook/+server.ts` after verifying the transaction with Toss's
  server-to-server API.
- Use Toss test/sandbox keys (`TOSS_SECRET_KEY`, `TOSS_CLIENT_KEY`) during development.
  Do not hardcode or assume live keys exist — ask before wiring up production payments.
- If asked to add more payment methods (KakaoPay, NaverPay, virtual accounts) later,
  consider PortOne as a multi-PG aggregator rather than integrating each separately.

## Backups

- Neon provides automatic point-in-time recovery: **6 hours of history on the free
  tier** (up to 1 GB of changes), no setup required. This covers recovery from recent
  accidental changes but not longer-term retention.
- For longer retention without upgrading to a paid Neon plan, a scheduled `pg_dump`
  via GitHub Actions is the free option — export nightly to a private repo or R2
  bucket. Set this up before taking real customer orders; do not rely on the 6-hour
  window alone once the store is live.

## Environment Variables (`.env`, never commit)

```
DATABASE_URL=                 # Neon pooled connection string
BETTER_AUTH_SECRET=           # random secret for session signing
BETTER_AUTH_URL=              # base URL of the app (for callback links, e.g. email verification)
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=                 # public URL / custom domain serving the bucket
TOSS_CLIENT_KEY=
TOSS_SECRET_KEY=
```

## Commands

```
npm run dev              # start dev server
npm run build             # production build
npx drizzle-kit generate  # generate SQL migration from schema.ts changes
npx drizzle-kit push      # push schema directly to DB (early-stage dev)
npx drizzle-kit studio    # visual DB browser
```

## Open / Not Yet Decided

- Final styling approach (Tailwind assumed).
- Whether to add PortOne for additional payment methods beyond Toss.
- Order notification method — email vs. Kakao AlimTalk (optional, not built yet).
- Korean address input — plan is to use the free Daum Postcode API for
  zipcode/address lookup at checkout; not yet implemented.
- Whether to front R2 with a custom domain / Cloudflare CDN for image delivery, or
  serve directly from the R2 public bucket URL.
- Retention window for the scheduled `pg_dump` backups (how many days to keep before
  overwriting).

## General Working Style

- Keep the stack minimal for what it needs to do — 3 services (Neon, Better Auth,
  R2) instead of Supabase's 1 is a deliberate tradeoff to avoid egress costs, not an
  invitation to keep adding more services. Avoid introducing further
  services/dependencies unless there's a clear need.
- Prefer server-rendered SvelteKit `load` functions over client-side fetching for
  page data.
- Flag anything that would require paid infrastructure before implementing it.
- Because there's no RLS safety net (unlike the old Supabase setup), be extra careful
  that every server route touching user or admin data has an explicit auth/role check
  — this is the single most important thing to get right in this stack.
