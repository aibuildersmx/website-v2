# Community DB + Newsletter Panel — Design Spec

**Date:** 2026-06-07
**Status:** Approved (design); pending implementation plan
**Author:** Ricardo + Mavi

---

## 1. Goal & Vision

Make the AI Builders MX app the **single source of truth** for the community,
hosted entirely on **Railway** (Vercel is sunset). The app already runs on
Railway (`aibm` project, `website-v2` service, serving `aibuilders.mx`) and has
a **Postgres** service online but unused by the code (the code still talks to a
**paused** Supabase project).

The immediate, user-facing goal: **view a newsletter issue in an admin panel and
send it to the community audience** — using Resend as the sending anchor and
retiring Beehiiv.

The underlying goal: build a **unified community database** that merges every
source we have (Beehiiv subscribers + Cursor event attendees + leads) into one
`contacts` table on Railway Postgres. The Resend Audience stops being the source
of truth and becomes a **projection** we sync for sending.

### Services after this work
- **Railway** — hosting + Postgres (the single source of truth)
- **Resend** — email sending (Broadcasts API)
- **Luma** — events (unchanged, external)
- ~~Beehiiv~~ (retired), ~~Vercel~~ (sunset), ~~Supabase~~ (retired in Phase 4)

---

## 2. Scope

This spec covers **Phases 1–3**. Phase 4 (migrating the job board off Supabase)
is acknowledged but gets its own spec/plan cycle.

| Phase | Title | In this spec |
|---|---|---|
| 1 | Postgres foundation + unified community DB | ✅ |
| 2 | Auth on Postgres (email + password) | ✅ |
| 3 | Newsletter panel (MDX + react-email) | ✅ |
| 4 | Job board → Postgres + storage | ❌ future |

### What already exists (Phase 0, done — PR #5)
A standalone CLI in `scripts/newsletter/` that sends via Resend Broadcasts:
- `lib/env.ts` — Resend client factory from env
- `lib/subscribers.ts` — CSV parser (validate, dedupe, skip unsubscribed)
- `import-audience.ts` — CSV → Resend Audience (idempotent)
- `templates/build-log.ts` — email-safe table-based HTML renderer
- `issues/002-the-build-log.ts` + `types.ts` — issue content as typed TS
- `send-broadcast.ts` — `--test` / `--dry-run` / `--send`
- `stats.ts` — broadcast metrics

`resend@^6.12.4` is already a dependency. This logic is reused where noted, but
must be refactored out of the CLI shell (it uses `process.exit`,
`process.loadEnvFile`, dynamic `.ts` imports) into framework-agnostic `lib/`
functions usable from both the CLI and Next.js server actions.

---

## 3. Data sources (the 3 CSVs)

Located in `/Users/vellent/`. These ARE the export (Supabase is paused/NXDOMAIN;
restoring it just to re-export already-exported data is not worth it).

| CSV | Rows | Key columns | Source tag |
|---|---|---|---|
| `ai-builders-mx-basic_subscriber-2026-06-07.csv` (Beehiiv) | 2,177 | `email`, `status` (active), `tags`, `premium?`, `created_at` | `beehiiv` |
| `attendees.csv` (Cursor Event) | 81 | `email`, `name`, `locale`, `opted_in_for_raffle`, `selected_prize_id`, `coupon_code_id`, `registered_at` | `cursor-event` |
| `leads.csv` | 90 | `email`, `name`, `locale`, `coupon_code_id`, `registered_at` | `lead` |

Expected unified total: ~2,200+ (event attendees overlap with Beehiiv), not the
naive sum of 2,348.

---

## 4. Phase 1 — Postgres foundation + unified community DB

### 4.1 ORM / driver
**Drizzle ORM** + `postgres`/`pg` driver. Rationale: TS-native, lightweight,
SQL-ish migrations that match the existing `.sql` migration style, first-class
Railway Postgres fit. Prisma is heavier; raw `pg` is too manual for a growing
schema.

- Connection reads `DATABASE_URL` (already injected into `website-v2` as
  `postgresql://...@postgres.railway.internal:5432/railway`).
- Migrations live in a Drizzle migrations folder; a `pnpm db:migrate` script
  applies them. Schema defined in TS (`lib/db/schema.ts`).

### 4.2 `contacts` table
One row per human; **lowercased `email` is the merge key**.

