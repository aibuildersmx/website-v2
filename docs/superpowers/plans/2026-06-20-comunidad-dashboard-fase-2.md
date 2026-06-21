# Comunidad Dashboard — Fase 2 (Temas + Personas) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add ranked **Temas** and **Personas** list pages plus their detail routes (`/temas/[slug]`, `/personas/[jid]`) to the `/admin/comunidad` section, all proxied through the existing aiby-bridge API client.

**Architecture:** Extends `lib/aiby/{types,client}.ts` (built in Fase 1) with four read functions — `getTopics`, `getPeople`, `getTopic`, `getPerson`. New server-component pages reuse the Fase 1 `RangeChannelPicker` and the admin's existing card/section primitives. **No graph visualization** — ranked lists + detail pages only (decided in brainstorming). Cursor-less pagination (show "Siguiente" when a full page returned) since the bot API returns no `total` for these lists.

**Tech Stack:** Next.js 16 (App Router, Server Components), TypeScript, Tailwind 4, vitest.

## Global Constraints

- Package manager is **pnpm** only — never npm/yarn.
- All user-facing copy in **Spanish (es_MX)**.
- Palette is binary: black `#212121` + white; neutrals `black/5 /10 /20 /40 /60`; status `green-500`/`red-500` only.
- `AIBY_API_KEY` must never reach the client bundle — used only inside `lib/aiby/client.ts` (`import "server-only"`).
- Follow the Fase 1 + admin pattern: server components calling typed client functions, no client-side data fetching, no new auth. Tests live in `tests/aiby/` (project convention), imported via the `@/` alias; vitest aliases `server-only` to `tests/stubs/server-only.ts`.
- Test: `pnpm test`. Lint: `pnpm lint`. Build: `pnpm build`.

---

### Task 1: Extend types + client (topics, people, topic detail, person detail)

**Files:**
- Modify: `lib/aiby/types.ts` (append four interfaces)
- Modify: `lib/aiby/client.ts` (append four functions)
- Create: `tests/aiby/client-list.test.ts`

**Interfaces:**
- Consumes: the `get<T>`/`AibyRange`/`config` internals already in `lib/aiby/client.ts` (Fase 1).
- Produces:
  - `getTopics(range: AibyRange, opts?: { offset?: number; limit?: number }): Promise<TopicsPage>`
  - `getPeople(range: AibyRange, opts?: { offset?: number; limit?: number }): Promise<PeoplePage>`
  - `getTopic(slug: string, range: AibyRange): Promise<TopicDetailData>`
  - `getPerson(jid: string, range: AibyRange): Promise<PersonDetailData>`
  - Interfaces `TopicsPage`, `PeoplePage`, `TopicDetailData`, `PersonDetailData`.

- [ ] **Step 1: Append the four interfaces to `lib/aiby/types.ts`**

Add at the end of `lib/aiby/types.ts` (ported verbatim from `aibuilders-bot/dashboard/src/api.ts`):

```typescript
export interface TopicsPage {
  range: { fromDate: string; toDate: string };
  group: string | null;
  offset: number;
  limit: number;
  topics: Array<{ slug: string; display_name: string; count: number }>;
}

export interface PeoplePage {
  range: { fromDate: string; toDate: string };
  group: string | null;
  offset: number;
  limit: number;
  people: Array<{ jid: string; name: string | null; phone: string; count: number }>;
}

export interface TopicDetailData {
  slug: string;
  display_name: string;
  mention_count: number;
  topPeople: Array<{ jid: string; name: string | null; phone: string; count: number }>;
  recentMessages: Array<{ id: number; ts: string; sender_name: string | null; sender_phone: string; group_alias: string; text: string }>;
  showcase: Array<{ id: number; date: string; group_alias: string; author_name: string | null; author_jid: string; title: string; description: string; links: string[]; tags: string[] }>;
  threads: Array<{ date: string; group_alias: string; title: string; gist: string }>;
  timeline: Array<{ date: string; count: number }>;
  contributors: Array<{ name: string; jid: string | null; count: number; sources: Array<"showcase" | "thread"> }>;
}

export interface PersonDetailData {
  jid: string;
  name: string | null;
  phone: string;
  messageCount: number;
  topTopics: Array<{ slug: string; display_name: string; count: number }>;
  recentMessages: Array<{ id: number; ts: string; group_alias: string; text: string }>;
  showcase: Array<{ id: number; date: string; group_alias: string; title: string; description: string; links: string[]; tags: string[] }>;
  profile: { expertise: string[]; projects: unknown[]; links_authored: string[]; style_notes: string | null } | null;
}
```

