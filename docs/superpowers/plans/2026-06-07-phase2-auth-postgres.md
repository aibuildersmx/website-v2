# Phase 2 — Auth on Postgres (email + password) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Supabase Auth with email+password authentication backed by Railway Postgres (Drizzle), gating an `/admin` area and the existing job-board dashboard.

**Architecture:** Two new tables — `users` (bcrypt password hash + role) and `sessions` (server-side, revocable). Login validates credentials, creates a `sessions` row, and sets an httpOnly cookie holding a random token whose SHA-256 hash is stored in the DB. `getUser()` reads the cookie, looks up the unexpired session, and returns `{ id, email, role }` — keeping the same shape current consumers rely on (`user.email`). The existing per-route gate pattern (call `getUser()`, redirect if null) is preserved; no middleware is introduced.

**Tech Stack:** Next.js 16 (server actions, `next/headers` cookies), Drizzle ORM + `postgres`, `bcryptjs`, Node `crypto`, Vitest. Spec: `docs/superpowers/specs/2026-06-07-community-db-and-newsletter-panel-design.md` §5.

---

## Decisions locked (from spec §5 + user confirmation 2026-06-07)

- **Sessions:** server-side `sessions` table (revocable), cookie holds a random token; DB stores its SHA-256 hash.
- **Redirect/gate:** login lands on `/admin` (placeholder page in Phase 2; newsletter panel arrives Phase 3). The job-board dashboard gate is repointed at the new auth. The old Supabase `recruiters` allowlist is dropped as a login gate.
- **Hashing:** `bcryptjs` (pure JS, no native build step — safe for Railway/Next build).

## Blast radius (current Supabase auth usage)

- `lib/auth.ts` — `signIn`, `signOut`, `getUser` (rewritten in this plan).
- `app/login/page.tsx` — calls `signIn` (server action signature unchanged; only redirect target changes inside the action).
- `app/job-board/dashboard/page.tsx` — `const user = await getUser(); ... user.email` (works unchanged with new `getUser`).
- `app/job-board/dashboard/recruiters/page.tsx` — `getUser()` then `user.email` (works unchanged).
- `app/job-board/dashboard/dashboard-client.tsx` — `signOut` server action (works unchanged).
- `lib/actions/jobs.ts` — inline `supabase.auth.getUser()` auth check (repointed to `getUser()`).
- `lib/actions/recruiters.ts` — inline `supabase.auth.getUser()` auth check (repointed to `getUser()`).

`lib/supabase/*` stays in place (job-board DB reads/writes are Phase 4). Only the **auth** checks move. Supabase is paused, so those job-board DB ops already fail at runtime — that's pre-existing and out of scope here. The build must stay green and `getUser()` must work.

## File structure

- **Modify** `lib/db/schema.ts` — add `users` and `sessions` tables + types.
- **Create** `drizzle/<generated>.sql` — migration (via `pnpm db:generate`).
- **Create** `lib/auth/password.ts` — `hashPassword`, `verifyPassword` (bcryptjs).
- **Create** `lib/auth/tokens.ts` — `generateToken`, `hashToken` (pure crypto helpers).
- **Create** `lib/auth/users.ts` — `AuthUser` type, `getUserByEmail`, `createUser`.
- **Create** `lib/auth/session.ts` — `createSession`, `getSessionUser`, `destroySession` (cookies + DB).
- **Rewrite** `lib/auth.ts` — `signIn`, `signOut`, `getUser` over Postgres.
- **Modify** `lib/actions/jobs.ts`, `lib/actions/recruiters.ts` — repoint auth check to `getUser()`.
- **Create** `app/admin/layout.tsx` — server gate (redirect to `/login` if no user).
- **Create** `app/admin/page.tsx` — minimal placeholder admin home.
- **Modify** `app/login/page.tsx` — copy tweak (panel is no longer job-board-only).
- **Create** `scripts/auth/seed-admin.ts` + `pnpm db:seed-admin` — create the admin user from env.
- **Create** `tests/auth/password.test.ts`, `tests/auth/tokens.test.ts`, `tests/auth/session.test.ts` (DATABASE_URL-guarded integration, mirrors `tests/community/import.test.ts`).
- **Modify** `package.json` — add `bcryptjs` dep, `@types/bcryptjs` devDep, `db:seed-admin` script.

