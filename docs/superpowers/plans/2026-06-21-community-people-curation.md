# Community People Curation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let an admin curate WhatsApp community people (override the display name, match them to a `contacts` record, add notes/tags) from `/admin/comunidad/personas/[jid]`, with the curated name flowing back to the bot so its MCP/summaries show it.

**Architecture:** Postgres-owned curation (new `community_people` table, FK to `contacts`) overlaid on the bot's live activity data via a LEFT JOIN done in the page. The only field replicated to the bot is the curated name, pushed over a new `PATCH /dashboard/api/person/:jid` endpoint into a new `user_profiles.curated_name` column the nightly rebuild never overwrites. Postgres is the source of truth; the bot name-sync is best-effort and never blocks a save.

**Tech Stack:** Next.js 16 (App Router, Server Actions), Drizzle ORM + Railway Postgres (website); Express 5 + better-sqlite3 (bot); vitest (website tests only).

## Global Constraints

- **Two repos.** Website = `/Volumes/VELLENT USB/Sites/aibuilders` (pnpm). Bot = `/Users/vellent/sites/aibuilders-bot` (npm).
- **Branch:** work on `main` in both repos (no feature branches — user's standing instruction).
- **Package manager (website):** always `pnpm`, never `npm`/`yarn`.
- **Bot has no test runner.** Verify bot tasks with `npm run build` (tsc clean) + a `curl` smoke. Do NOT add vitest/jest to the bot.
- **Website tests:** `pnpm test` runs `vitest run`, includes only `tests/**/*.test.ts`. New tests go under `tests/`, import via the `@/` alias, never co-located.
- **server-only:** `lib/aiby/client.ts` imports `server-only`; vitest already aliases it to `tests/stubs/server-only.ts`. Do not change that.
- **UI palette:** binary B/N only — `#212121`/white + neutrals `black/5,10,20,40,60`, status `green-500`/`red-500`. Reuse existing card/chip/eyebrow classes. No new colors. Spanish (es_MX) copy.
- **Auth gate:** every server action that writes or reads contacts is gated by `await getUser()` from `@/lib/auth`, returning `{ error: "No autorizado." }` when absent — mirror `lib/actions/aiby.ts`.
- **Failure stance:** if the bot PATCH fails, the Postgres write still commits; log and continue, never revert.

---

## File Structure

**Bot (`aibuilders-bot`):**
- `src/memory/db.ts` — add `curated_name` column to `user_profiles` + idempotent `addColumnIfMissing` migration.
- `src/dashboard/queries.ts` — add `setCuratedName(jid, name)`; add `curated_name` to `getPersonDetail`'s SELECT + payload.
- `src/dashboard/routes.ts` — add `PATCH /person/:jid`.
- `src/mcp/queries.ts` — `getPersonBrief` + `listActivePeople` use `COALESCE(NULLIF(curated_name,''), name)`.

**Website (`aibuilders`):**
- `lib/db/schema.ts` — new `communityPeople` table + types.
- `lib/db/queries/community-people.ts` (NEW) — `getOverlays`, `getOverlay`, `searchContacts`, `upsertCommunityPerson`, `CommunityOverlay` type.
- `lib/aiby/client.ts` — `patchPersonName(jid, name)`.
- `lib/actions/community.ts` (NEW) — `saveCommunityPerson`, `searchContactsAction`.
- `app/(admin)/admin/comunidad/personas/components/person-editor.tsx` (NEW) — client editor.
- `app/(admin)/admin/comunidad/personas/[jid]/page.tsx` — render overlay + mount editor.
- `app/(admin)/admin/comunidad/personas/page.tsx` — overlay curated names in the list.
- Tests: `tests/aiby/client-person.test.ts`, `tests/actions/community.test.ts`, `tests/db/community-people.test.ts`.

---

## Task 1: Bot — `curated_name` column + idempotent migration

**Files:**
- Modify: `aibuilders-bot/src/memory/db.ts` (the `user_profiles` `CREATE TABLE` block near line 199, and the `migrate()` function)

**Interfaces:**
- Produces: `user_profiles.curated_name TEXT` exists on every DB (fresh and pre-existing).

- [ ] **Step 1: Add the column to the CREATE TABLE block**

In `src/memory/db.ts`, inside the `CREATE TABLE IF NOT EXISTS user_profiles (...)` block, add `curated_name` right after `style_notes`:

```sql
      style_notes      TEXT,
      curated_name     TEXT,
      message_count    INTEGER NOT NULL DEFAULT 0,
```

- [ ] **Step 2: Add an idempotent column-add helper + call it**

At the end of `migrate(db)` (after the existing `db.exec(...)` and the vec block, before the `schema_version` meta write), add:

```ts
  addColumnIfMissing(db, "user_profiles", "curated_name", "TEXT");
```

And define the helper at the bottom of the file (module scope):

```ts
function addColumnIfMissing(
  db: Database.Database,
  table: string,
  column: string,
  type: string,
): void {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
  if (!cols.some((c) => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
  }
}
```

- [ ] **Step 3: Verify it builds**

Run: `cd /Users/vellent/sites/aibuilders-bot && npm run build`
Expected: tsc exits 0, no errors.

- [ ] **Step 4: Smoke the migration against a temp DB**

Run:
```bash
cd /Users/vellent/sites/aibuilders-bot && MEMORY_DB=/tmp/aiby-mig.sqlite npx tsx -e "import { getDb } from './src/memory/db.js'; const db = getDb(); const cols = db.prepare('PRAGMA table_info(user_profiles)').all().map(c => c.name); console.log(cols.includes('curated_name') ? 'OK curated_name present' : 'FAIL'); " ; rm -f /tmp/aiby-mig.sqlite*
```
Expected: prints `OK curated_name present`.

- [ ] **Step 5: Commit**

```bash
cd /Users/vellent/sites/aibuilders-bot && git add src/memory/db.ts && git commit -m "feat(profiles): add curated_name column + idempotent migration"
```

---

## Task 2: Bot — `setCuratedName` query + `PATCH /person/:jid` route

**Files:**
- Modify: `aibuilders-bot/src/dashboard/queries.ts` (add `setCuratedName`)
- Modify: `aibuilders-bot/src/dashboard/routes.ts` (add the route, near the existing `router.patch("/jobs/:id", ...)` ~line 107)

**Interfaces:**
- Consumes: `getDb()` from `../memory/db.js` (already imported in queries.ts).
- Produces: `setCuratedName(jid: string, curatedName: string | null): void`; `PATCH /dashboard/api/person/:jid` accepting `{ curated_name: string | null }`, returning `{ ok: true, jid, curated_name }`.

- [ ] **Step 1: Add `setCuratedName` to queries.ts**

At the end of `src/dashboard/queries.ts`:

```ts
/**
 * Set (or clear) the admin-curated display name for a person. Upserts so it works
 * even before the nightly profile synthesis has created the row. Touches ONLY
 * curated_name — never the synthesized fields.
 */
export function setCuratedName(jid: string, curatedName: string | null): void {
  const db = getDb();
  const name = curatedName && curatedName.trim() !== "" ? curatedName.trim() : null;
  const base = db
    .prepare(
      `SELECT sender_phone AS phone, sender_name AS name
       FROM messages WHERE sender_jid = ? ORDER BY ts DESC LIMIT 1`,
    )
    .get(jid) as { phone: string; name: string | null } | undefined;
  db.prepare(
    `INSERT INTO user_profiles (jid, phone, name, curated_name, last_updated)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(jid) DO UPDATE SET curated_name = excluded.curated_name,
                                    last_updated = excluded.last_updated`,
  ).run(jid, base?.phone ?? "", base?.name ?? null, name, new Date().toISOString());
}
```

- [ ] **Step 2: Add the PATCH route**

In `src/dashboard/routes.ts`, import `setCuratedName` alongside the other queries, then add right after the `router.patch("/jobs/:id", ...)` handler:

```ts
  router.patch("/person/:jid", (req, res) => {
    const jid = req.params.jid as string;
    if (!jid) return res.status(400).json({ error: "invalid jid" });
    const raw = req.body?.curated_name;
    if (raw !== null && typeof raw !== "string") {
      return res.status(400).json({ error: "curated_name must be a string or null" });
    }
    const curated = typeof raw === "string" && raw.trim() !== "" ? raw.trim() : null;
    setCuratedName(jid, curated);
    res.json({ ok: true, jid, curated_name: curated });
  });
```

- [ ] **Step 3: Verify it builds**

Run: `cd /Users/vellent/sites/aibuilders-bot && npm run build`
Expected: tsc exits 0.

- [ ] **Step 4: Smoke `setCuratedName` against a temp DB**

Run:
```bash
cd /Users/vellent/sites/aibuilders-bot && MEMORY_DB=/tmp/aiby-set.sqlite npx tsx -e "import { getDb } from './src/memory/db.js'; import { setCuratedName } from './src/dashboard/queries.js'; getDb(); setCuratedName('123@s.whatsapp.net', 'Ricardo García'); const row = getDb().prepare('SELECT jid, curated_name FROM user_profiles WHERE jid = ?').get('123@s.whatsapp.net'); console.log(JSON.stringify(row)); setCuratedName('123@s.whatsapp.net', ''); const row2 = getDb().prepare('SELECT curated_name FROM user_profiles WHERE jid = ?').get('123@s.whatsapp.net'); console.log('cleared:', JSON.stringify(row2));" ; rm -f /tmp/aiby-set.sqlite*
```
Expected: first line `{"jid":"123@s.whatsapp.net","curated_name":"Ricardo García"}`, second line `cleared: {"curated_name":null}`.

- [ ] **Step 5: Commit**

```bash
cd /Users/vellent/sites/aibuilders-bot && git add src/dashboard/queries.ts src/dashboard/routes.ts && git commit -m "feat(api): PATCH /dashboard/api/person/:jid sets curated_name"
```

---

## Task 3: Bot — curated name wins in reads (detail + MCP)

**Files:**
- Modify: `aibuilders-bot/src/dashboard/queries.ts` (`getPersonDetail` — add `curated_name` to SELECT + return)
- Modify: `aibuilders-bot/src/mcp/queries.ts` (`getPersonBrief` ~line 327; `listActivePeople` name resolution ~line 298)
- Modify: `aibuilders-bot/src/memory/profiles.ts` — confirm `upsertProfile` does NOT touch `curated_name` (no change expected; verify only)

**Interfaces:**
- Consumes: `user_profiles.curated_name` (Task 1).
- Produces: detail payload carries `curated_name`; MCP person/people reads display `COALESCE(NULLIF(curated_name,''), name)`.

- [ ] **Step 1: Add `curated_name` to `getPersonDetail`**

In `src/dashboard/queries.ts`, the `profileRow` query (~line 469) currently selects `expertise, projects, links_authored, style_notes`. Add `curated_name`:

```ts
  const profileRow = db
    .prepare("SELECT expertise, projects, links_authored, style_notes, curated_name FROM user_profiles WHERE jid = ?")
    .get(jid) as { expertise: string; projects: string; links_authored: string; style_notes: string | null; curated_name: string | null } | undefined;
```

Then in the returned object (the `return { jid, name: baseRow.name, ... }` block) add `curatedName`:

```ts
  return {
    jid,
    name: baseRow.name,
    curatedName: profileRow?.curated_name ?? null,
    phone: baseRow.phone ?? "",
    // ...rest unchanged
```

- [ ] **Step 2: `getPersonBrief` returns the curated name**

In `src/mcp/queries.ts`, the `getPersonBrief` SELECT (~line 329) lists `jid, name, phone, expertise, ...`. Change the `name` column to resolve curated-first:

```ts
      `SELECT jid, COALESCE(NULLIF(curated_name, ''), name) AS name, phone, expertise, projects, links_authored, style_notes
       FROM user_profiles WHERE jid = ?`,
```

(The row type already types `name: string | null` — no type change needed.)

- [ ] **Step 3: `listActivePeople` prefers the curated name**

In `src/mcp/queries.ts`, `listActivePeople`'s people query (~line 249) is `SELECT sender_jid jid, MAX(sender_name) name, ...` from `messages`. The curated name lives in `user_profiles`, so LEFT JOIN it:

```ts
      `SELECT m.sender_jid jid,
              COALESCE(NULLIF(up.curated_name, ''), MAX(m.sender_name)) name,
              MAX(m.sender_phone) phone, COUNT(*) c
       FROM messages m
       LEFT JOIN user_profiles up ON up.jid = m.sender_jid
       WHERE m.ts BETWEEN ? AND ?${g.sql}
       GROUP BY m.sender_jid
       ORDER BY c DESC LIMIT ?`,
```

(Keep the existing param order: `from, to, ...g.params, limit`. `g` here is the `messages` group clause — preserve whatever alias the existing code uses; if it references bare `sender_*`, qualify with `m.` as above.)

- [ ] **Step 4: Verify the nightly rebuild never writes `curated_name`**

Open `src/memory/profiles.ts`, find `upsertProfile` (the `INSERT INTO user_profiles (...) ON CONFLICT DO UPDATE SET ...` ~line 319). Confirm `curated_name` appears in NEITHER the column list NOR the `DO UPDATE SET` clause. It should not (the column is new). No code change — this step is a guard check. If it somehow references `curated_name`, remove it.

- [ ] **Step 5: Verify it builds**

Run: `cd /Users/vellent/sites/aibuilders-bot && npm run build`
Expected: tsc exits 0.

- [ ] **Step 6: Smoke COALESCE precedence against a temp DB**

Run:
```bash
cd /Users/vellent/sites/aibuilders-bot && MEMORY_DB=/tmp/aiby-coal.sqlite npx tsx -e "import { getDb } from './src/memory/db.js'; const db = getDb(); db.prepare('INSERT INTO user_profiles (jid, phone, name, curated_name, last_updated) VALUES (?,?,?,?,?)').run('x@s','52','Fp','Fernando P', new Date().toISOString()); const r = db.prepare(\"SELECT COALESCE(NULLIF(curated_name,''), name) AS name FROM user_profiles WHERE jid='x@s'\").get(); console.log('curated wins:', r.name); db.prepare('UPDATE user_profiles SET curated_name=NULL WHERE jid=?').run('x@s'); const r2 = db.prepare(\"SELECT COALESCE(NULLIF(curated_name,''), name) AS name FROM user_profiles WHERE jid='x@s'\").get(); console.log('fallback:', r2.name);" ; rm -f /tmp/aiby-coal.sqlite*
```
Expected: `curated wins: Fernando P` then `fallback: Fp`.

- [ ] **Step 7: Commit**

```bash
cd /Users/vellent/sites/aibuilders-bot && git add src/dashboard/queries.ts src/mcp/queries.ts && git commit -m "feat(reads): curated_name wins in person detail + MCP person/people"
```

---

## Task 4: Website — `community_people` schema + migration

**Files:**
- Modify: `lib/db/schema.ts` (add table + types; `uuid`/`text`/`timestamp`/`index` already imported)
- Create (generated): `drizzle/*` migration

**Interfaces:**
- Produces: `communityPeople` Drizzle table; types `CommunityPerson`, `NewCommunityPerson`.

- [ ] **Step 1: Add the table to `lib/db/schema.ts`**

After the `contacts` block (and its exported types, ~line 37) add:

```ts
export const communityPeople = pgTable(
  "community_people",
  {
    jid: text("jid").primaryKey(),
    contactId: uuid("contact_id").references(() => contacts.id, { onDelete: "set null" }),
    displayName: text("display_name"),
    notes: text("notes"),
    tags: text("tags").array().notNull().default([]),
    phone: text("phone"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    contactIdx: index("community_people_contact_idx").on(t.contactId),
  }),
);

export type CommunityPerson = typeof communityPeople.$inferSelect;
export type NewCommunityPerson = typeof communityPeople.$inferInsert;
```

- [ ] **Step 2: Generate the migration**

Run: `cd "/Volumes/VELLENT USB/Sites/aibuilders" && pnpm db:generate`
Expected: a new SQL file appears under `drizzle/` creating `community_people` with the FK + index. Inspect it — it must `CREATE TABLE "community_people"` and reference `contacts` with `ON DELETE set null`.

- [ ] **Step 3: Apply the migration**

Run: `cd "/Volumes/VELLENT USB/Sites/aibuilders" && pnpm db:migrate`
Expected: applies cleanly; no error.

- [ ] **Step 4: Verify the table exists**

Run:
```bash
cd "/Volumes/VELLENT USB/Sites/aibuilders" && pnpm tsx -e "import { db } from './lib/db/client'; import { communityPeople } from './lib/db/schema'; const r = await db.select().from(communityPeople).limit(1); console.log('community_people OK, rows:', r.length); process.exit(0);"
```
Expected: prints `community_people OK, rows: 0`.

- [ ] **Step 5: Commit**

```bash
cd "/Volumes/VELLENT USB/Sites/aibuilders" && git add lib/db/schema.ts drizzle/ && git commit -m "feat(db): community_people table for person curation"
```

---

## Task 5: Website — `community-people` query module

**Files:**
- Create: `lib/db/queries/community-people.ts`
- Test: `tests/db/community-people.test.ts`

**Interfaces:**
- Consumes: `db` from `@/lib/db/client`; `communityPeople`, `contacts` from `@/lib/db/schema`.
- Produces:
  - `type CommunityOverlay = { jid: string; displayName: string | null; notes: string | null; tags: string[]; contact: { id: string; email: string; name: string | null } | null }`
  - `getOverlays(jids: string[]): Promise<Map<string, CommunityOverlay>>`
  - `getOverlay(jid: string): Promise<CommunityOverlay | null>`
  - `searchContacts(q: string, limit?: number): Promise<Array<{ id: string; email: string; name: string | null }>>`
  - `upsertCommunityPerson(input: { jid: string; displayName: string | null; contactId: string | null; notes: string | null; tags: string[]; phone: string | null }): Promise<void>`

This task has both unit-testable pure logic (the empty-input / short-query guards) and DB-integration parts. The integration parts follow the existing `tests/community/import.test.ts` pattern: gated on `process.env.DATABASE_URL`, skipped otherwise. The guard tests always run.

- [ ] **Step 1: Write the failing tests**

Create `tests/db/community-people.test.ts`:

```ts
import { describe, it, expect, beforeAll, afterAll } from "vitest";

const hasDb = !!process.env.DATABASE_URL;
const d = hasDb ? describe : describe.skip;

describe("community-people guards (no DB needed)", () => {
  it("getOverlays returns an empty Map for an empty jid list without hitting the DB", async () => {
    const { getOverlays } = await import("@/lib/db/queries/community-people");
    const res = await getOverlays([]);
    expect(res instanceof Map).toBe(true);
    expect(res.size).toBe(0);
  });

  it("searchContacts returns [] for a query shorter than 2 chars without hitting the DB", async () => {
    const { searchContacts } = await import("@/lib/db/queries/community-people");
    expect(await searchContacts("a")).toEqual([]);
    expect(await searchContacts(" ")).toEqual([]);
  });
});

d("community-people (integration)", () => {
  let mod: typeof import("@/lib/db/queries/community-people");
  let db: typeof import("@/lib/db/client").db;
  let schema: typeof import("@/lib/db/schema");
  const jid = "vitest-jid@s.whatsapp.net";
  let contactId: string;

  beforeAll(async () => {
    mod = await import("@/lib/db/queries/community-people");
    ({ db } = await import("@/lib/db/client"));
    schema = await import("@/lib/db/schema");
    const [c] = await db
      .insert(schema.contacts)
      .values({ email: "vitest+curation@example.com", name: "Vitest Person" })
      .onConflictDoUpdate({ target: schema.contacts.email, set: { name: "Vitest Person" } })
      .returning();
    contactId = c.id;
  });

  afterAll(async () => {
    const { eq } = await import("drizzle-orm");
    await db.delete(schema.communityPeople).where(eq(schema.communityPeople.jid, jid));
    await db.delete(schema.contacts).where(eq(schema.contacts.email, "vitest+curation@example.com"));
  });

  it("upsert then getOverlay round-trips with the joined contact", async () => {
    await mod.upsertCommunityPerson({
      jid, displayName: "Curated Name", contactId, notes: "nota", tags: ["mentor"], phone: "52",
    });
    const overlay = await mod.getOverlay(jid);
    expect(overlay?.displayName).toBe("Curated Name");
    expect(overlay?.tags).toEqual(["mentor"]);
    expect(overlay?.contact?.email).toBe("vitest+curation@example.com");
  });

  it("upsert again updates in place (no duplicate row)", async () => {
    await mod.upsertCommunityPerson({
      jid, displayName: "Updated", contactId: null, notes: null, tags: [], phone: "52",
    });
    const overlay = await mod.getOverlay(jid);
    expect(overlay?.displayName).toBe("Updated");
    expect(overlay?.contact).toBeNull();
    const all = await mod.getOverlays([jid]);
    expect(all.size).toBe(1);
  });

  it("searchContacts finds the contact by name fragment", async () => {
    const res = await mod.searchContacts("Vitest Per");
    expect(res.some((c) => c.email === "vitest+curation@example.com")).toBe(true);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd "/Volumes/VELLENT USB/Sites/aibuilders" && pnpm test tests/db/community-people.test.ts`
Expected: FAIL — module `@/lib/db/queries/community-people` not found.

- [ ] **Step 3: Implement the module**

Create `lib/db/queries/community-people.ts`:

```ts
import { eq, ilike, or, inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { communityPeople, contacts } from "@/lib/db/schema";

export type CommunityOverlay = {
  jid: string;
  displayName: string | null;
  notes: string | null;
  tags: string[];
  contact: { id: string; email: string; name: string | null } | null;
};

function toOverlay(row: {
  jid: string;
  displayName: string | null;
  notes: string | null;
  tags: string[];
  contactId: string | null;
  contactEmail: string | null;
  contactName: string | null;
}): CommunityOverlay {
  return {
    jid: row.jid,
    displayName: row.displayName,
    notes: row.notes,
    tags: row.tags,
    contact: row.contactId
      ? { id: row.contactId, email: row.contactEmail ?? "", name: row.contactName }
      : null,
  };
}

const baseSelect = {
  jid: communityPeople.jid,
  displayName: communityPeople.displayName,
  notes: communityPeople.notes,
  tags: communityPeople.tags,
  contactId: communityPeople.contactId,
  contactEmail: contacts.email,
  contactName: contacts.name,
};

export async function getOverlays(jids: string[]): Promise<Map<string, CommunityOverlay>> {
  if (jids.length === 0) return new Map();
  const rows = await db
    .select(baseSelect)
    .from(communityPeople)
    .leftJoin(contacts, eq(communityPeople.contactId, contacts.id))
    .where(inArray(communityPeople.jid, jids));
  return new Map(rows.map((r) => [r.jid, toOverlay(r)]));
}

export async function getOverlay(jid: string): Promise<CommunityOverlay | null> {
  const rows = await db
    .select(baseSelect)
    .from(communityPeople)
    .leftJoin(contacts, eq(communityPeople.contactId, contacts.id))
    .where(eq(communityPeople.jid, jid))
    .limit(1);
  return rows[0] ? toOverlay(rows[0]) : null;
}

export async function searchContacts(
  q: string,
  limit = 10,
): Promise<Array<{ id: string; email: string; name: string | null }>> {
  const term = q.trim();
  if (term.length < 2) return [];
  const like = `%${term}%`;
  return db
    .select({ id: contacts.id, email: contacts.email, name: contacts.name })
    .from(contacts)
    .where(or(ilike(contacts.name, like), ilike(contacts.email, like)))
    .orderBy(contacts.name)
    .limit(limit);
}

export async function upsertCommunityPerson(input: {
  jid: string;
  displayName: string | null;
  contactId: string | null;
  notes: string | null;
  tags: string[];
  phone: string | null;
}): Promise<void> {
  await db
    .insert(communityPeople)
    .values({
      jid: input.jid,
      displayName: input.displayName,
      contactId: input.contactId,
      notes: input.notes,
      tags: input.tags,
      phone: input.phone,
    })
    .onConflictDoUpdate({
      target: communityPeople.jid,
      set: {
        displayName: input.displayName,
        contactId: input.contactId,
        notes: input.notes,
        tags: input.tags,
        phone: input.phone,
        updatedAt: new Date(),
      },
    });
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd "/Volumes/VELLENT USB/Sites/aibuilders" && pnpm test tests/db/community-people.test.ts`
Expected: the 2 guard tests PASS. The integration block PASSES if `DATABASE_URL` is set, else shows as skipped. (To run integration locally: `DATABASE_URL=... pnpm test tests/db/community-people.test.ts`.)

- [ ] **Step 5: Commit**

```bash
cd "/Volumes/VELLENT USB/Sites/aibuilders" && git add lib/db/queries/community-people.ts tests/db/community-people.test.ts && git commit -m "feat(db): community-people query module (overlays, contact search, upsert)"
```

---

## Task 6: Website — `patchPersonName` bot client fn

**Files:**
- Modify: `lib/aiby/client.ts` (add after `patchJobStatus`, ~line 116)
- Test: `tests/aiby/client-person.test.ts`

**Interfaces:**
- Consumes: the existing `patch<T>` helper in `client.ts`.
- Produces: `patchPersonName(jid: string, curatedName: string | null): Promise<{ ok: boolean; jid: string; curated_name: string | null }>`.

- [ ] **Step 1: Write the failing test**

Create `tests/aiby/client-person.test.ts`:

```ts
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("aiby client — patchPersonName", () => {
  beforeEach(() => {
    process.env.AIBY_API_BASE = "https://bot.example";
    process.env.AIBY_API_KEY = "secret-key";
    vi.resetModules();
  });
  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.AIBY_API_BASE;
    delete process.env.AIBY_API_KEY;
  });

  it("PATCHes the jid with a curated_name body + api key", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true, jid: "1@s", curated_name: "Ana" }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const { patchPersonName } = await import("@/lib/aiby/client");
    const res = await patchPersonName("1@s", "Ana");
    const [url, opts] = fetchMock.mock.calls[0];
    expect(String(url)).toBe("https://bot.example/dashboard/api/person/1%40s");
    expect(opts.method).toBe("PATCH");
    expect((opts.headers as Record<string, string>)["x-api-key"]).toBe("secret-key");
    expect(JSON.parse(opts.body as string)).toEqual({ curated_name: "Ana" });
    expect(res).toEqual({ ok: true, jid: "1@s", curated_name: "Ana" });
  });

  it("forwards a null curated_name (clearing)", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true, jid: "1@s", curated_name: null }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const { patchPersonName } = await import("@/lib/aiby/client");
    await patchPersonName("1@s", null);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body as string)).toEqual({ curated_name: null });
  });

  it("throws AibyApiError on non-2xx", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("no", { status: 500 })));
    const { patchPersonName, AibyApiError } = await import("@/lib/aiby/client");
    await expect(patchPersonName("1@s", "x")).rejects.toBeInstanceOf(AibyApiError);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd "/Volumes/VELLENT USB/Sites/aibuilders" && pnpm test tests/aiby/client-person.test.ts`
Expected: FAIL — `patchPersonName` is not exported.

- [ ] **Step 3: Implement `patchPersonName`**

In `lib/aiby/client.ts`, after the `patchJobStatus` export:

```ts
export const patchPersonName = (jid: string, curatedName: string | null) =>
  patch<{ ok: boolean; jid: string; curated_name: string | null }>(
    `/person/${encodeURIComponent(jid)}`,
    { curated_name: curatedName },
  );
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd "/Volumes/VELLENT USB/Sites/aibuilders" && pnpm test tests/aiby/client-person.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
cd "/Volumes/VELLENT USB/Sites/aibuilders" && git add lib/aiby/client.ts tests/aiby/client-person.test.ts && git commit -m "feat(aiby): patchPersonName client for curated name sync"
```

---

## Task 7: Website — server actions (`saveCommunityPerson`, `searchContactsAction`)

**Files:**
- Create: `lib/actions/community.ts`
- Test: `tests/actions/community.test.ts`

**Interfaces:**
- Consumes: `getUser` from `@/lib/auth`; `getOverlay`, `upsertCommunityPerson`, `searchContacts` from `@/lib/db/queries/community-people`; `patchPersonName`, `AibyApiError` from `@/lib/aiby/client`; `revalidatePath` from `next/cache`.
- Produces:
  - `saveCommunityPerson(jid: string, data: { displayName: string | null; contactId: string | null; notes: string | null; tags: string[]; phone: string | null }): Promise<{ ok: true } | { error: string }>`
  - `searchContactsAction(q: string): Promise<Array<{ id: string; email: string; name: string | null }>>`

- [ ] **Step 1: Write the failing test**

Create `tests/actions/community.test.ts`. It mocks every dependency so no DB/network is needed:

```ts
import { describe, it, expect, beforeEach, vi } from "vitest";

const getUser = vi.fn();
const getOverlay = vi.fn();
const upsertCommunityPerson = vi.fn();
const searchContacts = vi.fn();
const patchPersonName = vi.fn();
const revalidatePath = vi.fn();

vi.mock("@/lib/auth", () => ({ getUser }));
vi.mock("@/lib/db/queries/community-people", () => ({ getOverlay, upsertCommunityPerson, searchContacts }));
vi.mock("@/lib/aiby/client", () => ({
  patchPersonName,
  AibyApiError: class AibyApiError extends Error { status = 500; },
}));
vi.mock("next/cache", () => ({ revalidatePath }));

const data = { displayName: "Ana", contactId: null, notes: null, tags: [], phone: "52" };

describe("saveCommunityPerson", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getUser.mockResolvedValue({ id: "u1" });
    getOverlay.mockResolvedValue(null);
    upsertCommunityPerson.mockResolvedValue(undefined);
    patchPersonName.mockResolvedValue({ ok: true });
  });

  it("rejects when not authenticated", async () => {
    getUser.mockResolvedValue(null);
    const { saveCommunityPerson } = await import("@/lib/actions/community");
    expect(await saveCommunityPerson("1@s", data)).toEqual({ error: "No autorizado." });
    expect(upsertCommunityPerson).not.toHaveBeenCalled();
  });

  it("upserts and pushes the name to the bot when the name changed", async () => {
    getOverlay.mockResolvedValue({ jid: "1@s", displayName: "Old", notes: null, tags: [], contact: null });
    const { saveCommunityPerson } = await import("@/lib/actions/community");
    expect(await saveCommunityPerson("1@s", data)).toEqual({ ok: true });
    expect(upsertCommunityPerson).toHaveBeenCalledOnce();
    expect(patchPersonName).toHaveBeenCalledWith("1@s", "Ana");
    expect(revalidatePath).toHaveBeenCalled();
  });

  it("does NOT push to the bot when the name is unchanged", async () => {
    getOverlay.mockResolvedValue({ jid: "1@s", displayName: "Ana", notes: null, tags: [], contact: null });
    const { saveCommunityPerson } = await import("@/lib/actions/community");
    await saveCommunityPerson("1@s", data);
    expect(upsertCommunityPerson).toHaveBeenCalledOnce();
    expect(patchPersonName).not.toHaveBeenCalled();
  });

  it("still returns ok when the bot push fails (Postgres is source of truth)", async () => {
    getOverlay.mockResolvedValue({ jid: "1@s", displayName: "Old", notes: null, tags: [], contact: null });
    patchPersonName.mockRejectedValue(new Error("bot down"));
    const { saveCommunityPerson } = await import("@/lib/actions/community");
    expect(await saveCommunityPerson("1@s", data)).toEqual({ ok: true });
    expect(upsertCommunityPerson).toHaveBeenCalledOnce();
  });
});

describe("searchContactsAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getUser.mockResolvedValue({ id: "u1" });
  });

  it("returns [] when not authenticated", async () => {
    getUser.mockResolvedValue(null);
    const { searchContactsAction } = await import("@/lib/actions/community");
    expect(await searchContactsAction("ana")).toEqual([]);
    expect(searchContacts).not.toHaveBeenCalled();
  });

  it("delegates to searchContacts when authenticated", async () => {
    searchContacts.mockResolvedValue([{ id: "c1", email: "a@b.com", name: "Ana" }]);
    const { searchContactsAction } = await import("@/lib/actions/community");
    expect(await searchContactsAction("ana")).toEqual([{ id: "c1", email: "a@b.com", name: "Ana" }]);
    expect(searchContacts).toHaveBeenCalledWith("ana");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd "/Volumes/VELLENT USB/Sites/aibuilders" && pnpm test tests/actions/community.test.ts`
Expected: FAIL — module `@/lib/actions/community` not found.

- [ ] **Step 3: Implement the actions**

Create `lib/actions/community.ts`:

```ts
"use server";

import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/auth";
import { getOverlay, upsertCommunityPerson, searchContacts } from "@/lib/db/queries/community-people";
import { patchPersonName } from "@/lib/aiby/client";

const LIST_PATH = "/admin/comunidad/personas";

function norm(s: string | null): string | null {
  if (s === null) return null;
  const t = s.trim();
  return t === "" ? null : t;
}

export async function saveCommunityPerson(
  jid: string,
  data: {
    displayName: string | null;
    contactId: string | null;
    notes: string | null;
    tags: string[];
    phone: string | null;
  },
): Promise<{ ok: true } | { error: string }> {
  const user = await getUser();
  if (!user) return { error: "No autorizado." };

  const displayName = norm(data.displayName);
  const notes = norm(data.notes);
  const tags = data.tags.map((t) => t.trim()).filter((t) => t !== "");

  const prev = await getOverlay(jid);
  const nameChanged = (prev?.displayName ?? null) !== displayName;

  await upsertCommunityPerson({
    jid,
    displayName,
    contactId: data.contactId,
    notes,
    tags,
    phone: norm(data.phone),
  });

  if (nameChanged) {
    try {
      await patchPersonName(jid, displayName);
    } catch (e) {
      console.error("[community] name sync to bot failed:", e);
    }
  }

  revalidatePath(LIST_PATH);
  revalidatePath(`${LIST_PATH}/[jid]`, "page");
  return { ok: true };
}

export async function searchContactsAction(
  q: string,
): Promise<Array<{ id: string; email: string; name: string | null }>> {
  const user = await getUser();
  if (!user) return [];
  return searchContacts(q);
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd "/Volumes/VELLENT USB/Sites/aibuilders" && pnpm test tests/actions/community.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
cd "/Volumes/VELLENT USB/Sites/aibuilders" && git add lib/actions/community.ts tests/actions/community.test.ts && git commit -m "feat(actions): saveCommunityPerson + searchContactsAction"
```

---

## Task 8: Website — `PersonEditor` component + wire into detail page

**Files:**
- Create: `app/(admin)/admin/comunidad/personas/components/person-editor.tsx`
- Modify: `app/(admin)/admin/comunidad/personas/[jid]/page.tsx`

**Interfaces:**
- Consumes: `saveCommunityPerson`, `searchContactsAction` from `@/lib/actions/community`; `getOverlay` from `@/lib/db/queries/community-people`; `getPerson` (existing) for the bot person.
- Produces: a client `PersonEditor` taking `{ jid, initial }`.

There is no headless test for this client component (the project tests logic, not React rendering — see existing `tests/`). Verification is `pnpm build` + the manual checklist. Keep all behavior in the action layer (already tested in Task 7).

- [ ] **Step 1: Create the `PersonEditor` client component**

Create `app/(admin)/admin/comunidad/personas/components/person-editor.tsx`:

```tsx
"use client";

import { useState, useTransition } from "react";
import { saveCommunityPerson, searchContactsAction } from "@/lib/actions/community";

type Contact = { id: string; email: string; name: string | null };

export function PersonEditor({
  jid,
  initial,
}: {
  jid: string;
  initial: {
    displayName: string;
    notes: string;
    tags: string[];
    contact: Contact | null;
    phone: string | null;
  };
}) {
  const [displayName, setDisplayName] = useState(initial.displayName);
  const [notes, setNotes] = useState(initial.notes);
  const [tags, setTags] = useState<string[]>(initial.tags);
  const [tagDraft, setTagDraft] = useState("");
  const [contact, setContact] = useState<Contact | null>(initial.contact);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Contact[]>([]);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runSearch(q: string) {
    setQuery(q);
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    setResults(await searchContactsAction(q));
  }

  function addTag() {
    const t = tagDraft.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagDraft("");
  }

  function save() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const res = await saveCommunityPerson(jid, {
        displayName,
        contactId: contact?.id ?? null,
        notes,
        tags,
        phone: initial.phone,
      });
      if ("error" in res) setError(res.error);
      else setSaved(true);
    });
  }

  const field = "w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-black/30 dark:border-white/15 dark:bg-neutral-900 dark:text-gray-100";
  const label = "text-xs font-medium text-gray-400 dark:text-gray-500";

  return (
    <div className="mt-8 rounded-2xl border border-black/5 bg-white p-6 dark:border-white/10 dark:bg-neutral-900">
      <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-gray-400">Editar perfil</p>

      <div className="mt-4 flex flex-col gap-4">
        <div>
          <label className={label}>Nombre</label>
          <input className={`mt-1 ${field}`} value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Nombre curado" />
        </div>

        <div>
          <label className={label}>Contacto</label>
          {contact ? (
            <div className="mt-1 flex items-center justify-between gap-3 rounded-xl border border-black/10 px-3 py-2 dark:border-white/15">
              <span className="truncate text-sm text-gray-800 dark:text-gray-100">
                {contact.name ?? "—"} · <span className="text-gray-400">{contact.email}</span>
              </span>
              <button type="button" onClick={() => setContact(null)} className="shrink-0 font-mono text-[11px] uppercase tracking-[0.15em] text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                Desvincular
              </button>
            </div>
          ) : (
            <div className="relative mt-1">
              <input className={field} value={query} onChange={(e) => runSearch(e.target.value)} placeholder="Buscar por nombre o email…" />
              {results.length > 0 && (
                <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-black/10 bg-white shadow-lg dark:border-white/15 dark:bg-neutral-900">
                  {results.map((c) => (
                    <li key={c.id}>
                      <button type="button" onClick={() => { setContact(c); setQuery(""); setResults([]); }} className="block w-full px-3 py-2 text-left text-sm hover:bg-black/[0.03] dark:hover:bg-white/[0.04]">
                        <span className="text-gray-800 dark:text-gray-100">{c.name ?? "—"}</span>{" "}
                        <span className="text-gray-400">{c.email}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div>
          <label className={label}>Tags</label>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            {tags.map((t) => (
              <button key={t} type="button" onClick={() => setTags(tags.filter((x) => x !== t))} className="rounded-full border border-black/10 px-3 py-1 text-xs text-gray-700 hover:border-black/30 dark:border-white/15 dark:text-gray-200">
                {t} ×
              </button>
            ))}
            <input
              className="min-w-[8rem] flex-1 bg-transparent px-1 py-1 text-sm text-gray-800 outline-none dark:text-gray-100"
              value={tagDraft}
              onChange={(e) => setTagDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); } }}
              placeholder="añadir tag…"
            />
          </div>
        </div>

        <div>
          <label className={label}>Notas</label>
          <textarea className={`mt-1 ${field} min-h-[5rem] resize-y`} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas internas…" />
        </div>

        <div className="flex items-center gap-3">
          <button type="button" onClick={save} disabled={pending} className="rounded-full bg-gray-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-black disabled:opacity-50 dark:bg-white dark:text-gray-900">
            {pending ? "Guardando…" : "Guardar"}
          </button>
          {saved && <span className="text-xs font-medium text-green-500">Guardado.</span>}
          {error && <span className="text-xs font-medium text-red-500">{error}</span>}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Wire it into the detail page**

In `app/(admin)/admin/comunidad/personas/[jid]/page.tsx`:

1. Add imports at the top:
```ts
import { getOverlay } from "@/lib/db/queries/community-people";
import { PersonEditor } from "../components/person-editor";
```

2. After `const { jid } = await params;` and the `getPerson` try/catch, fetch the overlay:
```ts
  const overlay = await getOverlay(jid);
```

3. Change the `<h1>` to prefer the curated name:
```tsx
          <h1 className="mt-3 text-3xl font-medium text-gray-800 dark:text-gray-100">
            {overlay?.displayName || person.name || person.phone}
          </h1>
```

4. Mount the editor right after the stat cards grid (before the `person.profile &&` block):
```tsx
          <PersonEditor
            jid={jid}
            initial={{
              displayName: overlay?.displayName ?? person.name ?? "",
              notes: overlay?.notes ?? "",
              tags: overlay?.tags ?? [],
              contact: overlay?.contact ?? null,
              phone: person.phone ?? null,
            }}
          />
```

- [ ] **Step 3: Verify lint + build**

Run: `cd "/Volumes/VELLENT USB/Sites/aibuilders" && pnpm lint && pnpm build`
Expected: lint clean; build succeeds (no server/client boundary errors — `PersonEditor` is `"use client"`, the page stays a server component).

- [ ] **Step 4: Commit**

```bash
cd "/Volumes/VELLENT USB/Sites/aibuilders" && git add "app/(admin)/admin/comunidad/personas/components/person-editor.tsx" "app/(admin)/admin/comunidad/personas/[jid]/page.tsx" && git commit -m "feat(comunidad): PersonEditor — curate name, contact match, notes, tags"
```

---

## Task 9: Website — curated names in the Personas list

**Files:**
- Modify: `app/(admin)/admin/comunidad/personas/page.tsx`

**Interfaces:**
- Consumes: `getOverlays` from `@/lib/db/queries/community-people`.

- [ ] **Step 1: Fetch overlays for the page's jids**

In `app/(admin)/admin/comunidad/personas/page.tsx`, add the import:
```ts
import { getOverlays } from "@/lib/db/queries/community-people";
```

After the `getPeople` try/catch that sets `people`, fetch overlays:
```ts
  const overlays = await getOverlays(people.map((p) => p.jid));
```

- [ ] **Step 2: Render the curated name + a linked-contact marker**

In the `people.map(...)` row, replace the name span:
```tsx
                  <span className="truncate text-sm font-medium text-gray-800 hover:underline dark:text-gray-100">
                    {overlays.get(p.jid)?.displayName || p.name || p.phone}
                    {overlays.get(p.jid)?.contact && (
                      <span className="ml-2 font-mono text-[10px] uppercase tracking-widest text-gray-300 dark:text-gray-600">
                        ✓ contacto
                      </span>
                    )}
                  </span>
```

- [ ] **Step 3: Verify lint + build**

Run: `cd "/Volumes/VELLENT USB/Sites/aibuilders" && pnpm lint && pnpm build`
Expected: lint clean; build succeeds.

- [ ] **Step 4: Commit**

```bash
cd "/Volumes/VELLENT USB/Sites/aibuilders" && git add "app/(admin)/admin/comunidad/personas/page.tsx" && git commit -m "feat(comunidad): show curated name + contact marker in Personas list"
```

---

## Final verification (after all tasks)

- [ ] **Full website test suite:** `cd "/Volumes/VELLENT USB/Sites/aibuilders" && pnpm test` → all green (guard tests run; DB-integration block runs only with `DATABASE_URL`).
- [ ] **Website build:** `pnpm lint && pnpm build` → clean.
- [ ] **Bot build:** `cd /Users/vellent/sites/aibuilders-bot && npm run build` → tsc 0.
- [ ] **Deploy:** push both repos to `main` (each triggers its Railway service). Bot env already has `API_KEY`; website env already has `AIBY_API_BASE`/`AIBY_API_KEY`. No new env vars.
- [ ] **Bot smoke (with the real key):**
  ```bash
  curl -s -X PATCH "$AIBY_API_BASE/dashboard/api/person/<some-jid>" -H "x-api-key: $AIBY_API_KEY" -H "Content-Type: application/json" -d '{"curated_name":"Prueba"}'
  ```
  Expected: `{"ok":true,"jid":"...","curated_name":"Prueba"}`. Without the key → 401.
- [ ] **Manual UX checklist (logged in):**
  - `/admin/comunidad/personas/[jid]` — set a name on a junk-named person → `<h1>` updates after save; reload persists.
  - Link a contact via typeahead → chip appears; "Desvincular" clears it.
  - Add/remove tags; add notes; Guardar shows "Guardado."
  - `/admin/comunidad/personas` — the curated name + `✓ contacto` marker render.
  - Confirm the bot received the name (re-run the curl GET `/dashboard/api/person/<jid>` and check `curatedName`, or query the MCP `get_person_brief`).
- [ ] Update memory `comunidad-dashboard.md` with the curation feature + the new `community_people` table and `curated_name` column.
