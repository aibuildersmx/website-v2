# Phase 1 — Community DB Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up Railway Postgres via Drizzle and import the 3 community CSVs (Beehiiv subscribers, Cursor event attendees, leads) into one deduplicated `contacts` table that becomes the single source of truth.

**Architecture:** Drizzle ORM owns the schema/migrations against the Railway Postgres already attached to `website-v2` (`DATABASE_URL`). Pure, unit-tested functions parse each CSV into a normalized `ContactInput` and merge them by lowercased email into `MergedContact[]`. A thin DB layer upserts the merged set; a CLI script wires file reads to the DB layer.

**Tech Stack:** Drizzle ORM + `drizzle-kit`, `postgres` (postgres-js driver), `csv-parse/sync` (already a dep), `vitest` (already a dep), `tsx` (already a dep), Node 22.

**Scope note:** Phases 2 (auth) and 3 (newsletter panel) get their own plans. This plan delivers working, testable software on its own: a populated `contacts` table.

**Reference spec:** `docs/superpowers/specs/2026-06-07-community-db-and-newsletter-panel-design.md`

---

## File Structure

| File | Responsibility |
|---|---|
| `lib/db/schema.ts` | Drizzle table definitions (`contacts` here; `users` added in Phase 2) |
| `lib/db/client.ts` | Singleton Drizzle client from `DATABASE_URL` |
| `drizzle.config.ts` | drizzle-kit config (schema path, migrations out dir, credentials) |
| `drizzle/` | Generated SQL migrations (committed) |
| `lib/community/types.ts` | `ContactSource`, `ContactInput`, `MergedContact` types + `parseTimestamp` helper |
| `lib/community/parse.ts` | `parseBeehiiv(csv)` and `parseEventCsv(csv, source)` → `ContactInput[]` |
| `lib/community/merge.ts` | `mergeContacts(inputs)` → `MergedContact[]` (pure, the heart) |
| `lib/community/import.ts` | `importContacts(db, merged)` → `{inserted, updated}` (DB upsert) |
| `scripts/community/import-contacts.ts` | CLI: read 3 CSV paths → parse → merge → import |
| `tests/community/*.test.ts` | Unit tests for parse/merge/timestamp; guarded integration test for import |

---

## Local DB access gotcha (read before Task 2)

`DATABASE_URL` on Railway is `postgresql://...@postgres.railway.internal:5432/railway`.
The `*.railway.internal` host **only resolves inside Railway's network** — it will
not connect from the Mac. For local migrate/import runs use Railway's **public**
connection string instead:

- In the Railway dashboard, the Postgres service exposes `DATABASE_PUBLIC_URL`
  (a `...proxy.rlwy.net:PORT` host). Copy it.
- Run migrate/import commands with that value, e.g.:
  `DATABASE_URL="<public url>" pnpm db:migrate`
  `DATABASE_URL="<public url>" pnpm community:import ...`
- Do **not** commit the public URL. The deployed app keeps using the internal
  `DATABASE_URL` Railway injects automatically.

---

## Task 1: Install and wire Drizzle

**Files:**
- Modify: `package.json` (deps + scripts)
- Create: `drizzle.config.ts`
- Create: `lib/db/client.ts`
- Modify: `vitest.config.ts:4` (broaden test include)

- [ ] **Step 1: Install dependencies**

Run:
```bash
pnpm add drizzle-orm postgres
pnpm add -D drizzle-kit
```
Expected: `package.json` gains `drizzle-orm`, `postgres` in deps and `drizzle-kit` in devDeps; `pnpm-lock.yaml` updates.

- [ ] **Step 2: Add db scripts to package.json**

In `package.json` `"scripts"`, add these three entries alongside the existing ones:
```json
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "community:import": "tsx scripts/community/import-contacts.ts",
```

- [ ] **Step 3: Broaden the vitest include so tests/community runs**

In `vitest.config.ts`, change the include line:
```ts
    include: ["tests/**/*.test.ts"],
```
(was `["tests/newsletter/**/*.test.ts"]`).

- [ ] **Step 4: Create the drizzle-kit config**

Create `drizzle.config.ts`:
```ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
});
```

- [ ] **Step 5: Create the Drizzle client singleton**

