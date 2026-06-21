# Community People Curation — Design Spec

**Date:** 2026-06-21
**Status:** Approved (design), pending implementation plan
**Repos touched:** `aibuilders` (website) + `aibuilders-bot` (bot)

## Problem

The `/admin/comunidad/personas` pages render WhatsApp community members straight
from the bot's data. Two gaps:

1. **Junk names.** The person name comes from `messages.sender_name` (the WhatsApp
   pushName), which is often garbage (`.`, `J`, `Fp`, `H.S`). There is no way to fix it.
2. **No identity unification.** A bot person (keyed by WhatsApp `jid`/phone) has no
   link to the website's `contacts` table (2245 records, keyed by `email`). The two
   halves of the community are disconnected.

We also want the bot's MCP newsletter tools (`get_person_brief`, `list_active_people`)
to show the curated name instead of the scraped junk.

## Goal

Let an admin curate community people from `/admin/comunidad/personas/[jid]`:

- Override the **display name**.
- **Match** the person to a `contacts` record (the jid ↔ contact link).
- Add internal **notes** and **tags**.

The curated name flows back to the bot so the MCP and nightly summaries show it.

## Non-goals (YAGNI)

- Editing the Haiku-synthesized fields (`expertise`, `projects`, `links_authored`,
  `style_notes`). Those stay bot-owned and rebuild nightly. We do **not** touch the
  nightly synthesis of those arrays.
- Matchmaking between builders (connecting people to each other). Out of scope.
- Replicating all ~100 people into Postgres. A `community_people` row exists **only**
  when an admin has curated something.
- Bidirectional sync of notes/tags/contact link into the bot. Only the display name
  is pushed to the bot.

## Architecture (Approach A — Postgres-owned, push name to bot)

```
┌─────────────────────────── website (Postgres) ───────────────────────────┐
│  contacts (existing)         community_people (NEW)                        │
│    id, email, name, ...  ◄──── contactId (FK, nullable)                    │
│                               jid PK, displayName, notes, tags[], phone    │
│                                                                            │
│  personas pages: bot activity  +  LEFT JOIN community_people overlay       │
│  server action saveCommunityPerson() ── upsert Postgres ──┐                │
└───────────────────────────────────────────────────────────┼──────────────┘
                                                             │ if name changed
                                          PATCH /dashboard/api/person/:jid
                                                             │ { curated_name }
┌──────────────────────────── bot (SQLite) ──────────────────▼──────────────┐
│  user_profiles.curated_name (NEW)  ── nightly rebuild NEVER overwrites it  │
│  MCP get_person_brief / list_active_people / summaries:                    │
│      display name = COALESCE(curated_name, name)                           │
└────────────────────────────────────────────────────────────────────────────┘
```

**Why Postgres owns it:** the contact link is inherently a Postgres FK relationship;
notes/tags are website-admin metadata; writes are local + fast. **Why push name to
the bot:** the MCP reads the bot's SQLite, so the one field the MCP needs (the curated
name) is replicated there. The bot has no Postgres access (separate Railway service,
SQLite-only), so pushing one field over the existing PATCH pattern is lighter than
giving the bot a Postgres connection.

**Failure stance:** Postgres is the source of truth. The bot name is best-effort. If
the PATCH to the bot fails, the Postgres write still persists (match/notes/tags do not
depend on the bot); the name-sync failure is logged, not reverted.

---

## Data model

### Postgres — new table `community_people` (`lib/db/schema.ts`)

