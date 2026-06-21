# Comunidad Dashboard — Fase 1 (Cliente + Pulso) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up a typed server-only client to the aiby-bridge API and a new `/admin/comunidad` "Pulso" page rendering KPIs, message volume, a channel donut, an activity heatmap, and a recent-messages feed.

**Architecture:** A single `lib/aiby/client.ts` (marked `server-only`) wraps `fetch` to the bot's public API with an `x-api-key` header from env. Admin pages are server components, already session-gated by `app/(admin)/admin/layout.tsx`. Charts use `recharts` themed strictly to the B/N design tokens; the heatmap is a plain CSS grid.

**Tech Stack:** Next.js 16 (App Router, Server Components), TypeScript, Tailwind 4, recharts, vitest.

## Global Constraints

- Package manager is **pnpm** only — never npm/yarn.
- All user-facing copy in **Spanish (es_MX)**.
- Palette is binary: black `#212121` + white; neutrals `black/5 /10 /20 /40 /60`; status `green-500`/`red-500` only. No other colors (greyscale/opacity for multi-series charts).
- `AIBY_API_KEY` must **never** reach the client bundle — used only inside `lib/aiby/client.ts` (`import "server-only"`).
- Follow the existing admin pattern: server components calling typed functions, no client data fetching, no new auth.
- Test runner: `pnpm test` (vitest, `vitest run`). Lint: `pnpm lint`. Build: `pnpm build`.

---

### Task 1: Types + server-only API client (with tests)

**Files:**
- Create: `lib/aiby/types.ts`
- Create: `lib/aiby/client.ts`
- Create: `lib/aiby/client.test.ts`
- Modify: `package.json` (add `server-only` dep)

**Interfaces:**
- Consumes: env `AIBY_API_BASE` (e.g. `https://aiby-bridge-production-xxxx.up.railway.app`), `AIBY_API_KEY`.
- Produces:
  - Type `AibyRange = { preset: "day"|"week"|"month"|"quarter"|"year"; group?: string | null }`
  - `getOverview(range: AibyRange): Promise<OverviewData>`
  - `getVolume(range: AibyRange): Promise<VolumeData>`
  - `getHeatmap(range: AibyRange): Promise<HeatmapData>`
  - `getRecent(range: AibyRange, limit?: number): Promise<RecentMessages>`
  - Plus exported interfaces `OverviewData`, `VolumeData`, `HeatmapData`, `RecentMessages` (ported verbatim from the bot).
  - Error class `AibyApiError extends Error` with `status: number`.

- [ ] **Step 1: Add the `server-only` dependency**

Run:
```bash
cd "/Volumes/VELLENT USB/Sites/aibuilders" && pnpm add server-only
```
Expected: `server-only` appears in `package.json` dependencies.

- [ ] **Step 2: Port the types**

Create `lib/aiby/types.ts` (copied verbatim from `aibuilders-bot/dashboard/src/api.ts`, only the data interfaces Fase 1 needs):

```typescript
// Tipos de las respuestas de la API de aiby-bridge (/dashboard/api/*).
// Portados de aibuilders-bot/dashboard/src/api.ts — mantener en sync si la API cambia.

export interface OverviewData {
  range: { preset: string; fromDate: string; toDate: string };
  group: string | null;
  totals: { messages: number; activePeople: number; topics: number; showcase: number };
  volumeByDay: Array<{ date: string; count: number }>;
  topPeople: Array<{ jid: string; name: string | null; phone: string; count: number }>;
  topTopics: Array<{ slug: string; display_name: string; count: number }>;
  groups: Array<{ alias: string; jid: string; count: number }>;
}

export interface VolumeData {
  range: { fromDate: string; toDate: string };
  // Cada fila: { date, [channelAlias]: count, ... }. Las llaves (menos `date`) son canales.
  series: Array<Record<string, number | string>>;
}

export interface HeatmapData {
  range: { fromDate: string; toDate: string };
  group: string | null;
  cells: Array<{ dow: number; hour: number; count: number }>;
}

export interface RecentMessages {
  range: { fromDate: string; toDate: string };
  group: string | null;
  messages: Array<{
    id: number; ts: string; group_alias: string; sender_jid: string;
    sender_name: string | null; sender_phone: string; text: string; is_image: number;
  }>;
}
```

- [ ] **Step 3: Write the failing test**

