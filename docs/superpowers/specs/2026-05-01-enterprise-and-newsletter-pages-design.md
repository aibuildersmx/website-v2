# Enterprise & Newsletter Pages — Design Spec

**Date:** 2026-05-01
**Status:** Approved (pending user spec review)
**Author:** brainstorming session with @benkim

## Goal

Add two new marketing routes to aibuilders.mx:

1. **`/enterprise`** — single omnibus landing page pitching four B2B service lines (workshops, consulting retainer, recruiting, corporate talks) to MX corporate buyers. Anchor sections allow deep-linking to specific offerings.
2. **`/newsletter`** — lightweight pitch page for the existing Beehiiv newsletter, providing a dedicated URL to share in social profiles, signatures, and email campaigns.

Both pages must follow the existing design system (`docs/design/`) and ship with Spanish (`es_MX`) copy.

## Non-goals

- No CMS or content management. All copy lives in source.
- No backend. Contact is `mailto:` only; newsletter form continues to post to Beehiiv as today.
- No bilingual page. Routes use English slugs (`/enterprise`, `/newsletter`) but copy is Spanish-only.
- No case study cards, testimonial blocks, or sample-issue previews. Logos-only proof per service section.
- No homepage changes beyond the navigation update.

## Decisions

| Decision | Choice | Reasoning |
|---|---|---|
| Page architecture | Omnibus `/enterprise` with anchor sections (`#workshops`, `#consulting`, `#recruiting`, `#talks`) + dedicated `/newsletter` | Single shareable enterprise URL, deep-linkable per service |
| Language / route | Spanish copy, English route slug | Corporate buyers Google in English, read in Spanish |
| Proof format | Logos only per section | Lightest lift; consulting omits proof block (no public clients yet) |
| Logo assets | Source from official press kits; fall back to Geist Mono wordmark text if SVG unavailable | Defensible; swappable later |
| Pricing for consulting | "Desde $5,000 USD / mes" (anchor floor only) | Filters tire-kickers without hiding |
| Contact mechanism | `mailto:1996byk@gmail.com` with pre-filled `?subject=` per section | Matches existing site patterns; ships fast |
| Top nav | Append `Enterprise` (with `isNew` badge); newsletter not in nav | Existing CTA section already surfaces newsletter site-wide |
| Visual approach | Hybrid — dither hero (brand consistency) + Template 2 prose-heavy sections (B2B suitability) | Keeps brand voice while suiting prose copy |
| Newsletter page tone | Calmer than `/enterprise` — no dither, no SplitText, no animation | Single-purpose conversion surface |

## Architecture

### File structure

```
app/
├── enterprise/
│   ├── page.tsx               ← composes sections
│   ├── layout.tsx             ← metadata, optional theme overrides
│   └── components/
│       ├── enterprise-hero.tsx
│       ├── workshops-section.tsx
│       ├── consulting-section.tsx
│       ├── recruiting-section.tsx
│       ├── talks-section.tsx
│       ├── enterprise-cta.tsx
│       ├── partner-logo-strip.tsx ← reused across sections
│       └── enterprise-data.ts  ← copy + logo metadata + mailto subjects
└── newsletter/
    ├── page.tsx               ← inlined sections (small page)
    └── layout.tsx             ← metadata

components/
├── header.tsx                 ← MODIFIED: add Enterprise nav item
└── ui/
    └── check-list.tsx         ← NEW: extracted from blog MDX for shared use

public/
└── logos/
    └── enterprise/
        ├── bbva.svg
        ├── walmart.svg
        ├── pwc.svg
        ├── rappi.svg
        ├── t1.svg
        └── grupo-gigante.svg
```

### Data shape

`app/enterprise/components/enterprise-data.ts` exports:

```ts
type ServiceSection = {
  id: 'workshops' | 'consulting' | 'recruiting' | 'talks';
  eyebrow: string;
  headline: string;
  body: string[];               // paragraphs
  bullets?: string[];           // for CheckList in consulting
  pricing?: string;             // consulting only
  logos: { src: string; alt: string }[];  // empty for consulting
  ctaLabel: string;
  mailtoSubject: string;        // appended to base mailto
};

export const ENTERPRISE_EMAIL = '1996byk@gmail.com';
export const enterpriseSections: ServiceSection[];
```

### Email link helper

Single helper in `enterprise-data.ts`:

```ts
export const buildMailto = (subject: string) =>
  `mailto:${ENTERPRISE_EMAIL}?subject=${encodeURIComponent(subject)}`;
```

## `/enterprise` page composition

| # | Section | Template | Anchor |
|---|---|---|---|
| 1 | Hero | Template 1 (dither, fixed) | — |
| 2 | Workshops | Template 2 (Content With Media) | `#workshops` |
| 3 | Consulting | Template 2 with pricing pill + CheckList | `#consulting` |
| 4 | Recruiting | Template 3 (Grid Of Cards) | `#recruiting` |
| 5 | Talks | Template 2 (lighter copy) | `#talks` |
| 6 | Final CTA | Template 4 (CTA With Inset, dual purpose) | — |
| 7 | Footer | global | — |

### 1. Hero

- Kicker: `PARA EMPRESAS`
- Headline (SplitText, Instrument Serif): *"Lleva la inteligencia artificial al corazón de tu organización."*
- Subhead: positioning AI Builders as MX's largest applied AI community + the four offerings
- Primary CTA: "Hablemos" → `buildMailto('Consulta Enterprise')`
- Secondary CTA: "Ver servicios" → anchor to `#workshops`
- 2x2 image grid: keep existing `hero1–4.avif` by default (do not swap to event-photos unless workshop/corporate-event photos are confirmed present)
- Partner strip footer: `HAN CONFIADO EN NOSOTROS` eyebrow + 6-logo strip (BBVA, Walmart, PwC, Rappi, T1, Grupo Gigante)

### 2. Workshops `#workshops`

- H2: *"Workshops de IA hechos a la medida"*
- Three short paragraphs: format (1–3 días, presencial o remoto), audience (líderes, managers, equipos técnicos), deliverables (manos en código, frameworks de adopción, playbook post-workshop)
- Logo row (small, mono, opacity-40 → 100 on hover): BBVA · WALMART · PwC
- Right media panel: workshop photo with `grayscale hover:grayscale-0`
- Inline CTA: "Solicitar workshop →" → `buildMailto('Consulta Enterprise — Workshops')`

### 3. Consulting `#consulting`

- Eyebrow: `CONSULTORÍA`
- H2: *"Asesoría estratégica mensual con acceso semanal."*
- Pricing pill (matches pill-eyebrow style from `components.md`): `Desde $5,000 USD / mes`
- Prose: positioning ("retainer-only, no proyectos por hora, no scope creep"), what's included
- Right column: `<CheckList>` deliverables card — items: 4 sesiones estratégicas / mes, acceso WhatsApp directo, asesoría técnica + estratégica, intros a la red de builders
- CTA: "Agendar conversación →" → `buildMailto('Consulta Enterprise — Consultoría')`
- No logo row (no public consulting clients yet)

### 4. Recruiting `#recruiting`

- H2: *"Reclutamiento técnico para equipos de IA"*
- Subtitle: positioning (acceso a +1500 builders, ML/AI engineers senior, founding engineers, AI product leaders)
- Three cards (no index numbers):
  1. **Sourcing** — community + curated network feeds top-of-funnel
  2. **Screening** — technical bar + cultural fit work
  3. **Placement** — close + onboarding support
- Logo row below grid: RAPPI · T1 · GRUPO GIGANTE
- CTA: "Empezar búsqueda →" → `buildMailto('Consulta Enterprise — Reclutamiento')`

### 5. Talks `#talks`

- H2: *"Talks y engagement corporativo"*
- ~120-word prose block: keynotes, panels, AI-literacy sessions for boards & leadership; 3 example topics inline (estrategia de IA, talento en MX, ética y gobernanza)
- Right column: small topic-list card (text-based; corporate-talk photo only if confirmed available)
- Logo row: GRUPO GIGANTE · T1
- CTA: "Invitar a hablar →" → `buildMailto('Consulta Enterprise — Talks')`

### 6. Final CTA

Template 4, dual purpose:

- Left column: pill eyebrow `LISTOS PARA EMPEZAR` + H2 "Hablemos" + 4 mailto links (one per service) styled as a list with arrows
- Right column: dark inset card reusing the existing Beehiiv newsletter form (lifted from `components/cta-section.tsx`) + "Únete a +1,000 builders" proof line

## `/newsletter` page composition

