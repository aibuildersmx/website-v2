# Newsletter Sending Queue — Design

**Date:** 2026-06-08
**Status:** Approved (design)
**Supersedes the synchronous send path in** `lib/actions/newsletter.ts` → `sendIssue()`

## Problem

Mass sending today runs entirely inside one synchronous server action
(`sendIssue`, `lib/actions/newsletter.ts:164`): it loads every subscribed
contact, chunks them by 100, and calls `resend.batch.send()` sequentially in
the same request, then flips the issue to `sent`.

This is not foolproof:

- **Single request.** ~2,256 contacts = ~23 sequential Resend calls in one
  request. A Railway/Next timeout leaves a partial send with no record of where
  it stopped.
- **No per-recipient tracking.** Failures are counted per chunk, not per
  recipient — a single bad address can mark a whole chunk failed (or none).
  There's no "who actually received it."
- **No retries, no idempotency.** A partial failure + a second "Send" click
  re-mails everyone who already received. The `status === "sent"` guard does not
  help partial sends.
- **No rate-limit handling.** The tight loop can hit Resend's ~2 req/s limit.
- **Blocks the admin UI** while sending thousands.

## Goal

Replace the synchronous send with a **Postgres-backed job queue** so each batch
is an idempotent, retryable job that survives restarts, tracks delivery
per-recipient, and never double-sends.

## Decisions (locked)

- **Queue backend:** `pg-boss` on the existing Railway Postgres. No Redis. Reused
  for other internal scheduled jobs later.
- **Worker:** a second Railway service on the **same repo**, started with
  `pnpm worker`. Shares Drizzle schema, newsletter render, and Resend config with
  the web service — no duplication.
- **Tracking granularity:** per-recipient `newsletter_sends` table with a unique
  `(issueId, contactId)` constraint. This is the idempotency anchor.
- **Concurrency:** worker processes this queue with team size 1 (serial batches)
  to stay under Resend's rate limit. Tunable later.
- **Finalization:** the last batch to finish (no `pending`/`processing` rows left
  for the issue) flips the issue to `sent`. No separate finalize cron.

## Architecture

```
Admin clicks "Enviar"
        │
        ▼
[web service]  sendIssue(issueId)
    1. INSERT newsletter_sends (issueId, contactId, status='pending')
       for every subscribed recipient  — ON CONFLICT (issueId, contactId) DO NOTHING
    2. UPDATE newsletter_issues SET status='sending'
    3. for each chunk of 100 contactIds:
         pgboss.send('newsletter.send-batch', { issueId, contactIds })
        │
        ▼  (Postgres = queue; web + worker share DATABASE_URL)
[worker service]  pnpm worker  →  pg-boss drains 'newsletter.send-batch'
    handler(job):
      1. SELECT contacts joined to newsletter_sends
         WHERE issueId = job.issueId
           AND contactId IN job.contactIds
           AND status = 'pending'          ← re-read; skips already-sent on retry
      2. render issue once; resend.batch.send(pending recipients)
      3. per recipient: UPDATE newsletter_sends SET status='sent', resendId=...
         (or status='failed', error=...)
      4. if no rows with status IN ('pending') remain for issueId:
           UPDATE newsletter_issues SET status='sent', sentAt=now()
           WHERE id=issueId AND status='sending'   ← guarded against double-finalize
```

## Data model

New table `newsletter_sends` (`lib/db/schema.ts` + Drizzle migration):

| column      | type        | notes                                        |
|-------------|-------------|----------------------------------------------|
| `id`        | uuid pk     | `defaultRandom()`                            |
| `issueId`   | uuid        | fk → `newsletter_issues.id`, `onDelete: cascade` |
| `contactId` | uuid        | fk → `contacts.id`, `onDelete: cascade`      |
| `status`    | text        | `pending` \| `sent` \| `failed`, default `pending` |
| `resendId`  | text (null) | id returned by Resend, for audit             |
| `error`     | text (null) | failure message                              |
| `createdAt` | timestamptz | `defaultNow()`                               |
| `updatedAt` | timestamptz | `defaultNow()`                               |

