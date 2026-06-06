# Newsletter Sending — Design (Phase 1)

> Date: 2026-06-05 · Status: approved design, pre-implementation
> Topic: stand up a way to send the AI Builders MX newsletter ("The Build Log") to our list, owned by us, without depending on Beehiiv, Vercel, or the paused Supabase project.

---

## Goal

Send "The Build Log" issues to our subscriber list via **Resend**, with native open/click analytics and compliant unsubscribe, using only assets we control today (a verified Resend domain + a CSV of subscribers). Everything must be versioned in the repo and portable to Railway later.

**Phase 1 priority is sending.** Subscriber capture on the site, a web archive, our own subscriber DB, and Railway are explicitly later phases.

---

## Constraints (the reason the design looks like this)

- **No Vercel control.** The production site deploys on Ben's Vercel account. Code ships via `git push` (auto-deploy), but we **cannot add new secret env vars** (e.g. `RESEND_API_KEY`) to that deployment. → Sending must run off-Vercel.
- **No live database right now.** The Supabase project (`AIBM Job Board`) is paused (INACTIVE), and the user chose **CSV-only** for this phase. → No DB writes in Phase 1.
- **Verified Resend domain exists.** We can send for real today.
- **Subscriber list is exportable** from Beehiiv as CSV.
- **Compliance.** A self-rolled send loop over a CSV has nowhere to record opt-outs and no unsubscribe endpoint → spam risk and domain reputation risk. This is why we lean on Resend's managed list features instead of a raw send loop.

---

## Approach: Resend Broadcasts (managed audience)

Import the CSV into a **Resend Audience**, then send each issue as a **Broadcast**. Resend natively injects the unsubscribe link, processes unsubscribes, and tracks opens/clicks — no backend, no DB, compliant. We drive it with a small versioned script so the flow is reproducible and movable to Railway.

Trade-off accepted: the subscriber list lives in Resend for now. It is exportable, so Phase 2 (our own DB) is not blocked.

---

## Architecture

All Phase 1 code lives under `scripts/newsletter/` in this repo. It is a standalone CLI, **not** part of the Next.js app — it never deploys to Vercel.

```
scripts/newsletter/
  issues/
    002-the-build-log.ts      # issue data (title, date, sections, stories…)
  templates/
    build-log.tsx             # email-safe template, dark/red Build Log look
  lib/
    resend.ts                 # Resend client from local env
    render.ts                 # issue data + template -> email-safe HTML
  import-audience.ts          # CSV -> Resend Audience (idempotent)
  send-broadcast.ts           # render issue -> create + send Broadcast
  stats.ts                    # pull open/click summary for an issue
  .env.example                # documents RESEND_API_KEY (real .env is git-ignored)
```

Run via `tsx` (dev dependency). Commands (exact CLI surface finalized in the plan):

| Command | What it does |
|---|---|
| `import-audience --csv path.csv` | Upserts CSV rows as contacts in the Resend Audience. Idempotent. |
| `send-broadcast --issue 002 --test you@email` | Renders the issue, sends a **test** to one address. |
| `send-broadcast --issue 002 --dry-run` | Renders + validates, prints recipient count, sends nothing. |
| `send-broadcast --issue 002 --send` | Creates and sends the real Broadcast to the audience. |
| `stats --issue 002` | Prints delivered/opened/clicked/bounced/unsubscribed summary. |

### Data flow

```
Beehiiv CSV ──import-audience──> Resend Audience (contacts, unsubscribe state)
issue data (.ts) + template ──render──> email-safe HTML
HTML + Audience ──send-broadcast──> Resend Broadcast ──> inboxes
                                          │
                                          └── opens/clicks/unsubs (Resend) ──stats──> console summary
```

---

## Components

### 1. Email-safe Build Log template
The current `index.html` uses a `<style>` block, CSS custom properties, and `clamp()` — all unreliable in Gmail/Outlook. The template re-expresses the same layout with **inline styles and fixed px**, table-based where needed for Outlook.

- **Keeps the dark/editorial Build Log aesthetic** (`#030303` bg, `#e50914` accent). The email is its own surface and is intentionally exempt from the site's binary black/white design system; the website surfaces (Phase 2 archive) will follow the design system.
- Adds a footer with the Resend unsubscribe link and physical-sender line (CAN-SPAM/compliance).
- Sets a proper subject + preview text per issue.
- Spanish copy (`es_MX`), matching the existing issue voice.

### 2. Issue as versioned data
Each issue is a typed data file (sections: "Esta semana en IA", "Pensamiento de la semana", "En qué estamos usando IA", "Próximos eventos", "Comunidad"/jobs). Issue #002 is ported from the existing HTML as the first one. This data shape is reused by the Phase 2 web archive, so no rework later.

### 3. Audience import
Reads the Beehiiv CSV (email + optional name), upserts into the Resend Audience. Idempotent so re-running after a fresh export doesn't duplicate. Skips already-unsubscribed contacts.

### 4. Stats
Pulls the issue's broadcast metrics from the Resend API into a short console summary. (Native Resend dashboard remains the rich view.)

---

## Secrets & config

- `RESEND_API_KEY` lives only in `scripts/newsletter/.env` (git-ignored) and, later, in Railway. **Never** committed, never added to Vercel.
- `.env.example` documents the variable.
- No Supabase, no Vercel env changes in this phase.

---

## Error handling

- **Missing/invalid API key** → fail fast with a clear message before any network call.
- **Malformed CSV** (no email column, bad rows) → report bad rows, import the rest, exit non-zero if any failed.
- **Real send guarded** → `--send` requires an explicit flag; default is `--dry-run`. A test send to the operator is the recommended pre-flight.
- **Render validation** → required issue fields (subject, date, at least one section) validated before send; missing fields abort.

---

## Testing

- **Render tests:** issue data + template renders to HTML containing expected subject, section titles, unsubscribe placeholder, and no `clamp(`/`var(--` leftovers.
- **CSV parse tests:** valid rows parsed, malformed rows flagged, dedupe works.
- **Manual pre-flight:** `--dry-run` (count check) then `--test` to the operator's inbox, verify rendering across Gmail + one Outlook/Apple Mail, then `--send`.

---

## Explicitly out of scope (later phases)

- **Phase 2:** site signup form → our own subscriber DB (replacing the Beehiiv redirect in `components/cta-section.tsx`), reusing the existing Supabase config already present on Vercel.
- **Phase 2/3:** web archive at `/newsletter/<issue>` rendered in the design system (MDX, like the blog), from the same issue data.
- **Phase 3:** our own subscribers + events tables, Resend webhook for per-subscriber analytics.
- **Later:** move the whole sender to Railway.

---

## Success criteria

1. Issue #002 sends to the imported audience from a single command.
2. Recipients get an email-safe Build Log that renders correctly in Gmail and one of Outlook/Apple Mail.
3. The email has a working unsubscribe link handled by Resend.
4. `stats --issue 002` returns open/click numbers.
5. No secret was added to Vercel; nothing depends on the paused Supabase project.