---

### Task 1: Add dependencies (bcryptjs)

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install bcryptjs + types**

Run:
```bash
pnpm add bcryptjs && pnpm add -D @types/bcryptjs
```
Expected: `package.json` gains `"bcryptjs"` under dependencies and `"@types/bcryptjs"` under devDependencies; `pnpm-lock.yaml` updates. No native build step runs (bcryptjs is pure JS).

- [ ] **Step 2: Verify it imports**

Run:
```bash
pnpm tsx -e "import bcrypt from 'bcryptjs'; console.log(typeof bcrypt.hashSync)"
```
Expected: prints `function`.

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add bcryptjs for password hashing (Phase 2 auth)"
```

---

### Task 2: Schema — `users` and `sessions` tables

**Files:**
- Modify: `lib/db/schema.ts`

- [ ] **Step 1: Append the two tables to the schema**

Add to the bottom of `lib/db/schema.ts` (keep the existing `contacts` block and its imports; this file already imports `pgTable, uuid, text, boolean, jsonb, timestamp, index` from `drizzle-orm/pg-core`):

```ts
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(), // always lowercased before insert
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("admin"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull().unique(), // sha256 of the cookie token
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index("sessions_user_id_idx").on(t.userId),
  }),
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
```

- [ ] **Step 2: Generate the migration**

Run:
```bash
pnpm db:generate
```
Expected: a new file `drizzle/0001_<name>.sql` is created containing `CREATE TABLE "users"` and `CREATE TABLE "sessions"` with the FK and the `sessions_user_id_idx` index. The `contacts` table is untouched.

- [ ] **Step 3: Verify the generated SQL looks right**

Run:
```bash
ls drizzle/*.sql && grep -l 'CREATE TABLE "users"' drizzle/*.sql
```
Expected: lists the existing `0000_*.sql` plus the new `0001_*.sql`, and the grep matches the new file.

- [ ] **Step 4: Apply the migration to Railway Postgres**

The migrate command needs `DATABASE_URL` (public proxy for local runs — see `scripts/community/README.md`):
```bash
export DATABASE_URL="$(railway variables --service Postgres --kv | grep '^DATABASE_PUBLIC_URL=' | cut -d= -f2-)"
[ -n "$DATABASE_URL" ] || { echo "DATABASE_URL empty — re-run the railway export"; }
pnpm db:migrate
```
Expected: drizzle applies `0001_*`; output ends without error. If `railway` returns empty, re-run the export (CLI is occasionally flaky).

- [ ] **Step 5: Verify tables exist**

Run:
```bash
pnpm tsx -e "import postgres from 'postgres'; const sql=postgres(process.env.DATABASE_URL,{prepare:false}); const r=await sql\`select table_name from information_schema.tables where table_name in ('users','sessions') order by table_name\`; console.log(r.map(x=>x.table_name)); await sql.end()"
```
Expected: prints `[ 'sessions', 'users' ]`.

- [ ] **Step 6: Commit**

```bash
git add lib/db/schema.ts drizzle/
git commit -m "feat: users + sessions tables for Postgres auth"
```

---

### Task 3: Password hashing helpers

**Files:**
- Create: `lib/auth/password.ts`
- Test: `tests/auth/password.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/auth/password.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "../../lib/auth/password";

describe("password hashing", () => {
  it("produces a hash different from the plaintext", async () => {
    const hash = await hashPassword("s3cret-pass");
    expect(hash).not.toBe("s3cret-pass");
    expect(hash.length).toBeGreaterThan(20);
  });

  it("verifies a correct password", async () => {
    const hash = await hashPassword("s3cret-pass");
    expect(await verifyPassword("s3cret-pass", hash)).toBe(true);
  });

  it("rejects a wrong password", async () => {
    const hash = await hashPassword("s3cret-pass");
    expect(await verifyPassword("wrong", hash)).toBe(false);
  });

  it("produces distinct hashes for the same input (random salt)", async () => {
    const a = await hashPassword("same");
    const b = await hashPassword("same");
    expect(a).not.toBe(b);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm vitest run tests/auth/password.test.ts`
Expected: FAIL — cannot resolve `../../lib/auth/password`.

- [ ] **Step 3: Implement**

Create `lib/auth/password.ts`:
```ts
import bcrypt from "bcryptjs";

const COST = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, COST);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm vitest run tests/auth/password.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/auth/password.ts tests/auth/password.test.ts
git commit -m "feat: bcrypt password hash/verify helpers"
```

---

### Task 4: Token helpers (random token + SHA-256 hash)

**Files:**
- Create: `lib/auth/tokens.ts`
- Test: `tests/auth/tokens.test.ts`

The cookie carries a raw random token; the DB stores only its SHA-256 hash. This keeps a stolen DB dump from yielding live session cookies.

- [ ] **Step 1: Write the failing test**

Create `tests/auth/tokens.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { generateToken, hashToken } from "../../lib/auth/tokens";

describe("session tokens", () => {
  it("generates a long, url-safe-ish hex token", () => {
    const t = generateToken();
    expect(t).toMatch(/^[0-9a-f]{64}$/); // 32 bytes hex
  });

  it("generates distinct tokens", () => {
    expect(generateToken()).not.toBe(generateToken());
  });

  it("hashes deterministically", () => {
    expect(hashToken("abc")).toBe(hashToken("abc"));
  });

  it("hash differs from input and is 64-char hex", () => {
    const h = hashToken("abc");
    expect(h).not.toBe("abc");
    expect(h).toMatch(/^[0-9a-f]{64}$/);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm vitest run tests/auth/tokens.test.ts`
Expected: FAIL — cannot resolve `../../lib/auth/tokens`.

- [ ] **Step 3: Implement**

Create `lib/auth/tokens.ts`:
```ts
import { randomBytes, createHash } from "node:crypto";

/** Raw token stored in the cookie (never persisted in the DB). */
export function generateToken(): string {
  return randomBytes(32).toString("hex");
}

