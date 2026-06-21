# Comunidad Dashboard — migrar el dashboard de aiby-bridge al admin de aibuilders

> **Fecha:** 2026-06-20
> **Estado:** Diseño aprobado, pendiente plan de implementación

## Problema

El dashboard de la comunidad (métricas de WhatsApp, topics, personas, jobs, showcase)
vive hoy como un SPA Vite+React **dentro del repo del bot** (`aibuilders-bot`, servicio
`aiby-bridge` en Railway). Queremos sacarlo de ahí y reconstruirlo **dentro del admin de
aibuilders** (`/admin`), donde ya tenemos auth de sesión, design system, y más infra para
este tipo de cosas.

El bloqueo no trivial: **el bot guarda su data en SQLite** (`/data/memory.sqlite`, su propio
volumen), mientras que el website usa **Postgres**. Son bases distintas; el bot NO usa el
Postgres compartido. Por eso "conectar" requiere una decisión de acceso a datos.

## Decisiones tomadas (brainstorming)

1. **Acceso a datos: proxy a la API del bot.** El bot ya expone una API HTTP completa
   read-only en `/dashboard/api/*` (+ un `PATCH /jobs/:id`). El admin hace fetch
   server-to-server a esa API; el bot sigue siendo dueño de su SQLite. Cero migración de
   datos. (Un híbrido —replicar a Postgres lo que se quiera cruzar con `contacts`— queda
   como evolución futura, fuera de scope.)
2. **Rediseño completo a modo aibuilders.** Se tira el bento grid arrastrable y el drill
   panel. Se reconstruye con el lenguaje del admin: B/N minimal, sidebar, páginas
   server-rendered enfocadas, rutas de detalle reales.
3. **Propósito = los 4 trabajos:** pulso de la comunidad, de qué se habla, jobs+showcase
   (curación), personas. Los cuatro importan → la IA los mapea 1:1.
4. **Charts: `recharts`** (nueva dependencia) theme-eado estricto a tokens B/N para
   volumen y donut; heatmap a mano con CSS grid.
5. **Sección se llama "Comunidad"** en el sidebar.

## Arquitectura

```
┌─ aiby-bridge (Railway, sin cambios salvo hardening) ─┐
│  Express + SQLite (/data/memory.sqlite)              │
│  GET   /dashboard/api/*       (lecturas)             │
│  PATCH /dashboard/api/jobs/:id (status de vacante)   │
│  Auth: header x-api-key                              │
└──────────────────────────────────────────────────────┘
                  ▲ server-to-server, x-api-key (env)
                  │
┌─ website / admin (Railway, Next.js 16) ──────────────┐
│  lib/aiby/client.ts   ← ÚNICO punto que toca el bot   │
│  lib/aiby/types.ts    ← tipos portados del SPA         │
│  lib/actions/aiby.ts  ← writes (jobs status)           │
│  app/(admin)/admin/comunidad/**  ← Server Components    │
│    gated por app/(admin)/admin/layout.tsx (getUser)    │
└────────────────────────────────────────────────────────┘
```

**Principios:**
- El `API_KEY` **nunca** llega al browser. Vive en env (`AIBY_API_BASE`, `AIBY_API_KEY`),
  se usa solo dentro de `lib/aiby/client.ts`, marcado `import "server-only"`.
- Reusa el patrón existente: páginas `async` server-component protegidas por el layout de
  admin que ya hace `getUser()` → `redirect("/login")`. **No se agrega auth nueva.**
- Un solo módulo cliente tipado. Si la API del bot cambia, se toca un archivo.
- La API del bot **se queda**; lo que se borra del repo del bridge es el SPA frontend.

## Componentes (unidades)

### `lib/aiby/types.ts`
Tipos TS portados de `aibuilders-bot/dashboard/src/api.ts`. Reflejan las respuestas de la
API: `Overview`, `VolumeSeries`, `HeatmapCell`, `TopicNode`/`TopicEdge`, `PersonNode`,
`TopicDetail`, `PersonDetail`, `Job`, `JobFilters`, `ShowcaseItem`, `RecentMessage`, `Range`.

### `lib/aiby/client.ts` (`server-only`)
Wrapper de `fetch` sobre `AIBY_API_BASE` con header `x-api-key: AIBY_API_KEY` y
`next: { revalidate: 60 }` (las métricas no necesitan ser al-segundo). Funciones:
- `getOverview(range)` · `getVolume(range)` · `getHeatmap(range)`
- `getTopics(range, page)` · `getTopic(slug)` · `getTopicGraph(range)`
- `getPeople(range, page)` · `getPerson(jid)` · `getPeopleGraph(range)`
- `getJobs(filters)` · `getShowcase(range)` · `getRecent(opts)`
- `patchJobStatus(id, status)` — el único write
Cada función valida shape y devuelve tipos de `types.ts`. Errores de red/HTTP → throw
controlado para que la página renderice un estado de error.

### `lib/actions/aiby.ts`
Server actions. `updateJobStatus(id, status)`: gate con `getUser()`, llama
`patchJobStatus`, `revalidatePath("/admin/comunidad/jobs")`. Sigue el patrón de
`lib/actions/newsletter.ts`.

