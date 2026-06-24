# Newsletter Subscription Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the outward Beehiiv signup forms with a self-hosted newsletter subscription that writes directly into the Railway Postgres `contacts` table, exposed through a reusable CTA component placed on `/newsletter`, the homepage, the blog index, and blog post sidebars.

**Architecture:** A public `subscribe()` server action (honeypot + per-IP rate limit) upserts an email into the existing `contacts` table via a thin query function. A single client component `NewsletterSignup` renders the form + states and is dropped into every placement. No DB migration — `sources` is already a text array and `newsletterSubscribed` already exists.

**Tech Stack:** Next.js 16 (App Router, React Server Actions), Drizzle ORM + postgres-js (Railway Postgres), Tailwind CSS 4, Vitest, pnpm.

## Global Constraints

- Package manager is **pnpm** — never `npm`/`yarn`.
- Language is **Spanish (es_MX)** for all user-facing copy.
- **Binary B/W palette only:** black `#212121` + white; neutrals `black/5..60` (or `white/5..60` on dark); status only `green-500` / `red-500`. No other colors, **no `dark:` classes**.
- Typography: Instrument Serif headings (`font-instrument font-medium`), Geist Mono labels/eyebrows (`font-mono uppercase tracking-widest`), Geist Sans body.
- Import alias `@/` maps to project root.
- Tests run with `pnpm test` (`vitest run`). Mock DB/`next/headers` — there is no test database; never hit a live DB in a unit test.
- Email normalization: trim + lowercase before any DB write.
- Email shape regex (reuse the codebase's existing one): `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`.
- Single opt-in for now: a new/returning subscriber gets `newsletterSubscribed: true` immediately. Leave a seam for double opt-in but do NOT build it.
- Run `pnpm lint` and `pnpm build` before considering UI tasks done.

---

## File Structure

| File | Responsibility |
|---|---|
| `lib/rate-limit.ts` | **New.** Pure in-memory per-key fixed-window rate limiter. No I/O — fully unit-testable. |
| `lib/db/queries/subscribers.ts` | **New.** `upsertSubscriber(email)` — the single ON-CONFLICT upsert into `contacts`. Isolates the only DB write. |
| `lib/community/types.ts` | **Modify.** Add `"public-signup"` to the `ContactSource` union. |
| `lib/actions/subscribe.ts` | **New.** Public `subscribe(formData)` server action — honeypot, validation, rate limit, delegates the write to `upsertSubscriber`. |
| `components/newsletter-signup.tsx` | **New.** Reusable client CTA: form + idle/submitting/success/error states + honeypot. `tone` prop (`light` \| `onDark`). |
| `app/(site)/newsletter/page.tsx` | **Modify.** Swap the Beehiiv `<form>` in the black card for `<NewsletterSignup tone="onDark" />`. |
| `components/cta-section.tsx` | **Modify.** Swap the Beehiiv `<form>` in the black card for `<NewsletterSignup tone="onDark" />`. |
| `components/blog/blog-index.tsx` | **Modify.** Add a full-width `light` CTA block below the post-cards grid. |
| `components/blog/shared.tsx` | **Modify.** Add a compact `light` CTA below the TOC card inside `StickyTOC`. |
| `tests/lib/rate-limit.test.ts` | **New.** Unit tests for the limiter. |
| `tests/actions/subscribe.test.ts` | **New.** Unit tests for the action (mocked deps). |

---

## Task 1: Pure rate limiter

**Files:**
- Create: `lib/rate-limit.ts`
- Test: `tests/lib/rate-limit.test.ts`

**Interfaces:**
- Produces: `rateLimit(key: string, limit: number, windowMs: number, now?: number): boolean` — returns `true` if the call is **allowed**, `false` if the key has exceeded `limit` calls within the current `windowMs` window. `now` defaults to `Date.now()` and exists for deterministic tests.

- [ ] **Step 1: Write the failing test**

Create `tests/lib/rate-limit.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { rateLimit } from "@/lib/rate-limit";

describe("rateLimit", () => {
  it("allows up to `limit` calls in a window, then blocks", () => {
    const key = "ip-a";
    const t0 = 1_000_000;
    expect(rateLimit(key, 3, 60_000, t0)).toBe(true);
    expect(rateLimit(key, 3, 60_000, t0 + 1)).toBe(true);
    expect(rateLimit(key, 3, 60_000, t0 + 2)).toBe(true);
    expect(rateLimit(key, 3, 60_000, t0 + 3)).toBe(false); // 4th call blocked
  });

  it("resets after the window elapses", () => {
    const key = "ip-b";
    const t0 = 2_000_000;
    expect(rateLimit(key, 1, 60_000, t0)).toBe(true);
    expect(rateLimit(key, 1, 60_000, t0 + 100)).toBe(false);
    expect(rateLimit(key, 1, 60_000, t0 + 60_001)).toBe(true); // new window
  });

  it("tracks keys independently", () => {
    const t0 = 3_000_000;
    expect(rateLimit("ip-c", 1, 60_000, t0)).toBe(true);
    expect(rateLimit("ip-d", 1, 60_000, t0)).toBe(true);
    expect(rateLimit("ip-c", 1, 60_000, t0 + 1)).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test tests/lib/rate-limit.test.ts`
Expected: FAIL — cannot resolve `@/lib/rate-limit` / `rateLimit is not a function`.

- [ ] **Step 3: Write minimal implementation**

Create `lib/rate-limit.ts`:

```ts
// Pure, in-memory fixed-window rate limiter. Good enough on a single Railway
// instance; the Map is process-local. Swap the store here (not at call sites)
// if we ever run multiple instances.
type Window = { count: number; resetAt: number };

const windows = new Map<string, Window>();

/**
 * Returns true if the call is allowed, false if `key` has already made `limit`
 * calls within the current `windowMs` window. `now` is injectable for tests.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now: number = Date.now(),
): boolean {
  const existing = windows.get(key);
  if (!existing || now >= existing.resetAt) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (existing.count >= limit) return false;
  existing.count += 1;
  return true;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test tests/lib/rate-limit.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/rate-limit.ts tests/lib/rate-limit.test.ts
git commit -m "feat(rate-limit): pure in-memory fixed-window limiter"
```

---

## Task 2: Subscriber upsert query + source type

**Files:**
- Create: `lib/db/queries/subscribers.ts`
- Modify: `lib/community/types.ts:1`

**Interfaces:**
- Consumes: `db` from `@/lib/db/client`, `contacts` from `@/lib/db/schema`.
- Produces: `upsertSubscriber(email: string): Promise<void>` — inserts a contact with `sources: ["public-signup"]`, `newsletterSubscribed: true`; on email conflict merges the source (deduped) and **sets `newsletterSubscribed: true`** (re-subscribe) without clobbering `name`. Caller must pass an already-normalized (trim+lowercase) email.

This task has no standalone unit test (it is a thin DB wrapper with no test database, mirroring the untested `lib/actions/webinar-leads.ts` upsert). It is exercised through Task 3's mocked action tests, and verified live in the manual checklist. Its gate is `pnpm build` + `pnpm lint` passing.

- [ ] **Step 1: Add the source type**

In `lib/community/types.ts`, change line 1 from:

```ts
export type ContactSource = "beehiiv" | "cursor-event" | "lead" | "cursor-attendees";
```

to:

```ts
export type ContactSource =
  | "beehiiv"
  | "cursor-event"
  | "lead"
  | "cursor-attendees"
  | "public-signup";
```

- [ ] **Step 2: Write the query module**

Create `lib/db/queries/subscribers.ts`:

```ts
import { sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { contacts } from "@/lib/db/schema";

const SOURCE = "public-signup";

/**
 * Upsert a public newsletter signup into the community contacts table. On
 * conflict we merge the source (deduped) and (re)enable the newsletter flag —
 * an explicit re-signup re-subscribes someone who previously opted out — while
 * preserving any existing name. `email` must already be normalized
 * (trimmed + lowercased) by the caller.
 */
export async function upsertSubscriber(email: string): Promise<void> {
  await db
    .insert(contacts)
    .values({
      email,
      sources: [SOURCE],
      newsletterSubscribed: true,
    })
    .onConflictDoUpdate({
      target: contacts.email,
      set: {
        sources: sql`(select array(select distinct e from unnest(${contacts.sources} || excluded.sources) e))`,
        newsletterSubscribed: true,
        updatedAt: sql`now()`,
      },
    });
}
```

- [ ] **Step 3: Verify it type-checks and builds**

Run: `pnpm build`
Expected: build succeeds (no TypeScript errors for the new files).

- [ ] **Step 4: Commit**

```bash
git add lib/db/queries/subscribers.ts lib/community/types.ts
git commit -m "feat(db): public-signup contact source + upsertSubscriber query"
```

---

## Task 3: Public `subscribe` server action

**Files:**
- Create: `lib/actions/subscribe.ts`
- Test: `tests/actions/subscribe.test.ts`

**Interfaces:**
- Consumes: `upsertSubscriber` from `@/lib/db/queries/subscribers` (Task 2), `rateLimit` from `@/lib/rate-limit` (Task 1), `headers` from `next/headers`.
- Produces:
  ```ts
  export type SubscribeResult =
    | { ok: true }
    | { ok: false; error: "invalid" | "rate_limited" | "error" };
  export async function subscribe(formData: FormData): Promise<SubscribeResult>;
  ```
  Reads `email` and the honeypot field `company` from `formData`. Honeypot filled → `{ ok: true }` with no write. Invalid email → `{ ok: false, error: "invalid" }`. Over rate limit (5 / 60s per IP) → `{ ok: false, error: "rate_limited" }`. DB throw → `{ ok: false, error: "error" }`. Success → `{ ok: true }`.

- [ ] **Step 1: Write the failing test**

Create `tests/actions/subscribe.test.ts`:

```ts
import { describe, it, expect, beforeEach, vi } from "vitest";

const upsertSubscriber = vi.fn();
const rateLimit = vi.fn();
const headers = vi.fn();

vi.mock("@/lib/db/queries/subscribers", () => ({ upsertSubscriber }));
vi.mock("@/lib/rate-limit", () => ({ rateLimit }));
vi.mock("next/headers", () => ({ headers }));

function fd(fields: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.set(k, v);
  return f;
}

describe("subscribe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    rateLimit.mockReturnValue(true);
    upsertSubscriber.mockResolvedValue(undefined);
    headers.mockResolvedValue(new Map([["x-forwarded-for", "1.2.3.4"]]));
  });

  it("subscribes a valid email", async () => {
    const { subscribe } = await import("@/lib/actions/subscribe");
    expect(await subscribe(fd({ email: "Foo@Bar.com" }))).toEqual({ ok: true });
    expect(upsertSubscriber).toHaveBeenCalledWith("foo@bar.com"); // normalized
  });

  it("silently succeeds and writes nothing when the honeypot is filled", async () => {
    const { subscribe } = await import("@/lib/actions/subscribe");
    expect(await subscribe(fd({ email: "a@b.com", company: "Acme" }))).toEqual({ ok: true });
    expect(upsertSubscriber).not.toHaveBeenCalled();
  });

  it("rejects an invalid email without writing", async () => {
    const { subscribe } = await import("@/lib/actions/subscribe");
    expect(await subscribe(fd({ email: "not-an-email" }))).toEqual({ ok: false, error: "invalid" });
    expect(upsertSubscriber).not.toHaveBeenCalled();
  });

  it("rejects an empty email", async () => {
    const { subscribe } = await import("@/lib/actions/subscribe");
    expect(await subscribe(fd({ email: "   " }))).toEqual({ ok: false, error: "invalid" });
  });

  it("returns rate_limited when the limiter blocks, without writing", async () => {
    rateLimit.mockReturnValue(false);
    const { subscribe } = await import("@/lib/actions/subscribe");
    expect(await subscribe(fd({ email: "a@b.com" }))).toEqual({ ok: false, error: "rate_limited" });
    expect(upsertSubscriber).not.toHaveBeenCalled();
  });

  it("returns error when the DB write throws", async () => {
    upsertSubscriber.mockRejectedValue(new Error("db down"));
    const { subscribe } = await import("@/lib/actions/subscribe");
    expect(await subscribe(fd({ email: "a@b.com" }))).toEqual({ ok: false, error: "error" });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test tests/actions/subscribe.test.ts`
Expected: FAIL — cannot resolve `@/lib/actions/subscribe`.

- [ ] **Step 3: Write the implementation**

Create `lib/actions/subscribe.ts`:

```ts
"use server";

import { headers } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";
import { upsertSubscriber } from "@/lib/db/queries/subscribers";

export type SubscribeResult =
  | { ok: true }
  | { ok: false; error: "invalid" | "rate_limited" | "error" };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RATE_LIMIT = 5; // signups
const RATE_WINDOW_MS = 60_000; // per minute, per IP

export async function subscribe(formData: FormData): Promise<SubscribeResult> {
  // Honeypot: a hidden field humans never see. Bots autofill it — pretend it
  // worked and write nothing.
  const honeypot = (formData.get("company") as string | null)?.trim();
  if (honeypot) return { ok: true };

  const raw = (formData.get("email") as string | null)?.trim() ?? "";
  if (!raw || !EMAIL_RE.test(raw)) return { ok: false, error: "invalid" };
  const email = raw.toLowerCase();

  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  if (!rateLimit(`subscribe:${ip}`, RATE_LIMIT, RATE_WINDOW_MS)) {
    return { ok: false, error: "rate_limited" };
  }

  try {
    await upsertSubscriber(email);
  } catch (error) {
    console.error("subscribe failed:", error);
    return { ok: false, error: "error" };
  }
  return { ok: true };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test tests/actions/subscribe.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/actions/subscribe.ts tests/actions/subscribe.test.ts
git commit -m "feat(newsletter): public subscribe server action"
```

---

## Task 4: `NewsletterSignup` reusable component

**Files:**
- Create: `components/newsletter-signup.tsx`

**Interfaces:**
- Consumes: `subscribe` from `@/lib/actions/subscribe` (Task 3), `cn` from `@/lib/utils`.
- Produces:
  ```ts
  export function NewsletterSignup(props: {
    tone?: "light" | "onDark"; // default "light"
    heading?: string;          // optional — omit when the host card already has a title
    subtext?: string;          // optional
    className?: string;        // wrapper override
  }): JSX.Element;
  ```
  Renders an optional heading/subtext, an email form (with hidden honeypot), and idle→submitting→success/error states. On success it replaces the form with a confirmation line. No tests — this repo has no React test library; verified via `pnpm build`, `pnpm lint`, and the manual checklist.

- [ ] **Step 1: Write the component**

Create `components/newsletter-signup.tsx`:

```tsx
"use client";

import { useState, useTransition } from "react";
import { Send } from "lucide-react";
import { subscribe } from "@/lib/actions/subscribe";
import { cn } from "@/lib/utils";

type Status = "idle" | "success" | "error";

const ERROR_COPY: Record<string, string> = {
  invalid: "Ingresa un correo válido.",
  rate_limited: "Demasiados intentos, intenta en un momento.",
  error: "Hubo un error. Intenta de nuevo.",
};

const SUCCESS_COPY = "¡Listo! Te avisaremos en el próximo número.";

export function NewsletterSignup({
  tone = "light",
  heading,
  subtext,
  className,
}: {
  tone?: "light" | "onDark";
  heading?: string;
  subtext?: string;
  className?: string;
}) {
  const onDark = tone === "onDark";
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await subscribe(formData);
      if (res.ok) {
        setStatus("success");
        setMessage(SUCCESS_COPY);
      } else {
        setStatus("error");
        setMessage(ERROR_COPY[res.error] ?? ERROR_COPY.error);
      }
    });
  }

  return (
    <div className={className}>
      {heading && (
        <h3
          className={cn(
            "text-xl sm:text-2xl md:text-3xl font-instrument font-medium mb-3 sm:mb-4",
            onDark ? "text-white" : "text-black",
          )}
        >
          {heading}
        </h3>
      )}
      {subtext && (
        <p
          className={cn(
            "mb-6 sm:mb-8 text-sm sm:text-base",
            onDark ? "text-white/60" : "text-black/60",
          )}
        >
          {subtext}
        </p>
      )}

      {status === "success" ? (
        <p className="font-mono text-sm uppercase tracking-widest text-green-500">
          {SUCCESS_COPY}
        </p>
      ) : (
        <form className="space-y-3 sm:space-y-4" onSubmit={handleSubmit} noValidate>
          {/* Honeypot — hidden from humans, catnip for bots. */}
          <input
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="absolute left-[-9999px] h-0 w-0 opacity-0"
          />
          <input
            type="email"
            name="email"
            required
            placeholder="tu@email.com"
            className={cn(
              "w-full rounded-lg sm:rounded-xl px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-base focus:outline-none focus:ring-2 transition-all",
              onDark
                ? "bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:ring-white/20"
                : "bg-white border border-black/10 text-black placeholder:text-black/30 focus:ring-black/20",
            )}
          />
          <button
            type="submit"
            disabled={pending}
            className={cn(
              "w-full py-5 sm:py-6 text-sm sm:text-base font-bold rounded-lg sm:rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-60",
              onDark
                ? "bg-white text-black hover:bg-white/90"
                : "bg-black text-white hover:bg-black/90",
            )}
          >
            <span>{pending ? "Enviando…" : "Suscribirme"}</span>
            {!pending && <Send className="size-4" />}
          </button>
          {status === "error" && (
            <p className="font-mono text-xs uppercase tracking-widest text-red-500">
              {message}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Lint and build**

Run: `pnpm lint && pnpm build`
Expected: no lint errors, build succeeds.

- [ ] **Step 3: Commit**

```bash
git add components/newsletter-signup.tsx
git commit -m "feat(newsletter): reusable NewsletterSignup CTA component"
```

---

## Task 5: Beehiiv cutover on the dark cards (`/newsletter` + homepage)

**Files:**
- Modify: `app/(site)/newsletter/page.tsx:108-127`
- Modify: `components/cta-section.tsx:92-108`

**Interfaces:**
- Consumes: `NewsletterSignup` from `@/components/newsletter-signup` (Task 4).

Both files have an identical black newsletter card whose `<form action="https://aibuildersmx.beehiiv.com/">` opens a new tab and never touches our DB. The card already supplies the heading and subtext, so we render `<NewsletterSignup tone="onDark" />` **without** `heading`/`subtext` — only the form is replaced.

- [ ] **Step 1: Replace the form on the newsletter page**

In `app/(site)/newsletter/page.tsx`, replace the whole `<form>…</form>` block (currently lines ~108–127) with:

```tsx
<NewsletterSignup tone="onDark" />
```

Then add the import near the top (after the existing component imports, e.g. below the `HeroHeader` import):

```tsx
import { NewsletterSignup } from '@/components/newsletter-signup'
```

Remove the now-unused `Send` import from the `lucide-react` import on line 4 **only if** `Send` is not referenced elsewhere in the file (it is not). Leave `Mail` (still used by the card icon).

- [ ] **Step 2: Replace the form on the homepage CTA**

In `components/cta-section.tsx`, replace the whole `<form>…</form>` block (currently lines ~92–108) with:

```tsx
<NewsletterSignup tone="onDark" />
```

Add the import after line 8:

```tsx
import { NewsletterSignup } from '@/components/newsletter-signup';
```

Then remove the now-unused `Send` from the `lucide-react` import on line 5 (the rest — `ArrowRight, MessageCircle, Mail, Linkedin` — stay).

- [ ] **Step 3: Lint and build**

Run: `pnpm lint && pnpm build`
Expected: no lint errors (no unused imports), build succeeds.

- [ ] **Step 4: Manual check**

Run `pnpm dev`, then:
- Visit `http://localhost:3000/newsletter` — the black card shows the email input + "Suscribirme"; submitting a real email shows the green success line; the form is visually identical to before (white-on-black).
- Visit `http://localhost:3000/` and scroll to the CTA — same behavior in the black newsletter card.
- Submit an invalid email (e.g. `abc`) — red error line, no navigation, no new tab.

- [ ] **Step 5: Commit**

```bash
git add app/(site)/newsletter/page.tsx components/cta-section.tsx
git commit -m "feat(newsletter): cut over /newsletter + homepage forms to self-hosted signup"
```

---

## Task 6: Blog index CTA (below the post grid)

**Files:**
- Modify: `components/blog/blog-index.tsx`

**Interfaces:**
- Consumes: `NewsletterSignup` from `@/components/newsletter-signup` (Task 4).

Add a full-width `light` CTA card below the post-cards grid, inside the existing `max-w-6xl` section. `blog-index.tsx` is a server component; `NewsletterSignup` is a client component, which is fine to render from a server component.

- [ ] **Step 1: Add the import**

In `components/blog/blog-index.tsx`, add after line 8 (`import type { BlogPostMeta } …`):

```tsx
import { NewsletterSignup } from '@/components/newsletter-signup'
```

- [ ] **Step 2: Add the CTA block below the grid**

In `components/blog/blog-index.tsx`, locate the end of the posts conditional (the `)}` that closes the `posts.length === 0 ? … : ( … )` expression, currently line 45) and the section close `</section>` (line 46). Insert the CTA between them so it reads:

```tsx
            {posts.length === 0 ? (
                <EmptyState />
            ) : (
                <div className="grid gap-4 sm:gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {posts.map((post) => (
                        <PostCard key={post.slug} post={post} />
                    ))}
                </div>
            )}

            <div className="mt-16 sm:mt-20 rounded-2xl border border-black/10 bg-black/[0.02] p-8 sm:p-12 max-w-2xl mx-auto text-center">
                <span className="inline-block font-mono text-xs uppercase tracking-widest mb-4 text-black/40">
                    Newsletter
                </span>
                <NewsletterSignup
                    tone="light"
                    heading="The Build Log"
                    subtext="Lo que construimos con IA, cada semana. Sin spam, cancela cuando quieras."
                />
            </div>
        </section>
```

- [ ] **Step 3: Lint and build**

Run: `pnpm lint && pnpm build`
Expected: no errors, build succeeds.

- [ ] **Step 4: Manual check**

Run `pnpm dev`, visit `http://localhost:3000/blog` — below the post cards there is a centered light CTA card "The Build Log" with a working email form (black button, black-on-white). Submit a real email → green success line. Check mobile width (card stays within padding, not edge-to-edge).

- [ ] **Step 5: Commit**

```bash
git add components/blog/blog-index.tsx
git commit -m "feat(blog): newsletter CTA below the blog index grid"
```

---

## Task 7: Blog post sidebar CTA (below the TOC card)

**Files:**
- Modify: `components/blog/shared.tsx`

**Interfaces:**
- Consumes: `NewsletterSignup` from `@/components/newsletter-signup` (Task 4).

Add a compact `light` CTA directly below the TOC card inside `StickyTOC`'s `<nav>`. The sidebar only renders on posts that have a table of contents (`hasToc`) and only on `xl`+ screens — acceptable for v1 (a bottom-of-post fallback is explicitly out of scope). `shared.tsx` is already `'use client'`.

- [ ] **Step 1: Add the import**

In `components/blog/shared.tsx`, add after line 5 (`import { cn } from '@/lib/utils'`):

```tsx
import { NewsletterSignup } from '@/components/newsletter-signup'
```

- [ ] **Step 2: Add the CTA below the TOC card**

In `StickyTOC`, the `<nav>` currently contains a single card `<div className="relative rounded-xl border …">…</div>`. Add the CTA as a sibling **after** that card `</div>` but still inside the `</nav>`. The relevant tail of `StickyTOC`'s return becomes:

```tsx
                </div>
            </div>

            <div className="mt-4 rounded-xl border border-black/10 bg-black/[0.02] p-5">
                <p className="font-mono text-[10px] mb-3 uppercase tracking-widest text-black/40">
                    Newsletter
                </p>
                <NewsletterSignup tone="light" />
            </div>
        </nav>
    )
}
```

(The first two `</div>` above are the existing closers for the TOC card's inner `p-5` div and the card div — do not add new ones; only the `<div className="mt-4 …">…</div>` block and its content are new.)

- [ ] **Step 3: Lint and build**

Run: `pnpm lint && pnpm build`
Expected: no errors, build succeeds.

- [ ] **Step 4: Manual check**

Run `pnpm dev`, open a blog post that has a TOC (e.g. one with multiple `<SectionTitle>` entries) on a wide (`xl`, ≥1280px) viewport. Below the "Contenido" TOC card in the left sidebar there is a compact "Newsletter" CTA with the email form. Submit a real email → green success line. Confirm the sticky behavior still works (TOC + CTA scroll together and stick).

- [ ] **Step 5: Commit**

```bash
git add components/blog/shared.tsx
git commit -m "feat(blog): newsletter CTA below the post sidebar TOC"
```

---

## Final verification

- [ ] **Run the full test suite**

Run: `pnpm test`
Expected: all tests pass, including the new `rate-limit` and `subscribe` suites.

- [ ] **Lint + build clean**

Run: `pnpm lint && pnpm build`
Expected: no errors.

- [ ] **End-to-end DB check**

With `pnpm dev` running and a valid `DATABASE_URL`, subscribe with a fresh email from `/newsletter`. Then confirm the row exists with `source = public-signup` and `newsletter_subscribed = true` — via `/admin/comunidad` (or the admin contacts list). Re-submit the same email after toggling it unsubscribed (if testing re-subscribe) → `newsletter_subscribed` returns to `true`.

- [ ] **Confirm Beehiiv is fully gone**

Run: `grep -rn "beehiiv" app components` — expected: no remaining `aibuildersmx.beehiiv.com` form actions (matches in docs/comments are fine).

---

## Deviations from the spec

- The spec's `NewsletterSignup` props listed `variant` (`inline`/`stacked`) and `source`.
  Both were dropped: every real placement is stacked (no `inline` consumer → YAGNI), and a
  client-settable `source` is an injection vector with no v1 payoff (the action always writes
  `public-signup`). The `tone` prop (`light`/`onDark`) covers all four placements.

## Notes / Out of scope (do not build)

- Double opt-in confirmation email — the action's single-write path is the seam; not built now.
- CAPTCHA / Turnstile — honeypot + rate limit only.
- Per-placement source attribution — a single `public-signup` source for all placements.
- Distributed rate-limit store — in-memory `Map` is fine on one Railway instance.
- Bottom-of-post CTA fallback for posts without a TOC.
- `?email=` prefilled magic links.
