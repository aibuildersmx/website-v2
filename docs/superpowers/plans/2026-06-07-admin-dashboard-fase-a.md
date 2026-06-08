# Admin Dashboard — Fase A Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar el landing `/admin` (hoy 3 tarjetas-link sin datos) por un dashboard con métricas reales, acciones rápidas y dos listas cortas, respetando el design system black/white.

**Architecture:** Un agregador server-only `getDashboardMetrics()` junta datos de Postgres (Drizzle: `contacts`, `newsletter_issues`) y Supabase (`jobs`), tolerante a fallos vía `Promise.allSettled` (fuente caída → valor `null` → la UI muestra `—`). Los eventos se leen del array existente, extraído a un módulo de datos plano para que tanto el homepage (client) como el dashboard (server) lo consuman. `app/admin/page.tsx` pasa a server component async y compone stat cards + listas con dos componentes nuevos.

**Tech Stack:** Next.js 16 (App Router, server components), Drizzle ORM + postgres-js, Supabase JS, Tailwind 4, Vitest.

**Spec:** `docs/superpowers/specs/2026-06-07-admin-dashboard-fase-a-design.md`

---

## File Structure

| Archivo | Responsabilidad |
|---|---|
| `components/events-data.ts` | **nuevo** — arrays `events`/`pastEvents` + tipos, sin React. Fuente compartida client/server. |
| `components/events-section.tsx` | **modificar** — importa los arrays desde `events-data.ts` en vez de declararlos inline. |
| `lib/admin/metrics.ts` | **nuevo** — tipos, helpers puros (`eventToSummary`, `formatDate`, `formatCount`) y el agregador `getDashboardMetrics()`. |
| `tests/admin/dashboard.test.ts` | **nuevo** — tests de los helpers puros. |
| `app/admin/components/stat-card.tsx` | **nuevo** — tarjeta de métrica (eyebrow, value, sublabel, href opcional). |
| `app/admin/components/dashboard-section.tsx` | **nuevo** — wrapper de lista corta con eyebrow. |
| `app/admin/page.tsx` | **reescribir** — server component async que renderiza el dashboard. |

---

## Task 1: Extraer los datos de eventos a un módulo plano

Mueve los arrays `events` y `pastEvents` fuera del client component para que el dashboard (server) pueda importarlos sin arrastrar React. Refactor sin cambio de comportamiento.

**Files:**
- Create: `components/events-data.ts`
- Modify: `components/events-section.tsx`

- [ ] **Step 1: Crear `components/events-data.ts` con los tipos**

Crea el archivo con SOLO los tipos por ahora (las arrays se pegan en el siguiente paso):

```ts
// Datos de eventos — módulo plano (sin React) para que lo consuman tanto el
// homepage (client) como el dashboard del admin (server).

export type EventCard = {
  title: string;
  description: string;
  month: string;
  day: string;
  location: string;
  attendees: string;
  status: string;
  price: string;
  buttonText: string;
  buttonDisabled: boolean;
  tags: string[];
  logo: string;
  link: string;
};

export type PastEvent = {
  title: string;
  month: string;
  day: string;
  location: string;
  logo?: string;
  link?: string;
};
```

- [ ] **Step 2: Mover los arrays a `events-data.ts`**

En `components/events-section.tsx`, corta los dos bloques completos `const events = [ ... ];` y `const pastEvents = [ ... ];` (todo su contenido, tal cual). Pégalos al final de `components/events-data.ts` y antepón `export` con su tipo, de modo que queden así (el contenido `...` es exactamente el que cortaste):

```ts
export const events: EventCard[] = [
  // ...todos los objetos de eventos próximos, sin cambios...
];

export const pastEvents: PastEvent[] = [
  // ...todos los objetos de eventos pasados, sin cambios...
];
```

- [ ] **Step 3: Importar los arrays de vuelta en `events-section.tsx`**

En `components/events-section.tsx`, después de los imports existentes (junto a `import { cn } from "@/lib/utils";`), añade:

```ts
import { events, pastEvents } from "./events-data";
```

Deja intactos `EventLogo`, `eventTypeStyles`, `isExternalLink` y todo el JSX — solo quitaste las dos declaraciones de arrays y las reemplazaste por el import.

- [ ] **Step 4: Verificar que compila y el homepage no cambió**

Run: `pnpm build`
Expected: build OK, sin errores de tipo. El homepage `/` renderiza los mismos eventos que antes.

- [ ] **Step 5: Commit**

```bash
git add components/events-data.ts components/events-section.tsx
git commit -m "refactor: extract events arrays to events-data.ts (shared client/server)"
```

---

## Task 2: Helpers puros del dashboard (TDD)

Lógica pura y testeable que la UI usará para formatear. Se escribe con tests primero.

**Files:**
- Create: `lib/admin/metrics.ts`
- Test: `tests/admin/dashboard.test.ts`

- [ ] **Step 1: Escribir el test que falla**

Crea `tests/admin/dashboard.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { eventToSummary, formatDate, formatCount } from "../../lib/admin/metrics";

describe("eventToSummary", () => {
  it("arma el label de fecha desde month y day", () => {
    expect(
      eventToSummary({ title: "X", month: "JUN", day: "18", location: "Virtual" }),
    ).toEqual({ title: "X", dateLabel: "JUN 18", location: "Virtual" });
  });
});

describe("formatDate", () => {
  it("regresa em dash para null", () => {
    expect(formatDate(null)).toBe("—");
  });
  it("formatea como 'D mmm YYYY' en español (UTC)", () => {
    expect(formatDate(new Date("2026-05-14T12:00:00Z"))).toBe("14 may 2026");
  });
});

describe("formatCount", () => {
  it("regresa em dash para null", () => {
    expect(formatCount(null)).toBe("—");
  });
  it("agrupa miles con coma", () => {
    expect(formatCount(2256)).toBe("2,256");
  });
});
```

- [ ] **Step 2: Correr el test para verlo fallar**

Run: `pnpm test tests/admin/dashboard.test.ts`
Expected: FAIL — `Failed to resolve import "../../lib/admin/metrics"` (el archivo aún no existe).

- [ ] **Step 3: Implementar los helpers puros**

Crea `lib/admin/metrics.ts` con SOLO los helpers puros y sus tipos (el agregador llega en la Task 3):

