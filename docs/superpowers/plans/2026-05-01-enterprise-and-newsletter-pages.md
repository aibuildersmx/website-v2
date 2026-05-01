# Enterprise & Newsletter Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `/enterprise` (omnibus B2B landing page with workshops, consulting, recruiting, and talks sections) and `/newsletter` (dedicated subscribe-pitch page), per the spec at `docs/superpowers/specs/2026-05-01-enterprise-and-newsletter-pages-design.md`.

**Architecture:** Two new Next.js App Router routes with their own `layout.tsx` (metadata) and `page.tsx`. `/enterprise` decomposes into focused section components living in `app/enterprise/components/` and a typed `enterprise-data.ts` data file with section copy, logos, and a mailto helper. `/newsletter` is small enough to inline. The blog-only `<CheckList>` is refactored to be theme-agnostic so both blog MDX and the consulting section can use it. The global header gains a new "Enterprise" nav item (no newsletter link — already surfaced in CTAs site-wide).

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind 4, Geist + Instrument Serif fonts, lucide-react icons, existing primitives (`SplitText`, `Dither`, `Button`, `cn`). No new dependencies.

**Verification approach:** This codebase has no Vitest/Jest. Each task verifies with `pnpm build` (catches type + server/client boundary issues), `pnpm lint` (catches lint), and route smoke-checks via `pnpm dev` where applicable. Per CLAUDE.md, `pnpm build` is mandatory before claiming done.

---

## File Structure

**New files:**

```
app/
├── enterprise/
│   ├── page.tsx                              ← composes sections
│   ├── layout.tsx                            ← metadata
│   └── components/
│       ├── enterprise-data.ts                ← copy + logo metadata + mailto helper
│       ├── partner-logo-strip.tsx            ← shared logo row
│       ├── enterprise-hero.tsx
│       ├── workshops-section.tsx
│       ├── consulting-section.tsx
│       ├── recruiting-section.tsx
│       ├── talks-section.tsx
│       └── enterprise-cta.tsx
└── newsletter/
    ├── page.tsx                              ← inlined sections
    └── layout.tsx                            ← metadata

components/
└── ui/
    └── check-list.tsx                        ← extracted from blog MDX

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

**Modified files:**

```
components/
├── header.tsx                                ← add Enterprise nav item
└── blog/mdx/check-list.tsx                   ← thin wrapper around components/ui/check-list.tsx
```

---

### Task 1: Source corporate logos

**Files:**
- Create: `public/logos/enterprise/bbva.svg`
- Create: `public/logos/enterprise/walmart.svg`
- Create: `public/logos/enterprise/pwc.svg`
- Create: `public/logos/enterprise/rappi.svg`
- Create: `public/logos/enterprise/t1.svg`
- Create: `public/logos/enterprise/grupo-gigante.svg`

For each company, fetch the official wordmark/logotype from public press/brand assets. Prefer black-on-transparent SVGs since the page renders these on white backgrounds with mono treatment. PNG is acceptable when SVG is unavailable, but rename it `<company>.png` and update references in Task 3 accordingly.

If an official SVG is genuinely unobtainable for any of the six, **do not block** — create a placeholder SVG that contains a `<text>` element with the company name in a generic mono font. This will be visually replaced by the text-wordmark fallback in `partner-logo-strip.tsx` (Task 4). Document which logos are placeholders in a comment in `enterprise-data.ts` (Task 3).

- [ ] **Step 1: Source logos**

For each of the six companies, attempt to fetch the official SVG wordmark. Suggested sources (verify URLs don't 404 — these are starting points, not absolutes):

- BBVA: `https://www.bbva.com/en/our-brand/` or via Wikipedia Commons SVG export
- Walmart: `https://corporate.walmart.com/about/logos`
- PwC: `https://www.pwc.com/gx/en/about/brand-positioning.html` (often via Wikipedia Commons)
- Rappi: brand page or Wikipedia Commons
- T1: Mexican fintech (T1 Páginas / T1 Comercio) brand assets
- Grupo Gigante: corporate site press section

Use `WebFetch` to inspect each company's brand/press page and download the SVG. If only a PNG is available, save as PNG.

- [ ] **Step 2: Save each logo to `public/logos/enterprise/`**

Each file named `<slug>.svg` (or `.png` if PNG fallback). Slugs:
`bbva`, `walmart`, `pwc`, `rappi`, `t1`, `grupo-gigante`.

For any logo that cannot be sourced, create a placeholder SVG file with this content (replace `BBVA` with the actual company name):

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 40">
  <text x="100" y="28" font-family="ui-monospace, SFMono-Regular, monospace" font-size="20" font-weight="600" text-anchor="middle" fill="currentColor">BBVA</text>
</svg>
```

- [ ] **Step 3: Verify all six files exist**

```bash
ls public/logos/enterprise/
```

Expected output: six files (`.svg` or `.png`). All six must be present before moving on.

- [ ] **Step 4: Commit**

```bash
git add public/logos/enterprise/
git commit -m "Add corporate partner logos for /enterprise page"
```

---

### Task 2: Refactor `CheckList` to be theme-agnostic

The existing `components/blog/mdx/check-list.tsx` reads from `useBlogTheme()` which only works inside the blog layout. We extract the visual into a theme-agnostic `components/ui/check-list.tsx` that accepts a `variant` prop, then update the blog MDX wrapper to pass the theme through. The consulting section in Task 7 uses the new shared component directly.

**Files:**
- Create: `components/ui/check-list.tsx`
- Modify: `components/blog/mdx/check-list.tsx`

- [ ] **Step 1: Create `components/ui/check-list.tsx`**

```tsx
'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type CheckListItem =
    | string
    | ReactNode
    | { title?: ReactNode; description?: ReactNode }

export type CheckListVariant = 'light' | 'dark'

interface CheckListProps {
    items: CheckListItem[]
    variant?: CheckListVariant
    className?: string
}

export function CheckList({ items, variant = 'light', className }: CheckListProps) {
    const isDark = variant === 'dark'

    return (
        <div
            className={cn(
                'rounded-xl border p-5 sm:p-6',
                isDark ? 'border-white/10 bg-white/[0.02]' : 'border-black/10 bg-black/[0.02]',
                className,
            )}
        >
            <ul className={cn('space-y-3 text-sm', isDark ? 'text-[#bac2de]' : 'text-black/70')}>
                {items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                        <span className={cn('shrink-0 mt-0.5', isDark ? 'text-[#a6e3a1]' : 'text-green-600')}>✓</span>
                        <span className="flex-1 min-w-0">{renderItem(item, isDark)}</span>
                    </li>
                ))}
            </ul>
        </div>
    )
}

