# Comunidad Dashboard — Fase 3 (Jobs + Showcase) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the **Jobs** page (filterable vacancy list with an inline status control — the section's only write) and the read-only **Showcase** feed to `/admin/comunidad`.

**Architecture:** Extends `lib/aiby/{types,client}.ts` with `getJobs`, `getShowcase`, and `patchJobStatus` (the first non-GET call). A new `lib/actions/aiby.ts` server action wraps `patchJobStatus` behind the admin auth gate and revalidates the jobs route. The Jobs status control is a small client component calling that action; everything else stays server-rendered. Filters (`mode`/`status`/`search`) flow through URL query params, matching the bot API's `/jobs` filter surface exactly.

**Tech Stack:** Next.js 16 (App Router, Server Components + Server Actions), TypeScript, Tailwind 4, vitest.

## Global Constraints

- Package manager is **pnpm** only — never npm/yarn.
- All user-facing copy in **Spanish (es_MX)**.
- Palette is binary: black `#212121` + white; neutrals `black/5 /10 /20 /40 /60`; status `green-500`/`red-500` only.
- `AIBY_API_KEY` must never reach the client bundle — used only inside `lib/aiby/client.ts` (`import "server-only"`). The status write goes through a **server action**, never a client fetch.
- Follow the Fase 1–2 + admin pattern: server components call typed client functions; the one mutation uses a server action gated by `getUser()` (mirror `lib/actions/newsletter.ts`). Tests live in `tests/aiby/`, imported via `@/`; vitest aliases `server-only` to `tests/stubs/server-only.ts`.
- Test: `pnpm test`. Lint: `pnpm lint`. Build: `pnpm build`.

---

### Task 1: Extend types + client (jobs, showcase, status PATCH)

**Files:**
- Modify: `lib/aiby/types.ts` (append `JobPosting`, `JobsList`, `ShowcaseList`, `JobStatus`)
- Modify: `lib/aiby/client.ts` (append `getJobs`, `getShowcase`, `patchJobStatus`, plus a private `patch` helper)
- Create: `tests/aiby/client-jobs.test.ts`

**Interfaces:**
- Consumes: `get<T>`/`config`/`buildUrl`/`AibyApiError`/`AibyRange` internals in `lib/aiby/client.ts`.
- Produces:
  - `type JobStatus = "open" | "closed" | "hidden"`
  - `getJobs(range: AibyRange, filters?: { mode?: string; tag?: string; status?: string; search?: string; limit?: number; offset?: number }): Promise<JobsList>`
  - `getShowcase(range: AibyRange, limit?: number): Promise<ShowcaseList>`
  - `patchJobStatus(id: number, status: JobStatus): Promise<{ ok: boolean; id: number; status: string }>`
  - Interfaces `JobPosting`, `JobsList`, `ShowcaseList`.

- [ ] **Step 1: Append the interfaces to `lib/aiby/types.ts`**

Add at the end of `lib/aiby/types.ts` (ported verbatim from `aibuilders-bot/dashboard/src/api.ts`):

```typescript
export type JobStatus = "open" | "closed" | "hidden";

export interface JobPosting {
  id: number;
  date: string;
  first_ts: string;
  last_ts: string;
  group_alias: string;
  sender_jid: string;
  sender_phone: string;
  sender_name: string | null;
  title: string;
  company: string | null;
  summary: string;
  location: string | null;
  mode: string | null;
  seniority: string | null;
  employment_type: string | null;
  stack: string[];
  salary: string | null;
  contact: string | null;
  links: string[];
  tags: string[];
  raw_text: string;
  source_msg_ids: number[];
  status: string;
}

export interface JobsList {
  range: { fromDate: string; toDate: string };
  items: JobPosting[];
  total: number;
  facets: {
    modes: Array<{ key: string; count: number }>;
    tags: Array<{ key: string; count: number }>;
  };
}

export interface ShowcaseList {
  range: { fromDate: string; toDate: string };
  group: string | null;
  items: Array<{
    id: number; date: string; group_alias: string; author_name: string | null; author_jid: string;
    title: string; description: string; links: string[]; tags: string[]; reaction_score: number;
  }>;
}
```

- [ ] **Step 2: Write the failing test**