/** SHA-256 of the token; this is what we persist and look up by. */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm vitest run tests/auth/tokens.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/auth/tokens.ts tests/auth/tokens.test.ts
git commit -m "feat: session token generate + sha256 hash helpers"
```

---

### Task 5: User data access (`getUserByEmail`, `createUser`)

**Files:**
- Create: `lib/auth/users.ts`

This is thin DB glue over the `users` table. It is exercised by the session integration test (Task 6) and the seed script (Task 8), so it has no standalone unit test (a unit test would just mock Drizzle and assert nothing real).

- [ ] **Step 1: Implement**

Create `lib/auth/users.ts`:
```ts
import { eq } from "drizzle-orm";
import type { DB } from "../db/client";
import { users } from "../db/schema";
import { hashPassword } from "./password";

/** The shape every auth consumer relies on (`user.email`). */
export type AuthUser = {
  id: string;
  email: string;
  role: string;
};

export async function getUserByEmail(db: DB, email: string) {
  const normalized = email.trim().toLowerCase();
  const rows = await db.select().from(users).where(eq(users.email, normalized)).limit(1);
  return rows[0] ?? null;
}

/** Creates a user with a hashed password. Email is lowercased. */
export async function createUser(
  db: DB,
  email: string,
  password: string,
  role = "admin",
): Promise<AuthUser> {
  const normalized = email.trim().toLowerCase();
  const passwordHash = await hashPassword(password);
  const [row] = await db
    .insert(users)
    .values({ email: normalized, passwordHash, role })
    .returning({ id: users.id, email: users.email, role: users.role });
  return row;
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/auth/users.ts
git commit -m "feat: user data access (getUserByEmail, createUser)"
```

---

### Task 6: Session management (create / validate / destroy)

**Files:**
- Create: `lib/auth/session.ts`
- Test: `tests/auth/session.test.ts`

`session.ts` mixes cookie I/O (`next/headers`) with DB I/O. The pure, testable core is the **DB round-trip**: insert a session, look the user up by token, expire it. We test that against the real DB (guarded by `DATABASE_URL`, exactly like `tests/community/import.test.ts`). Cookie helpers are thin wrappers verified manually in Task 11.

Key design: `createSessionForUser(db, userId)` returns the **raw token** and writes the hashed token + 30-day expiry. `resolveSessionUser(db, token)` returns `AuthUser | null` (null if missing or expired). `deleteSession(db, token)` removes the row. The cookie-aware `createSession` / `getSessionUser` / `destroySession` wrap these and touch `cookies()`.

- [ ] **Step 1: Write the failing integration test**

Create `tests/auth/session.test.ts`:
```ts
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { eq } from "drizzle-orm";

const HAS_DB = !!process.env.DATABASE_URL?.trim();
const d = HAS_DB ? describe : describe.skip;

d("session DB round-trip", () => {
  let db: typeof import("../../lib/db/client").db;
  let schema: typeof import("../../lib/db/schema");
  let session: typeof import("../../lib/auth/session");
  let users: typeof import("../../lib/auth/users");
  let userId: string;
  const email = `session-test+${process.pid}@example.com`;

  beforeAll(async () => {
    db = (await import("../../lib/db/client")).db;
    schema = await import("../../lib/db/schema");
    session = await import("../../lib/auth/session");
    users = await import("../../lib/auth/users");
    const u = await users.createUser(db, email, "pw-123456");
    userId = u.id;
  });

  afterAll(async () => {
    if (userId) await db.delete(schema.users).where(eq(schema.users.id, userId));
  });

  it("creates a session and resolves the user from the raw token", async () => {
    const token = await session.createSessionForUser(db, userId);
    expect(token).toMatch(/^[0-9a-f]{64}$/);
    const resolved = await session.resolveSessionUser(db, token);
    expect(resolved?.email).toBe(email);
    expect(resolved?.id).toBe(userId);
  });

  it("returns null for an unknown token", async () => {
    expect(await session.resolveSessionUser(db, "deadbeef")).toBeNull();
  });

  it("deletes a session so it no longer resolves", async () => {
    const token = await session.createSessionForUser(db, userId);
    await session.deleteSession(db, token);
    expect(await session.resolveSessionUser(db, token)).toBeNull();
  });

  it("does not resolve an expired session", async () => {
    const past = new Date(Date.now() - 1000);
    const token = await session.createSessionForUser(db, userId, past);
    expect(await session.resolveSessionUser(db, token)).toBeNull();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run:
```bash
export DATABASE_URL="$(railway variables --service Postgres --kv | grep '^DATABASE_PUBLIC_URL=' | cut -d= -f2-)"
pnpm vitest run tests/auth/session.test.ts
```
Expected: FAIL — cannot resolve `../../lib/auth/session`. (If `DATABASE_URL` is empty the suite is skipped — re-run the export so it actually runs.)

- [ ] **Step 3: Implement**

Create `lib/auth/session.ts`:
```ts
import { cookies } from "next/headers";
import { and, eq, gt } from "drizzle-orm";
import type { DB } from "../db/client";
import { sessions, users } from "../db/schema";
import type { AuthUser } from "./users";
import { generateToken, hashToken } from "./tokens";

export const SESSION_COOKIE = "aibm_session";
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/** Inserts a session row; returns the RAW token (cookie value). */
export async function createSessionForUser(
  db: DB,
  userId: string,
  expiresAt: Date = new Date(Date.now() + THIRTY_DAYS_MS),
): Promise<string> {
  const token = generateToken();
  await db.insert(sessions).values({
    userId,
    tokenHash: hashToken(token),
    expiresAt,
  });
  return token;
}

/** Resolves an unexpired session's user from a raw token, or null. */
export async function resolveSessionUser(db: DB, token: string): Promise<AuthUser | null> {
  if (!token) return null;
  const rows = await db
    .select({ id: users.id, email: users.email, role: users.role })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.tokenHash, hashToken(token)), gt(sessions.expiresAt, new Date())))
    .limit(1);
  return rows[0] ?? null;
}

/** Deletes a session row by its raw token. */
export async function deleteSession(db: DB, token: string): Promise<void> {
  if (!token) return;
  await db.delete(sessions).where(eq(sessions.tokenHash, hashToken(token)));
}

// ---- Cookie-aware wrappers (used by server actions) ----

export async function createSession(db: DB, userId: string): Promise<void> {
  const token = await createSessionForUser(db, userId);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: THIRTY_DAYS_MS / 1000,
  });
}

export async function getSessionUser(db: DB): Promise<AuthUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value ?? "";
  return resolveSessionUser(db, token);
}

export async function destroySession(db: DB): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value ?? "";
  await deleteSession(db, token);
  jar.delete(SESSION_COOKIE);
}
```

- [ ] **Step 4: Run to verify it passes**

Run:
```bash
export DATABASE_URL="$(railway variables --service Postgres --kv | grep '^DATABASE_PUBLIC_URL=' | cut -d= -f2-)"
pnpm vitest run tests/auth/session.test.ts
```
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/auth/session.ts tests/auth/session.test.ts
git commit -m "feat: server-side session create/resolve/destroy on Postgres"
```

---

### Task 7: Rewrite `lib/auth.ts` over Postgres

**Files:**
- Modify: `lib/auth.ts` (full rewrite)

Keep the exported names and signatures **identical** so existing consumers (`app/login/page.tsx`, the dashboard pages, `dashboard-client.tsx`) compile unchanged: `signIn(formData) => Promise<{ error: string } | void>`, `signOut() => Promise<void>`, `getUser() => Promise<AuthUser | null>`. Only the redirect target changes (`/admin`) and the recruiter allowlist is gone.

- [ ] **Step 1: Replace the file contents**

Replace the entire contents of `lib/auth.ts` with:
```ts
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { getUserByEmail, type AuthUser } from "@/lib/auth/users";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession, getSessionUser } from "@/lib/auth/session";

export async function signIn(formData: FormData) {
  const email = (formData.get("email") as string | null)?.trim() ?? "";
  const password = (formData.get("password") as string | null) ?? "";

  if (!email || !password) {
    return { error: "Correo y contraseña son obligatorios." };
  }

  const user = await getUserByEmail(db, email);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Credenciales incorrectas. Intenta de nuevo." };
  }

  await createSession(db, user.id);
  revalidatePath("/", "layout");
  redirect("/admin");
}

export async function signOut() {
  await destroySession(db);
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function getUser(): Promise<AuthUser | null> {
  return getSessionUser(db);
}
```

- [ ] **Step 2: Typecheck the rewrite + consumers**

Run: `pnpm tsc --noEmit`
Expected: no errors. (`app/job-board/dashboard/page.tsx` and `recruiters/page.tsx` read `user.email`, which `AuthUser` provides; `dashboard-client.tsx` only calls `signOut`.)

- [ ] **Step 3: Verify build compiles**

Run: `pnpm build`
Expected: build succeeds. `redirect()` inside server actions is the standard Next pattern; `cookies()` is read inside the action/request scope. Note: `lib/db/client.ts` throws at module load if `DATABASE_URL` is unset — the Railway build sets it, but if `pnpm build` fails locally with "DATABASE_URL is not set", export it first (public proxy, as in Task 2 Step 4) and re-run.

- [ ] **Step 4: Commit**

```bash
git add lib/auth.ts
git commit -m "feat: rewrite auth (signIn/signOut/getUser) on Postgres sessions"
```

---

### Task 8: Seed-admin script

**Files:**
- Create: `scripts/auth/seed-admin.ts`
- Modify: `package.json` (add `db:seed-admin` script)

Creates (or updates the password of) the admin user from `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD`. Idempotent: re-running updates the existing user's hash rather than erroring on the unique email.

- [ ] **Step 1: Add the script entry to package.json**

In `package.json` `scripts`, add after `"community:import"`:
```json
    "db:seed-admin": "tsx scripts/auth/seed-admin.ts"
```

- [ ] **Step 2: Implement**

Create `scripts/auth/seed-admin.ts`:
```ts
import { eq } from "drizzle-orm";

async function main() {
  const email = process.env.ADMIN_SEED_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_SEED_PASSWORD;

  if (!email || !password) {
    console.error("Set ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD before running.");
    process.exit(1);
  }
  if (!process.env.DATABASE_URL?.trim()) {
    console.error(
      "DATABASE_URL is not set. For a local run use Railway's public proxy:\n" +
        '  export DATABASE_URL="$(railway variables --service Postgres --kv | grep \'^DATABASE_PUBLIC_URL=\' | cut -d= -f2-)"',
    );
    process.exit(1);
  }

  const { db } = await import("../../lib/db/client");
  const { users } = await import("../../lib/db/schema");
  const { hashPassword } = await import("../../lib/auth/password");

  const passwordHash = await hashPassword(password);
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);

  if (existing[0]) {
    await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.email, email));
    console.log(`Updated admin password for ${email}.`);
  } else {
    await db.insert(users).values({ email, passwordHash, role: "admin" });
    console.log(`Created admin user ${email}.`);
  }
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

- [ ] **Step 3: Run it against Railway Postgres**

Run:
```bash
export DATABASE_URL="$(railway variables --service Postgres --kv | grep '^DATABASE_PUBLIC_URL=' | cut -d= -f2-)"
ADMIN_SEED_EMAIL="ricardo@aibuilders.mx" ADMIN_SEED_PASSWORD="<choose-a-strong-one>" pnpm db:seed-admin
```
Expected: prints `Created admin user ricardo@aibuilders.mx.` (or `Updated admin password...` on a re-run). Use the real admin email/password Ricardo wants; do not commit them.

- [ ] **Step 4: Verify idempotency**

Run the same command again.
Expected: prints `Updated admin password for ricardo@aibuilders.mx.` — no unique-constraint error.

- [ ] **Step 5: Commit (script only, no secrets)**

```bash
git add scripts/auth/seed-admin.ts package.json
git commit -m "feat: db:seed-admin script (env-provided credentials)"
```

---

### Task 9: `/admin` gate + placeholder home

**Files:**
- Create: `app/admin/layout.tsx`
- Create: `app/admin/page.tsx`

The `/admin` segment is gated once at the layout: any unauthenticated request is redirected to `/login`. Phase 3's `/admin/newsletter` will nest under this and inherit the gate.

- [ ] **Step 1: Implement the gate layout**

Create `app/admin/layout.tsx`:
```tsx
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { signOut } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-stone-100">
      <header className="flex items-center justify-between border-b border-black/5 bg-white px-6 py-4">
        <a href="/admin" className="font-mono text-xs uppercase tracking-[0.2em] text-gray-500">
          AI Builders · Admin
        </a>
        <div className="flex items-center gap-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-400">
            {user.email}
          </span>
          <form action={signOut}>
            <button
              type="submit"
              className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500 hover:text-gray-900"
            >
              Salir
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">{children}</main>
    </div>
  );
}
```

- [ ] **Step 2: Implement the placeholder home**

Create `app/admin/page.tsx`:
```tsx
export default function AdminHome() {
  return (
    <div>
      <h1 className="font-serif text-3xl text-gray-800">Panel de administración</h1>
      <p className="mt-2 text-sm text-gray-500">
        El panel de newsletter llega en la siguiente fase. Por ahora, tu sesión está activa.
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `pnpm tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/admin/layout.tsx app/admin/page.tsx
git commit -m "feat: gated /admin area with placeholder home"
```

---

### Task 10: Repoint job-board auth checks + login copy

**Files:**
- Modify: `lib/actions/jobs.ts`
- Modify: `lib/actions/recruiters.ts`
- Modify: `app/login/page.tsx`

These two server-action files currently call `supabase.auth.getUser()` for their auth gate. Repoint that single check to the new `getUser()` so they don't depend on Supabase Auth. Their job-board **DB** operations (via `createAdminClient()` / `createClient()`) stay on Supabase — that's Phase 4.

- [ ] **Step 1: Inspect the current auth check in jobs.ts**

Run: `grep -n "auth.getUser\|user.email\|createClient\|createAdminClient" lib/actions/jobs.ts`
Expected: shows the `const { data: { user } } = await supabase.auth.getUser()` block (~lines 9-15) and the Supabase client usage for DB ops.

- [ ] **Step 2: Replace the auth check in jobs.ts**

In `lib/actions/jobs.ts`, replace the Supabase auth gate (the `supabase.auth.getUser()` call and its `user`/`normalizedEmail` derivation used purely for authorization) with the new gate. At the top of the file add:
```ts
import { getUser } from "@/lib/auth";
```
Then replace the auth-check block:
```ts
  const { data: { user } } = await supabase.auth.getUser()
  // ...existing lines that compute normalizedEmail from user.email...
```
with:
```ts
  const user = await getUser();
  if (!user) {
    throw new Error("No autorizado.");
  }
  const normalizedEmail = user.email.trim().toLowerCase();
```
Keep everything else (the Supabase DB calls) unchanged. If `normalizedEmail` was only used for the recruiter allowlist check that no longer exists, drop the now-unused variable instead of leaving it dangling.

- [ ] **Step 3: Replace the auth check in recruiters.ts**

In `lib/actions/recruiters.ts`, do the same: add `import { getUser } from "@/lib/auth";`, replace the `supabase.auth.getUser()` gate with:
```ts
  const user = await getUser();
  if (!user) {
    throw new Error("No autorizado.");
  }
  const normalizedEmail = user.email.trim().toLowerCase();
```
preserving the rest of the function.

- [ ] **Step 4: Update login copy (no longer job-board-only)**

In `app/login/page.tsx`, change the subtitle line:
```tsx
            Panel de administración del Job Board
```
to:
```tsx
            Panel de administración
```
Leave the rest of the page (the `signIn` form, styling) unchanged.

- [ ] **Step 5: Typecheck + lint**

Run: `pnpm tsc --noEmit && pnpm lint`
Expected: no type errors; lint clean (no unused-variable warnings from a dangling `normalizedEmail` — remove it if a consumer no longer needs it).

- [ ] **Step 6: Commit**

```bash
git add lib/actions/jobs.ts lib/actions/recruiters.ts app/login/page.tsx
git commit -m "refactor: repoint job-board auth gate to Postgres getUser; generalize login copy"
```

---

### Task 11: Full-suite verification + manual auth smoke test

**Files:** none (verification only)

- [ ] **Step 1: Run the whole test suite**

Run:
```bash
export DATABASE_URL="$(railway variables --service Postgres --kv | grep '^DATABASE_PUBLIC_URL=' | cut -d= -f2-)"
pnpm vitest run
```
Expected: all `tests/auth/*` and existing `tests/community/*` + `tests/newsletter/*` pass (community/session integration tests run because `DATABASE_URL` is set).

- [ ] **Step 2: Production build**

Run: `pnpm build`
Expected: succeeds (with `DATABASE_URL` exported).

- [ ] **Step 3: Manual login smoke test**

Run `pnpm dev` with `DATABASE_URL` exported, then:
1. Visit `http://localhost:3000/admin` → redirected to `/login`.
2. Log in with the seeded admin email/password → lands on `/admin`, header shows the email.
3. Visit `/admin` again → stays (session cookie works).
4. Click "Salir" → redirected to `/login`; visiting `/admin` again redirects to `/login` (session revoked in DB).
5. Visit `/job-board/dashboard` while logged out → redirected to `/login`; while logged in → loads (gate repointed).

Report results in the manual checklist. Do not commit anything in this task.

- [ ] **Step 4: Final commit (if any verification fixups were needed)**

Only if Steps 1–3 surfaced a fix:
```bash
git add -A
git commit -m "fix: <describe the verification fixup>"
```

---

## Post-implementation (operator notes — not code tasks)

- **Railway env vars:** set `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` (or run `db:seed-admin` once with the public proxy from a laptop). The deployed app needs no auth-specific env beyond `DATABASE_URL` (already present) and `NODE_ENV=production` (Railway sets this), which makes the session cookie `secure`.
- **First deploy after merge:** the `0001` migration must be applied to Railway Postgres (it was applied via the public proxy in Task 2; the internal `DATABASE_URL` points at the same DB, so no second apply is needed).
- **Phase 4 follow-up:** `lib/actions/jobs.ts` / `recruiters.ts` still do their *data* operations on Supabase; only their auth gate moved. The job board remains stale until Phase 4 migrates its tables.
```