function renderItem(item: CheckListItem, isDark: boolean): ReactNode {
    if (item === null || item === undefined) return null
    if (typeof item === 'string') return item
    if (
        typeof item === 'object' &&
        !Array.isArray(item) &&
        ('title' in item || 'description' in item) &&
        !('$$typeof' in (item as object))
    ) {
        const { title, description } = item as { title?: ReactNode; description?: ReactNode }
        return (
            <>
                {title ? (
                    <strong className={isDark ? 'text-[#cdd6f4]' : 'text-black'}>{title}</strong>
                ) : null}
                {title && description ? ' — ' : null}
                {description}
            </>
        )
    }
    return item as ReactNode
}
```

Note the difference from the original: removes the `my-6` spacing (the consumer should control vertical rhythm), accepts `className` for overrides, takes `variant` instead of reading `useBlogTheme()`.

- [ ] **Step 2: Replace `components/blog/mdx/check-list.tsx` with a thin wrapper**

Overwrite the file with:

```tsx
'use client'

import { useBlogTheme } from '@/app/(blog)/layout'
import {
    CheckList as SharedCheckList,
    type CheckListItem,
} from '@/components/ui/check-list'

export type { CheckListItem }

export function CheckList({ items }: { items: CheckListItem[] }) {
    const { theme } = useBlogTheme()
    return <SharedCheckList items={items} variant={theme === 'dark' ? 'dark' : 'light'} className="my-6" />
}
```

This preserves the existing MDX API (no frontmatter or post changes needed) while delegating the visual to the shared component. The `my-6` spacing the blog needs is reapplied here so existing posts render unchanged.

- [ ] **Step 3: Verify build still passes**

```bash
pnpm build
```

Expected: build completes without errors. Pay particular attention to any blog post that uses `<CheckList>` — its rendered output should be visually identical.

- [ ] **Step 4: Manual smoke-check**

```bash
pnpm dev
```

Open `http://localhost:3000/blog/segundo-cerebro-cursor` (or any blog post that uses `<CheckList>` — grep `content/blog` to find one) and confirm the checklist renders with a green ✓ on light theme and the same on dark theme. If no blog post uses `<CheckList>`, this is a no-op and you can move on.

- [ ] **Step 5: Commit**

```bash
git add components/ui/check-list.tsx components/blog/mdx/check-list.tsx
git commit -m "Extract CheckList to shared UI for non-blog reuse"
```

---

### Task 3: Create `enterprise-data.ts`

Single source of truth for `/enterprise` page copy, logos, and mailto links. All section components import from this file.

**Files:**
- Create: `app/enterprise/components/enterprise-data.ts`

- [ ] **Step 1: Create the file**

```ts
export const ENTERPRISE_EMAIL = '1996byk@gmail.com'

export const buildMailto = (subject: string): string =>
    `mailto:${ENTERPRISE_EMAIL}?subject=${encodeURIComponent(subject)}`

export interface PartnerLogo {
    src: string         // path under /public, e.g. '/logos/enterprise/bbva.svg'
    alt: string         // brand name, used as fallback text if image fails
    name: string        // mono-uppercase label for text-fallback rendering
}

// Replace any logo whose src points to a placeholder SVG with the same shape.
// Keep `alt` and `name` correct so the text fallback renders cleanly.
export const PARTNER_LOGOS: Record<string, PartnerLogo> = {
    bbva: { src: '/logos/enterprise/bbva.svg', alt: 'BBVA', name: 'BBVA' },
    walmart: { src: '/logos/enterprise/walmart.svg', alt: 'Walmart', name: 'WALMART' },
    pwc: { src: '/logos/enterprise/pwc.svg', alt: 'PwC', name: 'PWC' },
    rappi: { src: '/logos/enterprise/rappi.svg', alt: 'Rappi', name: 'RAPPI' },
    t1: { src: '/logos/enterprise/t1.svg', alt: 'T1', name: 'T1' },
    'grupo-gigante': { src: '/logos/enterprise/grupo-gigante.svg', alt: 'Grupo Gigante', name: 'GRUPO GIGANTE' },
}

export const HERO_LOGOS: PartnerLogo[] = [
    PARTNER_LOGOS.bbva,
    PARTNER_LOGOS.walmart,
    PARTNER_LOGOS.pwc,
    PARTNER_LOGOS.rappi,
    PARTNER_LOGOS.t1,
    PARTNER_LOGOS['grupo-gigante'],
]

export const WORKSHOPS_LOGOS: PartnerLogo[] = [
    PARTNER_LOGOS.bbva,
    PARTNER_LOGOS.walmart,
    PARTNER_LOGOS.pwc,
]

export const RECRUITING_LOGOS: PartnerLogo[] = [
    PARTNER_LOGOS.rappi,
    PARTNER_LOGOS.t1,
    PARTNER_LOGOS['grupo-gigante'],
]

export const TALKS_LOGOS: PartnerLogo[] = [
    PARTNER_LOGOS['grupo-gigante'],
    PARTNER_LOGOS.t1,
]

// ----- Section copy -----

export const HERO_COPY = {
    eyebrow: 'PARA EMPRESAS',
    headline: 'Lleva la inteligencia artificial al corazón de tu organización.',
    subhead:
        'Somos la comunidad de IA más grande de México. Diseñamos workshops, asesoría estratégica, reclutamiento técnico y talks corporativos para equipos que están construyendo con IA en serio.',
    primaryCtaLabel: 'Hablemos',
    primaryCtaSubject: 'Consulta Enterprise',
    secondaryCtaLabel: 'Ver servicios',
    secondaryCtaHref: '#workshops',
    partnersEyebrow: 'HAN CONFIADO EN NOSOTROS',
}

export const WORKSHOPS_COPY = {
    id: 'workshops',
    eyebrow: 'WORKSHOPS',
    headline: 'Workshops de IA hechos a la medida.',
    body: [
        'Sesiones de 1 a 3 días, presenciales o remotas, diseñadas alrededor de los retos reales que tu equipo enfrenta. Sin slides genéricos.',
        'Trabajamos con líderes, managers y equipos técnicos. Cada workshop combina teoría aplicada, manos en código y un framework concreto para llevar lo aprendido al día a día.',
        'Te entregamos un playbook post-workshop con los flujos y herramientas que tu equipo va a usar después de que nos vayamos.',
    ],
    ctaLabel: 'Solicitar workshop',
    ctaSubject: 'Consulta Enterprise — Workshops',
    mediaSrc: '/images/event-photos/cursor-event/cursor-1.jpg', // verify exists in Task 6
    mediaAlt: 'AI Builders workshop in progress',
}

export const CONSULTING_COPY = {
    id: 'consulting',
    eyebrow: 'CONSULTORÍA',
    headline: 'Asesoría estratégica mensual con acceso semanal.',
    pricing: 'Desde $5,000 USD / mes',
    body: [
        'Trabajamos como retainer mensual, no por proyecto ni por hora. Tu equipo de liderazgo recibe acceso directo a los founders de AI Builders cada semana — sin scope creep, sin facturas sorpresa.',
        'Ideal para C-levels y heads of product/engineering que necesitan un partner constante mientras adoptan IA: priorización, arquitectura, contratación y conexiones a la red de builders.',
    ],
    deliverables: [
        { title: '4 sesiones estratégicas / mes', description: 'Acceso directo con los founders' },
        { title: 'WhatsApp directo', description: 'Respuestas en horas, no en semanas' },
        { title: 'Asesoría técnica + estratégica', description: 'Producto, contratación, arquitectura' },
        { title: 'Intros a la red de builders', description: 'Acceso a +1,500 builders en México y EE.UU.' },
    ],
    ctaLabel: 'Agendar conversación',
    ctaSubject: 'Consulta Enterprise — Consultoría',
}

export const RECRUITING_COPY = {
    id: 'recruiting',
    eyebrow: 'RECLUTAMIENTO',
    headline: 'Reclutamiento técnico para equipos de IA.',
    subhead:
        'Acceso a +1,500 builders en México: ML/AI engineers senior, founding engineers y AI product leaders. Cuando publicamos un rol en la red, las mejores postulaciones llegan en días.',
    cards: [
        {
            title: 'Sourcing',
            description:
                'Tapamos en la comunidad y en la red curada. No CVs spam — perfiles que ya tienen contexto en el ecosistema de IA.',
        },
        {
            title: 'Screening',
            description:
                'Filtros técnicos y de cultura antes de que tu equipo invierta tiempo. Te llegan finalistas, no candidatos.',
        },
        {
            title: 'Placement',
            description:
                'Acompañamos el cierre y los primeros 30 días. Si no funciona, lo arreglamos con prioridad.',
        },
    ],
    ctaLabel: 'Empezar búsqueda',
    ctaSubject: 'Consulta Enterprise — Reclutamiento',
}

export const TALKS_COPY = {
    id: 'talks',
    eyebrow: 'TALKS Y ENGAGEMENT',
    headline: 'Talks y engagement corporativo.',
    body: [
        'Keynotes, paneles y sesiones de AI literacy para boards y equipos de liderazgo. Llevamos la conversación de IA del hype a las decisiones reales que tu organización tiene que tomar este año.',
        'Tres temas que pedimos seguido: estrategia de IA para líderes no técnicos, el panorama de talento de IA en México, y ética + gobernanza para equipos en escala.',
    ],
    topics: [
        'Estrategia de IA para líderes',
        'Talento e IA en México',
        'Ética y gobernanza',
    ],
    ctaLabel: 'Invitar a hablar',
    ctaSubject: 'Consulta Enterprise — Talks',
}

export const CTA_COPY = {
    eyebrow: 'LISTOS PARA EMPEZAR',
    headline: 'Hablemos.',
    services: [
        { label: 'Workshops →', subject: WORKSHOPS_COPY.ctaSubject },
        { label: 'Consultoría →', subject: CONSULTING_COPY.ctaSubject },
        { label: 'Reclutamiento →', subject: RECRUITING_COPY.ctaSubject },
        { label: 'Talks →', subject: TALKS_COPY.ctaSubject },
    ],
    newsletterEyebrow: 'NEWSLETTER',
    newsletterHeadline: 'Recibe updates semanales.',
    newsletterBody:
        'Herramientas, papers, eventos y vacantes del ecosistema de IA en México. Sin spam, solo valor.',
    newsletterProof: 'Únete a +1,000 builders hoy',
}
```