Create `lib/db/client.ts`:
```ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

// `prepare: false` is recommended for the Railway/PgBouncer-style proxy.
const queryClient = postgres(connectionString, { prepare: false });

export const db = drizzle(queryClient, { schema });
export type DB = typeof db;
```

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml drizzle.config.ts lib/db/client.ts vitest.config.ts
git commit -m "chore: wire Drizzle ORM + db scripts for community DB"
```

---

## Task 2: Define the `contacts` schema and migrate Railway Postgres

**Files:**
- Create: `lib/db/schema.ts`
- Create: `drizzle/` (generated)

- [ ] **Step 1: Write the schema**

Create `lib/db/schema.ts`:
```ts
import {
  pgTable,
  uuid,
  text,
  boolean,
  jsonb,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

export const contacts = pgTable(
  "contacts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull().unique(), // always lowercased before insert
    name: text("name"),
    locale: text("locale"),
    sources: text("sources").array().notNull().default([]),
    tags: text("tags").array().notNull().default([]),
    isPremium: boolean("is_premium").notNull().default(false),
    newsletterSubscribed: boolean("newsletter_subscribed").notNull().default(true),
    metadata: jsonb("metadata").notNull().default({}),
    firstSeenAt: timestamp("first_seen_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    sourcesIdx: index("contacts_sources_idx").using("gin", t.sources),
    tagsIdx: index("contacts_tags_idx").using("gin", t.tags),
  }),
);

export type Contact = typeof contacts.$inferSelect;
export type NewContact = typeof contacts.$inferInsert;
```

- [ ] **Step 2: Generate the migration**

Run:
```bash
pnpm db:generate
```
Expected: a new SQL file appears under `drizzle/` (e.g. `drizzle/0000_*.sql`) containing `CREATE TABLE "contacts"` plus the two GIN indexes, and a `drizzle/meta/` snapshot.

- [ ] **Step 3: Apply the migration to Railway Postgres**

Run (using the public URL — see the gotcha section):
```bash
DATABASE_URL="<DATABASE_PUBLIC_URL>" pnpm db:migrate
```
Expected: drizzle-kit reports the migration applied with no errors.

- [ ] **Step 4: Verify the table exists**

Run:
```bash
DATABASE_URL="<DATABASE_PUBLIC_URL>" pnpm tsx -e "import {db} from './lib/db/client'; import {contacts} from './lib/db/schema'; const r = await db.select().from(contacts).limit(1); console.log('contacts table OK, rows:', r.length); process.exit(0)"
```
Expected: `contacts table OK, rows: 0`

- [ ] **Step 5: Commit**

```bash
git add lib/db/schema.ts drizzle/
git commit -m "feat: contacts table schema + initial migration"
```

---

## Task 3: Community types + timestamp parser

**Files:**
- Create: `lib/community/types.ts`
- Test: `tests/community/timestamp.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/community/timestamp.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { parseTimestamp } from "../../lib/community/types";