- **Unique index `(issueId, contactId)`** — makes re-enqueue a no-op.
- Index on `(issueId, status)` for the finalization / progress queries.

`newsletter_issues.status` gains `sending`: `draft → sending → sent`. The schema
comment is updated to `"draft" | "sending" | "sent"`.

## Components

- **`lib/queue/boss.ts`** (new) — singleton pg-boss factory bound to
  `DATABASE_URL`. `getBoss()` starts it lazily; used by the web service to enqueue
  and by the worker to process. pg-boss owns its own `pgboss` schema in the DB.
- **`lib/newsletter/send-batch.ts`** (new) — pure-ish handler logic:
  `processSendBatch({ issueId, contactIds })`. Re-reads pending rows, renders,
  calls Resend, marks each row, attempts finalization. Isolated so it's testable
  with a mocked Resend.
- **`worker.ts`** (new, repo root) — boots pg-boss, registers
  `boss.work('newsletter.send-batch', { teamSize: 1 }, handler)`. Added as
  `"worker": "tsx worker.ts"` (or compiled equivalent) in `package.json`.
- **`lib/actions/newsletter.ts`** — `sendIssue` changes from "send everything" to
  "create send rows + enqueue + set status=sending". New action
  `retryFailed(issueId)` re-enqueues batches for rows currently `failed` (resets
  them to `pending` first).
- **Admin newsletter UI** — issue row/detail shows progress (`X / Y enviados`)
  derived from `newsletter_sends` counts, the `sending` state, and a **"Reintentar
  fallidos"** button when failed > 0.

## Idempotency & retries

- pg-boss job options: `retryLimit: 5`, `retryBackoff: true`.
- The handler **always re-reads `pending` rows** before sending, so a retried
  batch never re-mails a recipient already marked `sent`.
- Terminal states are `sent` and `failed`. Finalization triggers when zero
  `pending` rows remain (failed rows don't block it). The issue's final state is
  `sent`; failed count is surfaced in the UI and recoverable via `retryFailed`.
- Double "Send" click → `ON CONFLICT DO NOTHING` on inserts + the
  `WHERE status='sending'` finalize guard → no duplicates, no double-finalize.

## Rate limits

Worker runs `newsletter.send-batch` with `teamSize: 1` → batches process
serially, comfortably under Resend's ~2 req/s. Raising throughput later is a
config number, not a redesign.

## Error handling

- Resend call throws / returns error → the whole batch job throws → pg-boss
  retries with backoff. Rows stay `pending` (not yet marked), so the retry re-sends
  them cleanly.
- Per-recipient partial failures inside a successful `batch.send` → mark those
  rows `failed` with the error; the rest `sent`. Job succeeds; failed rows are
  retryable via the UI button.
- Missing Resend env (`MissingEnvError`) → surfaced at enqueue time in `sendIssue`
  (fail fast before creating rows), same as today.

## Testing

- `processSendBatch` with a mocked Resend client:
  - marks recipients `sent` with `resendId`, others `failed` with `error`;
  - a second invocation of the same batch re-reads pending and **does not**
    re-call Resend for already-sent rows;
  - finalizes the issue to `sent` only when no `pending` rows remain.
- Enqueue idempotency: calling `sendIssue` twice creates the same number of
  `newsletter_sends` rows (unique constraint holds).

## Out of scope

- Open/click tracking, scheduled (future-dated) sends, audience segmentation.
- Migrating other internal jobs onto pg-boss (enabled by this work, done later).

## Rollout

1. Schema + migration (`pnpm db:generate` → `pnpm db:migrate`).
2. `lib/queue/boss.ts`, `lib/newsletter/send-batch.ts`, `worker.ts`.
3. Rewire `sendIssue`, add `retryFailed`, update admin UI.
4. Add the Railway worker service (same repo, start command `pnpm worker`).
5. Verify with a small test issue to a controlled contact set before a real send.
