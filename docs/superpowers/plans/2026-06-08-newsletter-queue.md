# Newsletter Sending Queue Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the synchronous newsletter send with a Postgres-backed pg-boss queue so each batch is an idempotent, retryable job tracked per-recipient.

**Architecture:** The web service enqueues one `newsletter.send-batch` job per 100 recipients after writing a `pending` row per recipient into a new `newsletter_sends` table (unique on `(issueId, contactId)`). A second Railway service on the same repo (`pnpm worker`) drains the queue with pg-boss: each handler re-reads only `pending` rows, sends via Resend, marks rows `sent`/`failed`, and the last batch to drain flips the issue to `sent`. A dead-letter queue marks rows `failed` after retries are exhausted.

**Tech Stack:** Next.js 16 (server actions), Drizzle ORM + Railway Postgres, pg-boss, Resend, Vitest.

---

## Reference: existing pieces this plan builds on

- `lib/db/client.ts` — exports `db` and `type DB`. `postgres-js` with `prepare: false`.
- `lib/db/schema.ts` — Drizzle tables. `newsletterIssues` has `status` (`"draft" | "sent"`), `data` (JSONB `Issue`), `sentAt`. `contacts` has `id`, `email`, `newsletterSubscribed`.
- `lib/newsletter/render.ts` — `renderBuildLog(issue: Issue): string`.
- `lib/newsletter/unsubscribe.ts` — `injectUnsubscribe(html, contactId)`, `unsubscribeHeaders(contactId)`.
- `lib/newsletter/resend.ts` — `loadNewsletterConfig()` → `{ resend, from, replyTo }`; `MissingEnvError`.
- `lib/newsletter/recipients.ts` — `subscribedRecipients()` → `{ id, email, name }[]`; `chunk<T>(items, size=100)`.
- `lib/actions/newsletter.ts` — server actions, incl. the current `sendIssue` (to be rewired). `gate()` auth guard, `LIST_PATH`, `getIssue`.
- Test idiom: integration tests gated on `DATABASE_URL` via `const d = HAS_DB ? describe : describe.skip;`, importing `db` and `schema` dynamically in `beforeAll`. See `tests/auth/session.test.ts`, `tests/community/import.test.ts`.

## File structure (created / modified)

- Create: `lib/queue/boss.ts` — pg-boss singleton + queue names + job type.
- Create: `lib/newsletter/send-batch.ts` — `processSendBatch`, `finalizeIfComplete`, `failBatch`.
- Create: `worker.ts` (repo root) — worker entrypoint registering both queue handlers.
- Create: `tests/newsletter/send-batch.test.ts` — integration tests for the handler.
- Create: `tests/newsletter/sends-idempotency.test.ts` — unique-constraint / conflict test.
- Modify: `lib/db/schema.ts` — add `newsletterSends` table + `uniqueIndex` import; update `newsletterIssues.status` comment.
- Modify: `lib/actions/newsletter.ts` — rewire `sendIssue`; add `retryFailed`, `getIssueProgress`.
- Modify: `package.json` — add `"worker"` script.
- Modify: `app/(admin)/admin/newsletter/[id]/page.tsx` — fetch + pass initial progress.
- Modify: `app/(admin)/admin/newsletter/components/issue-editor.tsx` — sending/sent states, progress line, retry button, poll.
- Modify: `app/(admin)/admin/newsletter/page.tsx` — list `StatusDot` handles `sending`.
- Generated: `drizzle/<timestamp>_*.sql` — migration for the new table.

---

## Task 0: Install pg-boss

**Files:**
- Modify: `package.json` (via pnpm)

- [ ] **Step 1: Install**

Run: `pnpm add pg-boss`
Expected: pg-boss (v10.x) added to `dependencies`.

- [ ] **Step 2: Verify it resolves**