- [ ] **Step 2: Write the failing test**

Create `tests/aiby/client-list.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("aiby client — list + detail", () => {
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

  it("getTopics passes offset + limit + range", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const { getTopics } = await import("@/lib/aiby/client");
    await getTopics({ preset: "week" }, { offset: 25, limit: 25 });
    expect(String(fetchMock.mock.calls[0][0])).toBe(
      "https://bot.example/dashboard/api/topics?preset=week&offset=25&limit=25",
    );
  });

  it("getPeople defaults offset to 0", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const { getPeople } = await import("@/lib/aiby/client");
    await getPeople({ preset: "month", group: "general" });
    expect(String(fetchMock.mock.calls[0][0])).toBe(
      "https://bot.example/dashboard/api/people?preset=month&group=general&offset=0&limit=25",
    );
  });

  it("getTopic encodes the slug in the path", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const { getTopic } = await import("@/lib/aiby/client");
    await getTopic("pi sdk", { preset: "week" });
    expect(String(fetchMock.mock.calls[0][0])).toBe(
      "https://bot.example/dashboard/api/topic/pi%20sdk?preset=week",
    );
  });

  it("getPerson encodes the jid in the path", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const { getPerson } = await import("@/lib/aiby/client");
    await getPerson("12345@lid", { preset: "year" });
    expect(String(fetchMock.mock.calls[0][0])).toBe(
      "https://bot.example/dashboard/api/person/12345%40lid?preset=year",
    );
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `pnpm test tests/aiby/client-list.test.ts`
Expected: FAIL — `getTopics is not a function` (or undefined export).

- [ ] **Step 4: Append the four functions to `lib/aiby/client.ts`**

First extend the type import at the top of `lib/aiby/client.ts`:

```typescript
import type {
  OverviewData,
  VolumeData,
  HeatmapData,
  RecentMessages,
  TopicsPage,
  PeoplePage,
  TopicDetailData,
  PersonDetailData,
} from "./types";
```

Then append at the end of the file:

```typescript
export const getTopics = (range: AibyRange, opts?: { offset?: number; limit?: number }) =>
  get<TopicsPage>("/topics", range, { offset: opts?.offset ?? 0, limit: opts?.limit ?? 25 });
export const getPeople = (range: AibyRange, opts?: { offset?: number; limit?: number }) =>
  get<PeoplePage>("/people", range, { offset: opts?.offset ?? 0, limit: opts?.limit ?? 25 });
export const getTopic = (slug: string, range: AibyRange) =>
  get<TopicDetailData>(`/topic/${encodeURIComponent(slug)}`, range);
export const getPerson = (jid: string, range: AibyRange) =>
  get<PersonDetailData>(`/person/${encodeURIComponent(jid)}`, range);