Create `lib/aiby/client.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const ENV = { AIBY_API_BASE: "https://bot.example", AIBY_API_KEY: "secret-key" };

describe("aiby client", () => {
  beforeEach(() => {
    process.env.AIBY_API_BASE = ENV.AIBY_API_BASE;
    process.env.AIBY_API_KEY = ENV.AIBY_API_KEY;
    vi.resetModules();
  });
  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.AIBY_API_BASE;
    delete process.env.AIBY_API_KEY;
  });

  it("calls the right URL with the api key header and query params", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ totals: { messages: 1 } }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const { getOverview } = await import("./client");

    await getOverview({ preset: "week", group: "general" });

    const [url, opts] = fetchMock.mock.calls[0];
    expect(String(url)).toBe("https://bot.example/dashboard/api/overview?preset=week&group=general");
    expect((opts.headers as Record<string, string>)["x-api-key"]).toBe("secret-key");
  });

  it("omits group when not provided", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const { getVolume } = await import("./client");
    await getVolume({ preset: "month" });
    expect(String(fetchMock.mock.calls[0][0])).toBe(
      "https://bot.example/dashboard/api/volume?preset=month",
    );
  });

  it("throws AibyApiError with status on non-2xx", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("nope", { status: 401 })));
    const { getOverview, AibyApiError } = await import("./client");
    await expect(getOverview({ preset: "day" })).rejects.toMatchObject({ status: 401 });
    await expect(getOverview({ preset: "day" })).rejects.toBeInstanceOf(AibyApiError);
  });

  it("throws a clear error when env is missing", async () => {
    delete process.env.AIBY_API_BASE;
    vi.stubGlobal("fetch", vi.fn());
    const { getOverview } = await import("./client");
    await expect(getOverview({ preset: "day" })).rejects.toThrow(/AIBY_API_BASE/);
  });
});
```

- [ ] **Step 4: Run the test to verify it fails**

Run: `pnpm test lib/aiby/client.test.ts`
Expected: FAIL — `Cannot find module './client'`.

- [ ] **Step 5: Implement the client**

Create `lib/aiby/client.ts`:

```typescript
import "server-only";
import type {
  OverviewData,
  VolumeData,
  HeatmapData,
  RecentMessages,
} from "./types";

export type AibyRange = {
  preset: "day" | "week" | "month" | "quarter" | "year";
  group?: string | null;
};

export class AibyApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "AibyApiError";
    this.status = status;
  }
}

function config(): { base: string; key: string } {
  const base = process.env.AIBY_API_BASE;
  const key = process.env.AIBY_API_KEY;
  if (!base) throw new Error("Falta AIBY_API_BASE en el entorno.");
  if (!key) throw new Error("Falta AIBY_API_KEY en el entorno.");
  return { base: base.replace(/\/$/, ""), key };
}

function buildUrl(
  base: string,
  path: string,
  range: AibyRange,
  extra?: Record<string, string | number | undefined | null>,
): string {
  const url = new URL(`/dashboard/api${path}`, base);
  url.searchParams.set("preset", range.preset);
  if (range.group) url.searchParams.set("group", range.group);
  if (extra) {
    for (const [k, v] of Object.entries(extra)) {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

async function get<T>(
  path: string,
  range: AibyRange,
  extra?: Record<string, string | number | undefined | null>,
): Promise<T> {
  const { base, key } = config();
  const res = await fetch(buildUrl(base, path, range, extra), {
    headers: { "x-api-key": key },
    // Métricas: cachear 60s, no necesitan ser al-segundo.
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    throw new AibyApiError(`aiby API ${res.status} en ${path}`, res.status);
  }
  return (await res.json()) as T;
}

export const getOverview = (range: AibyRange) => get<OverviewData>("/overview", range);
export const getVolume = (range: AibyRange) => get<VolumeData>("/volume", range);
export const getHeatmap = (range: AibyRange) => get<HeatmapData>("/heatmap", range);
export const getRecent = (range: AibyRange, limit = 30) =>
  get<RecentMessages>("/recent", range, { limit });
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `pnpm test lib/aiby/client.test.ts`
Expected: PASS (4 passing).

- [ ] **Step 7: Commit**

```bash
cd "/Volumes/VELLENT USB/Sites/aibuilders"
git add lib/aiby package.json pnpm-lock.yaml
git commit -m "feat(comunidad): server-only aiby-bridge API client + types"
```

---

### Task 2: Env config helper + sidebar entry + Pulso KPIs (end-to-end vertical slice)

**Files:**
- Create: `lib/aiby/range.ts`
- Create: `lib/aiby/range.test.ts`
- Create: `app/(admin)/admin/comunidad/page.tsx`
- Modify: `app/(admin)/admin/components/admin-shell.tsx:97-101` (NAV array)
- Modify: `.env.example` (document new vars; create if absent)

**Interfaces:**
- Consumes: `getOverview` from Task 1.
- Produces:
  - `parseRange(searchParams: Record<string, string | string[] | undefined>): AibyRange` in `lib/aiby/range.ts` — validates `preset` (defaults to `"week"`), passes `group` through (treats `"all"`/empty as undefined).
  - `RANGE_PRESETS: { value: AibyRange["preset"]; label: string }[]` (Spanish labels) — consumed by Task 3.

- [ ] **Step 1: Write the failing test for parseRange**

Create `lib/aiby/range.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { parseRange } from "./range";