```ts
export const communityPeople = pgTable(
  "community_people",
  {
    jid: text("jid").primaryKey(),                       // WhatsApp jid
    contactId: uuid("contact_id").references(() => contacts.id, {
      onDelete: "set null",
    }),                                                  // the match; nullable
    displayName: text("display_name"),                   // curated name; wins over pushName
    notes: text("notes"),                                // admin-internal
    tags: text("tags").array().notNull().default([]),    // e.g. mentor, busca-trabajo
    phone: text("phone"),                                // denormalized for display/search
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

- `onDelete: "set null"` on `contactId` — if a contact is deleted, the person keeps
  its curation (name/notes/tags) and just loses the link. No dangling FK.
- Migration generated via `pnpm db:generate` → `pnpm db:migrate` (Drizzle Kit), per
  the existing project convention.

### Bot SQLite — `user_profiles.curated_name` (`aibuilders-bot/src/memory/db.ts`)

- Add `curated_name TEXT` to the `CREATE TABLE IF NOT EXISTS user_profiles` block.
- Idempotent startup migration: after `CREATE TABLE IF NOT EXISTS`, run a guarded
  `ALTER TABLE user_profiles ADD COLUMN curated_name TEXT` that no-ops if the column
  already exists (check `PRAGMA table_info(user_profiles)` first). This matches how the
  bot already manages its schema (no versioned migration files).

---

## Bot changes (`aibuilders-bot`)

### 1. Schema migration
`src/memory/db.ts` — column + guarded `ALTER TABLE` as above.

### 2. New endpoint `PATCH /dashboard/api/person/:jid`
`src/api.ts` (and a query in `src/dashboard/queries.ts`).

- Auth: `x-api-key` header (the existing `authMiddleware` on the `/dashboard/api` mount).
- Body: `{ curated_name: string | null }`. Empty string is normalized to `null`.
- Behavior: upsert `user_profiles(jid)` setting **only** `curated_name`. If the row does
  not exist yet (Haiku has not synthesized this person), create it with live minimal
  stats (`phone`, `name` from the most recent message for that jid; empty `[]` for the
  synthesized arrays; `last_updated = now`).
- Response: `{ ok: true, jid, curated_name }`.

```ts
// src/dashboard/queries.ts
export function setCuratedName(jid: string, curatedName: string | null): void {
  const db = getDb();
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
  ).run(jid, base?.phone ?? "", base?.name ?? null, curatedName, new Date().toISOString());
}
```

### 3. Nightly rebuild must not clobber `curated_name`
`src/memory/profiles.ts` — the `upsertProfile` `INSERT ... ON CONFLICT DO UPDATE` does
**not** list `curated_name` in its column set or its `DO UPDATE SET` clause, so the
nightly rebuild leaves the curated name untouched. (It already does not reference the
column today; the guarantee is to keep it that way — covered by a test.)

### 4. Curated name in reads
- `getPersonDetail` (`src/dashboard/queries.ts`) — `SELECT` includes `curated_name`,
  returned on the person payload (so the admin detail page can show the bot's current
  value, though Postgres remains the source of truth).
- MCP `get_person_brief` + `list_active_people` (`src/mcp/queries.ts`) and the daily
  summary / `active_people` rendering — display name uses
  `COALESCE(NULLIF(curated_name, ''), name)`.

---

## Website changes (`aibuilders`)

### Data access — `lib/db/queries/community-people.ts`
```ts
getOverlays(jids: string[]): Promise<Map<string, CommunityOverlay>>
  // one query: community_people LEFT JOIN contacts, keyed by jid, for the page's jids
getOverlay(jid: string): Promise<CommunityOverlay | null>
  // single person, includes joined contact { id, email, name } | null
searchContacts(q: string, limit = 10): Promise<Array<{ id; email; name }>>
  // ILIKE on name/email, ordered by name, capped
upsertCommunityPerson(input: {
  jid; displayName; contactId; notes; tags; phone
}): Promise<CommunityPerson>
  // INSERT ... ON CONFLICT (jid) DO UPDATE, updatedAt = now
```

`CommunityOverlay = { jid; displayName; notes; tags; contact: { id; email; name } | null }`.

### Bot client — `lib/aiby/client.ts`
Add, reusing the existing `patch` helper:
```ts
export const patchPersonName = (jid: string, curatedName: string | null) =>
  patch<{ ok: boolean; jid: string; curated_name: string | null }>(
    `/person/${encodeURIComponent(jid)}`,
    { curated_name: curatedName },
  );