Create `tests/aiby/client-jobs.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("aiby client — jobs + showcase", () => {
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

  it("getJobs forwards mode/status/search filters and skips blanks", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const { getJobs } = await import("@/lib/aiby/client");
    await getJobs({ preset: "month" }, { mode: "remote", status: "open", search: "", limit: 50 });
    expect(String(fetchMock.mock.calls[0][0])).toBe(
      "https://bot.example/dashboard/api/jobs?preset=month&mode=remote&status=open&limit=50",
    );
  });

  it("getShowcase forwards the limit", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const { getShowcase } = await import("@/lib/aiby/client");
    await getShowcase({ preset: "week" }, 20);
    expect(String(fetchMock.mock.calls[0][0])).toBe(
      "https://bot.example/dashboard/api/showcase?preset=week&limit=20",
    );
  });

  it("patchJobStatus PATCHes the id with a JSON status body + api key", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true, id: 7, status: "closed" }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const { patchJobStatus } = await import("@/lib/aiby/client");
    const res = await patchJobStatus(7, "closed");
    const [url, opts] = fetchMock.mock.calls[0];
    expect(String(url)).toBe("https://bot.example/dashboard/api/jobs/7");
    expect(opts.method).toBe("PATCH");
    expect((opts.headers as Record<string, string>)["x-api-key"]).toBe("secret-key");
    expect((opts.headers as Record<string, string>)["Content-Type"]).toBe("application/json");
    expect(JSON.parse(opts.body as string)).toEqual({ status: "closed" });
    expect(res).toEqual({ ok: true, id: 7, status: "closed" });
  });

  it("patchJobStatus throws AibyApiError on non-2xx", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("no", { status: 500 })));
    const { patchJobStatus, AibyApiError } = await import("@/lib/aiby/client");
    await expect(patchJobStatus(1, "hidden")).rejects.toBeInstanceOf(AibyApiError);
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `pnpm test tests/aiby/client-jobs.test.ts`
Expected: FAIL — `getJobs is not a function`.

- [ ] **Step 4: Extend `lib/aiby/client.ts`**

Add the new types to the import block at the top:

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
  JobsList,
  ShowcaseList,
  JobStatus,
} from "./types";
```

Append a `patch` helper (the GET `get<T>` already exists from Fase 1) and the three functions at the end of the file:

```typescript
async function patch<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const { base, key } = config();
  const res = await fetch(`${base}/dashboard/api${path}`, {
    method: "PATCH",
    headers: { "x-api-key": key, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new AibyApiError(`aiby API ${res.status} en PATCH ${path}`, res.status);
  }
  return (await res.json()) as T;
}

export const getJobs = (
  range: AibyRange,
  filters?: { mode?: string; tag?: string; status?: string; search?: string; limit?: number; offset?: number },
) =>
  get<JobsList>("/jobs", range, {
    mode: filters?.mode,
    tag: filters?.tag,
    status: filters?.status,
    search: filters?.search,
    limit: filters?.limit,
    offset: filters?.offset,
  });

export const getShowcase = (range: AibyRange, limit = 30) =>
  get<ShowcaseList>("/showcase", range, { limit });

export const patchJobStatus = (id: number, status: JobStatus) =>
  patch<{ ok: boolean; id: number; status: string }>(`/jobs/${id}`, { status });
```

Note: `get<T>`'s `extra` loop already skips `undefined`/`null`/`""`, so blank filters drop out of the URL (the test's `search: ""` is omitted). `config` and `AibyApiError` are already defined in the file.

- [ ] **Step 5: Run the test to verify it passes**

Run: `pnpm test tests/aiby/client-jobs.test.ts`
Expected: PASS (4 passing).

- [ ] **Step 6: Run the full aiby suite**

Run: `pnpm test tests/aiby`
Expected: all aiby suites pass.

- [ ] **Step 7: Commit**

```bash
cd "/Volumes/VELLENT USB/Sites/aibuilders"
git add lib/aiby/types.ts lib/aiby/client.ts tests/aiby/client-jobs.test.ts
git commit -m "feat(comunidad): client functions for jobs, showcase + status PATCH"
```

---

### Task 2: Server action for job status

**Files:**
- Create: `lib/actions/aiby.ts`