```ts
export type EventSummary = { title: string; dateLabel: string; location: string };

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

// Resume un evento del array a lo mínimo que muestra el dashboard.
export function eventToSummary(e: {
  title: string;
  month: string;
  day: string;
  location: string;
}): EventSummary {
  return { title: e.title, dateLabel: `${e.month} ${e.day}`, location: e.location };
}

// "14 may 2026" en UTC (determinista para tests); "—" si no hay fecha.
export function formatDate(d: Date | null): string {
  if (!d) return "—";
  return `${d.getUTCDate()} ${MESES[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

// "2,256" con separador de miles; "—" si es null.
export function formatCount(n: number | null): string {
  if (n === null) return "—";
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
```

- [ ] **Step 4: Correr el test para verlo pasar**

Run: `pnpm test tests/admin/dashboard.test.ts`
Expected: PASS — 6 tests verdes.

- [ ] **Step 5: Commit**

```bash
git add lib/admin/metrics.ts tests/admin/dashboard.test.ts
git commit -m "feat: pure dashboard format helpers + tests"
```

---

## Task 3: Agregador `getDashboardMetrics()`

Glue server-only que junta las métricas de Drizzle + Supabase + eventos, tolerante a fallos. No se testea con unit tests (toca DB real, igual que el resto del proyecto); se valida con `pnpm build` y el checklist manual de la Task 7.

**Files:**
- Modify: `lib/admin/metrics.ts`

- [ ] **Step 1: Añadir imports y tipos del agregador**

Al inicio de `lib/admin/metrics.ts`, sobre los helpers existentes, añade los imports:

```ts
import { sql, eq, gte, desc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { contacts, newsletterIssues } from "@/lib/db/schema";
import { getJobs } from "@/lib/actions/jobs";
import { events as upcomingEventsData } from "@/components/events-data";
```

Y después del tipo `EventSummary`, añade los tipos del resultado:

```ts
export type RecentIssue = {
  id: string;
  slug: string;
  subject: string;
  status: string;
  sentAt: Date | null;
};

export type DashboardMetrics = {
  contacts: { total: number | null; last30d: number | null };
  newsletter: {
    subscribers: number | null;
    lastIssueSentAt: Date | null;
    recentIssues: RecentIssue[];
  };
  jobs: { active: number | null };
  events: { upcomingCount: number | null; upcoming: EventSummary[] };
};
```

- [ ] **Step 2: Implementar las funciones por sección y el agregador**

Al final de `lib/admin/metrics.ts`, añade:

```ts
async function getContactsMetrics(): Promise<DashboardMetrics["contacts"]> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [{ total }] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(contacts);
  const [{ recent }] = await db
    .select({ recent: sql<number>`count(*)::int` })
    .from(contacts)
    .where(gte(contacts.createdAt, thirtyDaysAgo));
  return { total, last30d: recent };
}

async function getNewsletterMetrics(): Promise<DashboardMetrics["newsletter"]> {
  const [{ subscribers }] = await db
    .select({ subscribers: sql<number>`count(*)::int` })
    .from(contacts)
    .where(eq(contacts.newsletterSubscribed, true));

  const sentRows = await db
    .select({ sentAt: newsletterIssues.sentAt })
    .from(newsletterIssues)
    .where(eq(newsletterIssues.status, "sent"))
    .orderBy(desc(newsletterIssues.sentAt))
    .limit(1);

  const recentIssues = await db
    .select({
      id: newsletterIssues.id,
      slug: newsletterIssues.slug,
      subject: newsletterIssues.subject,
      status: newsletterIssues.status,
      sentAt: newsletterIssues.sentAt,
    })
    .from(newsletterIssues)
    .orderBy(desc(newsletterIssues.updatedAt))
    .limit(3);

  return { subscribers, lastIssueSentAt: sentRows[0]?.sentAt ?? null, recentIssues };
}

async function getJobsMetrics(): Promise<DashboardMetrics["jobs"]> {
  // getJobs() ya filtra is_active = true y devuelve [] ante errores de Supabase.
  const jobs = await getJobs();
  return { active: jobs.length };
}

async function getEventsMetrics(): Promise<DashboardMetrics["events"]> {
  return {
    upcomingCount: upcomingEventsData.length,
    upcoming: upcomingEventsData.slice(0, 3).map(eventToSummary),
  };
}

// Nunca lanza: cada sección degrada a su valor neutro si su fuente falla.
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const [contactsR, newsletterR, jobsR, eventsR] = await Promise.allSettled([
    getContactsMetrics(),
    getNewsletterMetrics(),
    getJobsMetrics(),
    getEventsMetrics(),
  ]);

  return {
    contacts:
      contactsR.status === "fulfilled"
        ? contactsR.value
        : { total: null, last30d: null },
    newsletter:
      newsletterR.status === "fulfilled"
        ? newsletterR.value
        : { subscribers: null, lastIssueSentAt: null, recentIssues: [] },
    jobs: jobsR.status === "fulfilled" ? jobsR.value : { active: null },
    events:
      eventsR.status === "fulfilled"
        ? eventsR.value
        : { upcomingCount: null, upcoming: [] },
  };
}
```

- [ ] **Step 3: Verificar tipos y que los tests siguen verdes**

Run: `pnpm test tests/admin/dashboard.test.ts && pnpm build`
Expected: tests PASS (los helpers no cambiaron) y build OK.

- [ ] **Step 4: Commit**

```bash
git add lib/admin/metrics.ts
git commit -m "feat: getDashboardMetrics aggregator (drizzle + supabase + events)"
```

---

## Task 4: Componente `StatCard`

**Files:**
- Create: `app/admin/components/stat-card.tsx`

- [ ] **Step 1: Crear el componente**

```tsx
import Link from "next/link";

// Tarjeta de métrica. Si recibe `href`, toda la tarjeta es un link con hover.
export function StatCard({
  eyebrow,
  value,
  sublabel,
  href,
}: {
  eyebrow: string;
  value: string;
  sublabel?: string;
  href?: string;
}) {
  const inner = (
    <>
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
        {eyebrow}
      </p>
      <p className="mt-2 font-serif text-3xl text-gray-800 dark:text-gray-100">{value}</p>
      {sublabel && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{sublabel}</p>
      )}
    </>
  );

  const base =
    "block rounded-2xl border border-black/5 bg-white p-6 transition dark:border-white/10 dark:bg-neutral-900";

  if (href) {
    return (
      <Link
        href={href}
        className={`${base} hover:border-black/20 dark:hover:border-white/25`}
      >
        {inner}
      </Link>
    );
  }

  return <div className={base}>{inner}</div>;
}
```

- [ ] **Step 2: Verificar que compila**

Run: `pnpm build`
Expected: OK (componente aún sin consumir; debe tipar bien).

- [ ] **Step 3: Commit**

```bash
git add app/admin/components/stat-card.tsx
git commit -m "feat: StatCard component for admin dashboard"
```

---

## Task 5: Componente `DashboardSection`

**Files:**
- Create: `app/admin/components/dashboard-section.tsx`

- [ ] **Step 1: Crear el componente**

```tsx
import type { ReactNode } from "react";

// Tarjeta contenedora de una lista corta (eyebrow mono + items con divisores).
export function DashboardSection({
  eyebrow,
  children,
}: {
  eyebrow: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-6 dark:border-white/10 dark:bg-neutral-900">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
        {eyebrow}
      </p>
      <div className="mt-2 flex flex-col divide-y divide-black/5 dark:divide-white/10">
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verificar que compila**

Run: `pnpm build`
Expected: OK.

- [ ] **Step 3: Commit**

```bash
git add app/admin/components/dashboard-section.tsx
git commit -m "feat: DashboardSection component for admin dashboard"
```

---

## Task 6: Reescribir `app/admin/page.tsx` como dashboard

**Files:**
- Modify: `app/admin/page.tsx` (reemplazo completo)

- [ ] **Step 1: Reemplazar el contenido completo del archivo**

```tsx
import Link from "next/link";
import { getDashboardMetrics, formatCount, formatDate } from "@/lib/admin/metrics";
import { StatCard } from "./components/stat-card";
import { DashboardSection } from "./components/dashboard-section";

export default async function AdminHome() {
  const m = await getDashboardMetrics();

  return (
    <div>
      <h1 className="font-serif text-3xl text-gray-800 dark:text-gray-100">
        Panel de administración
      </h1>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Resumen de la comunidad de un vistazo.
      </p>

      {/* Acciones rápidas (Fase A: 2; "Nuevo evento" llega en Fase B). */}
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/admin/newsletter"
          className="rounded-full bg-black px-4 py-2 text-sm text-white transition hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80"
        >
          + Nuevo issue
        </Link>
        <Link
          href="/job-board/dashboard"
          className="rounded-full border border-black/10 px-4 py-2 text-sm text-gray-800 transition hover:border-black/30 dark:border-white/15 dark:text-gray-100 dark:hover:border-white/30"
        >
          + Nueva vacante
        </Link>
      </div>

      {/* Stat cards. */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          eyebrow="Comunidad"
          value={formatCount(m.contacts.total)}
          sublabel={
            m.contacts.last30d === null
              ? undefined
              : `+${m.contacts.last30d} últimos 30 días`
          }
        />
        <StatCard
          eyebrow="Newsletter"
          value={formatCount(m.newsletter.subscribers)}
          sublabel={`Último envío: ${formatDate(m.newsletter.lastIssueSentAt)}`}
          href="/admin/newsletter"
        />
        <StatCard
          eyebrow="Job Board"
          value={formatCount(m.jobs.active)}
          sublabel="Vacantes activas"
          href="/job-board/dashboard"
        />
        <StatCard
          eyebrow="Eventos"
          value={formatCount(m.events.upcomingCount)}
          sublabel="Próximos"
        />
      </div>

      {/* Listas cortas. */}
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <DashboardSection eyebrow="Próximos eventos">
          {m.events.upcoming.length === 0 ? (
            <p className="py-3 text-sm text-gray-400">Sin eventos próximos.</p>
          ) : (
            m.events.upcoming.map((e) => (
              <div
                key={e.title}
                className="flex items-baseline justify-between gap-3 py-3"
              >
                <span className="truncate text-sm text-gray-800 dark:text-gray-100">
                  {e.title}
                </span>
                <span className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-gray-400">
                  {e.dateLabel}
                </span>
              </div>
            ))
          )}
        </DashboardSection>

        <DashboardSection eyebrow="Últimos issues">
          {m.newsletter.recentIssues.length === 0 ? (
            <p className="py-3 text-sm text-gray-400">Sin issues todavía.</p>
          ) : (
            m.newsletter.recentIssues.map((i) => (
              <Link
                key={i.id}
                href={`/admin/newsletter/${i.id}`}
                className="group flex items-center gap-3 py-3"
              >
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${
                    i.status === "sent"
                      ? "bg-green-500"
                      : "bg-black/20 dark:bg-white/30"
                  }`}
                />
                <span className="truncate text-sm text-gray-800 group-hover:underline dark:text-gray-100">
                  {i.subject || i.slug}
                </span>
              </Link>
            ))
          )}
        </DashboardSection>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verificar build y lint**