```

### Server actions — `lib/actions/community.ts`
```ts
saveCommunityPerson(jid: string, data: {
  displayName: string | null; contactId: string | null; notes: string | null; tags: string[];
}): Promise<{ ok: boolean }>
```
- Gated by `getUser()` (redirect/401 if absent), same as `lib/actions/aiby.ts`.
- Reads the current overlay to know the previous `displayName`.
- `upsertCommunityPerson(...)` (carries `phone` from the bot person if available).
- **If `displayName` changed**, `await patchPersonName(jid, displayName)` inside a
  `try/catch` — on failure, log and continue (Postgres write already committed).
- `revalidatePath("/admin/comunidad/personas")` and
  `revalidatePath("/admin/comunidad/personas/[jid]", "page")`.

```ts
searchContactsAction(q: string): Promise<Array<{ id; email; name }>>
```
- Gated by `getUser()`. Thin wrapper over `searchContacts`. Returns `[]` for `q` < 2 chars.

### UX
- **Person detail** (`personas/[jid]/page.tsx`): the page additionally calls
  `getOverlay(jid)`. The `<h1>` uses `overlay?.displayName ?? person.name ?? phone`.
  A new client component **`PersonEditor`** (in `personas/components/`) renders a card:
  - **Nombre** — text input, prefilled with `displayName ?? person.name`.
  - **Contacto** — typeahead: an input that calls `searchContactsAction` (debounced),
    a dropdown of `{name} · {email}` results; shows the currently linked contact as a
    chip with a "Desvincular" affordance; selecting one sets `contactId`.
  - **Notas** — textarea.
  - **Tags** — chip input (comma/enter to add, click to remove).
  - **Guardar** button → `saveCommunityPerson`. Disabled while pending; shows saved state.
  - Styling: existing B/N system — `rounded-2xl border border-black/5 bg-white dark:...`
    cards, `font-mono` eyebrows, chips like the existing expertise chips. No new colors.
- **Personas list** (`personas/page.tsx`): after fetching the page of people, call
  `getOverlays(people.map(p => p.jid))` and render `overlay?.displayName ?? p.name ?? p.phone`.
  A small mono tag (e.g. `🔗` or a dot) MAY indicate a linked contact — minimal, optional.

---

## Testing

### Website — `tests/aiby/` + `tests/db/`
- `patchPersonName` builds the correct URL / headers / body (mock fetch), and maps a
  `null` name through.
- `saveCommunityPerson`:
  - returns/throws on missing auth (mock `getUser` → null).
  - upserts to Postgres with the right shape (mock the query layer).
  - fires `patchPersonName` **only** when `displayName` changed; does **not** fire it
    when only notes/tags/contact changed.
  - swallows a `patchPersonName` rejection (Postgres write still reported ok).
- `searchContacts`: builds the ILIKE query, respects the limit, returns `[]` for short `q`.

### Bot — `aibuilders-bot` tests (or a SQLite fixture test)
- `setCuratedName` upserts `curated_name` without altering other columns; creates a
  minimal row when the profile is absent.
- The nightly `upsertProfile` column set does **not** include `curated_name` (guards
  against future regressions clobbering it).
- A read path returns `COALESCE(curated_name, name)` (curated wins; falls back to raw).

### Manual / smoke
- Curate a junk-named person → name updates on the list + detail; reload persists.
- Link a contact → shows the contact chip; unlink works.
- Hit the bot `PATCH /dashboard/api/person/:jid` with and without the key (200 / 401).
- Confirm the MCP `get_person_brief` returns the curated name after a save.

## Open decisions (resolved)
- **Bot migration style:** idempotent guarded `ALTER TABLE` at startup (matches the
  bot's existing schema management), not a versioned migration file.
- **Sync failure:** Postgres is the source of truth; the bot name is best-effort and
  never blocks the save.
- **Contact deletion:** `onDelete: "set null"` — curation survives, link clears.