**Interfaces:**
- Consumes: `patchJobStatus` + `JobStatus` from Task 1; `getUser` from `@/lib/auth`; `revalidatePath` from `next/cache`.
- Produces: `updateJobStatus(id: number, status: JobStatus): Promise<{ ok: true } | { error: string }>` — server action consumed by the Jobs status control (Task 3).

- [ ] **Step 1: Create the server action**

Create `lib/actions/aiby.ts` (mirrors the gate pattern in `lib/actions/newsletter.ts`):

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/auth";
import { patchJobStatus, AibyApiError } from "@/lib/aiby/client";
import type { JobStatus } from "@/lib/aiby/types";

const JOBS_PATH = "/admin/comunidad/jobs";
const VALID: JobStatus[] = ["open", "closed", "hidden"];

export async function updateJobStatus(
  id: number,
  status: JobStatus,
): Promise<{ ok: true } | { error: string }> {
  const user = await getUser();
  if (!user) return { error: "No autorizado." };
  if (!VALID.includes(status)) return { error: "Status inválido." };

  try {
    await patchJobStatus(id, status);
  } catch (e) {
    const msg = e instanceof AibyApiError ? `Error del bot (${e.status}).` : "No se pudo actualizar.";
    return { error: msg };
  }

  revalidatePath(JOBS_PATH);
  return { ok: true };
}
```

- [ ] **Step 2: Verify it typechecks via build**

Run: `pnpm build`
Expected: succeeds (no route yet consumes it, but the module must compile).

- [ ] **Step 3: Commit**

```bash
cd "/Volumes/VELLENT USB/Sites/aibuilders"
git add lib/actions/aiby.ts
git commit -m "feat(comunidad): server action to update job status"
```

---

### Task 3: Jobs page with filters + inline status control

**Files:**
- Create: `app/(admin)/admin/comunidad/jobs/components/job-status-control.tsx`
- Create: `app/(admin)/admin/comunidad/jobs/page.tsx`
- Modify: `app/(admin)/admin/components/admin-shell.tsx` (sidebar entry)

**Interfaces:**
- Consumes: `getJobs` (Task 1), `parseRange`, `updateJobStatus` (Task 2).
- Produces: route `/admin/comunidad/jobs`.

- [ ] **Step 1: Create the status control (client component)**

Create `app/(admin)/admin/comunidad/jobs/components/job-status-control.tsx`:

```tsx
"use client";

import { useState, useTransition } from "react";
import { updateJobStatus } from "@/lib/actions/aiby";
import type { JobStatus } from "@/lib/aiby/types";

const OPTIONS: { value: JobStatus; label: string }[] = [
  { value: "open", label: "Abierta" },
  { value: "closed", label: "Cerrada" },
  { value: "hidden", label: "Oculta" },
];