Run: `pnpm build && pnpm lint`
Expected: build OK, lint limpio (sin `eslint-disable`/`ts-ignore`).

- [ ] **Step 3: Commit**

```bash
git add app/admin/page.tsx
git commit -m "feat: admin dashboard home with metrics + quick actions"
```

---

## Task 7: Verificación final

**Files:** ninguno (solo verificación).

- [ ] **Step 1: Suite de tests completa**

Run: `pnpm test`
Expected: todos los tests PASS (incluye los nuevos de `tests/admin/dashboard.test.ts` y no rompe los existentes).

- [ ] **Step 2: Build + lint limpios**

Run: `pnpm build && pnpm lint`
Expected: ambos OK.

- [ ] **Step 3: Checklist manual (con `pnpm dev`)**

Iniciar sesión y revisar en navegador:

- `/admin` — las 4 stat cards muestran números reales (Comunidad ~2256, Newsletter, Vacantes, Eventos); valores nulos aparecen como `—`; quick actions navegan; "Próximos eventos" lista 3; "Últimos issues" lista 3 con dot verde (sent) / gris (draft) y cada uno linkea a `/admin/newsletter/<id>`.
- `/` (homepage) — la sección de eventos se ve idéntica a antes del refactor.
- `/admin/newsletter`, `/job-board/dashboard`, `/job-board/dashboard/recruiters` — sin regresión.
- Probar mobile (1 columna), desktop (4 stat cards / 2 listas) y dark mode.

- [ ] **Step 4: Confirmar el estado del árbol**

Run: `git status`
Expected: working tree limpio respecto a los archivos del plan (los cambios previos no relacionados que ya estaban en el árbol no se tocaron).

---

## Notas para Fase B (fuera de alcance aquí)

- Tabla `events` + migración `0003` + seed desde `components/events-data.ts`.
- Server actions CRUD de eventos y UI admin (`/admin/eventos`).
- `components/events-section.tsx` y `getEventsMetrics()` cambian su fuente de `events-data.ts` a la DB (la firma de `EventSummary` y la UI del dashboard NO cambian).
- Agregar 3ª quick action "+ Nuevo evento" y entrada "Eventos" en el sidebar (`admin-shell.tsx`).