| # | Section | Template |
|---|---|---|
| 1 | Hero | Template 2 variant — calm, single column, no dither, no SplitText |
| 2 | What you get | Template 5 (Stats Grid) repurposed for value props |
| 3 | Subscribe | Template 4 right-column (full width on this page) — Beehiiv form |
| 4 | Footer | global |

### 1. Hero

- Kicker: `NEWSLETTER`
- Headline (Instrument Serif, static): *"Las mejores actualizaciones de IA, cada semana."*
- Subhead: ~2 sentences on what this newsletter does + what makes it different (writers in the MX AI ecosystem, not translated US digests)
- Primary CTA: "Suscribirme" — anchor scroll to `#subscribe`
- No image, no animation

### 2. What you get

Three cards (Stats Grid layout), icon + headline + 1-line description:

1. **Updates semanales** — model releases, papers, herramientas
2. **Comunidad y eventos** — qué pasa en AI Builders y la escena MX
3. **Bolsa de trabajo** — ofertas curadas de AI/ML/eng en empresas locales

### 3. Subscribe `#subscribe`

- Full-width dark inset card with the existing Beehiiv form (current `GET` post to `https://aibuildersmx.beehiiv.com/` is preserved; redirects user to Beehiiv-hosted subscribe page)
- "Únete a +1,000 builders hoy" proof line
- Legal footnote: "Sin spam. Cancela cuando quieras."

## Shared / reused components

### `components/ui/check-list.tsx` (new)

Extract the `CheckList` styling currently in blog MDX into a shared `components/ui/check-list.tsx`. Update the blog MDX `CheckList` to re-export or wrap it so existing posts keep working. Used in the Consulting section.

### Beehiiv form

Lifted from `components/cta-section.tsx` without changes to subscription behavior. The current `GET` to `https://aibuildersmx.beehiiv.com/` redirects users to Beehiiv's hosted subscribe page — this is preserved as v1 behavior. Upgrading to a Beehiiv iframe embed for in-page subscription is out of scope.

## Navigation update

`components/header.tsx`:

```ts
const menuItems = [
    { name: 'Events', href: '#events' },
    { name: 'Blog', href: '/blog' },
    { name: 'Bootcamp', href: '/designwithai', isNew: true },
    { name: 'Residencia', href: '/residencia', isNew: true },
    { name: 'Enterprise', href: '/enterprise', isNew: true },  // NEW
];
```

The pill nav fits 5 items at `lg`. Schedule a follow-up to remove `isNew` ~6 weeks after launch.

## SEO / metadata

Each page exports its own `metadata`:

- `/enterprise` — title: "Enterprise — AI Builders Mexico", description: 1-sentence positioning, OG: existing `og-image.png`
- `/newsletter` — title: "Newsletter — AI Builders Mexico", description: 1-sentence pitch, OG: existing `og-image.png`

No custom OG images per page in v1.

## Risks

1. **Logo trademarks.** Use without permission is widely accepted for "former client" claims but not zero-risk. Mitigation: source from press kits where possible; the "han confiado en nosotros" framing avoids endorsement claims; swap to text wordmarks if any company objects.
2. **Hero photo grounding.** If `event-photos/` lacks corporate-engagement photos, the dither hero may read more "community vibes" than "enterprise pitch." Mitigation: keep `hero1–4.avif` as default unless verified enterprise photos exist.
3. **Mailto fallback.** Some users have no default mail handler. Acceptable for B2B v1.
4. **Beehiiv redirect UX.** The current form redirects rather than subscribing in-page. Acceptable; flagged as a future upgrade.

## Acceptance criteria

- [ ] `/enterprise` renders with all 6 sections + footer; anchor links navigate correctly
- [ ] `/newsletter` renders with all 3 sections + footer
- [ ] Header nav shows "Enterprise" with `new` badge on lg+
- [ ] All 6 corporate logos render (real SVG or text fallback)
- [ ] Each section CTA opens the correct pre-filled mailto
- [ ] Newsletter form on both `/enterprise` final CTA and `/newsletter#subscribe` posts to Beehiiv
- [ ] `pnpm build` succeeds with no errors
- [ ] `pnpm lint` passes
- [ ] Manual mobile + desktop check on all sections
- [ ] All copy is in Spanish (`es_MX`); only the route slugs are English

## Out of scope (future)

- Custom OG images per page
- Beehiiv iframe embed for in-page subscription
- Case study cards / quotes / metrics
- Calendly or in-page contact form
- Bilingual toggle
- `isNew` badge removal (schedule for ~6 weeks after launch)