export function JobStatusControl({ jobId, status }: { jobId: number; status: string }) {
  const [current, setCurrent] = useState<string>(status);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onChange(next: JobStatus) {
    const prev = current;
    setCurrent(next);
    setError(null);
    startTransition(async () => {
      const res = await updateJobStatus(jobId, next);
      if ("error" in res) {
        setCurrent(prev);
        setError(res.error);
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <select
        aria-label="Status de la vacante"
        value={current}
        disabled={pending}
        onChange={(e) => onChange(e.target.value as JobStatus)}
        className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs text-gray-800 disabled:opacity-50 dark:border-white/15 dark:bg-neutral-900 dark:text-gray-100"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
```

- [ ] **Step 2: Create the Jobs page**

Create `app/(admin)/admin/comunidad/jobs/page.tsx`:

```tsx
import { getJobs } from "@/lib/aiby/client";
import { parseRange } from "@/lib/aiby/range";
import { RangeChannelPicker } from "../components/range-channel-picker";
import { JobStatusControl } from "./components/job-status-control";

export const dynamic = "force-dynamic";

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "", label: "Todas" },
  { value: "open", label: "Abiertas" },
  { value: "closed", label: "Cerradas" },
  { value: "hidden", label: "Ocultas" },
];

function str(v: string | string[] | undefined): string {
  return typeof v === "string" ? v : "";
}

function filterHref(
  sp: Record<string, string | string[] | undefined>,
  patch: Record<string, string>,
): string {
  const params = new URLSearchParams();
  for (const k of ["preset", "group", "mode", "status", "q"]) {
    const v = str(sp[k]);
    if (v) params.set(k, v);
  }
  for (const [k, v] of Object.entries(patch)) {
    if (v) params.set(k, v);
    else params.delete(k);
  }
  const qs = params.toString();
  return qs ? `/admin/comunidad/jobs?${qs}` : "/admin/comunidad/jobs";
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const range = parseRange(sp);
  const status = str(sp.status);
  const mode = str(sp.mode);
  const search = str(sp.q);

  let data: Awaited<ReturnType<typeof getJobs>> | null = null;
  let error: string | null = null;
  try {
    data = await getJobs(range, { status, mode, search, limit: 100 });
  } catch {
    error = "No se pudo cargar la data del bot.";
  }

  const items = data?.items ?? [];

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-gray-400 dark:text-gray-500">Comunidad</p>
          <h1 className="mt-1 text-3xl font-medium text-gray-800 dark:text-gray-100">Jobs</h1>
        </div>
        {data && (
          <p className="text-xs font-medium text-gray-400 dark:text-gray-500">
            {data.total.toLocaleString("es-MX")} total
          </p>
        )}
      </div>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Vacantes posteadas en la comunidad. Cambia su status para curar.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <RangeChannelPicker channels={[]} />
        <form method="get" className="flex flex-wrap items-center gap-2">
          {range.preset && <input type="hidden" name="preset" value={range.preset} />}
          {mode && <input type="hidden" name="mode" value={mode} />}
          {status && <input type="hidden" name="status" value={status} />}
          <input
            type="search"
            name="q"
            defaultValue={search}
            placeholder="Buscar vacante…"
            className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm text-gray-800 outline-none dark:border-white/15 dark:bg-neutral-900 dark:text-gray-100"
          />
        </form>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => {
          const active = status === f.value;
          return (
            <a
              key={f.value || "all"}
              href={filterHref(sp, { status: f.value })}
              className={`rounded-full border px-3 py-1.5 text-xs transition ${
                active
                  ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                  : "border-black/10 text-gray-600 hover:bg-black/5 dark:border-white/15 dark:text-gray-300 dark:hover:bg-white/10"
              }`}
            >
              {f.label}
            </a>
          );
        })}
        {data && data.facets.modes.length > 0 && (
          <span className="mx-1 self-center text-black/10 dark:text-white/15">|</span>
        )}
        {data?.facets.modes.map((m) => {
          const active = mode === m.key;
          return (
            <a
              key={m.key}
              href={filterHref(sp, { mode: active ? "" : m.key })}
              className={`rounded-full border px-3 py-1.5 text-xs transition ${
                active
                  ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                  : "border-black/10 text-gray-600 hover:bg-black/5 dark:border-white/15 dark:text-gray-300 dark:hover:bg-white/10"
              }`}
            >
              {m.key} ({m.count})
            </a>
          );
        })}
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {error ? (
          <p className="rounded-2xl border border-black/5 bg-white px-6 py-16 text-center text-sm text-gray-400 dark:border-white/10 dark:bg-neutral-900">
            {error}
          </p>
        ) : items.length === 0 ? (
          <p className="rounded-2xl border border-black/5 bg-white px-6 py-16 text-center text-sm text-gray-400 dark:border-white/10 dark:bg-neutral-900">
            Sin vacantes con estos filtros.
          </p>
        ) : (
          items.map((j) => (
            <div
              key={j.id}
              className="rounded-2xl border border-black/5 bg-white p-5 dark:border-white/10 dark:bg-neutral-900"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="truncate text-base font-medium text-gray-800 dark:text-gray-100">
                    {j.title}
                  </h2>
                  <p className="mt-0.5 text-xs font-medium text-gray-400 dark:text-gray-500">
                    {[j.company, j.location, j.mode, j.seniority].filter(Boolean).join(" · ") || "—"}
                  </p>
                </div>
                <JobStatusControl jobId={j.id} status={j.status} />
              </div>
              <p className="mt-3 line-clamp-3 text-sm text-gray-500 dark:text-gray-400">{j.summary}</p>
              {(j.stack.length > 0 || j.links.length > 0) && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {j.stack.slice(0, 8).map((s) => (
                    <span
                      key={s}
                      className="rounded-full border border-black/10 px-2.5 py-0.5 text-[11px] text-gray-600 dark:border-white/15 dark:text-gray-300"
                    >
                      {s}
                    </span>
                  ))}
                  {j.links.slice(0, 3).map((l) => (
                    <a
                      key={l}
                      href={l}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-gray-500 underline hover:text-gray-800 dark:text-gray-400"
                    >
                      link
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Add the Jobs sidebar entry**

In `app/(admin)/admin/components/admin-shell.tsx`, add `Briefcase` to the lucide import and a NAV entry under "Comunidad" after "Personas":

```typescript
import { Home, Mail, Users, MessageCircle, Hash, UserRound, Briefcase, Menu, X, ChevronUp } from "lucide-react";
```

```typescript
  { href: "/admin/comunidad/personas", label: "Personas", section: "Comunidad", icon: UserRound },
  { href: "/admin/comunidad/jobs", label: "Jobs", section: "Comunidad", icon: Briefcase },
  { href: "/admin/contactos", label: "Contactos", section: "Comunidad", icon: Users },
```

- [ ] **Step 4: Verify build + manual**

Run: `pnpm build`
Expected: succeeds; `/admin/comunidad/jobs` listed.

Manual (`pnpm dev`, logged in): `/admin/comunidad/jobs` lists vacancies; status filter chips + mode facet chips + search narrow the list; changing a job's status via the select persists (reload shows the new status), and the "Ocultas" filter then includes it.

- [ ] **Step 5: Commit**

```bash
cd "/Volumes/VELLENT USB/Sites/aibuilders"
git add "app/(admin)/admin/comunidad/jobs" "app/(admin)/admin/components/admin-shell.tsx"
git commit -m "feat(comunidad): Jobs page with filters + inline status control"
```

---

### Task 4: Showcase feed (read-only)

**Files:**
- Create: `app/(admin)/admin/comunidad/showcase/page.tsx`
- Modify: `app/(admin)/admin/components/admin-shell.tsx` (sidebar entry)

**Interfaces:**
- Consumes: `getShowcase` (Task 1), `parseRange`, `RangeChannelPicker`.
- Produces: route `/admin/comunidad/showcase`.

- [ ] **Step 1: Create the Showcase page**

Create `app/(admin)/admin/comunidad/showcase/page.tsx`:

```tsx
import { getShowcase } from "@/lib/aiby/client";
import { parseRange } from "@/lib/aiby/range";
import { RangeChannelPicker } from "../components/range-channel-picker";

export const dynamic = "force-dynamic";

const dateFmt = new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "short", year: "numeric" });

export default async function ShowcasePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const range = parseRange(await searchParams);

  let items: Awaited<ReturnType<typeof getShowcase>>["items"] = [];
  let error: string | null = null;
  try {
    const res = await getShowcase(range, 40);
    items = res.items;
  } catch {
    error = "No se pudo cargar la data del bot.";
  }

  return (
    <div>
      <p className="text-xs font-medium text-gray-400 dark:text-gray-500">Comunidad</p>
      <h1 className="mt-1 text-3xl font-medium text-gray-800 dark:text-gray-100">Showcase</h1>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Proyectos que la comunidad presume, rankeados por reacciones.
      </p>

      <div className="mt-6">
        <RangeChannelPicker channels={[]} />
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {error ? (
          <p className="rounded-2xl border border-black/5 bg-white px-6 py-16 text-center text-sm text-gray-400 dark:border-white/10 dark:bg-neutral-900">
            {error}
          </p>
        ) : items.length === 0 ? (
          <p className="rounded-2xl border border-black/5 bg-white px-6 py-16 text-center text-sm text-gray-400 dark:border-white/10 dark:bg-neutral-900">
            Sin proyectos en este rango.
          </p>
        ) : (
          items.map((s) => (
            <div
              key={s.id}
              className="rounded-2xl border border-black/5 bg-white p-5 dark:border-white/10 dark:bg-neutral-900"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="truncate text-base font-medium text-gray-800 dark:text-gray-100">
                    {s.title}
                  </h2>
                  <p className="mt-0.5 text-xs font-medium text-gray-400 dark:text-gray-500">
                    {[s.author_name || "Anónimo", dateFmt.format(new Date(s.date))].join(" · ")}
                  </p>
                </div>
                <span className="shrink-0 font-mono text-xs text-gray-400 dark:text-gray-500">
                  ★ {Math.round(s.reaction_score)}
                </span>
              </div>
              <p className="mt-3 line-clamp-3 text-sm text-gray-500 dark:text-gray-400">{s.description}</p>
              {(s.tags.length > 0 || s.links.length > 0) && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {s.tags.slice(0, 8).map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-black/10 px-2.5 py-0.5 text-[11px] text-gray-600 dark:border-white/15 dark:text-gray-300"
                    >
                      {t}
                    </span>
                  ))}
                  {s.links.slice(0, 3).map((l) => (
                    <a
                      key={l}
                      href={l}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-gray-500 underline hover:text-gray-800 dark:text-gray-400"
                    >
                      link
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add the Showcase sidebar entry**

In `app/(admin)/admin/components/admin-shell.tsx`, add `Sparkles` to the lucide import and a NAV entry under "Comunidad" after "Jobs":

```typescript
import { Home, Mail, Users, MessageCircle, Hash, UserRound, Briefcase, Sparkles, Menu, X, ChevronUp } from "lucide-react";
```

```typescript
  { href: "/admin/comunidad/jobs", label: "Jobs", section: "Comunidad", icon: Briefcase },
  { href: "/admin/comunidad/showcase", label: "Showcase", section: "Comunidad", icon: Sparkles },
  { href: "/admin/contactos", label: "Contactos", section: "Comunidad", icon: Users },
```

- [ ] **Step 3: Full verification**

Run: `pnpm test`
Expected: all suites pass.

Run: `pnpm lint`
Expected: no errors.

Run: `pnpm build`
Expected: succeeds; `/admin/comunidad/showcase` listed.

- [ ] **Step 4: Confirm the API key still never reaches the client bundle**

Run:
```bash
cd "/Volumes/VELLENT USB/Sites/aibuilders" && grep -rl "AIBY_API_KEY" .next/static 2>/dev/null && echo "LEAK!" || echo "clean — key not in client bundle"
```
Expected: `clean — key not in client bundle`.

- [ ] **Step 5: Manual test checklist (`pnpm dev`, logged in)**

  - `/admin/comunidad/jobs` — list, status/mode filter chips, search, status select persists on reload.
  - `/admin/comunidad/showcase` — ranked project feed, tags + links render.
  - Sidebar: Pulso / Temas / Personas / Jobs / Showcase / Contactos under "Comunidad".
  - Mobile width: cards stack.

- [ ] **Step 6: Commit**

```bash
cd "/Volumes/VELLENT USB/Sites/aibuilders"
git add "app/(admin)/admin/comunidad/showcase/page.tsx" "app/(admin)/admin/components/admin-shell.tsx"
git commit -m "feat(comunidad): showcase feed + Fase 3 verification"
```

---

## Self-Review Notes

- **Spec coverage (Fase 3):** Jobs filterable list ✓ (Task 3), job status write via server action ✓ (Tasks 2–3), Showcase feed ✓ (Task 4), client/types/PATCH ✓ (Task 1). Republishing showcase/jobs to site/newsletter stays out of scope (spec "Fuera de scope"). Bot cleanup/hardening is Fase 4.
- **Filters:** `mode`/`status`/`search` match the bot `/jobs` query surface exactly (`tag` exists in the API but is not surfaced in UI — YAGNI; can add later from `facets.tags`). The `q` URL param maps to the API `search` filter.
- **Write safety:** the only mutation (`patchJobStatus`) runs server-side inside `updateJobStatus`, gated by `getUser()` and validated against `["open","closed","hidden"]`; the client control calls the action, never the bot directly. Key-not-in-bundle re-checked in Task 4.
- **Type consistency:** `JobStatus`, `JobsList`, `JobPosting`, `ShowcaseList`, `getJobs`, `getShowcase`, `patchJobStatus`, `updateJobStatus` defined in Tasks 1–2, consumed by name in Tasks 3–4.
- **No placeholders:** every page/test/command step shows full content.