Run: `pnpm exec node -e "console.log(require('pg-boss/package.json').version)"`
Expected: prints a version starting with `10.`

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "build: add pg-boss for the newsletter send queue"
```

---

## Task 1: Schema — `newsletter_sends` table + migration

**Files:**
- Modify: `lib/db/schema.ts`

- [ ] **Step 1: Add `uniqueIndex` to the pg-core import**

In `lib/db/schema.ts`, change the import block (lines 1-9) so it also imports `uniqueIndex`:

```typescript
import {
  pgTable,
  uuid,
  text,
  boolean,
  jsonb,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
```

- [ ] **Step 2: Update the `newsletterIssues.status` comment**

In `lib/db/schema.ts`, change the `status` line of `newsletterIssues` (currently `// "draft" | "sent"`) to:

```typescript
  status: text("status").notNull().default("draft"), // "draft" | "sending" | "sent"
```

- [ ] **Step 3: Append the `newsletterSends` table**

At the end of `lib/db/schema.ts`, after the `newsletterIssues` type exports, add:

```typescript
// One row per (issue, contact) send attempt. The unique (issueId, contactId)
// index is the idempotency anchor: re-enqueuing a send is a no-op, and a retried
// batch skips rows already marked "sent".
export const newsletterSends = pgTable(
  "newsletter_sends",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    issueId: uuid("issue_id")
      .notNull()
      .references(() => newsletterIssues.id, { onDelete: "cascade" }),
    contactId: uuid("contact_id")
      .notNull()
      .references(() => contacts.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("pending"), // "pending" | "sent" | "failed"
    resendId: text("resend_id"),
    error: text("error"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    issueContactIdx: uniqueIndex("newsletter_sends_issue_contact_idx").on(
      t.issueId,
      t.contactId,
    ),
    issueStatusIdx: index("newsletter_sends_issue_status_idx").on(
      t.issueId,
      t.status,
    ),
  }),
);

export type NewsletterSendRow = typeof newsletterSends.$inferSelect;
export type NewNewsletterSendRow = typeof newsletterSends.$inferInsert;
```

- [ ] **Step 4: Generate the migration**

Run: `pnpm db:generate`
Expected: a new file `drizzle/<timestamp>_*.sql` containing `CREATE TABLE "newsletter_sends"` and the two indexes. No errors.

- [ ] **Step 5: Apply the migration**

Run: `pnpm db:migrate`
Expected: migration applies cleanly against `DATABASE_URL`.

- [ ] **Step 6: Commit**

```bash
git add lib/db/schema.ts drizzle/
git commit -m "feat(newsletter): add newsletter_sends table for per-recipient tracking"
```

---

## Task 2: pg-boss singleton — `lib/queue/boss.ts`

**Files:**
- Create: `lib/queue/boss.ts`

- [ ] **Step 1: Write the module**

Create `lib/queue/boss.ts`:

```typescript
import PgBoss from "pg-boss";

// Queue names. The send-batch queue dead-letters into the DLQ once retries are
// exhausted so the issue can still finalize.
export const SEND_BATCH_QUEUE = "newsletter.send-batch";
export const SEND_BATCH_DLQ = "newsletter.send-batch-dead";

export interface SendBatchJob {
  issueId: string;
  contactIds: string[];
}

let bossPromise: Promise<PgBoss> | null = null;

// Lazy singleton — shared by the web service (to enqueue) and the worker (to
// process). pg-boss is multi-instance safe; both connect to the same DATABASE_URL
// and pg-boss manages its own `pgboss` schema.
export function getBoss(): Promise<PgBoss> {
  if (!bossPromise) bossPromise = startBoss();
  return bossPromise;
}

async function startBoss(): Promise<PgBoss> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");

  const boss = new PgBoss({ connectionString });
  boss.on("error", (e) => console.error("[pg-boss]", e));
  await boss.start();

  // Idempotent queue setup. retryLimit/retryBackoff + deadLetter are queue
  // policies in pg-boss v10, so enqueue calls don't need per-send options.
  await boss.createQueue(SEND_BATCH_QUEUE, {
    name: SEND_BATCH_QUEUE,
    retryLimit: 5,
    retryBackoff: true,
    deadLetter: SEND_BATCH_DLQ,
  });
  await boss.createQueue(SEND_BATCH_DLQ, { name: SEND_BATCH_DLQ });

  return boss;
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: no errors from `lib/queue/boss.ts`. (If the repo has no `tsc` script, this invokes the installed TypeScript directly.)

- [ ] **Step 3: Commit**

```bash
git add lib/queue/boss.ts
git commit -m "feat(queue): add pg-boss singleton and newsletter queue setup"
```

---

## Task 3: Batch handler core — `lib/newsletter/send-batch.ts` (TDD)

**Files:**
- Create: `lib/newsletter/send-batch.ts`
- Test: `tests/newsletter/send-batch.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/newsletter/send-batch.test.ts`:

```typescript
import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { and, eq, inArray } from "drizzle-orm";

const HAS_DB = !!process.env.DATABASE_URL?.trim();
const d = HAS_DB ? describe : describe.skip;

// Minimal fake Resend: records calls and returns ids in payload order.
function fakeResend(opts: { fail?: boolean } = {}) {
  const calls: unknown[][] = [];
  return {
    calls,
    client: {
      batch: {
        send: async (payloads: unknown[]) => {
          calls.push(payloads);
          if (opts.fail) return { data: null, error: { message: "boom" } };
          return {
            data: { data: payloads.map((_, i) => ({ id: `re_${i}` })) },
            error: null,
          };
        },
      },
    },
  };
}

d("processSendBatch (integration)", () => {
  let db: typeof import("../../lib/db/client").db;
  let schema: typeof import("../../lib/db/schema");
  let sb: typeof import("../../lib/newsletter/send-batch");
  let issueId: string;
  let contactIds: string[];

  const mkIssue = () => ({
    slug: `t-${process.pid}-${Date.now()}`,
    subject: "Test subject",
    intro: "",
    stories: [{ title: "S", body: "b" }],
    signoff: "",
  });

  beforeAll(async () => {
    db = (await import("../../lib/db/client")).db;
    schema = await import("../../lib/db/schema");
    sb = await import("../../lib/newsletter/send-batch");
  });

  afterEach(async () => {
    if (issueId) {
      await db.delete(schema.newsletterSends).where(eq(schema.newsletterSends.issueId, issueId));
      await db.delete(schema.newsletterIssues).where(eq(schema.newsletterIssues.id, issueId));
    }
    if (contactIds?.length) {
      await db.delete(schema.contacts).where(inArray(schema.contacts.id, contactIds));
    }
  });

  afterAll(async () => {});

  async function seed(n: number) {
    const data = mkIssue();
    const [issue] = await db
      .insert(schema.newsletterIssues)
      .values({ slug: data.slug, subject: data.subject, status: "sending", data })
      .returning({ id: schema.newsletterIssues.id });
    issueId = issue.id;
    const inserted = await db
      .insert(schema.contacts)
      .values(
        Array.from({ length: n }, (_, i) => ({
          email: `sb-${process.pid}-${Date.now()}-${i}@example.com`,
        })),
      )
      .returning({ id: schema.contacts.id });
    contactIds = inserted.map((r) => r.id);
    await db.insert(schema.newsletterSends).values(
      contactIds.map((contactId) => ({ issueId, contactId, status: "pending" as const })),
    );
  }

  const deps = (resend: unknown) => ({
    db,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resend: resend as any,
    from: "test@aibuilders.mx",
    replyTo: undefined,
  });

  it("marks all recipients sent, records resendId, and finalizes the issue", async () => {
    await seed(3);
    const r = fakeResend();
    await sb.processSendBatch(deps(r.client), { issueId, contactIds });

    const rows = await db
      .select()
      .from(schema.newsletterSends)
      .where(eq(schema.newsletterSends.issueId, issueId));
    expect(rows.every((x) => x.status === "sent")).toBe(true);
    expect(rows.every((x) => x.resendId?.startsWith("re_"))).toBe(true);

    const [issue] = await db
      .select()
      .from(schema.newsletterIssues)
      .where(eq(schema.newsletterIssues.id, issueId));
    expect(issue.status).toBe("sent");
    expect(issue.sentAt).not.toBeNull();
  });

  it("is idempotent: a second run does not re-call Resend", async () => {
    await seed(2);
    const r = fakeResend();
    await sb.processSendBatch(deps(r.client), { issueId, contactIds });
    await sb.processSendBatch(deps(r.client), { issueId, contactIds });
    expect(r.calls.length).toBe(1);
  });

  it("throws and leaves rows pending when Resend errors", async () => {
    await seed(2);
    const r = fakeResend({ fail: true });
    await expect(
      sb.processSendBatch(deps(r.client), { issueId, contactIds }),
    ).rejects.toThrow(/Resend/);
    const rows = await db
      .select()
      .from(schema.newsletterSends)
      .where(eq(schema.newsletterSends.issueId, issueId));
    expect(rows.every((x) => x.status === "pending")).toBe(true);
  });

  it("failBatch marks pending rows failed and finalizes", async () => {
    await seed(2);
    await sb.failBatch(db, { issueId, contactIds });
    const rows = await db
      .select()
      .from(schema.newsletterSends)
      .where(eq(schema.newsletterSends.issueId, issueId));
    expect(rows.every((x) => x.status === "failed")).toBe(true);
    const [issue] = await db
      .select()
      .from(schema.newsletterIssues)
      .where(eq(schema.newsletterIssues.id, issueId));
    expect(issue.status).toBe("sent");
  });
});
```

> Note: the `mkIssue` shape must satisfy the `Issue` type. If `lib/newsletter/types.ts` requires different/more fields, mirror the shape used by `emptyIssue` in `lib/newsletter/issue.ts` instead — open that file and copy its object literal.

- [ ] **Step 2: Run the test to verify it fails**

Run: `DATABASE_URL=$DATABASE_URL pnpm exec vitest run tests/newsletter/send-batch.test.ts`
Expected: FAIL — `Cannot find module '../../lib/newsletter/send-batch'` (or `processSendBatch is not a function`).

- [ ] **Step 3: Implement the handler**

Create `lib/newsletter/send-batch.ts`:

```typescript
import { and, eq, inArray, sql } from "drizzle-orm";
import type { Resend } from "resend";
import type { DB } from "@/lib/db/client";
import { contacts, newsletterIssues, newsletterSends } from "@/lib/db/schema";
import type { Issue } from "./types";
import { renderBuildLog } from "./render";
import { injectUnsubscribe, unsubscribeHeaders } from "./unsubscribe";

export interface SendBatchDeps {
  db: DB;
  resend: Resend;
  from: string;
  replyTo: string | undefined;
}

export interface SendBatchPayload {
  issueId: string;
  contactIds: string[];
}

// Send one batch of an issue's pending recipients. Idempotent: it re-reads the
// pending rows, so recipients already marked "sent" are never re-mailed on retry.
export async function processSendBatch(
  deps: SendBatchDeps,
  { issueId, contactIds }: SendBatchPayload,
): Promise<void> {
  const { db, resend, from, replyTo } = deps;

  const [issueRow] = await db
    .select({ data: newsletterIssues.data })
    .from(newsletterIssues)
    .where(eq(newsletterIssues.id, issueId))
    .limit(1);
  const issue = issueRow?.data as Issue | undefined;
  if (!issue) return; // issue deleted mid-flight; nothing to do

  const pending = await db
    .select({ contactId: newsletterSends.contactId, email: contacts.email })
    .from(newsletterSends)
    .innerJoin(contacts, eq(newsletterSends.contactId, contacts.id))
    .where(
      and(
        eq(newsletterSends.issueId, issueId),
        inArray(newsletterSends.contactId, contactIds),
        eq(newsletterSends.status, "pending"),
      ),
    );

  if (pending.length === 0) {
    await finalizeIfComplete(db, issueId);
    return;
  }

  const html = renderBuildLog(issue);
  const res = await resend.batch.send(
    pending.map((r) => ({
      from,
      to: [r.email],
      subject: issue.subject,
      html: injectUnsubscribe(html, r.contactId),
      replyTo,
      headers: unsubscribeHeaders(r.contactId),
    })),
  );
  if (res.error) {
    // Throw so pg-boss retries with backoff. Rows stay "pending" → clean re-send.
    throw new Error(`Resend batch falló: ${res.error.message}`);
  }

  const ids = (res.data?.data ?? []) as { id: string }[];
  await Promise.all(
    pending.map((r, i) =>
      db
        .update(newsletterSends)
        .set({
          status: "sent",
          resendId: ids[i]?.id ?? null,
          error: null,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(newsletterSends.issueId, issueId),
            eq(newsletterSends.contactId, r.contactId),
          ),
        ),
    ),
  );

  await finalizeIfComplete(db, issueId);
}

// Flip the issue to "sent" once no recipients remain pending. The
// status='sending' guard makes this safe to call from every batch concurrently.
export async function finalizeIfComplete(db: DB, issueId: string): Promise<void> {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(newsletterSends)
    .where(
      and(
        eq(newsletterSends.issueId, issueId),
        eq(newsletterSends.status, "pending"),
      ),
    );
  if (count > 0) return;
  await db
    .update(newsletterIssues)
    .set({ status: "sent", sentAt: new Date(), updatedAt: new Date() })
    .where(
      and(eq(newsletterIssues.id, issueId), eq(newsletterIssues.status, "sending")),
    );
}

// Dead-letter handler: the batch exhausted its retries. Mark its still-pending
// rows "failed" so the issue can finalize and the UI can offer a retry.
export async function failBatch(
  db: DB,
  { issueId, contactIds }: SendBatchPayload,
): Promise<void> {
  await db
    .update(newsletterSends)
    .set({ status: "failed", error: "Falló tras reintentos", updatedAt: new Date() })
    .where(
      and(
        eq(newsletterSends.issueId, issueId),
        inArray(newsletterSends.contactId, contactIds),
        eq(newsletterSends.status, "pending"),
      ),
    );
  await finalizeIfComplete(db, issueId);
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `DATABASE_URL=$DATABASE_URL pnpm exec vitest run tests/newsletter/send-batch.test.ts`
Expected: PASS — all 4 tests green.

- [ ] **Step 5: Commit**

```bash
git add lib/newsletter/send-batch.ts tests/newsletter/send-batch.test.ts
git commit -m "feat(newsletter): batch send handler with idempotency + dead-letter"
```

---

## Task 4: Worker entrypoint — `worker.ts`

**Files:**
- Create: `worker.ts`
- Modify: `package.json`

- [ ] **Step 1: Write the worker**

Create `worker.ts` at the repo root:

```typescript
import {
  getBoss,
  SEND_BATCH_QUEUE,
  SEND_BATCH_DLQ,
  type SendBatchJob,
} from "@/lib/queue/boss";
import { db } from "@/lib/db/client";
import { loadNewsletterConfig } from "@/lib/newsletter/resend";
import { processSendBatch, failBatch } from "@/lib/newsletter/send-batch";

async function main() {
  const boss = await getBoss();
  const cfg = loadNewsletterConfig(); // fail fast if Resend env is missing

  // batchSize: 1 → process one batch at a time, comfortably under Resend's
  // ~2 req/s limit. In pg-boss v10 the handler receives an array of jobs.
  await boss.work<SendBatchJob>(SEND_BATCH_QUEUE, { batchSize: 1 }, async (jobs) => {
    for (const job of jobs) {
      await processSendBatch(
        { db, resend: cfg.resend, from: cfg.from, replyTo: cfg.replyTo },
        job.data,
      );
    }
  });

  await boss.work<SendBatchJob>(SEND_BATCH_DLQ, { batchSize: 1 }, async (jobs) => {
    for (const job of jobs) {
      await failBatch(db, job.data);
    }
  });

  console.log("[worker] newsletter queue worker running");
}

main().catch((e) => {
  console.error("[worker] fatal", e);
  process.exit(1);
});
```

> Note on the `@/` alias: `tsx` honors `tsconfig.json` `paths`. The existing scripts (`scripts/community/*.ts`) already run under `tsx` and use `@/` imports, so this resolves the same way.

- [ ] **Step 2: Add the `worker` script**

In `package.json`, add to `"scripts"` (after `"start"`):

```json
    "worker": "tsx worker.ts",
```

- [ ] **Step 3: Smoke-test the worker boots**

Run: `DATABASE_URL=$DATABASE_URL RESEND_API_KEY=$RESEND_API_KEY NEWSLETTER_FROM=test@aibuilders.mx timeout 8 pnpm worker`
Expected: prints `[worker] newsletter queue worker running` and stays alive until the 8s timeout kills it. No stack traces. (On macOS without `timeout`, use `gtimeout` or Ctrl-C after the line prints.)

- [ ] **Step 4: Commit**

```bash
git add worker.ts package.json
git commit -m "feat(worker): newsletter queue worker entrypoint"
```

---

## Task 5: Rewire actions — enqueue, retry, progress (TDD)

**Files:**
- Modify: `lib/actions/newsletter.ts`
- Test: `tests/newsletter/sends-idempotency.test.ts`

- [ ] **Step 1: Write the failing idempotency test**

Create `tests/newsletter/sends-idempotency.test.ts`. This validates the unique
constraint + `onConflictDoNothing` clause that `sendIssue` relies on:

```typescript
import { describe, it, expect, beforeAll, afterEach } from "vitest";
import { eq, inArray } from "drizzle-orm";

const HAS_DB = !!process.env.DATABASE_URL?.trim();
const d = HAS_DB ? describe : describe.skip;

d("newsletter_sends idempotency (integration)", () => {
  let db: typeof import("../../lib/db/client").db;
  let schema: typeof import("../../lib/db/schema");
  let issueId: string;
  let contactIds: string[];

  beforeAll(async () => {
    db = (await import("../../lib/db/client")).db;
    schema = await import("../../lib/db/schema");
  });

  afterEach(async () => {
    if (issueId) {
      await db.delete(schema.newsletterSends).where(eq(schema.newsletterSends.issueId, issueId));
      await db.delete(schema.newsletterIssues).where(eq(schema.newsletterIssues.id, issueId));
    }
    if (contactIds?.length) {
      await db.delete(schema.contacts).where(inArray(schema.contacts.id, contactIds));
    }
  });

  it("inserting the same (issueId, contactId) twice yields one row", async () => {
    const [issue] = await db
      .insert(schema.newsletterIssues)
      .values({
        slug: `idem-${process.pid}-${Date.now()}`,
        subject: "x",
        status: "sending",
        data: { slug: "x", subject: "x", stories: [] } as never,
      })
      .returning({ id: schema.newsletterIssues.id });
    issueId = issue.id;
    const [c] = await db
      .insert(schema.contacts)
      .values({ email: `idem-${process.pid}-${Date.now()}@example.com` })
      .returning({ id: schema.contacts.id });
    contactIds = [c.id];

    const rows = [{ issueId, contactId: c.id, status: "pending" as const }];
    await db.insert(schema.newsletterSends).values(rows).onConflictDoNothing({
      target: [schema.newsletterSends.issueId, schema.newsletterSends.contactId],
    });
    await db.insert(schema.newsletterSends).values(rows).onConflictDoNothing({
      target: [schema.newsletterSends.issueId, schema.newsletterSends.contactId],
    });

    const stored = await db
      .select()
      .from(schema.newsletterSends)
      .where(eq(schema.newsletterSends.issueId, issueId));
    expect(stored.length).toBe(1);
  });
});
```

- [ ] **Step 2: Run it to verify it passes already** (the constraint exists from Task 1)

Run: `DATABASE_URL=$DATABASE_URL pnpm exec vitest run tests/newsletter/sends-idempotency.test.ts`
Expected: PASS. (This is a guard test — it confirms the schema-level idempotency the action depends on. If it FAILS with a duplicate-row count, the unique index from Task 1 is missing; fix that before continuing.)

- [ ] **Step 3: Update imports in `lib/actions/newsletter.ts`**

At the top of `lib/actions/newsletter.ts`, extend the existing imports. Change the `drizzle-orm` import to include `and`, `inArray`, `sql`, and add the new module imports:

```typescript
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { newsletterIssues, newsletterSends } from "@/lib/db/schema";
import { getUser } from "@/lib/auth";
import type { Issue } from "@/lib/newsletter/types";
import { emptyIssue } from "@/lib/newsletter/issue";
import { renderBuildLog } from "@/lib/newsletter/render";
import { loadNewsletterConfig, MissingEnvError } from "@/lib/newsletter/resend";
import { subscribedRecipients, chunk } from "@/lib/newsletter/recipients";
import { injectUnsubscribe, unsubscribeHeaders } from "@/lib/newsletter/unsubscribe";
import { getBoss, SEND_BATCH_QUEUE } from "@/lib/queue/boss";
```

> `injectUnsubscribe`/`unsubscribeHeaders`/`renderBuildLog` stay imported — `sendTest` still uses the render; the old per-chunk send loop will be removed. After editing, if `pnpm lint` flags an unused import, remove only the genuinely unused one.

- [ ] **Step 4: Replace the body of `sendIssue`**

Replace the entire current `sendIssue` function (from `export async function sendIssue(` through its closing `}`) with:

```typescript
export async function sendIssue(id: string): Promise<ActionOk | ActionError> {
  if (await gate()) return { error: "No autorizado." };

  const detail = await getIssue(id);
  if (!detail) return { error: "Issue no encontrado." };
  if (detail.status === "sent") return { error: "Este issue ya fue enviado." };
  if (detail.status === "sending") return { error: "Este issue ya se está enviando." };

  const data = detail.data;
  if (!data.subject.trim()) return { error: "El issue necesita un subject." };
  if (!data.stories.length) return { error: "Agrega al menos una historia antes de enviar." };

  // Fail fast if Resend isn't configured — the same env the worker needs.
  try {
    loadNewsletterConfig();
  } catch (e) {
    if (e instanceof MissingEnvError) return { error: e.message };
    throw e;
  }

  const recipients = await subscribedRecipients();
  if (!recipients.length) return { error: "No hay contactos suscritos al newsletter." };

  // 1. One pending row per recipient (idempotent — re-send is a no-op).
  await db
    .insert(newsletterSends)
    .values(
      recipients.map((r) => ({ issueId: id, contactId: r.id, status: "pending" as const })),
    )
    .onConflictDoNothing({
      target: [newsletterSends.issueId, newsletterSends.contactId],
    });

  // 2. Mark the issue as sending.
  await db
    .update(newsletterIssues)
    .set({ status: "sending", updatedAt: new Date() })
    .where(eq(newsletterIssues.id, id));

  // 3. Enqueue one job per chunk of 100 recipients.
  const boss = await getBoss();
  for (const group of chunk(recipients)) {
    await boss.send(SEND_BATCH_QUEUE, {
      issueId: id,
      contactIds: group.map((r) => r.id),
    });
  }

  revalidatePath(`${LIST_PATH}/${id}`);
  revalidatePath(LIST_PATH);
  return { ok: true, message: `Encolado: enviando a ${recipients.length} contactos.` };
}
```

- [ ] **Step 5: Add `retryFailed` and `getIssueProgress`**

Immediately after `sendIssue`, add:

```typescript
export async function retryFailed(id: string): Promise<ActionOk | ActionError> {
  if (await gate()) return { error: "No autorizado." };

  const failed = await db
    .select({ contactId: newsletterSends.contactId })
    .from(newsletterSends)
    .where(and(eq(newsletterSends.issueId, id), eq(newsletterSends.status, "failed")));
  if (!failed.length) return { error: "No hay envíos fallidos para reintentar." };

  await db
    .update(newsletterSends)
    .set({ status: "pending", error: null, updatedAt: new Date() })
    .where(and(eq(newsletterSends.issueId, id), eq(newsletterSends.status, "failed")));

  await db
    .update(newsletterIssues)
    .set({ status: "sending", sentAt: null, updatedAt: new Date() })
    .where(eq(newsletterIssues.id, id));

  const ids = failed.map((r) => r.contactId);
  const boss = await getBoss();
  for (const group of chunk(ids)) {
    await boss.send(SEND_BATCH_QUEUE, { issueId: id, contactIds: group });
  }

  revalidatePath(`${LIST_PATH}/${id}`);
  revalidatePath(LIST_PATH);
  return { ok: true, message: `Reintentando ${ids.length} envíos.` };
}

export interface IssueProgress {
  total: number;
  sent: number;
  failed: number;
  pending: number;
}

export async function getIssueProgress(id: string): Promise<IssueProgress> {
  if (await gate()) return { total: 0, sent: 0, failed: 0, pending: 0 };
  const rows = await db
    .select({ status: newsletterSends.status, count: sql<number>`count(*)::int` })
    .from(newsletterSends)
    .where(eq(newsletterSends.issueId, id))
    .groupBy(newsletterSends.status);
  const by = (s: string) => rows.find((r) => r.status === s)?.count ?? 0;
  const sent = by("sent");
  const failed = by("failed");
  const pending = by("pending");
  return { total: sent + failed + pending, sent, failed, pending };
}
```

- [ ] **Step 6: Lint + run the newsletter tests**

Run: `pnpm lint && DATABASE_URL=$DATABASE_URL pnpm exec vitest run tests/newsletter/`
Expected: lint clean; all newsletter tests PASS.

- [ ] **Step 7: Commit**

```bash
git add lib/actions/newsletter.ts tests/newsletter/sends-idempotency.test.ts
git commit -m "feat(newsletter): enqueue sends + retryFailed + getIssueProgress"
```

---

## Task 6: Admin UI — sending state, progress, retry

**Files:**
- Modify: `app/(admin)/admin/newsletter/[id]/page.tsx`
- Modify: `app/(admin)/admin/newsletter/components/issue-editor.tsx`
- Modify: `app/(admin)/admin/newsletter/page.tsx`

- [ ] **Step 1: Pass initial progress into the editor**

In `app/(admin)/admin/newsletter/[id]/page.tsx`, import `getIssueProgress`, fetch it, and pass it down. Change the import line and the body:

```typescript
import { getIssue, getIssueProgress } from "@/lib/actions/newsletter";
```

In the component, after `if (!issue) notFound();` add:

```typescript
  const progress = await getIssueProgress(id);
```

And pass it to the editor:

```tsx
      <IssueEditor
        id={issue.id}
        initialData={issue.data}
        status={issue.status}
        initialProgress={progress}
      />
```

- [ ] **Step 2: Update the editor — props, imports, state**

In `app/(admin)/admin/newsletter/components/issue-editor.tsx`:

Change the action import block (lines 5-10) to add `retryFailed` and `getIssueProgress`:

```typescript
import {
  saveIssue,
  sendTest,
  sendIssue,
  renderPreview,
  retryFailed,
  getIssueProgress,
  type IssueProgress,
} from "@/lib/actions/newsletter";
```

Change the component signature/props (lines 15-23) to accept `initialProgress`:

```typescript
export function IssueEditor({
  id,
  initialData,
  status: initialStatus,
  initialProgress,
}: {
  id: string;
  initialData: Issue;
  status: string;
  initialProgress: IssueProgress;
}) {
```

After the `const [status, setStatus] = useState(initialStatus);` line, add progress state and derived flags:

```typescript
  const [progress, setProgress] = useState<IssueProgress>(initialProgress);
  const sending = status === "sending";
```

Replace the existing `const sent = status === "sent";` line (line 34) — keep `sent` but it now also implies finished:

```typescript
  const sent = status === "sent";
```

(no change needed to that line; it stays.)

- [ ] **Step 3: Add a polling effect while sending**

After the autosave `useEffect` (the one ending at line 49), add:

```typescript
  // Poll send progress while the issue is draining the queue. Stops when no
  // recipients remain pending (the worker has finalized the issue to "sent").
  useEffect(() => {
    if (!sending) return;
    let active = true;
    const tick = async () => {
      const p = await getIssueProgress(id);
      if (!active) return;
      setProgress(p);
      if (p.pending === 0 && p.total > 0) setStatus("sent");
    };
    void tick();
    const interval = setInterval(tick, 3000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [sending, id]);
```

- [ ] **Step 4: Update `onSendIssue` to enter the sending state**

Replace the `onSendIssue` function (lines 77-87) with:

```typescript
  async function onSendIssue() {
    if (!window.confirm("¿Enviar este issue a TODOS los contactos suscritos? No se puede deshacer.")) return;
    setMessage(null);
    const res = await sendIssue(id);
    if ("error" in res) {
      setMessage({ kind: "err", text: res.error });
    } else {
      setStatus("sending");
      setMessage({ kind: "ok", text: res.message ?? "Newsletter encolado." });
    }
  }

  async function onRetryFailed() {
    setMessage(null);
    const res = await retryFailed(id);
    if ("error" in res) {
      setMessage({ kind: "err", text: res.error });
    } else {
      setStatus("sending");
      setMessage({ kind: "ok", text: res.message ?? "Reintentando." });
    }
  }
```

- [ ] **Step 5: Update the status badge to show three states**

Replace the status badge block (lines 104-113) with one that handles `sending`:

```tsx
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
              sent
                ? "bg-green-500/10 text-green-700 dark:text-green-400"
                : sending
                  ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                  : "bg-black/5 text-gray-500 dark:bg-white/10 dark:text-gray-300"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                sent ? "bg-green-500" : sending ? "bg-amber-500" : "bg-black/20 dark:bg-white/30"
              }`}
            />
            {sent ? "Enviado" : sending ? "Enviando…" : "Borrador"}
          </span>
```

- [ ] **Step 6: Update the send button + add progress / retry**

Replace the send `<button>` block (lines 142-149) with a send button that's disabled while sent or sending, plus a progress readout and a retry button:

```tsx
          {sending && (
            <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
              {progress.sent}/{progress.total} enviados
              {progress.failed > 0 && ` · ${progress.failed} fallaron`}
            </span>
          )}
          {sent && progress.failed > 0 && (
            <button
              type="button"
              onClick={onRetryFailed}
              className="rounded-full border border-red-500/30 px-3 py-1.5 font-mono text-xs uppercase tracking-[0.15em] text-red-600 transition hover:border-red-500/60"
            >
              Reintentar {progress.failed} fallidos
            </button>
          )}
          <button
            type="button"
            onClick={onSendIssue}
            disabled={sent || sending}
            className="rounded-full bg-gray-900 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.15em] text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            {sent ? "Enviado" : sending ? "Enviando…" : "Enviar newsletter"}
          </button>
```

- [ ] **Step 7: Update the list page `StatusDot`**

In `app/(admin)/admin/newsletter/page.tsx`, replace the `StatusDot` function (lines 6-18) with a three-state version:

```tsx
function StatusDot({ status }: { status: string }) {
  const sent = status === "sent";
  const sending = status === "sending";
  const color = sent ? "bg-green-500" : sending ? "bg-amber-500" : "bg-black/20 dark:bg-white/25";
  const label = sent ? "Enviado" : sending ? "Enviando…" : "Borrador";
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-1.5 w-1.5 rounded-full ${color}`} />
      <span className="text-xs font-medium text-gray-400 dark:text-gray-500">{label}</span>
    </span>
  );
}
```

- [ ] **Step 8: Lint + build**

Run: `pnpm lint && pnpm build`
Expected: lint clean, build succeeds (no server/client boundary errors, no type errors).

- [ ] **Step 9: Commit**

```bash
git add "app/(admin)/admin/newsletter"
git commit -m "feat(admin): newsletter sending progress, status, and retry UI"
```

---

## Task 7: Deploy worker service + end-to-end verification

**Files:** none (ops + manual verification)

- [ ] **Step 1: Full check before deploy**

Run: `pnpm lint && pnpm build && DATABASE_URL=$DATABASE_URL pnpm exec vitest run`
Expected: all green.

- [ ] **Step 2: Create the Railway worker service**

In the Railway project, add a **new service from the same repo**:
- Start command: `pnpm worker`
- Variables: same `DATABASE_URL`, `RESEND_API_KEY`, `NEWSLETTER_FROM`, `NEWSLETTER_REPLY_TO`, `NEXT_PUBLIC_SITE_URL` as the web service (Railway: reference the shared variables or the Postgres plugin's `DATABASE_URL`).
- Confirm the deploy log shows `[worker] newsletter queue worker running`.

> If you cannot create the service yourself, hand Ricardo this checklist — it's a Railway dashboard action, not a code change.

- [ ] **Step 3: End-to-end test with a controlled audience**

Before a real send, verify against a tiny audience:
1. In the DB, confirm a small set of test contacts have `newsletter_subscribed = true` (or temporarily flip all but a couple to false in a scratch environment).
2. In `/admin/newsletter`, open a draft issue with a subject + at least one story.
3. Click **Enviar newsletter** → confirm. Expect the badge to flip to **Enviando…** and the `X/Y enviados` counter to climb, then settle to **Enviado**.
4. Confirm the test inboxes received the email with a working unsubscribe link.
5. In the DB: `select status, count(*) from newsletter_sends where issue_id = '<id>' group by status;` → expect all `sent`.

- [ ] **Step 4: Verify idempotency / recovery manually**

- Re-clicking **Enviar** on a `sending`/`sent` issue is blocked by the action guard (expect the "ya se está enviando / ya fue enviado" message).
- To exercise the dead-letter path: temporarily set an invalid `RESEND_API_KEY` on the worker, send to a test contact, watch the row go `pending` → (retries) → `failed`, the issue still finalize to `sent`, and the **Reintentar N fallidos** button appear. Restore the key and click it; the row should end `sent`.

- [ ] **Step 5: Final commit (if any doc/notes changed)**

```bash
git add -A
git commit -m "docs(newsletter): queue rollout notes" || echo "nothing to commit"
```

---

## Self-review notes

- **Spec coverage:** queue backend (Task 0,2), worker same-repo service (Task 4,7), `newsletter_sends` + unique constraint (Task 1), enqueue/idempotency (Task 5 + tests), re-read pending on retry (Task 3), dead-letter → failed (Task 3,4), finalize on last batch (Task 3), rate limit via batchSize 1 (Task 4), progress + retry UI (Task 6), testing (Task 3,5), rollout (Task 7). All spec sections map to a task.
- **Idempotency anchor** (`uniqueIndex newsletter_sends_issue_contact_idx`) is defined in Task 1 and consumed by `onConflictDoNothing` in Task 5 and the guard test in Task 5 — names match.
- **Type/name consistency:** `processSendBatch`, `finalizeIfComplete`, `failBatch`, `SendBatchDeps`, `SendBatchPayload`, `SEND_BATCH_QUEUE`, `SEND_BATCH_DLQ`, `SendBatchJob`, `IssueProgress`, `getIssueProgress`, `retryFailed` are used identically across tasks.
- **Open risk to watch during execution:** pg-boss v10 API specifics — `createQueue(name, options)` policy fields (`retryLimit`/`retryBackoff`/`deadLetter`), and `work(name, { batchSize }, handler)` delivering an array of jobs. If the installed minor version differs, adjust the two call sites in `lib/queue/boss.ts` and `worker.ts` only; the rest of the plan is API-agnostic.
