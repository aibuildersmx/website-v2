# Newsletter Subscription — Design

> Self-hosted public signup for "The Build Log", replacing the outward Beehiiv forms.
> Date: 2026-06-24

## Problem

The newsletter backend already exists and is production-ready: a `contacts` table
(Railway Postgres), Resend sending, signed unsubscribe links, first-party open/click
tracking, batch send pipeline. The **only** missing piece is a public on-ramp. Today's
signup forms (`components/cta-section.tsx`, `app/(site)/newsletter/page.tsx`) POST
**outward to Beehiiv** and never write to our own database.

We want people to subscribe directly into our DB via:
1. A canonical shareable link — a dedicated `/suscribete` page.
2. A reusable CTA component dropped across the site (homepage, blog index, blog posts).

## Decisions (locked)

| Topic | Decision |
|---|---|
| Link shape | **Both** — a `/suscribete` page (canonical link) + a reusable CTA component. |
| Opt-in | **Single opt-in now, double opt-in later.** Email goes straight in; schema/action designed so confirmation can be bolted on without a rewrite. |
| Beehiiv | **Full cutover.** Replace the outward Beehiiv forms; new signups land only in Railway Postgres. |
| Fields | **Email only.** `name` stays null (schema already allows it). |
| Abuse protection | **Honeypot + per-IP rate limit.** No third party, no UX cost. |
| Re-subscribe | An unsubscribed person who signs up again **gets re-added** (`newsletterSubscribed: true`). |

## Architecture

```
┌─ NewsletterSignup (client component) ──┐   reusable CTA
│  email input + honeypot + states       │   → homepage, blog index, blog post sidebar
└──────────────┬──────────────────────────┘
               │ calls
┌──────────────▼──────────────────────────┐
│  subscribe() server action               │   lib/actions/subscribe.ts
│  • validate email                        │   (PUBLIC — no auth gate)
│  • honeypot check                        │
│  • per-IP rate limit                     │
│  • upsert into contacts                  │
│    (source "public-signup", subscribed)  │
└──────────────┬──────────────────────────┘
               │ writes
┌──────────────▼──────────────────────────┐
│  contacts table (already exists)         │   no schema migration needed
└──────────────────────────────────────────┘

/suscribete page ── renders NewsletterSignup full-page (stacked variant)
```

The reusable component is the unit everything composes from. The `/suscribete` page is a
thin wrapper that gives us a canonical shareable URL.

## Components & responsibilities

### `lib/actions/subscribe.ts` (new — public server action)

Export `subscribe(formData: FormData): Promise<SubscribeResult>`.

- **No auth gate** (public). This is the only public-write action; keep it small and defensive.
- Reads `email` and a honeypot field named `company` (hidden; humans never see it).
- **Honeypot:** if `company` is non-empty → return `{ ok: true }` (fake success) and write nothing.
- **Validate:** trim + lowercase email; reject if it fails a basic email shape check → `{ ok: false, error: "invalid" }`.
- **Rate limit:** per-IP token bucket, ~5 requests/min. In-memory `Map` keyed by IP
  (Railway runs a single instance today). Read IP from request headers
  (`x-forwarded-for` first hop). Isolated in a small helper so it can be swapped for a
  shared store later without touching `subscribe()`. On trip → `{ ok: false, error: "rate_limited" }`.
- **Upsert by email** (idempotent):
  - New email → insert row: `email`, `sources: ["public-signup"]`, `newsletterSubscribed: true`, `firstSeenAt: now`.
  - Existing email → add `"public-signup"` to `sources` if missing, set `newsletterSubscribed: true` (covers re-subscribe), bump `updatedAt`.
  - Use a single `INSERT ... ON CONFLICT (email) DO UPDATE` (the `email` column is already unique).
- Returns a typed result:
  ```ts
  type SubscribeResult =
    | { ok: true }
    | { ok: false, error: "invalid" | "rate_limited" | "error" };
  ```
- **Double-opt-in seam:** internal `confirmed` flag, default `true` today. When confirmation
  ships later, the action writes a pending state and only flips `newsletterSubscribed` on
  confirm — callers (the component) don't change.
- DB errors → log server-side, return `{ ok: false, error: "error" }`.

### `lib/community/types.ts` (one-line edit)

Add `"public-signup"` to the `ContactSource` union. No DB migration — `sources` is a text array.

### `components/newsletter-signup.tsx` (new — `"use client"`)

