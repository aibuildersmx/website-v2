# Admin Dashboard — Fase A (métricas + acciones rápidas)

> Fecha: 2026-06-07
> Estado: aprobado para implementar
> Alcance: revamp del landing `/admin`. Eventos CRUD es **Fase B** (spec aparte).

## Contexto

El shell del admin (`app/admin/components/admin-shell.tsx`) con sidebar
(Newsletter, Vacantes, Reclutadores) ya está bien. El problema es el **landing
`/admin/page.tsx`**: hoy son solo tres tarjetas-link sin datos. Queremos un
dashboard con datos de un vistazo, acciones rápidas y mejor cobertura, sin tocar
la lógica del job board ni del newsletter.

Fuentes de datos disponibles hoy:

- **Postgres (Drizzle, `lib/db/schema.ts`):** `contacts` (~2256), `newsletter_issues`, `users`
- **Supabase:** `jobs`, `companies`, `recruiters`, webinar leads
- **Eventos:** hardcodeados en el array de `components/events-section.tsx` (no en DB todavía)

Esta fase es **solo lectura**: no agrega ninguna mutación nueva.

## Objetivo

Reemplazar el grid de 3 links por un dashboard que muestre, respetando el design
system black/white:

1. Acciones rápidas (los 3 atajos que más se usan)
2. 4 stat cards con data real
3. Dos listas cortas (próximos eventos, últimos issues)

## Arquitectura

### Data layer — `lib/admin/metrics.ts` (server-only)

Una función `getDashboardMetrics()` que agrega todo con `Promise.allSettled`, de
modo que si una fuente falla (p. ej. Supabase caído), esa métrica degrada a un
valor nulo y la UI muestra `—` en lugar de tronar la página entera.

Forma de retorno (tipos exactos se afinan en implementación):

```ts
type DashboardMetrics = {
  contacts: { total: number | null; last30d: number | null };
  newsletter: {
    subscribers: number | null;       // contacts where newsletterSubscribed = true
    lastIssueSentAt: Date | null;      // max(newsletter_issues.sentAt)
    recentIssues: Array<{ id: string; slug: string; subject: string; status: string; sentAt: Date | null }>; // 3 más recientes por updatedAt
  };
  jobs: { active: number | null };     // Supabase getJobs() filtrado por status activo
  events: { upcomingCount: number | null; upcoming: EventSummary[] }; // próximos 3
};
```

Consultas:

- **Contactos:** `count(*)` total; `count(*)` con `createdAt >= now() - 30d`
  (usar `createdAt`; `firstSeenAt` puede ser null).
- **Newsletter:** `count(*)` contacts con `newsletterSubscribed = true`;
  `max(sentAt)` de `newsletter_issues`; 3 issues por `updatedAt desc` para la lista.
- **Jobs:** `getJobs()` (Supabase admin client) y filtrar por el status activo real
  del tipo `Job` (verificar el valor exacto en `lib/supabase/types.ts` al implementar).
- **Eventos (Fase A):** exportar el array `events` desde
  `components/events-section.tsx` y derivar count + primeros 3. En **Fase B** se
  cambia la fuente a la DB sin tocar la UI del dashboard.

### UI — `app/admin/page.tsx` (server component async)

`AdminHome` pasa a `async`, llama `getDashboardMetrics()` y renderiza:

1. **Header:** título serif (`font-serif text-3xl`) + subtítulo corto.
2. **Quick actions:** fila de links estilo botón. En Fase A son **2** (la
   acción "Nuevo evento" se agrega en Fase B, cuando exista la ruta de eventos):
   - `+ Nuevo issue` → `/admin/newsletter`
   - `+ Nueva vacante` → `/job-board/dashboard`
3. **Stat cards:** grid `sm:grid-cols-2 lg:grid-cols-4`. Cuatro tarjetas:
   - Contactos — valor `total`, sublabel `+{last30d} últimos 30 días`, link `/admin` (o futura sección contactos)
   - Suscriptores — valor `subscribers`, sublabel `último envío: {fecha|—}`, link `/admin/newsletter`
   - Vacantes activas — valor `jobs.active`, link `/job-board/dashboard`
   - Eventos próximos — valor `events.upcomingCount`, link `/admin/eventos` (Fase B; en Fase A sin link o a `#`)
4. **Dos listas cortas** (grid `md:grid-cols-2`):
   - **Próximos eventos** (3): título + fecha + ubicación
   - **Últimos issues** (3): subject + status dot (green = sent, gris = draft)

Cada valor nulo se renderiza como `—`.

### Componentes nuevos — `app/admin/components/`

- **`stat-card.tsx`** (client o server según necesidad; probablemente server):
  props `{ eyebrow: string; value: string; sublabel?: string; href?: string }`.
  Reusa el patrón visual de la tarjeta actual (`rounded-2xl border border-black/5
  bg-white p-6 ... dark:...`). Valor en `font-serif text-2xl`, eyebrow en
  `font-mono text-[10px] uppercase tracking-[0.2em]`.
- **`dashboard-section.tsx`**: wrapper de lista corta con eyebrow mono + contenedor
  de items. Props `{ eyebrow: string; children }`.

## Design system

- Paleta binaria: negro (`#212121`) / blanco + neutrales `black/5,10,20,40,60`.
  Únicos colores de status: `green-500` (sent) / gris (draft) en los dots.
- Tipografía: Instrument Serif (`font-serif`) en headings y valores grandes;
  Geist Mono uppercase tracking-widest en eyebrows; Geist Sans en body.
- Bordes `border-black/5` (dark `border-white/10`), `rounded-2xl`/`rounded-lg`.
- Responsive: verificar mobile (1 col) y desktop (4 cols stats, 2 cols listas).
- Soporte dark mode consistente con el resto del admin (`dark:` ya en uso).

## Manejo de errores

- `getDashboardMetrics()` nunca lanza: cada bloque va en su propio
  `try/catch` o `Promise.allSettled`; en falla devuelve `null`/`[]`.
- La página renderiza `—` para nulos. No hay estados de loading especiales
  (server component; la página espera los datos).

## Out of scope (Fase A)

- Cualquier mutación nueva (crear/editar desde el dashboard).
- Tabla `events`, migración, CRUD de eventos, migrar el homepage a DB → **Fase B**.
- Nueva sección de contactos/comunidad (solo se enlaza con un stat card).
- Cambios al job board, newsletter, o al `admin-shell` sidebar (salvo, opcionalmente,
  agregar la entrada "Eventos" — se hace en Fase B).

## Testing / verificación

- `pnpm build` debe pasar (server/client boundaries, MDX no aplica aquí).
- `pnpm lint` limpio (sin `eslint-disable`/`ts-ignore` — fix real).
- Checklist manual de rutas:
  - `/admin` — stat cards con números reales, quick actions, listas pobladas
  - `/admin/newsletter`, `/job-board/dashboard`, `/job-board/dashboard/recruiters` — sin regresión
  - mobile + desktop + dark mode

## Archivos afectados

| Archivo | Cambio |
|---|---|
| `lib/admin/metrics.ts` | **nuevo** — agregador `getDashboardMetrics()` |
| `app/admin/page.tsx` | reescribir como server component async con dashboard |
| `app/admin/components/stat-card.tsx` | **nuevo** |
| `app/admin/components/dashboard-section.tsx` | **nuevo** |
| `components/events-section.tsx` | exportar el array `events` (cambio mínimo, sin tocar render) |