- [ ] **Step 2: Verify the file type-checks**

```bash
pnpm build
```

Expected: build completes (the file is currently unused but should compile cleanly).

- [ ] **Step 3: Commit**

```bash
git add app/enterprise/components/enterprise-data.ts
git commit -m "Add enterprise page data: copy, logos, mailto helper"
```

---

### Task 4: Build `PartnerLogoStrip` component

A reusable horizontal row of partner logos with consistent treatment (mono filter, opacity-40, hover-to-100). Renders the SVG `<img>` and falls back to a Geist Mono wordmark when the image errors out.

**Files:**
- Create: `app/enterprise/components/partner-logo-strip.tsx`

- [ ] **Step 1: Create the component**

```tsx
'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { PartnerLogo } from './enterprise-data'

interface PartnerLogoStripProps {
    logos: PartnerLogo[]
    eyebrow?: string
    variant?: 'light' | 'dark'
    size?: 'sm' | 'md'
    className?: string
}

export function PartnerLogoStrip({
    logos,
    eyebrow,
    variant = 'light',
    size = 'md',
    className,
}: PartnerLogoStripProps) {
    const isDark = variant === 'dark'
    const heightClass = size === 'sm' ? 'h-5 sm:h-6' : 'h-6 sm:h-8'

    return (
        <div className={cn('flex flex-col items-center gap-4 sm:gap-6', className)}>
            {eyebrow ? (
                <span
                    className={cn(
                        'text-[10px] sm:text-xs font-mono uppercase tracking-widest',
                        isDark ? 'text-white/40' : 'text-black/40',
                    )}
                >
                    {eyebrow}
                </span>
            ) : null}
            <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 sm:gap-x-12">
                {logos.map((logo) => (
                    <li key={logo.alt}>
                        <LogoCell logo={logo} variant={variant} heightClass={heightClass} />
                    </li>
                ))}
            </ul>
        </div>
    )
}

function LogoCell({
    logo,
    variant,
    heightClass,
}: {
    logo: PartnerLogo
    variant: 'light' | 'dark'
    heightClass: string
}) {
    const [errored, setErrored] = useState(false)
    const isDark = variant === 'dark'

    if (errored) {
        return (
            <span
                className={cn(
                    'font-mono uppercase tracking-widest text-xs sm:text-sm font-medium',
                    isDark ? 'text-white/60' : 'text-black/60',
                )}
            >
                {logo.name}
            </span>
        )
    }

    return (
        <img
            src={logo.src}
            alt={logo.alt}
            className={cn(
                'w-auto object-contain transition-opacity duration-300',
                heightClass,
                isDark ? 'opacity-50 hover:opacity-100 invert' : 'opacity-40 hover:opacity-100 grayscale',
            )}
            onError={() => setErrored(true)}
        />
    )
}
```

- [ ] **Step 2: Verify build**

```bash
pnpm build
```

Expected: build passes.

- [ ] **Step 3: Commit**

```bash
git add app/enterprise/components/partner-logo-strip.tsx
git commit -m "Add PartnerLogoStrip with image-fallback to text wordmark"
```

---

### Task 5: Build `EnterpriseHero`