```

Note: the existing `get<T>` helper writes `offset`/`limit` from `extra` in insertion order, so the URL is `?preset=...&group=...&offset=...&limit=...` — matching the test expectations. `extra` values of `0` are kept (the helper only skips `undefined`/`null`/`""`).

- [ ] **Step 5: Run the test to verify it passes**

Run: `pnpm test tests/aiby/client-list.test.ts`
Expected: PASS (4 passing).

- [ ] **Step 6: Run the full aiby suite (no regressions)**

Run: `pnpm test tests/aiby`
Expected: all aiby suites pass.

- [ ] **Step 7: Commit**

```bash
cd "/Volumes/VELLENT USB/Sites/aibuilders"
git add lib/aiby/types.ts lib/aiby/client.ts tests/aiby/client-list.test.ts
git commit -m "feat(comunidad): client functions for topics, people + detail"
```

---

### Task 2: Temas list page

**Files:**
- Create: `app/(admin)/admin/comunidad/temas/page.tsx`

**Interfaces:**
- Consumes: `getTopics`, `parseRange`, `RANGE_PRESETS` aren't needed here directly; reuses `RangeChannelPicker` (Fase 1) — but that needs channel groups. To avoid a second fetch, the picker on list pages shows the range only via `getOverview`'s groups is overkill; instead reuse `RangeChannelPicker` with an empty `channels={[]}` so only the range dropdown is meaningful. (Channel filtering still flows through the URL.)
- Produces: route `/admin/comunidad/temas`.

- [ ] **Step 1: Create the Temas list page**

Create `app/(admin)/admin/comunidad/temas/page.tsx`:

```tsx
import Link from "next/link";
import { getTopics } from "@/lib/aiby/client";
import { parseRange } from "@/lib/aiby/range";
import { RangeChannelPicker } from "../components/range-channel-picker";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

