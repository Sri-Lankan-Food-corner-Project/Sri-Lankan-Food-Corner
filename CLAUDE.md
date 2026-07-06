# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project Overview

E-commerce website for **Sri Lankan Food Corner** — a Sri Lankan grocery
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
- **Styling:** Tailwind CSS v4 with `@tailwindcss/vite`. Brand palette is registered
  as theme tokens (see "Design System / Color Palette" below) — use `bg-brand-green`,
  `text-brand-amber`, etc. Fonts: Poppins (Latin) + Noto Sans KR (Korean) + Noto Sans
  Sinhala, loaded via `<link rel="stylesheet">` in `src/app.html` (NOT via
  `@import` in CSS — `@import` blocks render until the CSS bundle downloads and
  parses, which cost ~2.8 s of FCP on mobile). Do not move these back into CSS.

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
│   │   ├── home/             # section components for the homepage (HeroBanner, FeatureMarquee, …)
│   │   ├── header/           # header sub-components
│   │   ├── admin/            # admin panel-only components
│   │   ├── ui/               # shadcn-svelte primitives (button, input, dialog, …)
│   │   └── *.svelte          # shared app-wide components (Header, Footer, ProductCard, …)
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

## Design System / Color Palette

The customer-facing storefront uses a warm, natural palette inspired by Sri Lankan
food packaging (earthy greens, cream tones, warm amber accents). All colors are
registered as Tailwind theme tokens in `src/routes/layout.css` → use them via
utility classes (`bg-brand-green`, `text-brand-amber`, `border-brand-cream`, …).
**Do not sprinkle raw hex codes across components** — reach for the tokens so the
palette stays consistent and future rebrands are one-file changes.

| Token                        | Hex        | Purpose                                                                        |
|------------------------------|-----------|--------------------------------------------------------------------------------|
| `brand-green`                | `#2B4B1F` | Primary brand — header top bar, primary CTAs, admin accents, focus rings       |
| `brand-green-hover`          | `#22391A` | Hover state for green surfaces                                                 |
| `brand-amber`                | `#E8B267` | Warm accent — cart button, sale badges, secondary CTAs, highlight strips       |
| `brand-amber-hover`          | `#DFA755` | Hover state for amber surfaces                                                 |
| `brand-cream`                | `#F6EEDC` | Header main-bar surface, soft callouts, empty states                           |
| `brand-sand`                 | `#F3F1EA` | Page background (applied to `body`)                                            |
| `brand-charcoal`             | `#353535` | Footer, dark-neutral buttons ("All Categories"), dropdown item hover           |
| `brand-charcoal-hover`       | `#2A2A2A` | Hover state for charcoal surfaces                                              |
| `white`                      | `#FFFFFF` | Cards, dropdown panels, search input surface                                   |

### Usage rules

- **Primary CTA** (Add to Cart, Checkout, Sign up): `bg-brand-green text-white hover:bg-brand-green-hover`.
- **Warm accent CTA** (view cart, promotional badges): `bg-brand-amber text-neutral-900 hover:bg-brand-amber-hover`.
- **Dark neutral button** (All Categories, secondary admin actions): `bg-brand-charcoal text-white hover:bg-brand-charcoal-hover`.
- **Card / panel surface**: `bg-white` on a `bg-brand-sand` page.
- **Callout / highlight strip inside a panel** (e.g. dropdown header): `bg-brand-green text-white` or `bg-brand-cream text-neutral-900`.
- **Hover / focus state for dropdown menu items**: `focus:bg-brand-charcoal focus:text-white` — matches the footer's tone so the whole UI feels consistent instead of using pure black.
- Text on `brand-green` / `brand-charcoal` / `brand-amber` should be `white` or `neutral-900` respectively — never rely on the default shadcn `text-primary-foreground` since those tokens are unrelated to the brand palette.
- Do not use the shadcn `--primary` / `--accent` / `--muted` tokens for customer-facing marketing surfaces — those are neutral shadcn defaults and will drift away from the brand feel. They're fine inside the `/admin` panel, which is intentionally neutral.

### Where the palette is defined

`src/routes/layout.css` → `@theme inline { --color-brand-*: ...; }`. Tailwind v4
auto-generates every `bg-`, `text-`, `border-`, `ring-`, `outline-`, `divide-`,
`from-`, `via-`, `to-`, and `decoration-` variant from those tokens, so any color
utility that works for `bg-primary` also works for `bg-brand-green`.

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

## Components & Page Structure

- **Keep `+page.svelte` thin.** A route file should mostly be a list of `<SectionComponent />`
  tags with its own `load` data plumbed in as props. Don't inline hero sliders, marquees,
  product grids, etc. — extract them into components under `src/lib/components/<area>/`.
- **Folder layout for components**:
  - `src/lib/components/home/` — homepage sections (`HeroBanner`, `HeroSlider`,
    `HeroCategoryCard`, `FeatureMarquee`, …).
  - `src/lib/components/header/`, `src/lib/components/admin/` — area-specific.
  - `src/lib/components/ui/` — shadcn-svelte primitives (buttons, inputs, dialogs).
  - `src/lib/components/*.svelte` (top level) — shared across areas (`Header`,
    `Footer`, `ProductCard`, `CartItem`, `MobileBottomNav`).
