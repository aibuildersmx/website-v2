# First-party newsletter engagement tracking

**Date:** 2026-06-20 · **Status:** approved, implementing

## Goal
Track opens and clicks for "The Build Log" **first-party** (on `aibuilders.mx`),
keeping Resend's own open/click tracking OFF. Resend's tracking rewrites links
through its domain (a phishing/spam signal) and serves a third-party pixel; doing
it ourselves on our reputable domain avoids that and gives us engagement data to
order future warmup sends by who actually engages.

## Data model
New append-only table `newsletter_events`:
- `id` uuid pk
- `issueId` uuid → newsletter_issues (cascade)
- `contactId` uuid → contacts (cascade)
- `type` text — `'open' | 'click'` (future: `delivered | bounce | complaint` via Resend webhooks)
- `url` text nullable — click destination
- `userAgent` text nullable — to filter bot/proxy prefetch later
- `createdAt` timestamptz default now()
- Indexes: `(issueId, type)`, `(contactId)`.

Append-only (every event) so we can later compute CTR/time-to-open; engagement
booleans derive via `distinct`. No IP stored (privacy).

## Personalization (the core change)
Links are wrapped once in the issue JSON (shared); per-contact data is injected at
**send time**, exactly like `injectUnsubscribe`. Add `injectTracking(html, contactId, issueId)`:
- **Clicks:** append `&c=<contactId>&i=<issueId>` to every `/r/...` link. The target
  is already HMAC-signed (`s`); `c`/`i` are best-effort attribution (forging them only
  pollutes our own analytics — no security impact).
- **Opens:** replace render placeholder `{{{OPEN_PIXEL}}}` with
  `aibuilders.mx/api/newsletter/o/<contactId>.gif?i=<issueId>&s=<sig>`, HMAC-signed
  with `RESEND_API_KEY` (same secret as unsubscribe/links).

Previews and contact-less test sends use `stripTracking()` (removes the pixel
placeholder, leaves `/r` links unattributed).

## Routes
- `/r/[token]` (existing): if `c` & `i` present, log a `click` event (fire-and-forget)
  before the 302. Redirect behavior unchanged.
- `/api/newsletter/o/[token]` (new): verify sig → log `open` → return a 1×1 transparent
  GIF (`no-store`). Invalid sig still returns the GIF but logs nothing (never a broken image).

## Warmup ordering
`warmup.ts` picks recipients in order: **seed-tagged → has recent engagement
(any event in prior issues) → longest-standing (`createdAt`)**. Sends to engaged
contacts earlier = better reputation. Effective from the second tracked issue (#004+);
#003 is the first to *collect*.

## Touched / new files
- New: `lib/newsletter/tracking.ts`, `app/(site)/api/newsletter/o/[token]/route.ts`,
  `drizzle/0005_*` migration.
- Edit: `lib/db/schema.ts` (table), `lib/newsletter/render.ts` (pixel placeholder),
  `lib/newsletter/send-batch.ts` + `lib/actions/newsletter.ts` (inject tracking; strip in previews/tests),
  `app/(site)/r/[token]/route.ts` (log click), `lib/newsletter/warmup.ts` (order by engagement).

## Out of scope (future, same table)
Resend webhooks for bounce/complaint/delivered; consent UI; bot-prefetch filtering
beyond storing `userAgent`.