```
contacts
  id                     uuid pk default gen_random_uuid()
  email                  text unique not null      -- lowercased
  name                   text
  locale                 text
  sources                text[] not null default '{}'   -- {beehiiv,cursor-event,lead}
  tags                   text[] not null default '{}'
  is_premium             boolean not null default false  -- from beehiiv premium?
  newsletter_subscribed  boolean not null default true   -- see consent decision
  metadata               jsonb not null default '{}'     -- raffle, coupon, source-native ids
  first_seen_at          timestamptz                     -- min(created_at) across sources
  created_at             timestamptz not null default now()
  updated_at             timestamptz not null default now()
```

Indexes: unique on `email`; GIN on `sources` and `tags` for segmentation later.

### 4.3 Consent decision
**All contacts get `newsletter_subscribed = true`** (Ricardo's explicit call),
including event attendees and leads who registered for an *event* rather than the
newsletter. **One exception:** Beehiiv rows whose status is explicitly
`unsubscribed`/`bounced` are imported with `newsletter_subscribed = false` — re-mailing
an explicit opt-out is a hard compliance line (CAN-SPAM) and is never overridden
(see §4.4). Documented risk: mailing people who did not opt into the newsletter
can raise spam complaints and hurt Resend sender reputation. Mitigation if
complaints appear: segment by `sources` (e.g. mail `beehiiv` only) — the schema
supports this without a migration. Resend handles unsubscribe natively, which
backstops compliance.

### 4.4 Import + merge
A script (and later an admin action) that:
1. Parses each CSV (reuse/extend `scripts/newsletter/lib/subscribers.ts`).
2. Normalizes `email` to lowercase, trims.
3. **Upserts** by email: on conflict, append the `source`, fill missing
   `name`/`locale`, merge `tags`, keep earliest `first_seen_at`, stash
   source-native ids + raffle/coupon data in `metadata`.
4. Idempotent: re-running with the same CSVs is a no-op beyond `updated_at`.
5. Reports inserted / merged / skipped counts.

`status = unsubscribed/bounced/etc.` rows from Beehiiv are imported with
`newsletter_subscribed = false` (parser already detects unsubscribed states),
so a paused/bounced Beehiiv contact does not silently get re-mailed.

---

## 5. Phase 2 — Auth on Postgres (email + password)

Replace Supabase Auth (paused, and we are leaving Supabase). **Email + password
only — no Google/OAuth**, per Ricardo, to remove that problem for now.

### 5.1 `users` table
```
users
  id             uuid pk default gen_random_uuid()
  email          text unique not null      -- lowercased
  password_hash  text not null             -- bcrypt/argon2
  role           text not null default 'admin'
  created_at     timestamptz not null default now()
  updated_at     timestamptz not null default now()
```

### 5.2 Sessions & gate
- Password hashing with a vetted lib (bcrypt or argon2).
- Cookie-based session (httpOnly, secure, signed). A `sessions` table or signed
  stateless token — implementation plan decides; default to a `sessions` table
  for easy revocation.
- `getUser()` rewritten to read the session and return the user, replacing the
  Supabase recruiter-allowlist version in `lib/auth.ts`.
- Gate the whole `/admin` area (newsletter panel lives here). The existing
  `/login` page is repointed at the new email+password `signIn`.
- A `pnpm db:seed-admin` (or one-off script) creates Ricardo's admin user from
  env-provided credentials.

> Note: the job-board dashboard currently depends on the Supabase `getUser()`.
> Since the job board is stale/unused, repointing its gate at the new auth is
> acceptable; full job-board migration is Phase 4.

---

## 6. Phase 3 — Newsletter panel (MDX + react-email)

### 6.1 Rendering engine
**MDX content authored like the blog, components built on react-email
primitives.** One component definition, two outputs:
- **Web** — rendered in the admin panel (live preview) and at
  `/newsletter/<slug>` (public archive). react-email components render in the
  browser too.
- **Email** — `@react-email/render` produces email-safe HTML (tables + inlined
  styles) for sending.

Rationale (decision record): Codex/agents author these newsletters. Markdown is
the lowest-friction, least-breakable surface for an agent; react-email owns the
email-client quirks so we never hand-roll (and re-break) email-safe HTML. This
beats both pure react-email `.tsx` (agent writes fragile JSX) and freeform MDX +
`juice` (we maintain the email-safe layer by hand; flex/clamp do not survive in
Gmail/Outlook regardless of inlining).

### 6.2 Content layout
- `content/newsletter/<slug>.mdx` — one file per issue. Filename minus `.mdx` is
  the slug. Auto-discovered (mirror `lib/blog/posts.ts` → `lib/newsletter/issues.ts`).
- Frontmatter: `subject`, `preview` (inbox text), `issueLabel`, `date`,
  `readingTime`, `title`, `subtitle`.
- Body uses newsletter MDX components. Initial set maps the existing
  `issues/types.ts` concepts to components:
  `<Story>`, `<Essay>`, `<UseCase>`, `<EventItem>`, `<Community>`, `<JobItem>`,
  plus shared `<Callout>` etc. Each implemented with react-email primitives
  (`Section`, `Row`, `Column`, `Text`, `Heading`, `Link`, `Hr`, `Img`).
- Components are registered in a newsletter-specific MDX component map (separate
  from the blog's `mdx-components.tsx`).
- **Seed:** the first issue's content is lifted (text only) from
  `~/Downloads/index.html` ("The Build Log - AI Builders MX") into the first
  `.mdx`. The old TS template (`templates/build-log.ts`) and the standalone
  `index.html` are retired once parity is confirmed.

### 6.3 Admin panel — `/admin/newsletter`
- **List** issues (from `content/newsletter/*.mdx`), newest first, with status.
- **Detail** view per issue: live web preview of the rendered components.
- **Send test** — `resend.emails.send` to a single address (unsubscribe token
  replaced with `#`), reusing the Phase 0 test path.
- **Send broadcast** — confirm-gated. Pipeline:
  1. Sync `contacts WHERE newsletter_subscribed = true` into the Resend Audience
     (idempotent upsert of contacts).
  2. `resend.broadcasts.create` with the email-safe rendered HTML.
  3. `resend.broadcasts.send`.
- Open/click metrics live in the Resend dashboard (Resend Node SDK v6 does not
  return them via `broadcasts.get`); the panel links out, consistent with the
  existing `stats` CLI.

### 6.4 Server actions & shared lib
Refactor Phase 0 CLI internals into `lib/newsletter/`:
- `lib/newsletter/render.ts` — MDX → web React tree and → email-safe HTML.
- `lib/newsletter/issues.ts` — discover/parse `.mdx` issues.
- `lib/newsletter/send.ts` — test send, audience sync, broadcast create+send.
- `lib/newsletter/resend.ts` — Resend client from env (no `process.exit`).
The CLI scripts become thin wrappers over these so both paths share one
implementation.

### 6.5 Env vars (Railway `website-v2`)
Add: `RESEND_API_KEY`, `NEWSLETTER_FROM`, `RESEND_AUDIENCE_ID` (+ optional
`NEWSLETTER_REPLY_TO`). Set via `railway variables --set`. `DATABASE_URL` already
present. `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` for the auth seed.

---

## 7. Data flow (end state, Phases 1–3)

```
3 CSVs ──import/merge──▶ Postgres `contacts` (single source of truth)
                                 │
                                 │ newsletter_subscribed = true
                                 ▼
                      sync (idempotent) ──▶ Resend Audience
                                                  │
content/newsletter/*.mdx ──react-email render──▶ email-safe HTML
                                                  │
                                    broadcasts.create + send ──▶ inboxes
                                                  ▲
                              /admin/newsletter (auth-gated panel)
                              · list · web preview · test · send
```

---

## 8. Testing strategy

- **Unit:** CSV parse/merge (dedup by email, source append, tag merge, status →
  `newsletter_subscribed`); MDX → email HTML snapshot per component; auth
  password hashing + session validation.
- **Integration:** import script against the real 3 CSVs into a test DB →
  assert contact count and merge correctness; audience sync idempotency.
- **Manual:** send `--test` to Ricardo's inbox and verify render in Gmail +
  Apple Mail before any broadcast; dry-run reports subscribed count.
- Existing `tests/newsletter` (vitest) is extended, not replaced.

---

## 9. Risks & open items

- **Spam/reputation:** mailing event/lead contacts who did not opt into the
  newsletter. Mitigation: `sources`-based segmentation available without
  migration; monitor Resend complaint rate after first send.
- **Email parity:** react-email output must be verified in real clients before
  trusting the retirement of `build-log.ts`. Keep both until parity confirmed.
- **Auth migration blast radius:** rewriting `getUser()` touches the job-board
  dashboard gate. Acceptable because the job board is stale; verify it still
  loads (or is intentionally locked) after the swap.
- **MDX → react-email glue:** wiring MDX components to react-email primitives is
  the main net-new engineering. Build the component set first, snapshot-test it,
  then author content.

---

## 10. Out of scope (future)

- **Phase 4:** job board (`companies`, `jobs`, `applications`, `recruiters`,
  `webinar_leads`) + Supabase Storage (CV/logo uploads) → Railway Postgres + a
  file store (Railway volume or S3/R2). Its own spec/plan.
- Site signup form writing directly into `contacts` (a natural Phase 3.5).
- Resend webhooks → write unsubscribe/bounce events back into `contacts`.