- **One responsibility per component.** If a section has a reusable pattern (e.g. the
  two "category cards" on the homepage), turn it into a props-driven component
  (`HeroCategoryCard`) rather than copy-pasting the markup. Variants (light-on-dark vs
  dark-on-light text) should be a `tone` prop with a lookup table, not two components.
- **Props are typed with `$props()` + a `type Props = { ... }`.** Skip the type only for
  trivial one-off components. Always accept Tailwind class props (`bgClass`, `blobClass`)
  as strings rather than baking hex colors into the component — this keeps color choices
  in the palette tokens.
- **Data belongs with the component that renders it.** The slide list lives in
  `HeroSlider.svelte`, the marquee items live in `FeatureMarquee.svelte`. Don't hoist
  static content into the route file just because that's where it started.
- **Scoped styles for animations, Tailwind for everything else.** The marquee's
  `@keyframes` live in the component's `<style>` block; layout/color use utility classes.
  Don't create parallel CSS files for component styles.
- **Naming**: `PascalCase.svelte` for component files, singular nouns (`ProductCard`,
  not `ProductCards`). Match the folder to the section (`home/HeroBanner.svelte`, not
  `HomeHeroBanner.svelte`).

## Performance Patterns (rendering & data loading)

The site targets Korean customers over Vercel `sin1` + Neon Singapore. Perceived
speed comes from **painting the shell as fast as possible** and letting slower
data fill in progressively, not from making every query faster.

### 1. Stream heavy queries via `streamed: { ... }`

Anything a `load` function fetches by default blocks the first HTML byte. If a
query isn't needed for the above-the-fold render (reviews, product listings,
homepage sliders), return it as an **unawaited** promise nested inside a
`streamed` object, and consume it with `{#await}` on the client.

```ts
// +page.server.ts — awaits only what the shell needs, streams the rest
export const load: PageServerLoad = async ({ params }) => {
  const [row] = await db.select(...).from(products).where(...);
  if (!row) throw error(404);
  const images = await db.select(...).from(productImages).where(...);

  // Nested under `streamed` → SvelteKit ships the HTML first and streams this later.
  const reviewData = (async () => {
    const [reviews, summary, own] = await Promise.all([...]);
    return { reviews, summary, own };
  })();

  return { product: row, images, streamed: { reviewData } };
};
```

```svelte
<!-- +page.svelte -->
{#await data.streamed.reviewData}
  <ReviewsSkeleton />
{:then r}
  <ProductReviews {...r} />
{/await}
```

Rules:
- **Top-level Promise → awaited before render. Nested Promise → streamed.** This
  is why the `streamed: { ... }` wrapper matters — a bare Promise at the top
  level of the return object gets awaited and defeats the whole point.
- Always ship a **skeleton** in the `{#await}` pending branch that mirrors the
  final layout (same heading heights, same grid columns). No CLS when data lands.
- Await the queries you actually need for the shell (product row + hero image,
  category record for the page title, 404 checks). Defer everything below the fold.

Already streamed:
- `/products/[slug]` → reviews section
- `/products/` and `/category/[slug]` → the full listing (`loadProductListing`)
- `/` (home) → home sections (`loadHomeSections`)

### 2. In-memory caching for near-static data (`categoriesCache`)

`src/lib/server/categoriesCache.ts` is the pattern to follow when a table is
read on nearly every request but rarely changes. 60-second TTL, per Vercel
function instance, invalidated manually by admin mutation actions.

```ts
// After any create/update/delete in /admin/categories:
import { invalidateCategoriesCache } from '$lib/server/categoriesCache';
// ...
await db.insert(categories).values(...);
invalidateCategoriesCache();
```

When to add a similar cache for a new table:
- Read on most navigations (like categories are, from `+layout.server.ts`).
- Writes are rare and go through admin-only routes (so we know exactly where
  to `invalidate*Cache()` from).
- Data is small and safe to hold in memory (a few KB).

When NOT to cache:
- Per-user data (wishlist, cart, orders) — freshness matters more than 10 ms.
- Anything with strong consistency needs (stock quantity, payment status).
- Data that changes from webhooks / external services (Toss callbacks, etc.).

**Serverless caveat:** each Vercel function instance has its own memory. Cold
starts miss and query normally. If multiple instances serve concurrent traffic,
each holds its own cache; a manual invalidation only clears the instance that
handled the admin request. At ~100 customers/day this is fine — usually one
warm instance handles everything. Do not add Redis/Vercel KV to fix this
unless traffic actually justifies it.

### 3. Link preload strategy

`src/app.html` sets `<body data-sveltekit-preload-data="tap">` globally.
Preloading fires on `mousedown` / `touchstart` — the moment the user starts
a click — not on `mouseenter`. This gives every navigation a ~50 ms head
start on desktop and mobile without preloading links people just move their
cursor past.

Do not switch this back to `hover` without a specific reason. `hover` fires
on cursor movement across every link, which on a product grid means dozens
of wasted prefetches per second of casual browsing.

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