describe("parseRange", () => {
  it("defaults to week with no group", () => {
    expect(parseRange({})).toEqual({ preset: "week", group: undefined });
  });
  it("accepts a valid preset and group", () => {
    expect(parseRange({ preset: "month", group: "general" })).toEqual({
      preset: "month",
      group: "general",
    });
  });
  it("falls back to week on an invalid preset", () => {
    expect(parseRange({ preset: "decade" })).toEqual({ preset: "week", group: undefined });
  });
  it("treats group=all as no filter", () => {
    expect(parseRange({ preset: "day", group: "all" })).toEqual({
      preset: "day",
      group: undefined,
    });
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test lib/aiby/range.test.ts`
Expected: FAIL — `Cannot find module './range'`.

- [ ] **Step 3: Implement range.ts**

Create `lib/aiby/range.ts`:

```typescript
import type { AibyRange } from "./client";

export const RANGE_PRESETS: { value: AibyRange["preset"]; label: string }[] = [
  { value: "day", label: "Hoy" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mes" },
  { value: "quarter", label: "Trimestre" },
  { value: "year", label: "Año" },
];

const VALID = new Set(RANGE_PRESETS.map((p) => p.value));

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export function parseRange(
  searchParams: Record<string, string | string[] | undefined>,
): AibyRange {
  const presetRaw = first(searchParams.preset);
  const preset = (VALID.has(presetRaw as AibyRange["preset"])
    ? presetRaw
    : "week") as AibyRange["preset"];
  const groupRaw = first(searchParams.group);
  const group = !groupRaw || groupRaw === "all" ? undefined : groupRaw;
  return { preset, group };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test lib/aiby/range.test.ts`
Expected: PASS (4 passing).

- [ ] **Step 5: Add the "Comunidad" sidebar entry**

In `app/(admin)/admin/components/admin-shell.tsx`, modify the `NAV` array (lines 97-101). Add `MessageCircle` to the lucide import on line 7, and add the entry under the existing "Comunidad" section so it groups with Contactos:

```typescript
import { Home, Mail, Users, MessageCircle, Menu, X, ChevronUp } from "lucide-react";
```

```typescript
const NAV: { href: string; label: string; section: string; icon: typeof Home; exact?: boolean }[] = [
  { href: "/admin", label: "Inicio", section: "General", icon: Home, exact: true },
  { href: "/admin/newsletter", label: "Newsletter", section: "The Build Log", icon: Mail },
  { href: "/admin/comunidad", label: "Pulso", section: "Comunidad", icon: MessageCircle },
  { href: "/admin/contactos", label: "Contactos", section: "Comunidad", icon: Users },
];
```

- [ ] **Step 6: Create the Pulso page with KPIs only**

Create `app/(admin)/admin/comunidad/page.tsx`:

```tsx
import { getOverview } from "@/lib/aiby/client";
import { parseRange } from "@/lib/aiby/range";
import { StatCard } from "../components/stat-card";

export const dynamic = "force-dynamic";

function formatCount(n: number): string {
  return new Intl.NumberFormat("es-MX").format(n);
}

export default async function ComunidadPulso({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const range = parseRange(await searchParams);

  let overview: Awaited<ReturnType<typeof getOverview>> | null = null;
  let error: string | null = null;
  try {
    overview = await getOverview(range);
  } catch {
    error = "No se pudo cargar la data del bot.";
  }

  return (
    <div>
      <h1 className="text-3xl font-medium text-gray-800 dark:text-gray-100">Pulso</h1>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Salud de la comunidad de un vistazo.
      </p>

      {error || !overview ? (
        <p className="mt-8 rounded-2xl border border-black/5 bg-white p-6 text-sm text-gray-500 dark:border-white/10 dark:bg-neutral-900">
          {error ?? "Sin datos."}
        </p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard eyebrow="Mensajes" value={formatCount(overview.totals.messages)} />
          <StatCard eyebrow="Gente activa" value={formatCount(overview.totals.activePeople)} />
          <StatCard eyebrow="Topics" value={formatCount(overview.totals.topics)} />
          <StatCard eyebrow="Showcase" value={formatCount(overview.totals.showcase)} />
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 7: Document the env vars**

Add to `.env.example` (create the file if it does not exist):

```bash
# aiby-bridge dashboard API (Fase Comunidad)
AIBY_API_BASE=https://aiby-bridge-production-xxxx.up.railway.app
AIBY_API_KEY=
```

- [ ] **Step 8: Verify build + manual smoke**

Run: `pnpm build`
Expected: build succeeds, no type errors, route `/admin/comunidad` listed.

Then set real `AIBY_API_BASE`/`AIBY_API_KEY` in `.env.local`, run `pnpm dev`, log in, visit `/admin/comunidad`. Expected: 4 KPI cards with real numbers (or the error card if the bot is unreachable). Confirm "Pulso" appears in the sidebar under "Comunidad".

- [ ] **Step 9: Commit**

```bash
cd "/Volumes/VELLENT USB/Sites/aibuilders"
git add lib/aiby/range.ts lib/aiby/range.test.ts "app/(admin)/admin/comunidad/page.tsx" "app/(admin)/admin/components/admin-shell.tsx" .env.example
git commit -m "feat(comunidad): Pulso page with KPIs + sidebar entry + range parser"
```

---

### Task 3: Range + channel picker

**Files:**
- Create: `app/(admin)/admin/comunidad/components/range-channel-picker.tsx`
- Modify: `app/(admin)/admin/comunidad/page.tsx` (mount the picker, pass channels)

**Interfaces:**
- Consumes: `RANGE_PRESETS` from `lib/aiby/range.ts`; `overview.groups` (channel list) and current `range` from the page.
- Produces: `<RangeChannelPicker preset={...} group={...} channels={...} />` — a client component that updates `?preset=&group=` query params via `useRouter`, triggering a server re-render.

- [ ] **Step 1: Implement the picker (client component)**

Create `app/(admin)/admin/comunidad/components/range-channel-picker.tsx`:

```tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { RANGE_PRESETS } from "@/lib/aiby/range";

export function RangeChannelPicker({
  channels,
}: {
  channels: { alias: string; count: number }[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const preset = params.get("preset") ?? "week";
  const group = params.get("group") ?? "all";

  function update(key: "preset" | "group", value: string) {
    const next = new URLSearchParams(params.toString());
    next.set(key, value);
    router.push(`?${next.toString()}`);
  }

  const selectClass =
    "rounded-full border border-black/10 bg-white px-4 py-2 text-sm text-gray-800 dark:border-white/15 dark:bg-neutral-900 dark:text-gray-100";

  return (
    <div className="flex flex-wrap gap-3">
      <select
        aria-label="Rango"
        value={preset}
        onChange={(e) => update("preset", e.target.value)}
        className={selectClass}
      >
        {RANGE_PRESETS.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>
      <select
        aria-label="Canal"
        value={group}
        onChange={(e) => update("group", e.target.value)}
        className={selectClass}
      >
        <option value="all">Todos los canales</option>
        {channels.map((c) => (
          <option key={c.alias} value={c.alias}>
            {c.alias}
          </option>
        ))}
      </select>
    </div>
  );
}
```

- [ ] **Step 2: Mount it on the Pulso page**

In `app/(admin)/admin/comunidad/page.tsx`, add the import and render the picker between the header `<p>` and the KPI grid. It only renders when overview loaded (so we have the channel list):

```tsx
import { RangeChannelPicker } from "./components/range-channel-picker";
```

Insert after the intro paragraph:

```tsx
{overview && (
  <div className="mt-6">
    <RangeChannelPicker channels={overview.groups} />
  </div>
)}
```

- [ ] **Step 3: Verify build + manual**

Run: `pnpm build`
Expected: succeeds.

Manual (`pnpm dev`, logged in): on `/admin/comunidad`, change the range and channel dropdowns. Expected: URL updates (`?preset=month&group=...`), KPI numbers re-fetch and change.

- [ ] **Step 4: Commit**

```bash
cd "/Volumes/VELLENT USB/Sites/aibuilders"
git add "app/(admin)/admin/comunidad"
git commit -m "feat(comunidad): range + channel picker wired to query params"
```

---

### Task 4: Volume chart (recharts, themed)

**Files:**
- Create: `lib/aiby/series.ts`
- Create: `lib/aiby/series.test.ts`
- Create: `app/(admin)/admin/comunidad/components/volume-chart.tsx`
- Modify: `app/(admin)/admin/comunidad/page.tsx` (render volume section)
- Modify: `package.json` (add `recharts`)

**Interfaces:**
- Consumes: `VolumeData.series` from Task 1.
- Produces:
  - `channelKeys(series: Array<Record<string, number | string>>): string[]` in `lib/aiby/series.ts` — returns every key except `"date"`, sorted, for stacked-bar series.
  - `INK_SCALE: string[]` — greyscale hex ramp for multi-series charts (B/N-compliant).
  - `<VolumeChart series={...} />` client component.

- [ ] **Step 1: Add recharts**

Run:
```bash
cd "/Volumes/VELLENT USB/Sites/aibuilders" && pnpm add recharts
```
Expected: `recharts` in dependencies.

- [ ] **Step 2: Write the failing test for channelKeys**

Create `lib/aiby/series.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { channelKeys, INK_SCALE } from "./series";

describe("channelKeys", () => {
  it("returns every key except date, sorted", () => {
    const series = [
      { date: "2026-06-01", general: 3, anuncios: 1 },
      { date: "2026-06-02", general: 5 },
    ];
    expect(channelKeys(series)).toEqual(["anuncios", "general"]);
  });
  it("returns [] for empty series", () => {
    expect(channelKeys([])).toEqual([]);
  });
});

describe("INK_SCALE", () => {
  it("is non-empty and all greyscale-ish hex", () => {
    expect(INK_SCALE.length).toBeGreaterThan(0);
    for (const c of INK_SCALE) expect(c).toMatch(/^#[0-9a-fA-F]{6}$/);
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `pnpm test lib/aiby/series.test.ts`
Expected: FAIL — `Cannot find module './series'`.

- [ ] **Step 4: Implement series.ts**

Create `lib/aiby/series.ts`:

```typescript
// Helpers para alimentar recharts desde la API, respetando la paleta B/N.

// Rampa de grises (de tinta a casi-blanco) para series múltiples. Sin color.
export const INK_SCALE = [
  "#212121",
  "#454545",
  "#6b6b6b",
  "#919191",
  "#b7b7b7",
  "#d6d6d6",
];

export function channelKeys(series: Array<Record<string, number | string>>): string[] {
  const keys = new Set<string>();
  for (const row of series) {
    for (const k of Object.keys(row)) if (k !== "date") keys.add(k);
  }
  return [...keys].sort();
}

export function inkFor(index: number): string {
  return INK_SCALE[index % INK_SCALE.length];
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `pnpm test lib/aiby/series.test.ts`
Expected: PASS (3 passing).

- [ ] **Step 6: Implement the VolumeChart component**

Create `app/(admin)/admin/comunidad/components/volume-chart.tsx`:

```tsx
"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { channelKeys, inkFor } from "@/lib/aiby/series";

export function VolumeChart({
  series,
}: {
  series: Array<Record<string, number | string>>;
}) {
  const keys = channelKeys(series);
  if (series.length === 0) {
    return <p className="py-8 text-sm text-gray-400">Sin actividad en este rango.</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
        <CartesianGrid stroke="rgba(0,0,0,0.06)" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "#919191" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis tick={{ fontSize: 11, fill: "#919191" }} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{
            borderRadius: 12,
            border: "1px solid rgba(0,0,0,0.1)",
            fontSize: 12,
          }}
        />
        {keys.map((k, i) => (
          <Bar key={k} dataKey={k} stackId="msgs" fill={inkFor(i)} radius={i === keys.length - 1 ? [4, 4, 0, 0] : 0} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
```

- [ ] **Step 7: Render the volume section on Pulso**

In `app/(admin)/admin/comunidad/page.tsx`: import `getVolume` and `VolumeChart`, fetch volume alongside overview (inside the same try), and render a card below the KPI grid. Update the fetch block:

```tsx
import { getOverview, getVolume } from "@/lib/aiby/client";
import { VolumeChart } from "./components/volume-chart";
```

```tsx
let overview: Awaited<ReturnType<typeof getOverview>> | null = null;
let volume: Awaited<ReturnType<typeof getVolume>> | null = null;
let error: string | null = null;
try {
  [overview, volume] = await Promise.all([getOverview(range), getVolume(range)]);
} catch {
  error = "No se pudo cargar la data del bot.";
}
```

Add below the KPI grid (inside the `else` branch):

```tsx
<div className="mt-4 rounded-2xl border border-black/5 bg-white p-6 dark:border-white/10 dark:bg-neutral-900">
  <p className="text-xs font-medium text-gray-400 dark:text-gray-500">Volumen de mensajes</p>
  <div className="mt-4">
    <VolumeChart series={volume?.series ?? []} />
  </div>
</div>
```

- [ ] **Step 8: Verify build + manual**

Run: `pnpm build`
Expected: succeeds (watch for recharts server/client boundary — the component is `"use client"`, so it must not be imported into a server-only path other than as a child).

Manual: `/admin/comunidad` shows a stacked bar chart in greyscale; changing range updates it.

- [ ] **Step 9: Commit**

```bash
cd "/Volumes/VELLENT USB/Sites/aibuilders"
git add lib/aiby/series.ts lib/aiby/series.test.ts "app/(admin)/admin/comunidad" package.json pnpm-lock.yaml
git commit -m "feat(comunidad): themed volume bar chart (recharts)"
```

---

### Task 5: Channel donut (recharts, themed)

**Files:**
- Create: `app/(admin)/admin/comunidad/components/channel-donut.tsx`
- Modify: `app/(admin)/admin/comunidad/page.tsx` (render donut next to volume)

**Interfaces:**
- Consumes: `overview.groups` (`{ alias, jid, count }[]`) from Task 1; `inkFor` from `lib/aiby/series.ts`.
- Produces: `<ChannelDonut groups={...} />` client component.

- [ ] **Step 1: Implement the donut**

Create `app/(admin)/admin/comunidad/components/channel-donut.tsx`:

```tsx
"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { inkFor } from "@/lib/aiby/series";

export function ChannelDonut({
  groups,
}: {
  groups: { alias: string; count: number }[];
}) {
  if (groups.length === 0) {
    return <p className="py-8 text-sm text-gray-400">Sin canales en este rango.</p>;
  }
  const data = [...groups].sort((a, b) => b.count - a.count);
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="count" nameKey="alias" innerRadius={55} outerRadius={90} paddingAngle={2}>
          {data.map((_, i) => (
            <Cell key={i} fill={inkFor(i)} stroke="none" />
          ))}
        </Pie>
        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid rgba(0,0,0,0.1)", fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
```

- [ ] **Step 2: Render volume + donut side by side**

In `app/(admin)/admin/comunidad/page.tsx`, import `ChannelDonut`, and wrap the volume card and a new donut card in a 2-column grid (replace the standalone volume card from Task 4):

```tsx
import { ChannelDonut } from "./components/channel-donut";
```

```tsx
<div className="mt-4 grid gap-4 lg:grid-cols-3">
  <div className="rounded-2xl border border-black/5 bg-white p-6 lg:col-span-2 dark:border-white/10 dark:bg-neutral-900">
    <p className="text-xs font-medium text-gray-400 dark:text-gray-500">Volumen de mensajes</p>
    <div className="mt-4">
      <VolumeChart series={volume?.series ?? []} />
    </div>
  </div>
  <div className="rounded-2xl border border-black/5 bg-white p-6 dark:border-white/10 dark:bg-neutral-900">
    <p className="text-xs font-medium text-gray-400 dark:text-gray-500">Por canal</p>
    <div className="mt-4">
      <ChannelDonut groups={overview.groups} />
    </div>
  </div>
</div>
```

- [ ] **Step 3: Verify build + manual**

Run: `pnpm build`
Expected: succeeds.

Manual: donut renders in greyscale next to the volume chart, legend shows channel aliases.

- [ ] **Step 4: Commit**

```bash
cd "/Volumes/VELLENT USB/Sites/aibuilders"
git add "app/(admin)/admin/comunidad"
git commit -m "feat(comunidad): channel donut (recharts)"
```

---

### Task 6: Activity heatmap (CSS grid, no chart lib)

**Files:**
- Create: `lib/aiby/heatmap.ts`
- Create: `lib/aiby/heatmap.test.ts`
- Create: `app/(admin)/admin/comunidad/components/heatmap.tsx`
- Modify: `app/(admin)/admin/comunidad/page.tsx` (fetch + render heatmap)

**Interfaces:**
- Consumes: `HeatmapData.cells` (`{ dow, hour, count }[]`) from Task 1.
- Produces:
  - `heatmapGrid(cells): { rows: number[][]; max: number }` in `lib/aiby/heatmap.ts` — builds a 7×24 matrix (`rows[dow][hour] = count`), dow 0=Sunday matching JS, and the max count for opacity scaling.
  - `<Heatmap cells={...} />` server-safe component (no `"use client"` needed; pure markup).

- [ ] **Step 1: Write the failing test**

Create `lib/aiby/heatmap.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { heatmapGrid } from "./heatmap";

describe("heatmapGrid", () => {
  it("builds a 7x24 matrix with counts placed by dow/hour", () => {
    const { rows, max } = heatmapGrid([
      { dow: 0, hour: 0, count: 2 },
      { dow: 6, hour: 23, count: 9 },
    ]);
    expect(rows).toHaveLength(7);
    expect(rows[0]).toHaveLength(24);
    expect(rows[0][0]).toBe(2);
    expect(rows[6][23]).toBe(9);
    expect(rows[3][12]).toBe(0);
    expect(max).toBe(9);
  });
  it("max is 0 for empty cells", () => {
    expect(heatmapGrid([]).max).toBe(0);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test lib/aiby/heatmap.test.ts`
Expected: FAIL — `Cannot find module './heatmap'`.

- [ ] **Step 3: Implement heatmap.ts**

Create `lib/aiby/heatmap.ts`:

```typescript
export function heatmapGrid(cells: Array<{ dow: number; hour: number; count: number }>): {
  rows: number[][];
  max: number;
} {
  const rows: number[][] = Array.from({ length: 7 }, () => new Array(24).fill(0));
  let max = 0;
  for (const c of cells) {
    if (c.dow < 0 || c.dow > 6 || c.hour < 0 || c.hour > 23) continue;
    rows[c.dow][c.hour] = c.count;
    if (c.count > max) max = c.count;
  }
  return { rows, max };
}

export const DOW_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test lib/aiby/heatmap.test.ts`
Expected: PASS (2 passing).

- [ ] **Step 5: Implement the Heatmap component**

Create `app/(admin)/admin/comunidad/components/heatmap.tsx`:

```tsx
import { heatmapGrid, DOW_LABELS } from "@/lib/aiby/heatmap";

export function Heatmap({
  cells,
}: {
  cells: { dow: number; hour: number; count: number }[];
}) {
  const { rows, max } = heatmapGrid(cells);
  if (max === 0) {
    return <p className="py-8 text-sm text-gray-400">Sin actividad en este rango.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <div className="flex flex-col gap-1">
        {rows.map((row, dow) => (
          <div key={dow} className="flex items-center gap-1">
            <span className="w-8 shrink-0 text-right text-[10px] font-medium text-gray-400">
              {DOW_LABELS[dow]}
            </span>
            {row.map((count, hour) => (
              <span
                key={hour}
                title={`${DOW_LABELS[dow]} ${hour}:00 — ${count} mensajes`}
                className="h-3.5 w-3.5 shrink-0 rounded-[3px] bg-black dark:bg-white"
                style={{ opacity: count === 0 ? 0.05 : 0.15 + 0.85 * (count / max) }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Fetch + render the heatmap on Pulso**

In `app/(admin)/admin/comunidad/page.tsx`: import `getHeatmap` and `Heatmap`, add to the `Promise.all`, and render a full-width card below the volume/donut row:

```tsx
import { getOverview, getVolume, getHeatmap } from "@/lib/aiby/client";
import { Heatmap } from "./components/heatmap";
```

```tsx
let heatmap: Awaited<ReturnType<typeof getHeatmap>> | null = null;
// ...
[overview, volume, heatmap] = await Promise.all([
  getOverview(range),
  getVolume(range),
  getHeatmap(range),
]);
```

```tsx
<div className="mt-4 rounded-2xl border border-black/5 bg-white p-6 dark:border-white/10 dark:bg-neutral-900">
  <p className="text-xs font-medium text-gray-400 dark:text-gray-500">Actividad por hora</p>
  <div className="mt-4">
    <Heatmap cells={heatmap?.cells ?? []} />
  </div>
</div>
```

- [ ] **Step 7: Verify build + manual**

Run: `pnpm build`
Expected: succeeds.

Manual: heatmap renders 7 rows × 24 cells, darker = more active.

- [ ] **Step 8: Commit**

```bash
cd "/Volumes/VELLENT USB/Sites/aibuilders"
git add lib/aiby/heatmap.ts lib/aiby/heatmap.test.ts "app/(admin)/admin/comunidad"
git commit -m "feat(comunidad): activity heatmap (CSS grid)"
```

---

### Task 7: Recent-messages feed + final polish

**Files:**
- Create: `app/(admin)/admin/comunidad/components/recent-feed.tsx`
- Modify: `app/(admin)/admin/comunidad/page.tsx` (fetch + render recent feed)

**Interfaces:**
- Consumes: `getRecent` from Task 1 (`RecentMessages.messages`).
- Produces: `<RecentFeed messages={...} />` server-safe component.

- [ ] **Step 1: Implement the recent feed**

Create `app/(admin)/admin/comunidad/components/recent-feed.tsx`:

```tsx
function timeLabel(ts: string): string {
  const d = new Date(ts);
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function RecentFeed({
  messages,
}: {
  messages: {
    id: number;
    ts: string;
    group_alias: string;
    sender_name: string | null;
    sender_phone: string;
    text: string;
  }[];
}) {
  if (messages.length === 0) {
    return <p className="py-3 text-sm text-gray-400">Sin mensajes recientes.</p>;
  }
  return (
    <div className="flex flex-col divide-y divide-black/5 dark:divide-white/10">
      {messages.map((m) => (
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
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Fetch + render the feed**

In `app/(admin)/admin/comunidad/page.tsx`: import `getRecent` and `RecentFeed`, add to `Promise.all` (limit 12), render a card at the bottom:

```tsx
import { getOverview, getVolume, getHeatmap, getRecent } from "@/lib/aiby/client";
import { RecentFeed } from "./components/recent-feed";
```

```tsx
let recent: Awaited<ReturnType<typeof getRecent>> | null = null;
// ...
[overview, volume, heatmap, recent] = await Promise.all([
  getOverview(range),
  getVolume(range),
  getHeatmap(range),
  getRecent(range, 12),
]);
```

```tsx
<div className="mt-4 rounded-2xl border border-black/5 bg-white p-6 dark:border-white/10 dark:bg-neutral-900">
  <p className="text-xs font-medium text-gray-400 dark:text-gray-500">Mensajes recientes</p>
  <div className="mt-2">
    <RecentFeed messages={recent?.messages ?? []} />
  </div>
</div>
```

- [ ] **Step 3: Full verification**

Run: `pnpm test`
Expected: all suites pass (client, range, series, heatmap).

Run: `pnpm lint`
Expected: no errors.

Run: `pnpm build`
Expected: succeeds.

- [ ] **Step 4: Confirm the API key never reaches the client bundle**

Run:
```bash
cd "/Volumes/VELLENT USB/Sites/aibuilders" && grep -rl "AIBY_API_KEY" .next/static 2>/dev/null && echo "LEAK!" || echo "clean — key not in client bundle"
```
Expected: `clean — key not in client bundle`.

- [ ] **Step 5: Manual test checklist (`pnpm dev`, logged in)**

  - `/admin/comunidad` — KPIs, volume, donut, heatmap, recent feed all render with real data.
  - Range + channel picker updates every section.
  - Mobile width: cards stack, charts stay responsive, sidebar drawer shows "Pulso".
  - `/` , `/photos`, `/collab` — unaffected (smoke).

- [ ] **Step 6: Commit**

```bash
cd "/Volumes/VELLENT USB/Sites/aibuilders"
git add "app/(admin)/admin/comunidad"
git commit -m "feat(comunidad): recent-messages feed + Pulso polish"
```

---

## Self-Review Notes

- **Spec coverage (Fase 1):** types ✓ (Task 1), client ✓ (Task 1), env ✓ (Task 2), sidebar ✓ (Task 2), KPIs ✓ (Task 2), RangeChannelPicker ✓ (Task 3), volume recharts ✓ (Task 4), donut recharts ✓ (Task 5), heatmap CSS grid ✓ (Task 6), recent feed ✓ (Task 7), security/key-not-in-bundle ✓ (Task 7), testing/build gates ✓ (Tasks 1–7). Graphs/Temas/Personas/Jobs/Showcase + bot hardening/cleanup are Fases 2–4 (out of scope here).
- **Type consistency:** `AibyRange`, `OverviewData`, `VolumeData`, `HeatmapData`, `RecentMessages`, `channelKeys`, `inkFor`, `heatmapGrid`, `parseRange`, `RANGE_PRESETS` are defined once and consumed by name in later tasks.
- **No placeholders:** every code/test/command step shows the actual content.