Template 1 (dither, fixed) hero adapted for enterprise. Reuses `<HeroHeader>` from `components/header.tsx` (already updated in Task 13 — this task assumes the global header exists; the order doesn't matter for the hero itself since `HeroHeader` is loaded via the same import either way).

**Files:**
- Create: `app/enterprise/components/enterprise-hero.tsx`

- [ ] **Step 1: Create the component**

```tsx
'use client'

import Link from 'next/link'
import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import Dither from '@/components/Dither'
import SplitText from '@/components/SplitText'
import { HeroHeader } from '@/components/header'
import { Button } from '@/components/ui/button'
import { HERO_COPY, HERO_LOGOS, buildMailto } from './enterprise-data'
import { PartnerLogoStrip } from './partner-logo-strip'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export function EnterpriseHero() {
    const gridRef = useRef<HTMLDivElement>(null)

    useGSAP(
        () => {
            if (!gridRef.current) return
            const images = gridRef.current.children
            gsap.fromTo(
                images,
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    stagger: 0.1,
                    ease: 'power3.out',
                    scrollTrigger: { trigger: gridRef.current, start: 'top 80%', once: true },
                },
            )
        },
        { scope: gridRef },
    )

    return (
        <div className="relative">
            <HeroHeader />
            <section className="fixed top-0 left-0 h-[100dvh] w-full flex flex-col pointer-events-none -z-10 bg-[#212121]">
                <div className="absolute inset-0 pointer-events-auto">
                    <Dither />
                </div>

                <div className="flex-1 flex items-center w-full pt-16 pb-2 sm:pt-20 sm:pb-4 md:pt-32 md:pb-8 relative z-10 overflow-hidden">
                    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 lg:gap-16">
                            {/* Left: copy */}
                            <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left">
                                <span className="mb-3 sm:mb-4 text-[10px] sm:text-xs font-mono uppercase tracking-widest text-white/60">
                                    {HERO_COPY.eyebrow}
                                </span>
                                <SplitText
                                    text={HERO_COPY.headline}
                                    className="text-balance text-3xl sm:text-4xl md:text-5xl font-medium text-white lg:text-6xl xl:text-7xl leading-[1.1] font-instrument text-center lg:text-left"
                                    delay={30}
                                    duration={0.8}
                                    ease="power3.out"
                                    splitType="chars"
                                    from={{ opacity: 0, y: 40 }}
                                    to={{ opacity: 1, y: 0 }}
                                    threshold={0.1}
                                    rootMargin="-50px"
                                    tag="h1"
                                    textAlign="inherit"
                                />
                                <p className="mt-3 sm:mt-6 md:mt-8 text-pretty text-sm sm:text-lg md:text-xl text-white/80 max-w-lg">
                                    {HERO_COPY.subhead}
                                </p>
                                <div className="mt-8 md:mt-10 hidden lg:flex items-center gap-3 pointer-events-auto">
                                    <Button
                                        asChild
                                        size="lg"
                                        className="bg-white text-black hover:bg-white/90 px-10 py-7 text-lg font-medium rounded-xl"
                                    >
                                        <Link href={buildMailto(HERO_COPY.primaryCtaSubject)}>
                                            <span className="text-nowrap">{HERO_COPY.primaryCtaLabel}</span>
                                        </Link>
                                    </Button>
                                    <Link
                                        href={HERO_COPY.secondaryCtaHref}
                                        className="px-6 py-4 rounded-xl border border-white/20 text-white/80 hover:text-white hover:border-white/40 hover:bg-white/5 text-sm font-mono uppercase tracking-widest transition-all"
                                    >
                                        {HERO_COPY.secondaryCtaLabel}
                                    </Link>
                                </div>
                            </div>

                            {/* Right: 2x2 image grid (reuse existing hero1-4) */}
                            <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-end pointer-events-auto">
                                <div
                                    ref={gridRef}
                                    className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 w-full max-w-[360px] sm:max-w-[400px] md:max-w-[500px] lg:max-w-none"
                                >
                                    {(['/hero1.avif', '/hero2.avif', '/hero3.avif', '/hero4.avif'] as const).map(
                                        (src, i) => (
                                            <div
                                                key={src}
                                                className="relative aspect-square w-full bg-[#212121]/80 rounded-xl sm:rounded-2xl border border-white/10 overflow-hidden"
                                            >
                                                <img
                                                    src={src}
                                                    alt={`AI Builders hero ${i + 1}`}
                                                    className="absolute inset-0 w-full h-full object-cover grayscale transition-transform duration-500 hover:scale-105"
                                                />
                                            </div>
                                        ),
                                    )}
                                </div>

                                {/* Mobile CTAs under grid */}
                                <div className="mt-3 sm:mt-6 flex lg:hidden w-full gap-2 sm:gap-3 pointer-events-auto shrink-0">
                                    <Button
                                        asChild
                                        size="lg"
                                        className="flex-1 bg-white text-black hover:bg-white/90 px-4 sm:px-10 py-4 sm:py-7 text-sm sm:text-lg font-medium rounded-xl"
                                    >
                                        <Link href={buildMailto(HERO_COPY.primaryCtaSubject)}>
                                            <span className="text-nowrap">{HERO_COPY.primaryCtaLabel}</span>
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Partner strip (desktop only) */}
                <div className="relative z-10 pb-3 sm:pb-6 md:pb-8 shrink-0 hidden md:block pointer-events-auto">
                    <PartnerLogoStrip
                        logos={HERO_LOGOS}
                        eyebrow={HERO_COPY.partnersEyebrow}
                        variant="dark"
                        size="sm"
                    />
                </div>
            </section>
        </div>
    )
}
```

- [ ] **Step 2: Verify build**

```bash
pnpm build
```

Expected: build passes. Server/client boundary issues are the main risk here — all imports must work in a `'use client'` boundary.

- [ ] **Step 3: Commit**

```bash
git add app/enterprise/components/enterprise-hero.tsx
git commit -m "Add EnterpriseHero with dither + corporate logo strip"
```

---

### Task 6: Build `WorkshopsSection`

Template 2 (Content With Media) with the workshops logo row.

**Files:**
- Create: `app/enterprise/components/workshops-section.tsx`

- [ ] **Step 1: Verify the hero photo path**

```bash
ls public/images/event-photos/
```

If a `cursor-event/` directory with `cursor-1.jpg` exists (or any workshop-style photo), use that. Otherwise pick any existing photo from `public/images/event-photos/` and update `WORKSHOPS_COPY.mediaSrc` in `enterprise-data.ts` accordingly. If no event-photos directory has anything usable, fall back to `/hero1.avif`.

- [ ] **Step 2: Create the component**

```tsx
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WORKSHOPS_COPY, WORKSHOPS_LOGOS, buildMailto } from './enterprise-data'
import { PartnerLogoStrip } from './partner-logo-strip'

export function WorkshopsSection() {
    return (
        <section
            id={WORKSHOPS_COPY.id}
            className="relative py-16 sm:py-24 md:py-32 bg-white text-black border-t border-black/5"
        >
            <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-12 sm:space-y-16">
                <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-start">
                    <div>
                        <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-black/40">
                            {WORKSHOPS_COPY.eyebrow}
                        </span>
                        <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-medium font-instrument leading-[1.1] text-balance">
                            {WORKSHOPS_COPY.headline}
                        </h2>
                    </div>
                    <div className="space-y-4 text-black/60 text-base sm:text-lg leading-relaxed">
                        {WORKSHOPS_COPY.body.map((p, i) => (
                            <p key={i}>{p}</p>
                        ))}
                        <Button
                            asChild
                            size="lg"
                            className="mt-2 bg-black text-white hover:bg-black/90 rounded-xl group"
                        >
                            <Link href={buildMailto(WORKSHOPS_COPY.ctaSubject)} className="flex items-center gap-2">
                                <span>{WORKSHOPS_COPY.ctaLabel}</span>
                                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Media panel */}
                <div className="relative rounded-2xl sm:rounded-3xl border border-black/10 overflow-hidden h-64 sm:h-80 md:h-[32rem]">
                    <img
                        src={WORKSHOPS_COPY.mediaSrc}
                        alt={WORKSHOPS_COPY.mediaAlt}
                        className="absolute inset-0 w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                </div>

                {/* Logo strip */}
                <PartnerLogoStrip logos={WORKSHOPS_LOGOS} variant="light" size="md" />
            </div>
        </section>
    )
}
```

- [ ] **Step 3: Verify build**

```bash
pnpm build
```

- [ ] **Step 4: Commit**

```bash
git add app/enterprise/components/workshops-section.tsx
git commit -m "Add WorkshopsSection (Template 2 with logo strip)"
```

---

### Task 7: Build `ConsultingSection`

Template 2 variant with pricing pill and `<CheckList>` deliverables. No logo row (no public consulting clients yet).

**Files:**
- Create: `app/enterprise/components/consulting-section.tsx`

- [ ] **Step 1: Create the component**

```tsx
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CheckList } from '@/components/ui/check-list'
import { CONSULTING_COPY, buildMailto } from './enterprise-data'

export function ConsultingSection() {
    return (
        <section
            id={CONSULTING_COPY.id}
            className="relative py-16 sm:py-24 md:py-32 bg-white text-black border-t border-black/5"
        >
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <div className="grid md:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-start">
                    <div>
                        <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-black/40">
                            {CONSULTING_COPY.eyebrow}
                        </span>
                        <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-medium font-instrument leading-[1.1] text-balance">
                            {CONSULTING_COPY.headline}
                        </h2>

                        {/* Pricing pill */}
                        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/[0.02] px-4 py-2">
                            <span className="size-1.5 rounded-full bg-black animate-pulse" />
                            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest font-bold text-black/70">
                                {CONSULTING_COPY.pricing}
                            </span>
                        </div>

                        <div className="mt-6 sm:mt-8 space-y-4 text-black/60 text-base sm:text-lg leading-relaxed">
                            {CONSULTING_COPY.body.map((p, i) => (
                                <p key={i}>{p}</p>
                            ))}
                        </div>

                        <Button
                            asChild
                            size="lg"
                            className="mt-6 sm:mt-8 bg-black text-white hover:bg-black/90 rounded-xl group"
                        >
                            <Link href={buildMailto(CONSULTING_COPY.ctaSubject)} className="flex items-center gap-2">
                                <span>{CONSULTING_COPY.ctaLabel}</span>
                                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </Button>
                    </div>

                    <div>
                        <p className="mb-4 text-[10px] sm:text-xs font-mono uppercase tracking-widest text-black/40">
                            QUÉ INCLUYE
                        </p>
                        <CheckList items={CONSULTING_COPY.deliverables} variant="light" />
                    </div>
                </div>
            </div>
        </section>
    )
}
```

- [ ] **Step 2: Verify build**

```bash
pnpm build
```

- [ ] **Step 3: Commit**

```bash
git add app/enterprise/components/consulting-section.tsx
git commit -m "Add ConsultingSection with pricing pill + deliverables CheckList"
```

---

### Task 8: Build `RecruitingSection`

Template 3 (Grid Of Cards) with three service cards and the recruiting logo row.

**Files:**
- Create: `app/enterprise/components/recruiting-section.tsx`

- [ ] **Step 1: Create the component**

```tsx
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RECRUITING_COPY, RECRUITING_LOGOS, buildMailto } from './enterprise-data'
import { PartnerLogoStrip } from './partner-logo-strip'

export function RecruitingSection() {
    return (
        <section
            id={RECRUITING_COPY.id}
            className="relative py-16 sm:py-24 md:py-32 bg-white text-black border-t border-black/5"
        >
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <header className="flex flex-col items-center text-center space-y-3 sm:space-y-4 max-w-3xl mx-auto">
                    <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-black/40">
                        {RECRUITING_COPY.eyebrow}
                    </span>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-instrument font-medium leading-tight text-balance">
                        {RECRUITING_COPY.headline}
                    </h2>
                    <p className="text-base sm:text-lg text-black/60 leading-relaxed max-w-2xl">
                        {RECRUITING_COPY.subhead}
                    </p>
                </header>

                <ul className="mt-12 sm:mt-16 md:mt-20 grid gap-4 sm:gap-6 md:gap-8 md:grid-cols-3">
                    {RECRUITING_COPY.cards.map((card, i) => (
                        <li
                            key={card.title}
                            className="group relative border border-black/10 rounded-xl sm:rounded-2xl bg-white hover:border-black/20 hover:shadow-lg hover:shadow-black/5 transition-all duration-500 p-6 sm:p-8"
                        >
                            <span className="hidden md:block absolute top-4 right-4 text-xs font-mono text-black/20">
                                / {String(i + 1).padStart(2, '0')}
                            </span>
                            <h3 className="text-xl sm:text-2xl font-instrument font-medium">{card.title}</h3>
                            <p className="mt-3 text-sm sm:text-base text-black/60 leading-relaxed">
                                {card.description}
                            </p>
                        </li>
                    ))}
                </ul>

                <div className="mt-12 sm:mt-16 flex flex-col items-center gap-6 sm:gap-8">
                    <PartnerLogoStrip logos={RECRUITING_LOGOS} variant="light" size="md" />
                    <Button
                        asChild
                        size="lg"
                        className="bg-black text-white hover:bg-black/90 rounded-xl group"
                    >
                        <Link href={buildMailto(RECRUITING_COPY.ctaSubject)} className="flex items-center gap-2">
                            <span>{RECRUITING_COPY.ctaLabel}</span>
                            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    )
}
```

- [ ] **Step 2: Verify build**

```bash
pnpm build
```

- [ ] **Step 3: Commit**

```bash
git add app/enterprise/components/recruiting-section.tsx
git commit -m "Add RecruitingSection (Template 3 grid + logo strip)"
```

---

### Task 9: Build `TalksSection`

Template 2 with lighter copy + topic list + logo row.

**Files:**
- Create: `app/enterprise/components/talks-section.tsx`

- [ ] **Step 1: Create the component**

```tsx
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TALKS_COPY, TALKS_LOGOS, buildMailto } from './enterprise-data'
import { PartnerLogoStrip } from './partner-logo-strip'

export function TalksSection() {
    return (
        <section
            id={TALKS_COPY.id}
            className="relative py-16 sm:py-24 md:py-32 bg-white text-black border-t border-black/5"
        >
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <div className="grid md:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-start">
                    <div>
                        <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-black/40">
                            {TALKS_COPY.eyebrow}
                        </span>
                        <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-medium font-instrument leading-[1.1] text-balance">
                            {TALKS_COPY.headline}
                        </h2>
                        <div className="mt-6 sm:mt-8 space-y-4 text-black/60 text-base sm:text-lg leading-relaxed">
                            {TALKS_COPY.body.map((p, i) => (
                                <p key={i}>{p}</p>
                            ))}
                        </div>
                        <Button
                            asChild
                            size="lg"
                            className="mt-6 sm:mt-8 bg-black text-white hover:bg-black/90 rounded-xl group"
                        >
                            <Link href={buildMailto(TALKS_COPY.ctaSubject)} className="flex items-center gap-2">
                                <span>{TALKS_COPY.ctaLabel}</span>
                                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </Button>
                    </div>

                    <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-6 sm:p-8">
                        <p className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-black/40">
                            TEMAS QUE NOS PIDEN
                        </p>
                        <ul className="mt-4 space-y-3">
                            {TALKS_COPY.topics.map((topic) => (
                                <li
                                    key={topic}
                                    className="text-lg sm:text-xl font-instrument font-medium text-black border-b border-black/5 pb-3 last:border-b-0"
                                >
                                    {topic}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="mt-12 sm:mt-16">
                    <PartnerLogoStrip logos={TALKS_LOGOS} variant="light" size="md" />
                </div>
            </div>
        </section>
    )
}
```

- [ ] **Step 2: Verify build**

```bash
pnpm build
```

- [ ] **Step 3: Commit**

```bash
git add app/enterprise/components/talks-section.tsx
git commit -m "Add TalksSection (Template 2 with topic list + logos)"
```

---

### Task 10: Build `EnterpriseCTA`

Template 4 dual-purpose: left column lists all 4 services as mailto links, right column is the dark inset Beehiiv newsletter form.

**Files:**
- Create: `app/enterprise/components/enterprise-cta.tsx`

- [ ] **Step 1: Create the component**

```tsx
'use client'

import Link from 'next/link'
import { ArrowRight, Mail, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CTA_COPY, buildMailto } from './enterprise-data'

export function EnterpriseCTA() {
    return (
        <section className="relative py-16 sm:py-24 md:py-32 overflow-hidden bg-white text-black border-t border-black/5">
            {/* Blur orbs */}
            <div className="pointer-events-none absolute -top-24 left-1/4 size-72 rounded-full bg-black/[0.02] blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 right-1/4 size-80 rounded-full bg-black/[0.02] blur-3xl" />

            <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
                <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
                    {/* Left: pill + headline + service mailto list */}
                    <div className="flex flex-col items-start space-y-5 sm:space-y-6">
                        <div className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-black/[0.02] px-3 py-1.5">
                            <span className="size-1.5 rounded-full bg-black animate-pulse" />
                            <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest font-bold text-black/60">
                                {CTA_COPY.eyebrow}
                            </span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-instrument font-medium leading-[1.1] text-balance">
                            {CTA_COPY.headline}
                        </h2>
                        <ul className="w-full space-y-2 sm:space-y-3 mt-2">
                            {CTA_COPY.services.map((service) => (
                                <li key={service.subject}>
                                    <Link
                                        href={buildMailto(service.subject)}
                                        className="group flex items-center justify-between border-b border-black/10 py-3 sm:py-4 hover:border-black/40 transition-colors"
                                    >
                                        <span className="text-lg sm:text-xl font-instrument font-medium text-black">
                                            {service.label.replace(' →', '')}
                                        </span>
                                        <ArrowRight className="size-4 sm:size-5 text-black/40 transition-all group-hover:translate-x-1 group-hover:text-black" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Right: dark inset newsletter card */}
                    <div className="relative">
                        <div className="bg-black text-white p-6 sm:p-8 md:p-12 rounded-2xl sm:rounded-3xl overflow-hidden relative">
                            <div
                                className="absolute inset-0 opacity-10 pointer-events-none"
                                style={{
                                    backgroundImage:
                                        'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                                    backgroundSize: '24px 24px',
                                }}
                            />
                            <div className="relative z-10">
                                <div className="size-10 sm:size-12 bg-white/10 rounded-xl sm:rounded-2xl flex items-center justify-center mb-6 sm:mb-8">
                                    <Mail className="size-5 sm:size-6 text-white" />
                                </div>
                                <p className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-white/60 mb-3">
                                    {CTA_COPY.newsletterEyebrow}
                                </p>
                                <h3 className="text-xl sm:text-2xl md:text-3xl font-instrument font-medium mb-3 sm:mb-4">
                                    {CTA_COPY.newsletterHeadline}
                                </h3>
                                <p className="text-white/60 mb-6 sm:mb-8 text-balance text-sm sm:text-base">
                                    {CTA_COPY.newsletterBody}
                                </p>
                                <form
                                    className="space-y-3 sm:space-y-4"
                                    action="https://aibuildersmx.beehiiv.com/"
                                    method="GET"
                                    target="_blank"
                                >
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="tu@email.com"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg sm:rounded-xl px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-base text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                                    />
                                    <Button
                                        type="submit"
                                        className="w-full bg-white text-black hover:bg-white/90 py-5 sm:py-6 text-sm sm:text-base font-bold rounded-lg sm:rounded-xl flex items-center justify-center gap-2 group"
                                    >
                                        <span>Suscribirme</span>
                                        <Send className="size-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                                    </Button>
                                </form>
                                <p className="mt-4 sm:mt-6 text-[9px] sm:text-[10px] font-mono text-white/30 uppercase tracking-widest text-center">
                                    {CTA_COPY.newsletterProof}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
```

- [ ] **Step 2: Verify build**

```bash
pnpm build
```

- [ ] **Step 3: Commit**

```bash
git add app/enterprise/components/enterprise-cta.tsx
git commit -m "Add EnterpriseCTA dual-purpose section (services + newsletter)"
```

---

### Task 11: Compose `/enterprise` page + layout

**Files:**
- Create: `app/enterprise/page.tsx`
- Create: `app/enterprise/layout.tsx`

- [ ] **Step 1: Create `app/enterprise/layout.tsx`**

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Enterprise — AI Builders Mexico',
    description:
        'Workshops, consultoría, reclutamiento y talks de IA para empresas. La comunidad de IA más grande de México al servicio de tu organización.',
    icons: {
        icon: '/favicon.svg',
        shortcut: '/favicon.svg',
    },
    openGraph: {
        title: 'Enterprise — AI Builders Mexico',
        description:
            'Workshops, consultoría, reclutamiento y talks de IA para empresas en México.',
        type: 'website',
        locale: 'es_MX',
        siteName: 'AI Builders Mexico',
    },
}