Reusable CTA. Props:
- `variant?: "inline" | "stacked"` (default `"inline"`). `inline` = email + button on one row (homepage/footer); `stacked` = heading + subtext + form block (page / blog index).
- `heading?: string`, `subtext?: string` — optional copy overrides.
- `source?: string` — optional source override (defaults to `"public-signup"`), so we can attribute signups per placement later if wanted.

Behavior:
- States: `idle → submitting → success | error`, driven by `useActionState`/`useTransition` against `subscribe`.
- Success copy (Spanish): "¡Listo! Te avisaremos en el próximo número." (single opt-in — no confirmation email yet).
- Error copy maps `invalid` / `rate_limited` / `error` to friendly Spanish messages.
- Hidden honeypot `<input name="company">` (off-screen, `aria-hidden`, `tabIndex={-1}`, `autoComplete="off"`).
- Styled strictly per the binary B/W design system: Geist Mono eyebrow (`font-mono uppercase tracking-widest`), Instrument Serif heading, black (`#212121`)/white only, neutrals via `black/5..60`, status via `green-500`/`red-500`. No new colors, no `dark:` classes.

### `app/(site)/suscribete/page.tsx` (new)

Full-page wrapper. Section uses the canonical layout (`py-16 sm:py-24 md:py-32`,
`mx-auto max-w-6xl px-4 sm:px-6`, `border-t border-black/5`). Renders `<NewsletterSignup variant="stacked" />`
with a short line about The Build Log. Add page `metadata` (title/description) for the shareable link's social preview.

### Swap-in points (Beehiiv cutover)

Replace the Beehiiv `<form action="https://aibuildersmx.beehiiv.com/">` blocks with `<NewsletterSignup />`:
- `components/cta-section.tsx` (homepage) — `inline` variant.
- `app/(site)/newsletter/page.tsx` — `stacked` variant (or redirect/merge with `/suscribete`; keep both pages for now, both use the component).

### Blog placements

- **Blog index** — `components/blog/blog-index.tsx`: full-width `stacked` CTA block **below the post-cards grid**, inside the `max-w-6xl` section (after the grid `</div>`, before `</section>`).
- **Blog post sidebar** — `components/blog/shared.tsx` `StickyTOC`: a compact `stacked` CTA **below the TOC card**, inside the sidebar `<nav>`. Note: the sidebar only renders when the post has a TOC (`hasToc`). Posts without a TOC won't show the sidebar CTA — acceptable for now; a bottom-of-post fallback can be added later if desired.

## Data flow & edge cases

| Case | Result |
|---|---|
| New email | Insert; `sources: ["public-signup"]`, `newsletterSubscribed: true`. |
| Existing subscribed email | No-op success; add source if missing. |
| Previously unsubscribed email | Re-subscribe (`newsletterSubscribed: true`). |
| Honeypot filled (bot) | Fake success, nothing written. |
| Rate-limited IP | `{ ok:false, error:"rate_limited" }` → "Demasiados intentos, intenta en un momento." |
| Invalid email | `{ ok:false, error:"invalid" }` → inline error, no write. |
| DB error | `{ ok:false, error:"error" }` → generic message, logged. |

## Testing

- **Unit-test `subscribe()`** directly (server actions are callable in tests): valid insert,
  upsert dedupe, re-subscribe of an unsubscribed contact, honeypot rejection (no write),
  rate-limit trip, invalid email.
- **Manual checklist:** `/suscribete`, homepage CTA, blog index CTA, blog post sidebar CTA,
  then confirm the new contact appears with `public-signup` source in `/admin/comunidad`
  (or the contacts list).

## Out of scope (later)

- Double opt-in confirmation email (seam left in `subscribe()`).
- CAPTCHA (Turnstile/hCaptcha) — only if honeypot+rate-limit proves insufficient.
- Per-placement source attribution analytics.
- Shared/distributed rate-limit store (current in-memory is fine on single Railway instance).
- Prefilled magic-link signup (`?email=`) — not requested for v1.

## Files touched

| File | Change |
|---|---|
| `lib/actions/subscribe.ts` | New — public `subscribe()` action + rate-limit helper. |
| `lib/community/types.ts` | Add `"public-signup"` to `ContactSource`. |
| `components/newsletter-signup.tsx` | New — reusable CTA component. |
| `app/(site)/suscribete/page.tsx` | New — canonical signup page. |
| `components/cta-section.tsx` | Replace Beehiiv form with `<NewsletterSignup />`. |
| `app/(site)/newsletter/page.tsx` | Replace Beehiiv form with `<NewsletterSignup />`. |
| `components/blog/blog-index.tsx` | Add full-width CTA below post grid. |
| `components/blog/shared.tsx` | Add compact CTA below the StickyTOC card. |