describe("parseTimestamp", () => {
  it("parses a Beehiiv 'YYYY-MM-DD HH:MM:SS UTC' string", () => {
    const d = parseTimestamp("2025-08-04 19:40:05 UTC");
    expect(d?.toISOString()).toBe("2025-08-04T19:40:05.000Z");
  });

  it("parses a plain 'YYYY-MM-DD HH:MM:SS' string as UTC", () => {
    const d = parseTimestamp("2025-11-15 09:15:12");
    expect(d?.toISOString()).toBe("2025-11-15T09:15:12.000Z");
  });

  it("returns undefined for NULL, empty, or junk", () => {
    expect(parseTimestamp("NULL")).toBeUndefined();
    expect(parseTimestamp("")).toBeUndefined();
    expect(parseTimestamp("   ")).toBeUndefined();
    expect(parseTimestamp("not-a-date")).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/community/timestamp.test.ts`
Expected: FAIL — `parseTimestamp` is not exported / module not found.

- [ ] **Step 3: Write the types + parser**

Create `lib/community/types.ts`:
```ts
export type ContactSource = "beehiiv" | "cursor-event" | "lead";

/** One normalized row from a single CSV source. */
export interface ContactInput {
  email: string; // lowercased, validated
  name?: string;
  locale?: string;
  source: ContactSource;
  tags: string[];
  isPremium: boolean;
  newsletterSubscribed: boolean;
  metadata: Record<string, unknown>; // source-native fields
  firstSeenAt?: Date;
}

/** One human after merging all sources by email. */
export interface MergedContact {
  email: string;
  name?: string;
  locale?: string;
  sources: ContactSource[];
  tags: string[];
  isPremium: boolean;
  newsletterSubscribed: boolean;
  metadata: Record<string, unknown>; // namespaced: { beehiiv: {...}, "cursor-event": {...} }
  firstSeenAt?: Date;
}

/**
 * Parse timestamps from the CSVs. Beehiiv uses "2025-08-04 19:40:05 UTC";
 * the event CSVs use "2025-11-15 09:15:12" (treated as UTC). "NULL"/empty/junk
 * return undefined.
 */
export function parseTimestamp(raw: string | undefined): Date | undefined {
  const s = (raw ?? "").trim();
  if (!s || s.toUpperCase() === "NULL") return undefined;
  // Normalize "YYYY-MM-DD HH:MM:SS[ UTC]" → ISO "YYYY-MM-DDTHH:MM:SSZ".
  const normalized = s.replace(/\s+UTC$/i, "").replace(" ", "T") + "Z";
  const d = new Date(normalized);
  return Number.isNaN(d.getTime()) ? undefined : d;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/community/timestamp.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/community/types.ts tests/community/timestamp.test.ts
git commit -m "feat: community contact types + CSV timestamp parser"
```

---

## Task 4: Beehiiv CSV parser

**Files:**
- Create: `lib/community/parse.ts`
- Test: `tests/community/parse-beehiiv.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/community/parse-beehiiv.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { parseBeehiiv } from "../../lib/community/parse";

const HEADER = "subscriber_id,api_subscription_id,email,tags,status,premium?,created_at";

describe("parseBeehiiv", () => {
  it("parses an active subscriber as newsletter_subscribed", () => {
    const csv = `${HEADER}\nsub_1,api_1,Ada@Example.com,"",active,No,2025-08-04 19:40:05 UTC\n`;
    const rows = parseBeehiiv(csv);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      email: "ada@example.com",
      source: "beehiiv",
      newsletterSubscribed: true,
      isPremium: false,
    });
    expect(rows[0].firstSeenAt?.toISOString()).toBe("2025-08-04T19:40:05.000Z");
    expect(rows[0].metadata).toMatchObject({ subscriber_id: "sub_1", status: "active" });
  });

  it("marks unsubscribed/bounced rows as not subscribed (still imported)", () => {
    const csv =
      `${HEADER}\n` +
      `s1,a1,unsub@x.com,"",unsubscribed,No,2025-08-04 19:40:05 UTC\n` +
      `s2,a2,bounce@x.com,"",bounced,No,2025-08-04 19:40:05 UTC\n`;
    const rows = parseBeehiiv(csv);
    expect(rows.map((r) => r.email)).toEqual(["unsub@x.com", "bounce@x.com"]);
    expect(rows.every((r) => r.newsletterSubscribed === false)).toBe(true);
  });

  it("reads premium and splits tags", () => {
    const csv = `${HEADER}\ns1,a1,pro@x.com,"ai, dev",active,Yes,2025-08-04 19:40:05 UTC\n`;
    const rows = parseBeehiiv(csv);
    expect(rows[0].isPremium).toBe(true);
    expect(rows[0].tags).toEqual(["ai", "dev"]);
  });

  it("skips rows with an invalid email", () => {
    const csv = `${HEADER}\ns1,a1,not-an-email,"",active,No,2025-08-04 19:40:05 UTC\n`;
    expect(parseBeehiiv(csv)).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/community/parse-beehiiv.test.ts`
Expected: FAIL — `parseBeehiiv` not exported.

- [ ] **Step 3: Write the parser**

Create `lib/community/parse.ts`:
```ts
import { parse } from "csv-parse/sync";
import { parseTimestamp, type ContactInput, type ContactSource } from "./types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BEEHIIV_UNSUB = new Set(["unsubscribed", "unsub", "inactive", "removed", "bounced"]);

function lower(row: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(row)) out[k.toLowerCase()] = v;
  return out;
}

function splitTags(raw: string | undefined): string[] {
  return (raw ?? "")
    .split(/[,;]/)
    .map((t) => t.trim())
    .filter(Boolean);
}

/** Beehiiv export: subscriber_id,api_subscription_id,email,tags,status,premium?,created_at */
export function parseBeehiiv(csv: string): ContactInput[] {
  const rows = parse(csv, { columns: true, skip_empty_lines: true, trim: true }) as Record<
    string,
    string
  >[];
  const out: ContactInput[] = [];
  for (const raw of rows) {
    const r = lower(raw);
    const email = (r.email ?? "").trim().toLowerCase();
    if (!EMAIL_RE.test(email)) continue;
    const status = (r.status ?? "").trim().toLowerCase();
    out.push({
      email,
      source: "beehiiv",
      tags: splitTags(r.tags),
      isPremium: (r["premium?"] ?? "").trim().toLowerCase() === "yes",
      newsletterSubscribed: !BEEHIIV_UNSUB.has(status),
      metadata: {
        subscriber_id: r.subscriber_id,
        api_subscription_id: r.api_subscription_id,
        status,
      },
      firstSeenAt: parseTimestamp(r.created_at),
    });
  }
  return out;
}

/**
 * Event-style export (Cursor attendees and leads). Shared shape:
 * id,name,email,locale,coupon_code_id,[opted_in_for_raffle,selected_prize_id,]registered_at,created_at,updated_at
 * Every contact is newsletter_subscribed=true (Ricardo's consent decision).
 */
export function parseEventCsv(csv: string, source: ContactSource): ContactInput[] {
  const rows = parse(csv, { columns: true, skip_empty_lines: true, trim: true }) as Record<
    string,
    string
  >[];
  const out: ContactInput[] = [];
  for (const raw of rows) {
    const r = lower(raw);
    const email = (r.email ?? "").trim().toLowerCase();
    if (!EMAIL_RE.test(email)) continue;
    const name = (r.name ?? "").trim() || undefined;
    const locale = (r.locale ?? "").trim() || undefined;
    const metadata: Record<string, unknown> = {};
    for (const key of ["id", "coupon_code_id", "opted_in_for_raffle", "selected_prize_id"]) {
      if (r[key] !== undefined && r[key] !== "" && r[key]?.toUpperCase() !== "NULL") {
        metadata[key] = r[key];
      }
    }
    out.push({
      email,
      name,
      locale,
      source,
      tags: [],
      isPremium: false,
      newsletterSubscribed: true,
      metadata,
      firstSeenAt: parseTimestamp(r.registered_at) ?? parseTimestamp(r.created_at),
    });
  }
  return out;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/community/parse-beehiiv.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/community/parse.ts tests/community/parse-beehiiv.test.ts
git commit -m "feat: Beehiiv + event CSV parsers for community contacts"
```

---

## Task 5: Event CSV parser tests

**Files:**
- Test: `tests/community/parse-event.test.ts`

(The implementation `parseEventCsv` was written in Task 4; this task locks its behavior with tests.)

- [ ] **Step 1: Write the failing test**

Create `tests/community/parse-event.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { parseEventCsv } from "../../lib/community/parse";

describe("parseEventCsv", () => {
  it("parses attendees with raffle metadata, all subscribed", () => {
    const csv =
      `id,name,email,locale,coupon_code_id,opted_in_for_raffle,selected_prize_id,registered_at,created_at,updated_at\n` +
      `12,"Ricardo",Ric@Example.com,es,126,1,7,2025-11-15 09:15:12,2025-11-15 09:15:12,2025-11-15 10:35:57\n`;
    const rows = parseEventCsv(csv, "cursor-event");
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      email: "ric@example.com",
      name: "Ricardo",
      locale: "es",
      source: "cursor-event",
      newsletterSubscribed: true,
    });
    expect(rows[0].metadata).toMatchObject({ id: "12", opted_in_for_raffle: "1", selected_prize_id: "7" });
    expect(rows[0].firstSeenAt?.toISOString()).toBe("2025-11-15T09:15:12.000Z");
  });

  it("parses leads (no raffle columns) and drops NULL coupon", () => {
    const csv =
      `id,name,email,locale,coupon_code_id,registered_at,created_at,updated_at\n` +
      `3,"Aylin",darinka@gapy.io,es,NULL,2025-11-19 15:30:22,2025-11-19 15:30:22,2025-11-20 12:05:34\n`;
    const rows = parseEventCsv(csv, "lead");
    expect(rows[0].source).toBe("lead");
    expect(rows[0].metadata).toMatchObject({ id: "3" });
    expect(rows[0].metadata).not.toHaveProperty("coupon_code_id");
  });

  it("skips invalid emails", () => {
    const csv = `id,name,email,locale,registered_at\n1,X,bad,es,2025-11-19 15:30:22\n`;
    expect(parseEventCsv(csv, "lead")).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run test to verify it passes**

Run: `pnpm vitest run tests/community/parse-event.test.ts`
Expected: PASS (3 tests) — `parseEventCsv` already exists from Task 4.

- [ ] **Step 3: Commit**

```bash
git add tests/community/parse-event.test.ts
git commit -m "test: lock event CSV parser behavior"
```

---

## Task 6: Merge contacts by email

**Files:**
- Create: `lib/community/merge.ts`
- Test: `tests/community/merge.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/community/merge.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { mergeContacts } from "../../lib/community/merge";
import type { ContactInput } from "../../lib/community/types";

function input(p: Partial<ContactInput> & { email: string; source: ContactInput["source"] }): ContactInput {
  return {
    tags: [],
    isPremium: false,
    newsletterSubscribed: true,
    metadata: {},
    ...p,
  };
}

describe("mergeContacts", () => {
  it("collapses the same email across sources into one row", () => {
    const merged = mergeContacts([
      input({ email: "a@x.com", source: "beehiiv", tags: ["dev"] }),
      input({ email: "a@x.com", source: "cursor-event", name: "Ada", locale: "es" }),
    ]);
    expect(merged).toHaveLength(1);
    expect(merged[0].sources).toEqual(["beehiiv", "cursor-event"]);
    expect(merged[0].name).toBe("Ada");
    expect(merged[0].locale).toBe("es");
    expect(merged[0].tags).toEqual(["dev"]);
  });

  it("namespaces metadata by source", () => {
    const merged = mergeContacts([
      input({ email: "a@x.com", source: "beehiiv", metadata: { subscriber_id: "s1" } }),
      input({ email: "a@x.com", source: "lead", metadata: { id: "9" } }),
    ]);
    expect(merged[0].metadata).toEqual({ beehiiv: { subscriber_id: "s1" }, lead: { id: "9" } });
  });

  it("an explicit opt-out anywhere wins (compliance)", () => {
    const merged = mergeContacts([
      input({ email: "a@x.com", source: "beehiiv", newsletterSubscribed: false }),
      input({ email: "a@x.com", source: "cursor-event", newsletterSubscribed: true }),
    ]);
    expect(merged[0].newsletterSubscribed).toBe(false);
  });

  it("ORs premium and keeps the earliest firstSeenAt", () => {
    const merged = mergeContacts([
      input({ email: "a@x.com", source: "beehiiv", isPremium: true, firstSeenAt: new Date("2025-08-01T00:00:00Z") }),
      input({ email: "a@x.com", source: "lead", firstSeenAt: new Date("2025-06-01T00:00:00Z") }),
    ]);
    expect(merged[0].isPremium).toBe(true);
    expect(merged[0].firstSeenAt?.toISOString()).toBe("2025-06-01T00:00:00.000Z");
  });

  it("keeps the first non-empty name and unions tags", () => {
    const merged = mergeContacts([
      input({ email: "a@x.com", source: "cursor-event", name: "First", tags: ["a"] }),
      input({ email: "a@x.com", source: "lead", name: "Second", tags: ["a", "b"] }),
    ]);
    expect(merged[0].name).toBe("First");
    expect(merged[0].tags).toEqual(["a", "b"]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/community/merge.test.ts`
Expected: FAIL — `mergeContacts` not exported.

- [ ] **Step 3: Write the merge function**

Create `lib/community/merge.ts`:
```ts
import type { ContactInput, ContactSource, MergedContact } from "./types";

/**
 * Merge normalized inputs into one row per lowercased email.
 * - sources: union, first-seen order
 * - name/locale: first non-empty wins
 * - tags: union (dedup, first-seen order)
 * - isPremium: OR
 * - newsletterSubscribed: AND — any explicit opt-out wins (CAN-SPAM compliance)
 * - metadata: namespaced by source
 * - firstSeenAt: earliest defined
 */
export function mergeContacts(inputs: ContactInput[]): MergedContact[] {
  const byEmail = new Map<string, MergedContact>();

  for (const inp of inputs) {
    const existing = byEmail.get(inp.email);
    if (!existing) {
      byEmail.set(inp.email, {
        email: inp.email,
        name: inp.name,
        locale: inp.locale,
        sources: [inp.source],
        tags: [...new Set(inp.tags)],
        isPremium: inp.isPremium,
        newsletterSubscribed: inp.newsletterSubscribed,
        metadata: Object.keys(inp.metadata).length ? { [inp.source]: inp.metadata } : {},
        firstSeenAt: inp.firstSeenAt,
      });
      continue;
    }
    if (!existing.sources.includes(inp.source)) existing.sources.push(inp.source);
    if (!existing.name && inp.name) existing.name = inp.name;
    if (!existing.locale && inp.locale) existing.locale = inp.locale;
    existing.tags = [...new Set([...existing.tags, ...inp.tags])];
    existing.isPremium = existing.isPremium || inp.isPremium;
    existing.newsletterSubscribed = existing.newsletterSubscribed && inp.newsletterSubscribed;
    if (Object.keys(inp.metadata).length) {
      existing.metadata = { ...existing.metadata, [inp.source]: inp.metadata };
    }
    if (inp.firstSeenAt && (!existing.firstSeenAt || inp.firstSeenAt < existing.firstSeenAt)) {
      existing.firstSeenAt = inp.firstSeenAt;
    }
  }

  return [...byEmail.values()];
}

/** Convenience: sources present in a merged set, for reporting. */
export function sourceCounts(merged: MergedContact[]): Record<ContactSource, number> {
  const counts = { beehiiv: 0, "cursor-event": 0, lead: 0 } as Record<ContactSource, number>;
  for (const c of merged) for (const s of c.sources) counts[s]++;
  return counts;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/community/merge.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/community/merge.ts tests/community/merge.test.ts
git commit -m "feat: merge community contacts by email"
```

---

## Task 7: DB upsert layer

**Files:**
- Create: `lib/community/import.ts`
- Test: `tests/community/import.test.ts`

- [ ] **Step 1: Write the integration test (guarded by DATABASE_URL)**

Create `tests/community/import.test.ts`:
```ts
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { MergedContact } from "../../lib/community/types";

// Integration test: only runs when a test DATABASE_URL is provided.
const hasDb = !!process.env.DATABASE_URL;
const d = hasDb ? describe : describe.skip;

d("importContacts (integration)", () => {
  let importContacts: typeof import("../../lib/community/import").importContacts;
  let db: typeof import("../../lib/db/client").db;
  let contacts: typeof import("../../lib/db/schema").contacts;
  const testEmail = "vitest+merge@example.com";

  beforeAll(async () => {
    ({ importContacts } = await import("../../lib/community/import"));
    ({ db } = await import("../../lib/db/client"));
    ({ contacts } = await import("../../lib/db/schema"));
    const { eq } = await import("drizzle-orm");
    await db.delete(contacts).where(eq(contacts.email, testEmail));
  });

  afterAll(async () => {
    const { eq } = await import("drizzle-orm");
    await db.delete(contacts).where(eq(contacts.email, testEmail));
  });

  function row(over: Partial<MergedContact> = {}): MergedContact {
    return {
      email: testEmail,
      sources: ["beehiiv"],
      tags: [],
      isPremium: false,
      newsletterSubscribed: true,
      metadata: {},
      ...over,
    };
  }

  it("inserts a new contact, then is idempotent on re-run", async () => {
    const first = await importContacts(db, [row({ name: "First" })]);
    expect(first.inserted).toBe(1);
    expect(first.updated).toBe(0);

    const second = await importContacts(db, [row({ name: "Updated", tags: ["x"] })]);
    expect(second.inserted).toBe(0);
    expect(second.updated).toBe(1);

    const { eq } = await import("drizzle-orm");
    const [stored] = await db.select().from(contacts).where(eq(contacts.email, testEmail));
    expect(stored.name).toBe("Updated");
    expect(stored.tags).toEqual(["x"]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails (or skips without DB)**

Run: `pnpm vitest run tests/community/import.test.ts`
Expected without a DB: the suite is **skipped** (0 failures). With `DATABASE_URL` set: FAIL — `importContacts` not exported.

- [ ] **Step 3: Write the import layer**

Create `lib/community/import.ts`:
```ts
import { sql } from "drizzle-orm";
import type { DB } from "../db/client";
import { contacts } from "../db/schema";
import type { MergedContact } from "./types";

export interface ImportResult {
  inserted: number;
  updated: number;
}

/**
 * Upsert merged contacts by email. The merged set is the desired state, so on
 * conflict we overwrite the mutable fields and bump updated_at. Idempotent for
 * the same input set. `xmax = 0` distinguishes a fresh insert from an update.
 */
export async function importContacts(db: DB, merged: MergedContact[]): Promise<ImportResult> {
  let inserted = 0;
  let updated = 0;

  for (const c of merged) {
    const rows = await db
      .insert(contacts)
      .values({
        email: c.email,
        name: c.name,
        locale: c.locale,
        sources: c.sources,
        tags: c.tags,
        isPremium: c.isPremium,
        newsletterSubscribed: c.newsletterSubscribed,
        metadata: c.metadata,
        firstSeenAt: c.firstSeenAt,
      })
      .onConflictDoUpdate({
        target: contacts.email,
        set: {
          name: c.name,
          locale: c.locale,
          sources: c.sources,
          tags: c.tags,
          isPremium: c.isPremium,
          newsletterSubscribed: c.newsletterSubscribed,
          metadata: c.metadata,
          firstSeenAt: c.firstSeenAt,
          updatedAt: sql`now()`,
        },
      })
      .returning({ isInsert: sql<boolean>`(xmax = 0)` });

    if (rows[0]?.isInsert) inserted++;
    else updated++;
  }

  return { inserted, updated };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `DATABASE_URL="<DATABASE_PUBLIC_URL>" pnpm vitest run tests/community/import.test.ts`
Expected: PASS (1 test). Without the env var it stays skipped — that is acceptable for CI but you MUST run it once with the DB before finishing.

- [ ] **Step 5: Commit**

```bash
git add lib/community/import.ts tests/community/import.test.ts
git commit -m "feat: idempotent contacts upsert layer"
```

---

## Task 8: Import CLI + run the real 3-CSV import

**Files:**
- Create: `scripts/community/import-contacts.ts`

- [ ] **Step 1: Write the CLI**

Create `scripts/community/import-contacts.ts`:
```ts
import { readFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { parseBeehiiv, parseEventCsv } from "../../lib/community/parse";
import { mergeContacts, sourceCounts } from "../../lib/community/merge";
import { importContacts } from "../../lib/community/import";
import type { ContactInput } from "../../lib/community/types";

async function main() {
  const { values } = parseArgs({
    options: {
      beehiiv: { type: "string" },
      attendees: { type: "string" },
      leads: { type: "string" },
      "dry-run": { type: "boolean", default: false },
    },
  });

  const inputs: ContactInput[] = [];
  if (values.beehiiv) inputs.push(...parseBeehiiv(readFileSync(values.beehiiv, "utf8")));
  if (values.attendees) inputs.push(...parseEventCsv(readFileSync(values.attendees, "utf8"), "cursor-event"));
  if (values.leads) inputs.push(...parseEventCsv(readFileSync(values.leads, "utf8"), "lead"));

  if (inputs.length === 0) {
    console.error(
      "Usage: pnpm community:import --beehiiv <csv> --attendees <csv> --leads <csv> [--dry-run]",
    );
    process.exit(1);
  }

  const merged = mergeContacts(inputs);
  const subscribed = merged.filter((c) => c.newsletterSubscribed).length;
  console.log(`Parsed ${inputs.length} rows → ${merged.length} unique contacts.`);
  console.log(`  source coverage:`, sourceCounts(merged));
  console.log(`  newsletter_subscribed: ${subscribed} / ${merged.length}`);

  if (values["dry-run"]) {
    console.log("DRY RUN — nothing written.");
    process.exit(0);
  }

  const { db } = await import("../../lib/db/client");
  const res = await importContacts(db, merged);
  console.log(`Done. inserted=${res.inserted} updated=${res.updated}`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

- [ ] **Step 2: Dry-run against the real CSVs to verify the merge**

Run:
```bash
pnpm community:import \
  --beehiiv ~/ai-builders-mx-basic_subscriber-2026-06-07.csv \
  --attendees ~/attendees.csv \
  --leads ~/leads.csv \
  --dry-run
```
Expected: parses ~2,348 rows, reports ~2,200+ unique contacts, source coverage with `beehiiv: 2177` (±skipped invalids), and a `newsletter_subscribed` count. No DB write.

- [ ] **Step 3: Run the real import**

Run:
```bash
DATABASE_URL="<DATABASE_PUBLIC_URL>" pnpm community:import \
  --beehiiv ~/ai-builders-mx-basic_subscriber-2026-06-07.csv \
  --attendees ~/attendees.csv \
  --leads ~/leads.csv
```
Expected: `Done. inserted=<~2200> updated=0`.

- [ ] **Step 4: Verify idempotency — run the exact same command again**

Run the same command from Step 3 again.
Expected: `Done. inserted=0 updated=<~2200>` (no new rows; only updated_at bumped).

- [ ] **Step 5: Spot-check the data**

Run:
```bash
DATABASE_URL="<DATABASE_PUBLIC_URL>" pnpm tsx -e "import {db} from './lib/db/client'; import {contacts} from './lib/db/schema'; import {sql} from 'drizzle-orm'; const [c]=await db.select({n:sql\`count(*)\`}).from(contacts); console.log('total contacts:', c.n); process.exit(0)"
```
Expected: total contacts ≈ the unique count from the dry run.

- [ ] **Step 6: Commit**

```bash
git add scripts/community/import-contacts.ts
git commit -m "feat: community import CLI (3 CSVs -> contacts, idempotent)"
```

---

## Task 9: Full suite green + wrap-up

- [ ] **Step 1: Run the whole unit suite**

Run: `pnpm vitest run`
Expected: all `tests/newsletter/**` and `tests/community/**` pass (the DB integration test skips without `DATABASE_URL`, or passes with it). No failures.

- [ ] **Step 2: Lint and build**

Run: `pnpm lint && pnpm build`
Expected: lint clean; Next build succeeds (the new `lib/db` / `lib/community` modules compile).

- [ ] **Step 3: Update the memory pointer**

Append to `/Users/vellent/.claude/projects/-Volumes-VELLENT-USB-Sites-aibuilders/memory/newsletter-feature-phases.md` (or a new `community-db.md` memory) a note that Phase 1 (community DB on Railway Postgres via Drizzle, `contacts` populated from the 3 CSVs) is done, and update `MEMORY.md` with the one-line pointer.

- [ ] **Step 4: Final commit if anything changed**

```bash
git add -A && git commit -m "chore: phase 1 community DB wrap-up" || echo "nothing to commit"
```

---

## Self-Review

**Spec coverage (§ of the design spec → task):**
- §4.1 Drizzle/driver → Task 1
- §4.2 `contacts` table → Task 2
- §4.3 consent (all `true` except Beehiiv opt-outs) → Task 4 (parser) + Task 6 (merge AND-rule)
- §4.4 import/merge idempotent, namespaced metadata, earliest first_seen → Tasks 6, 7, 8
- §3 the 3 CSVs and shapes → Tasks 4, 5, 8
- §8 testing strategy (unit parse/merge, integration import, manual dry-run/counts) → Tasks 3–9

**Not in this plan (correctly deferred):** §5 auth (Phase 2), §6 newsletter panel (Phase 3), §10 job board (Phase 4), Resend Audience sync (Phase 3 — the DB is the source of truth; sync happens when sending). Adding `RESEND_*` env vars is a Phase 3 step.

**Placeholder scan:** none — every code step has complete code; every command has expected output.

**Type consistency:** `ContactInput` / `MergedContact` / `ContactSource` defined in Task 3 are used consistently in Tasks 4–8. `importContacts(db, merged)` signature matches between `import.ts` (Task 7), its test, and the CLI (Task 8). `mergeContacts` / `sourceCounts` names match between `merge.ts` and consumers. `db` / `contacts` / `DB` names match the `lib/db` modules from Tasks 1–2.