export default function EnterpriseLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return <>{children}</>
}
```

- [ ] **Step 2: Create `app/enterprise/page.tsx`**

```tsx
import { EnterpriseHero } from './components/enterprise-hero'
import { WorkshopsSection } from './components/workshops-section'
import { ConsultingSection } from './components/consulting-section'
import { RecruitingSection } from './components/recruiting-section'
import { TalksSection } from './components/talks-section'
import { EnterpriseCTA } from './components/enterprise-cta'

export default function EnterprisePage() {
    return (
        <div className="relative min-h-screen bg-black">
            <EnterpriseHero />
            <div className="relative z-10 bg-white mt-[100vh]">
                <WorkshopsSection />
                <ConsultingSection />
                <RecruitingSection />
                <TalksSection />
                <EnterpriseCTA />
                <footer className="bg-[#212121] py-12 sm:py-16">
                    <p className="text-white/30 text-[10px] sm:text-xs font-mono tracking-widest uppercase text-center px-4">
                        2026 — built in v0, hand crafted in cursor, made with ♥︎ by aibuilders.mx
                    </p>
                </footer>
            </div>
        </div>
    )
}
```

The structure mirrors the homepage's hero-fixed-with-content-scrolling-over pattern (see `app/page.tsx`). `EnterpriseHero` itself contains the `fixed top-0` section that pins to the viewport, so no extra wrapper is needed. The footer is inlined here since the global `Footer` is also fixed-positioned and won't compose with the rest of the page.

- [ ] **Step 3: Verify build**

```bash
pnpm build
```

- [ ] **Step 4: Manual route check**

```bash
pnpm dev
```

Open `http://localhost:3000/enterprise`. Verify:
- Hero renders with dither + headline + image grid + corporate logo strip
- Scrolling reveals each of the 4 service sections
- Anchor links from the hero secondary CTA (`#workshops`) and from the EnterpriseCTA service list (`mailto:` URLs) work
- All 6 logos render (real or text-fallback)
- Mobile (devtools 375px width) shows the hero stack properly and the sections stack vertically without horizontal scroll