### Páginas (`app/(admin)/admin/comunidad/`)
| Ruta | Trabajo | Contenido |
|---|---|---|
| `comunidad/page.tsx` | **Pulso** (home) | KPIs (mensajes, gente activa, topics, showcase) + volumen (recharts) + heatmap (CSS grid) + split por canal (donut recharts) + feed compacto de recent. Selector rango/canal. |
| `comunidad/temas/page.tsx` | **De qué se habla** | Top topics rankeados + grafo de co-ocurrencia. |
| `comunidad/temas/[slug]/page.tsx` | detalle topic | contribuyentes, mensajes, timeline, showcase relacionado. |
| `comunidad/personas/page.tsx` | **Personas** | Lista de miembros (mensajes, expertise). |
| `comunidad/personas/[jid]/page.tsx` | detalle persona | perfil, topics, proyectos, mensajes. |
| `comunidad/jobs/page.tsx` | **Jobs** (write) | vacantes con filtros (modo/seniority/stack/status) + cambiar status open/closed/hidden vía server action. |
| `comunidad/showcase/page.tsx` | **Showcase** | proyectos rankeados por reacciones. Candidatos a republicar. |

### Componentes de UI (`comunidad/components/`)
- `RangeChannelPicker` — control compartido que refleja `preset` (day/week/month/quarter/year)
  + `group` (canal) de la API. Navega vía query params (patrón GET como `contactos`).
- `VolumeChart`, `ChannelDonut` — wrappers de recharts theme-eados a tokens B/N
  (barras `#212121`, grid `black/10`, multi-serie con escala de grises/opacidad, sin paleta
  de color salvo status verde/rojo donde aplique).
- `Heatmap` — grid Tailwind, opacidad de celda según densidad. Sin recharts.
- `TopicGraph`/`PeopleGraph` — visualización de nodos/edges (evaluar en su fase si recharts
  o SVG a mano; no bloquea Fase 1).
- Reuso de `stat-card.tsx`, `dashboard-section.tsx` existentes del admin para KPIs/secciones.

### Sidebar
Agregar entrada "Comunidad" (ícono `Users` o `MessageCircle` de lucide) en
`admin-shell.tsx`, apuntando a `/admin/comunidad`.

## Data flow

1. Usuario autenticado entra a `/admin/comunidad?preset=week&group=all`.
2. Layout de admin valida sesión (ya existe).
3. Server component lee query params → llama `lib/aiby/client.ts` (server-to-server,
   x-api-key) → recibe JSON tipado.
4. Renderiza KPIs/charts. `RangeChannelPicker` cambia query params → re-render server.
5. Jobs: cambiar status → server action `updateJobStatus` → `patchJobStatus` al bot →
   `revalidatePath`.

## Manejo de errores

- `lib/aiby/client.ts` hace throw en HTTP != 2xx o red caída; las páginas envuelven en
  estado de error ("No se pudo cargar la data del bot") sin tumbar el admin entero.
- Si `AIBY_API_BASE`/`AIBY_API_KEY` faltan, el cliente falla con mensaje claro en server log.

## Seguridad

- `API_KEY` solo server-side; verificar que no aparece en el bundle del cliente.
- **Hardening del bot (fase aparte):** quitar el path de `?key=`/localStorage del SPA y
  dejar **solo** `x-api-key` header en la API. Cambio chico en `aibuilders-bot`.
- Env nuevas en Railway (website service): `AIBY_API_BASE`, `AIBY_API_KEY`. No committeadas.

## Testing / Definition of Done

- Tests de `lib/aiby/client.ts` (mock fetch: parseo, headers, manejo de error).
- `pnpm lint` y `pnpm build` verdes (boundaries server/client — regla de oro del CLAUDE.md).
- Checklist manual con login: `/admin/comunidad` y subrutas, mobile + desktop.
- Verificar que `AIBY_API_KEY` no está en el bundle del cliente.

## Fases (cada una deja algo usable)

- **Fase 1 — Cliente + Pulso.** `types.ts`, `client.ts`, env, sidebar, `/admin/comunidad`
  con KPIs + volumen + heatmap + donut + recent. Recharts theme-eado.
- **Fase 2 — Temas + Personas.** Listas + rutas de detalle + grafos.
- **Fase 3 — Jobs + Showcase.** Filtros, server action de status (único write), showcase feed.
- **Fase 4 — Cleanup del bot.** Borrar el SPA Vite (`dashboard/` frontend + `dashboard:build`
  + servir `dist`) del repo del bridge; **conservar** los endpoints `/dashboard/api/*`.
  Aplicar el hardening del API_KEY.

## Fuera de scope (futuro)

- Replicar data del bot a Postgres (híbrido) para cruzar `personas ↔ contacts`/newsletter.
- Republicar showcase/jobs al sitio o newsletter desde el admin.
- Roles/permisos más finos sobre la API del bot.

## Referencias

- Bot: `aibuilders-bot/src/dashboard/routes.ts` (endpoints), `src/dashboard/queries.ts`
  (aggregations), `src/memory/db.ts` (schema SQLite), `dashboard/src/api.ts` (tipos a portar).
- Admin: `app/(admin)/admin/layout.tsx` (auth gate), `lib/actions/newsletter.ts` (patrón de
  action), `app/(admin)/admin/components/` (stat-card, dashboard-section, admin-shell).