function buildHref(sp: Record<string, string | string[] | undefined>, page: number): string {
  const params = new URLSearchParams();
  const preset = typeof sp.preset === "string" ? sp.preset : undefined;
  const group = typeof sp.group === "string" ? sp.group : undefined;
  if (preset) params.set("preset", preset);
  if (group) params.set("group", group);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/admin/comunidad/temas?${qs}` : "/admin/comunidad/temas";
}

export default async function TemasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const range = parseRange(sp);
  const pageRaw = Number.parseInt(typeof sp.page === "string" ? sp.page : "1", 10);
  const page = Number.isNaN(pageRaw) || pageRaw < 1 ? 1 : pageRaw;
  const offset = (page - 1) * PAGE_SIZE;

  let topics: Awaited<ReturnType<typeof getTopics>>["topics"] = [];
  let error: string | null = null;
  try {
    const res = await getTopics(range, { offset, limit: PAGE_SIZE });
    topics = res.topics;
  } catch {
    error = "No se pudo cargar la data del bot.";
  }

  const hasPrev = page > 1;
  const hasNext = topics.length === PAGE_SIZE;

  return (
    <div>
      <p className="text-xs font-medium text-gray-400 dark:text-gray-500">Comunidad</p>
      <h1 className="mt-1 text-3xl font-medium text-gray-800 dark:text-gray-100">Temas</h1>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        De qué se habla, rankeado por menciones.
      </p>

      <div className="mt-6">
        <RangeChannelPicker channels={[]} />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-black/5 bg-white dark:border-white/10 dark:bg-neutral-900">
        {error ? (
          <p className="px-6 py-16 text-center text-sm text-gray-400">{error}</p>
        ) : topics.length === 0 ? (
          <p className="px-6 py-16 text-center text-sm text-gray-400">Sin temas en este rango.</p>
        ) : (
          <ul className="divide-y divide-black/5 dark:divide-white/10">
            {topics.map((t, i) => (
              <li key={t.slug}>
                <Link
                  href={`/admin/comunidad/temas/${encodeURIComponent(t.slug)}`}
                  className="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-6 py-3 transition hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
                >
                  <span className="w-6 text-right font-mono text-xs text-gray-300 dark:text-gray-600">
                    {offset + i + 1}
                  </span>
                  <span className="truncate text-sm font-medium text-gray-800 hover:underline dark:text-gray-100">
                    {t.display_name}
                  </span>
                  <span className="font-mono text-xs text-gray-400 dark:text-gray-500">
                    {t.count.toLocaleString("es-MX")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {(hasPrev || hasNext) && (
        <div className="mt-6 flex items-center justify-between gap-4">
          <p className="text-xs font-medium text-gray-400 dark:text-gray-500">Página {page}</p>
          <div className="flex items-center gap-2">
            <Pager href={buildHref(sp, page - 1)} disabled={!hasPrev}>Anterior</Pager>
            <Pager href={buildHref(sp, page + 1)} disabled={!hasNext}>Siguiente</Pager>
          </div>
        </div>
      )}
    </div>
  );
}

function Pager({ href, disabled, children }: { href: string; disabled: boolean; children: React.ReactNode }) {
  const base = "rounded-full border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.15em] transition";
  if (disabled) {
    return <span className={`${base} cursor-not-allowed border-black/5 text-gray-300 dark:border-white/5 dark:text-gray-600`}>{children}</span>;
  }
  return <Link href={href} className={`${base} border-black/10 text-gray-700 hover:bg-black/5 dark:border-white/15 dark:text-gray-200 dark:hover:bg-white/10`}>{children}</Link>;
}
```

- [ ] **Step 2: Add the sidebar entry for Temas**

In `app/(admin)/admin/components/admin-shell.tsx`, add `Hash` to the lucide import and a NAV entry under "Comunidad" after "Pulso":

```typescript
import { Home, Mail, Users, MessageCircle, Hash, Menu, X, ChevronUp } from "lucide-react";
```

```typescript
  { href: "/admin/comunidad", label: "Pulso", section: "Comunidad", icon: MessageCircle },
  { href: "/admin/comunidad/temas", label: "Temas", section: "Comunidad", icon: Hash },
  { href: "/admin/contactos", label: "Contactos", section: "Comunidad", icon: Users },
```

Note: `isActive` uses `startsWith(`${href}/`)`, so `/admin/comunidad/temas/foo` keeps "Temas" highlighted, and "Pulso" (`/admin/comunidad`) is only active on exact + its own subpaths — acceptable since temas has its own entry.

- [ ] **Step 3: Verify build + manual**

Run: `pnpm build`
Expected: succeeds; `/admin/comunidad/temas` listed.

Manual (`pnpm dev`, logged in): `/admin/comunidad/temas` shows a ranked list; range dropdown changes it; "Siguiente" appears when 25 returned.

- [ ] **Step 4: Commit**

```bash
cd "/Volumes/VELLENT USB/Sites/aibuilders"
git add "app/(admin)/admin/comunidad/temas/page.tsx" "app/(admin)/admin/components/admin-shell.tsx"
git commit -m "feat(comunidad): Temas ranked list page + sidebar entry"
```

---

### Task 3: Topic detail page

**Files:**
- Create: `app/(admin)/admin/comunidad/temas/[slug]/page.tsx`

**Interfaces:**
- Consumes: `getTopic(slug, range)` from Task 1, `parseRange`.
- Produces: route `/admin/comunidad/temas/[slug]`.

- [ ] **Step 1: Create the topic detail page**

Create `app/(admin)/admin/comunidad/temas/[slug]/page.tsx`:

```tsx
import Link from "next/link";
import { getTopic } from "@/lib/aiby/client";
import { parseRange } from "@/lib/aiby/range";
import { StatCard } from "../../../components/stat-card";
import { DashboardSection } from "../../../components/dashboard-section";

export const dynamic = "force-dynamic";

function timeLabel(ts: string): string {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  }).format(new Date(ts));
}

export default async function TopicDetail({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const range = parseRange(await searchParams);

  let topic: Awaited<ReturnType<typeof getTopic>> | null = null;
  let error: string | null = null;
  try {
    topic = await getTopic(slug, range);
  } catch {
    error = "No se pudo cargar el tema.";
  }

  return (
    <div>
      <Link
        href="/admin/comunidad/temas"
        className="font-mono text-[11px] uppercase tracking-[0.15em] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      >
        ← Temas
      </Link>

      {error || !topic ? (
        <p className="mt-8 rounded-2xl border border-black/5 bg-white p-6 text-sm text-gray-500 dark:border-white/10 dark:bg-neutral-900">
          {error ?? "Sin datos."}
        </p>
      ) : (
        <>
          <h1 className="mt-3 text-3xl font-medium text-gray-800 dark:text-gray-100">
            {topic.display_name}
          </h1>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <StatCard eyebrow="Menciones" value={topic.mention_count.toLocaleString("es-MX")} />
            <StatCard eyebrow="Contribuyentes" value={String(topic.contributors.length)} />
            <StatCard eyebrow="Showcase" value={String(topic.showcase.length)} />
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <DashboardSection eyebrow="Top personas">
              {topic.topPeople.length === 0 ? (
                <p className="py-3 text-sm text-gray-400">Sin personas.</p>
              ) : (
                topic.topPeople.map((p) => (
                  <Link
                    key={p.jid}
                    href={`/admin/comunidad/personas/${encodeURIComponent(p.jid)}`}
                    className="flex items-baseline justify-between gap-3 py-3"
                  >
                    <span className="truncate text-sm text-gray-800 hover:underline dark:text-gray-100">
                      {p.name || p.phone}
                    </span>
                    <span className="shrink-0 font-mono text-xs text-gray-400">{p.count}</span>
                  </Link>
                ))
              )}
            </DashboardSection>

            <DashboardSection eyebrow="Contribuyentes">
              {topic.contributors.length === 0 ? (
                <p className="py-3 text-sm text-gray-400">Sin contribuyentes.</p>
              ) : (
                topic.contributors.map((c) => (
                  <div key={`${c.name}-${c.jid ?? "x"}`} className="flex items-baseline justify-between gap-3 py-3">
                    <span className="truncate text-sm text-gray-800 dark:text-gray-100">{c.name}</span>
                    <span className="shrink-0 font-mono text-[10px] uppercase tracking-wide text-gray-400">
                      {c.sources.join(" · ")}
                    </span>
                  </div>
                ))
              )}
            </DashboardSection>
          </div>

          <div className="mt-4 rounded-2xl border border-black/5 bg-white p-6 dark:border-white/10 dark:bg-neutral-900">
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500">Mensajes recientes</p>
            <div className="mt-2 flex flex-col divide-y divide-black/5 dark:divide-white/10">
              {topic.recentMessages.length === 0 ? (
                <p className="py-3 text-sm text-gray-400">Sin mensajes.</p>
              ) : (
                topic.recentMessages.map((m) => (
                  <div key={m.id} className="py-3">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="truncate text-sm font-medium text-gray-800 dark:text-gray-100">
                        {m.sender_name || m.sender_phone}
                      </span>
                      <span className="shrink-0 text-[11px] font-medium text-gray-400">
                        {m.group_alias} · {timeLabel(m.ts)}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">{m.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify build + manual**

Run: `pnpm build`
Expected: succeeds; `/admin/comunidad/temas/[slug]` listed as a dynamic route.

Manual: click a topic from the list → detail shows menciones, top personas (linking to person detail), contribuyentes, recent messages. Back link returns to the list.

- [ ] **Step 3: Commit**

```bash
cd "/Volumes/VELLENT USB/Sites/aibuilders"
git add "app/(admin)/admin/comunidad/temas/[slug]/page.tsx"
git commit -m "feat(comunidad): topic detail page"
```

---

### Task 4: Personas list page

**Files:**
- Create: `app/(admin)/admin/comunidad/personas/page.tsx`

**Interfaces:**
- Consumes: `getPeople`, `parseRange`, `RangeChannelPicker`.
- Produces: route `/admin/comunidad/personas`.

- [ ] **Step 1: Create the Personas list page**

Create `app/(admin)/admin/comunidad/personas/page.tsx`:

```tsx
import Link from "next/link";
import { getPeople } from "@/lib/aiby/client";
import { parseRange } from "@/lib/aiby/range";
import { RangeChannelPicker } from "../components/range-channel-picker";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

function buildHref(sp: Record<string, string | string[] | undefined>, page: number): string {
  const params = new URLSearchParams();
  const preset = typeof sp.preset === "string" ? sp.preset : undefined;
  const group = typeof sp.group === "string" ? sp.group : undefined;
  if (preset) params.set("preset", preset);
  if (group) params.set("group", group);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/admin/comunidad/personas?${qs}` : "/admin/comunidad/personas";
}

export default async function PersonasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const range = parseRange(sp);
  const pageRaw = Number.parseInt(typeof sp.page === "string" ? sp.page : "1", 10);
  const page = Number.isNaN(pageRaw) || pageRaw < 1 ? 1 : pageRaw;
  const offset = (page - 1) * PAGE_SIZE;

  let people: Awaited<ReturnType<typeof getPeople>>["people"] = [];
  let error: string | null = null;
  try {
    const res = await getPeople(range, { offset, limit: PAGE_SIZE });
    people = res.people;
  } catch {
    error = "No se pudo cargar la data del bot.";
  }

  const hasPrev = page > 1;
  const hasNext = people.length === PAGE_SIZE;

  return (
    <div>
      <p className="text-xs font-medium text-gray-400 dark:text-gray-500">Comunidad</p>
      <h1 className="mt-1 text-3xl font-medium text-gray-800 dark:text-gray-100">Personas</h1>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Miembros activos, rankeados por mensajes.
      </p>

      <div className="mt-6">
        <RangeChannelPicker channels={[]} />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-black/5 bg-white dark:border-white/10 dark:bg-neutral-900">
        {error ? (
          <p className="px-6 py-16 text-center text-sm text-gray-400">{error}</p>
        ) : people.length === 0 ? (
          <p className="px-6 py-16 text-center text-sm text-gray-400">Sin personas en este rango.</p>
        ) : (
          <ul className="divide-y divide-black/5 dark:divide-white/10">
            {people.map((p, i) => (
              <li key={p.jid}>
                <Link
                  href={`/admin/comunidad/personas/${encodeURIComponent(p.jid)}`}
                  className="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-6 py-3 transition hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
                >
                  <span className="w-6 text-right font-mono text-xs text-gray-300 dark:text-gray-600">
                    {offset + i + 1}
                  </span>
                  <span className="truncate text-sm font-medium text-gray-800 hover:underline dark:text-gray-100">
                    {p.name || p.phone}
                  </span>
                  <span className="font-mono text-xs text-gray-400 dark:text-gray-500">
                    {p.count.toLocaleString("es-MX")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {(hasPrev || hasNext) && (
        <div className="mt-6 flex items-center justify-between gap-4">
          <p className="text-xs font-medium text-gray-400 dark:text-gray-500">Página {page}</p>
          <div className="flex items-center gap-2">
            <Pager href={buildHref(sp, page - 1)} disabled={!hasPrev}>Anterior</Pager>
            <Pager href={buildHref(sp, page + 1)} disabled={!hasNext}>Siguiente</Pager>
          </div>
        </div>
      )}
    </div>
  );
}

function Pager({ href, disabled, children }: { href: string; disabled: boolean; children: React.ReactNode }) {
  const base = "rounded-full border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.15em] transition";
  if (disabled) {
    return <span className={`${base} cursor-not-allowed border-black/5 text-gray-300 dark:border-white/5 dark:text-gray-600`}>{children}</span>;
  }
  return <Link href={href} className={`${base} border-black/10 text-gray-700 hover:bg-black/5 dark:border-white/15 dark:text-gray-200 dark:hover:bg-white/10`}>{children}</Link>;
}
```

- [ ] **Step 2: Add the sidebar entry for Personas**

In `app/(admin)/admin/components/admin-shell.tsx`, add `UserRound` to the lucide import and a NAV entry under "Comunidad" after "Temas":

```typescript
import { Home, Mail, Users, MessageCircle, Hash, UserRound, Menu, X, ChevronUp } from "lucide-react";
```

```typescript
  { href: "/admin/comunidad/temas", label: "Temas", section: "Comunidad", icon: Hash },
  { href: "/admin/comunidad/personas", label: "Personas", section: "Comunidad", icon: UserRound },
  { href: "/admin/contactos", label: "Contactos", section: "Comunidad", icon: Users },
```

- [ ] **Step 3: Verify build + manual**

Run: `pnpm build`
Expected: succeeds; `/admin/comunidad/personas` listed.

Manual: ranked people list, range filter works, pagination works.

- [ ] **Step 4: Commit**

```bash
cd "/Volumes/VELLENT USB/Sites/aibuilders"
git add "app/(admin)/admin/comunidad/personas/page.tsx" "app/(admin)/admin/components/admin-shell.tsx"
git commit -m "feat(comunidad): Personas ranked list page + sidebar entry"
```

---

### Task 5: Person detail page

**Files:**
- Create: `app/(admin)/admin/comunidad/personas/[jid]/page.tsx`

**Interfaces:**
- Consumes: `getPerson(jid, range)` from Task 1, `parseRange`.
- Produces: route `/admin/comunidad/personas/[jid]`.

- [ ] **Step 1: Create the person detail page**

Create `app/(admin)/admin/comunidad/personas/[jid]/page.tsx`:

```tsx
import Link from "next/link";
import { getPerson } from "@/lib/aiby/client";
import { parseRange } from "@/lib/aiby/range";
import { StatCard } from "../../../components/stat-card";
import { DashboardSection } from "../../../components/dashboard-section";

export const dynamic = "force-dynamic";

function timeLabel(ts: string): string {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  }).format(new Date(ts));
}

export default async function PersonDetail({
  params,
  searchParams,
}: {
  params: Promise<{ jid: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { jid } = await params;
  const range = parseRange(await searchParams);

  let person: Awaited<ReturnType<typeof getPerson>> | null = null;
  let error: string | null = null;
  try {
    person = await getPerson(decodeURIComponent(jid), range);
  } catch {
    error = "No se pudo cargar la persona.";
  }

  return (
    <div>
      <Link
        href="/admin/comunidad/personas"
        className="font-mono text-[11px] uppercase tracking-[0.15em] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      >
        ← Personas
      </Link>

      {error || !person ? (
        <p className="mt-8 rounded-2xl border border-black/5 bg-white p-6 text-sm text-gray-500 dark:border-white/10 dark:bg-neutral-900">
          {error ?? "Sin datos."}
        </p>
      ) : (
        <>
          <h1 className="mt-3 text-3xl font-medium text-gray-800 dark:text-gray-100">
            {person.name || person.phone}
          </h1>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <StatCard eyebrow="Mensajes" value={person.messageCount.toLocaleString("es-MX")} />
            <StatCard eyebrow="Top topics" value={String(person.topTopics.length)} />
            <StatCard eyebrow="Showcase" value={String(person.showcase.length)} />
          </div>

          {person.profile && (
            <div className="mt-8 rounded-2xl border border-black/5 bg-white p-6 dark:border-white/10 dark:bg-neutral-900">
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500">Perfil</p>
              {person.profile.expertise.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {person.profile.expertise.map((e) => (
                    <span key={e} className="rounded-full border border-black/10 px-3 py-1 text-xs text-gray-700 dark:border-white/15 dark:text-gray-200">
                      {e}
                    </span>
                  ))}
                </div>
              )}
              {person.profile.style_notes && (
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">{person.profile.style_notes}</p>
              )}
              {person.profile.links_authored.length > 0 && (
                <ul className="mt-3 flex flex-col gap-1">
                  {person.profile.links_authored.slice(0, 8).map((l) => (
                    <li key={l} className="truncate text-sm">
                      <a href={l} target="_blank" rel="noreferrer" className="text-gray-600 underline hover:text-gray-900 dark:text-gray-300">
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <DashboardSection eyebrow="Top topics">
              {person.topTopics.length === 0 ? (
                <p className="py-3 text-sm text-gray-400">Sin topics.</p>
              ) : (
                person.topTopics.map((t) => (
                  <Link
                    key={t.slug}
                    href={`/admin/comunidad/temas/${encodeURIComponent(t.slug)}`}
                    className="flex items-baseline justify-between gap-3 py-3"
                  >
                    <span className="truncate text-sm text-gray-800 hover:underline dark:text-gray-100">
                      {t.display_name}
                    </span>
                    <span className="shrink-0 font-mono text-xs text-gray-400">{t.count}</span>
                  </Link>
                ))
              )}
            </DashboardSection>

            <DashboardSection eyebrow="Mensajes recientes">
              {person.recentMessages.length === 0 ? (
                <p className="py-3 text-sm text-gray-400">Sin mensajes.</p>
              ) : (
                person.recentMessages.map((m) => (
                  <div key={m.id} className="py-3">
                    <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-300">{m.text}</p>
                    <p className="mt-1 text-[11px] font-medium text-gray-400">
                      {m.group_alias} · {timeLabel(m.ts)}
                    </p>
                  </div>
                ))
              )}
            </DashboardSection>
          </div>
        </>
      )}
    </div>
  );
}
```

Note: the `[jid]` route param arrives URL-encoded; `decodeURIComponent(jid)` restores the raw jid before the client re-encodes it for the bot path.

- [ ] **Step 2: Full verification**

Run: `pnpm test`
Expected: all suites pass.

Run: `pnpm lint`
Expected: no errors.

Run: `pnpm build`
Expected: succeeds; `/admin/comunidad/personas/[jid]` listed.

- [ ] **Step 3: Manual test checklist (`pnpm dev`, logged in)**

  - `/admin/comunidad/temas` — ranked list, range filter, pagination.
  - Topic detail — menciones, top personas (→ person detail), contribuyentes, recent messages, back link.
  - `/admin/comunidad/personas` — ranked list, pagination.
  - Person detail — perfil (expertise chips, links), top topics (→ topic detail), recent messages, back link.
  - Sidebar shows Pulso / Temas / Personas / Contactos under "Comunidad"; active highlight correct.
  - Mobile width: lists and cards stack.

- [ ] **Step 4: Commit**

```bash
cd "/Volumes/VELLENT USB/Sites/aibuilders"
git add "app/(admin)/admin/comunidad/personas/[jid]/page.tsx"
git commit -m "feat(comunidad): person detail page + Fase 2 verification"
```

---

## Self-Review Notes

- **Spec coverage (Fase 2):** Temas list ✓ (Task 2), topic detail ✓ (Task 3), Personas list ✓ (Task 4), person detail ✓ (Task 5), client/types ✓ (Task 1). Graph viz intentionally **dropped** (brainstorming decision) — not a gap. Jobs/Showcase + bot cleanup are Fases 3–4.
- **Type consistency:** `getTopics`/`getPeople`/`getTopic`/`getPerson` and `TopicsPage`/`PeoplePage`/`TopicDetailData`/`PersonDetailData` defined in Task 1, consumed by name in Tasks 2–5. Cross-links between topic↔person detail use `encodeURIComponent` on slug/jid consistently; person detail `decodeURIComponent`s the route param before re-encoding.
- **Pagination:** cursor-less (`hasNext = rows.length === PAGE_SIZE`) because the bot's `/topics` and `/people` return no `total`. Documented in the plan header.
- **No placeholders:** every page/test/command step shows full content.
- **Hover styling:** title spans use plain `hover:underline` (not `group-hover:`), which works without a `group` class on the `<Link>` container. Consistent across Temas/Personas lists and detail cross-links.