- [ ] **Step 5: Commit**

```bash
git add app/enterprise/page.tsx app/enterprise/layout.tsx
git commit -m "Add /enterprise page composing all sections"
```

---

### Task 12: Build `/newsletter` page + layout

Single inlined page with hero, value props, and subscribe form.

**Files:**
- Create: `app/newsletter/page.tsx`
- Create: `app/newsletter/layout.tsx`

- [ ] **Step 1: Create `app/newsletter/layout.tsx`**

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Newsletter — AI Builders Mexico',
    description:
        'Las mejores actualizaciones de IA, cada semana. Updates, eventos, comunidad y ofertas de trabajo en el ecosistema de IA en México.',
    icons: {
        icon: '/favicon.svg',
        shortcut: '/favicon.svg',
    },
    openGraph: {
        title: 'Newsletter — AI Builders Mexico',
        description: 'Las mejores actualizaciones de IA, cada semana.',
        type: 'website',
        locale: 'es_MX',
        siteName: 'AI Builders Mexico',
    },
}

export default function NewsletterLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return <>{children}</>
}
```

- [ ] **Step 2: Create `app/newsletter/page.tsx`**

```tsx
'use client'

import Link from 'next/link'
import { Briefcase, Mail, Newspaper, Send, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HeroHeader } from '@/components/header'

const VALUE_CARDS = [
    {
        icon: Newspaper,
        title: 'Updates semanales',
        description:
            'Lanzamientos de modelos, papers que importan y herramientas nuevas — curado, no firehose.',
    },
    {
        icon: Users,
        title: 'Comunidad y eventos',
        description:
            'Qué está pasando en AI Builders Mexico y en la escena de IA local: meetups, workshops, hackathons.',
    },
    {
        icon: Briefcase,
        title: 'Bolsa de trabajo',
        description:
            'Ofertas curadas de roles de AI/ML/eng en empresas mexicanas que están construyendo en serio.',
    },
]

export default function NewsletterPage() {
    return (
        <div className="relative min-h-screen bg-white text-black">
            <HeroHeader />

            {/* Hero — calm, no dither, no animation */}
            <section className="relative pt-32 sm:pt-40 pb-16 sm:pb-24">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center space-y-5 sm:space-y-6">
                    <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-black/40">
                        NEWSLETTER
                    </span>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-instrument font-medium leading-[1.1] text-balance">
                        Las mejores actualizaciones de IA, cada semana.
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl text-black/60 leading-relaxed max-w-2xl mx-auto">
                        Curado por builders en el ecosistema de IA en México — no es un digest traducido del inglés. Updates de modelos, comunidad, eventos y vacantes en una sola lectura semanal.
                    </p>
                    <div className="pt-4">
                        <Button
                            asChild
                            size="lg"
                            className="bg-black text-white hover:bg-black/90 rounded-xl px-8 py-6 text-base"
                        >
                            <Link href="#subscribe">Suscribirme</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Value cards */}
            <section className="relative py-12 sm:py-16 md:py-24 border-t border-black/5">
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
                        {VALUE_CARDS.map((card) => (
                            <article
                                key={card.title}
                                className="group border border-black/10 rounded-xl sm:rounded-2xl p-6 sm:p-8 hover:border-black/20 hover:shadow-lg hover:shadow-black/5 transition-all duration-500"
                            >
                                <span className="inline-flex items-center justify-center size-10 rounded-full bg-black/[0.03] text-black/60 group-hover:bg-black group-hover:text-white transition-all duration-500">
                                    <card.icon className="size-5" />
                                </span>
                                <h2 className="mt-5 text-xl sm:text-2xl font-instrument font-medium">
                                    {card.title}
                                </h2>
                                <p className="mt-2 text-sm sm:text-base text-black/60 leading-relaxed">
                                    {card.description}
                                </p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* Subscribe */}
            <section
                id="subscribe"
                className="relative py-16 sm:py-24 md:py-32 border-t border-black/5"
            >
                <div className="mx-auto max-w-2xl px-4 sm:px-6">
                    <div className="bg-black text-white p-8 sm:p-12 rounded-2xl sm:rounded-3xl overflow-hidden relative">
                        <div
                            className="absolute inset-0 opacity-10 pointer-events-none"
                            style={{
                                backgroundImage:
                                    'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                                backgroundSize: '24px 24px',
                            }}
                        />
                        <div className="relative z-10">
                            <div className="size-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 sm:mb-8">
                                <Mail className="size-6 text-white" />
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-instrument font-medium mb-4">
                                Suscríbete gratis
                            </h2>
                            <p className="text-white/60 mb-6 sm:mb-8 text-sm sm:text-base">
                                Sin spam. Cancela cuando quieras.
                            </p>
                            <form
                                className="space-y-3 sm:space-y-4"
                                action="https://aibuildersmx.beehiiv.com/"
                                method="GET"
                                target="_blank"
                            >
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="tu@email.com"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-base text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                                />
                                <Button
                                    type="submit"
                                    className="w-full bg-white text-black hover:bg-white/90 py-6 text-base font-bold rounded-xl flex items-center justify-center gap-2 group"
                                >
                                    <span>Suscribirme</span>
                                    <Send className="size-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                                </Button>
                            </form>
                            <p className="mt-6 text-[10px] font-mono text-white/30 uppercase tracking-widest text-center">
                                Únete a +1,000 builders hoy
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#212121] py-12 sm:py-16">
                <p className="text-white/30 text-[10px] sm:text-xs font-mono tracking-widest uppercase text-center px-4">
                    2026 — built in v0, hand crafted in cursor, made with ♥︎ by aibuilders.mx
                </p>
            </footer>
        </div>
    )
}
```

- [ ] **Step 3: Verify build**

```bash
pnpm build
```

- [ ] **Step 4: Manual route check**

```bash
pnpm dev
```

Open `http://localhost:3000/newsletter`. Verify:
- Hero renders calm — no dither, no SplitText animation
- "Suscribirme" button scrolls to `#subscribe`
- 3 value cards render with icons + hover state
- Form submits to Beehiiv (opens new tab)
- Mobile renders without horizontal scroll

- [ ] **Step 5: Commit**

```bash
git add app/newsletter/page.tsx app/newsletter/layout.tsx
git commit -m "Add /newsletter page (calm hero + value cards + Beehiiv form)"
```

---

### Task 13: Add Enterprise to global header

**Files:**
- Modify: `components/header.tsx:9-14`

- [ ] **Step 1: Edit `components/header.tsx`**

Find the `menuItems` array near the top of the file:

```tsx
const menuItems = [
    { name: 'Events', href: '#events' },
    { name: 'Blog', href: '/blog' },
    { name: 'Bootcamp', href: '/designwithai', isNew: true },
    { name: 'Residencia', href: '/residencia', isNew: true },
]
```

Replace with:

```tsx
const menuItems = [
    { name: 'Events', href: '#events' },
    { name: 'Blog', href: '/blog' },
    { name: 'Bootcamp', href: '/designwithai', isNew: true },
    { name: 'Residencia', href: '/residencia', isNew: true },
    { name: 'Enterprise', href: '/enterprise', isNew: true },
]
```

- [ ] **Step 2: Verify build**

```bash
pnpm build
```

- [ ] **Step 3: Manual route check**

```bash
pnpm dev
```

Open `http://localhost:3000/`. Verify:
- Header pill nav now shows 5 items: Events, Blog, Bootcamp, Residencia, Enterprise
- "Enterprise" has the `new` micro-badge
- At lg breakpoint the nav doesn't overflow the pill; at sm and below the desktop nav is hidden as before

Open `http://localhost:3000/enterprise` and confirm the same header appears.

- [ ] **Step 4: Commit**

```bash
git add components/header.tsx
git commit -m "Add Enterprise to global nav"
```

---

### Task 14: Final verification

**No file changes — verification only.**

- [ ] **Step 1: Full build**

```bash
pnpm build
```

Expected: build succeeds with no errors. Note any warnings but they are not blocking unless they reference our new files.

- [ ] **Step 2: Lint**

```bash
pnpm lint
```

Expected: no errors. Fix any new lint warnings introduced by tasks 1–13 before declaring done.

- [ ] **Step 3: Manual route checklist**

Run `pnpm dev`, then for each route below confirm visual + interaction:

**`/` (homepage)**
- Hero loads with dither
- Header pill shows 5 items including "Enterprise" with `new` badge
- Existing CTA section still works

**`/enterprise`**
- Hero with dither + corporate logo strip
- Workshops section with 3 logos and inline CTA
- Consulting section with pricing pill + CheckList
- Recruiting section: 3 cards + 3 logos + CTA
- Talks section: copy + topic list + 2 logos
- Final CTA: 4 service mailto links + Beehiiv form
- All 4 mailto links open mail client with correct pre-filled subject (test at least one)
- `#workshops`, `#consulting`, `#recruiting`, `#talks` anchors scroll correctly

**`/newsletter`**
- Calm hero (no dither, no animation)
- 3 value cards with icons
- Subscribe form submits (opens Beehiiv in new tab)
- Footer renders

**`/blog/<any-post-with-CheckList>`**
- CheckList still renders correctly in light + dark themes
- Use `grep -l "CheckList" content/blog/*.mdx` to find a post that uses it; if none, skip this check

**Mobile (375px viewport in devtools)**
- All routes render without horizontal scroll
- All section headlines remain readable

- [ ] **Step 4: Self-audit against the spec**

Open `docs/superpowers/specs/2026-05-01-enterprise-and-newsletter-pages-design.md` and walk through the **Acceptance criteria** section. Tick off each item explicitly. If any is not satisfied, file a follow-up task.

- [ ] **Step 5: No additional commit needed**

If everything passes, you're done. If any issue surfaced and was fixed, commit that fix with a focused message.

---

## Self-Review

**Spec coverage check:**

| Spec section | Plan task |
|---|---|
| `/enterprise` route + 6 sections | Tasks 5–11 |
| `/newsletter` route | Task 12 |
| Header nav update | Task 13 |
| Logo assets sourced | Task 1 |
| `enterprise-data.ts` | Task 3 |
| `CheckList` extraction to shared UI | Task 2 |
| Beehiiv form reuse | Tasks 10 + 12 |
| Spanish copy (`es_MX`) | Task 3 sets all copy in Spanish; section components consume verbatim |
| Anchor sections + deep-linkable | Task 11 (sections all have `id`); secondary CTA + EnterpriseCTA links use them |
| `mailto:1996byk@gmail.com` with subjects per service | Task 3 (`buildMailto`); each section component uses it |
| SEO metadata per page | Tasks 11 + 12 |
| `pnpm build` + lint verification | Per-task plus Task 14 |

All acceptance criteria from the spec are covered by at least one task.

**Placeholder scan:** None. Every step has runnable commands or full code blocks.

**Type consistency:** `PartnerLogo` defined in Task 3 is consumed by Tasks 4, 5, 6, 8, 9. `CheckListItem` and `CheckListVariant` defined in Task 2 are consumed by Task 7. Mailto helper `buildMailto` defined in Task 3 is consumed by Tasks 5, 6, 7, 8, 9, 10. All names match across tasks.

**Out-of-band note for the implementing agent:** Several copy strings in `enterprise-data.ts` (Task 3) are first-pass drafts and the user may want to revise them. Don't try to "improve" them autonomously — ship the page with what's in the spec, and the user can edit copy in a follow-up commit.
