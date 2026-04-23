# Design Tokens

> Raw values. Every class string used in components and sections traces back to one of these tokens. Source of truth for colors, fonts, type scale, spacing, radii, shadows, and motion.

Pair this file with [components.md](./components.md) (how tokens compose into primitives) and [sections.md](./sections.md) (how primitives compose into layouts).

---

## 1. Color

### 1.1 Brand

| Token | Value | Usage |
|---|---|---|
| `--color-black` | `#212121` | Warm black. Primary text, footer background, scroll-locked nav, dark hero. Set in [app/globals.css](../../app/globals.css) under `@theme inline`. |
| `white` | `oklch(1 0 0)` | Primary page background, dark-bg CTA fill. Maps to `--background`. |

### 1.2 Neutrals (opacity ramp on black)

These replace gray scales. Apply as `text-*`, `bg-*`, or `border-*`.

| Class | Use case |
|---|---|
| `black/5` | Hairline dividers (`border-t border-black/5`), subtle section separators, blur orbs. |
| `black/10` | Card borders, input borders, standard dividers. |
| `black/20` | Hovered card borders, inactive/upcoming status dots, decorative index numbers. |
| `black/40` | Eyebrow/label text, muted microcopy. |
| `black/60` | Body paragraph text under a heading, subtitle copy. |
| `black/[0.01]`, `black/[0.02]`, `black/[0.03]` | Muted fill tints on nested cards and pill eyebrows. |

On dark surfaces, mirror with `white/*` (`white/5`, `white/10`, `white/20`, `white/30`, `white/60`, `white/70`, `white/80`).

### 1.3 Status (reserved — never decorative)

| Class | State |
|---|---|
| `bg-green-500` | Open / live / accepting registrations. |
| `bg-red-500` | Closed / full / error. |
| `bg-black/20` (light bg) or `bg-white/20` (dark bg) | Neutral / upcoming / pending. |

Use only as small dots (`size-1.5` or `size-2`) or pill backgrounds next to mono labels.

### 1.4 Dark-mode tokens (shadcn/oklch)

Defined in `:root` and `.dark` blocks of [app/globals.css](../../app/globals.css:52). Do not override these ad-hoc — they are consumed by [components/ui/*](../../components/ui/) primitives (`--primary`, `--secondary`, `--muted`, `--border`, `--ring`, `--card`, `--popover`, etc.).

Rule: if you need a color that isn't in § 1.1–1.3, reach for the shadcn token (`bg-card`, `text-muted-foreground`, `border-border`) rather than inventing a new hex.

---

## 2. Typography

### 2.1 Font families (loaded in [app/layout.tsx](../../app/layout.tsx))

| Family | Variable | Tailwind | Role |
|---|---|---|---|
| Instrument Serif | `--font-instrument-serif` | `font-instrument` / `font-serif` | **Display.** Auto-applied to `h1`–`h6` via [app/globals.css:131](../../app/globals.css) `@layer base`. |
| Instrument Sans | `--font-instrument-sans` | (via variable) | Reserved — used sparingly; do not introduce without approval. |
| Geist Sans | `--font-geist-sans` | `font-sans` (default) | **Body.** Unmarked text. |
| Geist Mono | `--font-geist-mono` | `font-mono` | **Meta.** Labels, eyebrows, nav items, legal, timestamps. |

### 2.2 Type scale

| Token | Classes | Role |
|---|---|---|
| `display-2xl` | `text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-[1.1] font-instrument font-medium` | Hero H1 (with `SplitText`). |
| `display-xl` | `text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-instrument font-medium leading-[1.1]` | CTA section H2 over a pill eyebrow. |
| `display-lg` | `text-2xl sm:text-3xl md:text-4xl font-instrument font-medium` | Standard section H2 (team, stats). |
| `display-md` | `text-2xl sm:text-3xl lg:text-5xl font-instrument font-medium` | Stats-style centered single headline. |
| `display-sm` | `text-xl sm:text-2xl font-instrument font-medium` | Sub-headings inside a section. |
| `body-lg` | `text-base sm:text-lg md:text-xl text-black/80` (on dark: `text-white/80`) | Hero lede copy. |
| `body` | `text-base sm:text-lg text-black/60 leading-relaxed` | Paragraph under a heading. |
| `body-sm` | `text-sm text-black/60` | Small copy, card description. |
| `eyebrow` | `text-[10px] sm:text-xs font-mono uppercase tracking-widest text-black/40` | Plain eyebrow above H2. |
| `eyebrow-pill` | `text-[9px] sm:text-[10px] font-mono uppercase tracking-widest font-bold text-black/60` | Pill-variant eyebrow copy (inside the pill container). |
| `meta` | `text-xs font-mono uppercase tracking-widest text-black/40` | Card metadata, status lines. |
| `micro` | `text-[9px] font-mono uppercase tracking-widest` | Legal, footnote, logo-slider label. |

### 2.3 Heading rules

- Always `font-medium` (never `font-bold` or `font-semibold` with Instrument Serif — it already reads heavy).
- Always tight leading (`leading-[1.1]` for display, `leading-tight` for smaller H2).
- Allow `text-balance` on marketing copy H1/H2 for nicer wraps.
- Never `font-italic` on Instrument Serif (it has no matching italic in our setup).

### 2.4 Label rules

- Always `uppercase` on `font-mono`.
- Always `tracking-widest` (or `tracking-[0.1em]` for extra wide).
- Default color is `text-black/40`; hover/active promotes to `text-black/60` or `text-black`.
- Never longer than ~40 characters — if it needs to wrap, it's not a label.

---

## 3. Spacing

### 3.1 Vertical rhythm (sections)

| Token | Classes | When |
|---|---|---|
| `section-y` (default) | `py-16 sm:py-24 md:py-32` | Every standard section. |
| `section-y-compact` | `py-12 sm:py-16 md:py-32` | Stats-style sections that lead with numbers. |
| `section-y-hero` | `pt-16 pb-2 sm:pt-20 sm:pb-4 md:pt-32 md:pb-8` | Fixed/absolute hero with bottom logo strip. |

### 3.2 Container

| Token | Classes | When |
|---|---|---|
| `container-x` | `mx-auto max-w-6xl px-4 sm:px-6` | Inside every section. Never `max-w-7xl`, `max-w-4xl`, or full-bleed without documented reason. |

### 3.3 Internal block gaps

| Token | Classes | When |
|---|---|---|
| `stack-sm` | `space-y-3 sm:space-y-4` | Within a card (title → meta → copy). |
| `stack-md` | `space-y-6 sm:space-y-8` | Header block (eyebrow → H2 → subtitle). |
| `stack-lg` | `space-y-8 sm:space-y-12 md:space-y-16` | Between header and body inside a section. |
| `grid-gap` | `gap-4 sm:gap-6 md:gap-8` | Card grids (events/team/stats). |
| `grid-gap-hero` | `gap-2 sm:gap-3 md:gap-4` | Hero image grid (tight). |

### 3.4 Inline gaps

| Token | Classes | When |
|---|---|---|
| `inline-sm` | `gap-1.5 sm:gap-2` | Nav pill internals, icon + label. |
| `inline-md` | `gap-3` | Button group (primary + icon). |

---

## 4. Border Radius

| Token | Value | Usage |
|---|---|---|
| `rounded-md` | 6px (via `calc(var(--radius) - 4px)`) | Tiny buttons (`size="xs"`), inline chips. |
| `rounded-lg` | 10px | Compact cards (past events), code blocks. |
| `rounded-xl` | 14px (`calc(var(--radius) + 4px)`) | Standard cards, primary CTA buttons, LinkedIn icon badges, hero image tiles (mobile). |
| `rounded-2xl` | 18px | Featured cards, hero image tiles (≥sm), inset CTA card. |
| `rounded-3xl` | 22px | Hero-scale inset containers (CTA card at ≥sm). |
| `rounded-full` | pill | **Navigation pill**, pill eyebrows, status chips, social icon buttons (LinkedIn in nav). |

Base `--radius` is `0.625rem` (10px). Defined in [app/globals.css:53](../../app/globals.css).

---

## 5. Borders

| Token | Classes |
|---|---|
| Hairline (light bg) | `border-t border-black/5` |
| Hairline (dark bg) | `border-t border-white/10` |
| Card (light bg) | `border border-black/10` → `hover:border-black/20` |
| Card (dark bg) | `border border-white/10` → `hover:border-white/20` |
| Input (light) | `border border-black/10 focus:border-black/30` |
| Input (dark) | `border border-white/20 focus:border-white/40` |
| Decorative divider | `h-px flex-1 bg-black/5` (used inside "Eventos Pasados" heading row) |

---

## 6. Elevation / Shadow

One canonical card shadow. The rest are reserved for the pill nav.

| Token | Classes | When |
|---|---|---|
| `shadow-card` | `hover:shadow-lg hover:shadow-black/5` | Cards on hover. |
| `shadow-nav-default` | `shadow-lg` | Pill nav at rest. |
| `shadow-nav-scrolled` | `shadow-2xl shadow-black/20` | Pill nav after `scrollY > 20`. |
| `shadow-glow` (dark-only accent) | `bg-black/5 blur-2xl` absolute behind element, fade via `group-hover:opacity-100` | Decorative glow under CTAs. Use sparingly. |

Do not introduce `drop-shadow`, `shadow-md` (use `shadow-lg`), or colored shadows outside `black/5` / `black/20`.

---

## 7. Motion

### 7.1 Transition tokens

| Token | Classes | When |
|---|---|---|
| `motion-card` | `transition-all duration-500` | Card hover (border, shadow, transform). |
| `motion-color` | `transition-colors duration-300` | Link / nav text color shifts. |
| `motion-nav` | `transition-all duration-500 ease-in-out` | Pill-nav scrolled-state change. |
| `motion-fast` | `transition-all duration-200` | Tiny micro-interactions (status dots, arrow slide). |

### 7.2 Image treatment

Canonical portraits and marketing imagery apply:

```
grayscale transition-transform duration-500 hover:scale-105
```

Optional hover-reveals color: `grayscale hover:grayscale-0 duration-500`.

### 7.3 Animation primitives (allowed)

Defined in [app/globals.css](../../app/globals.css) and via component libraries.

| Animation | Where | Use sparingly? |
|---|---|---|
| `animate-pulse` on status dots | CTA pill eyebrow, "ABIERTO" badges | Yes, only for live/active state. |
| `gradient-shift` keyframes | Decorative gradients | Rare; prefer static. |
| `SplitText` (GSAP) | Hero H1 and CTA H2 | One per page, not both. |
| `InfiniteSlider` | Partner logos only | Never for body copy. |
| `Dither` WebGL | Hero background | One instance; `pointer-events-auto`. |
| `holoSpin`, `matrixRain`, `crtFlicker`, `shimmer` | Job-board card gallery | Product-surface only — not the marketing system. |

### 7.4 Forbidden

- No `duration-1000`+ transitions on interactive elements.
- No `transition: all` without a duration.
- No `animate-spin` on text.
- No `animate-bounce` anywhere in production.

---

## 8. Z-index scale

| Layer | Value | Usage |
|---|---|---|
| Background decor | `-z-20` / `-z-10` | Fixed hero, fixed footer. |
| Content | default (0) | Page body. |
| Elevated inline (e.g. CTA pill badge) | `z-10` | Section header over blur orbs. |
| Nav | `z-[100]` | Fixed pill nav. Always highest. |

---

## 9. Breakpoints

Tailwind defaults, used consistently:

| Name | Min width | Typical responsive move |
|---|---|---|
| `sm` | 640px | Increase type size, tighten padding, reveal desktop-only decor. |
| `md` | 768px | Grid-cols flip from 1 → 2, typography shifts up. |
| `lg` | 1024px | Grid-cols flip from 2 → 3, reveal side-by-side hero layout. |
| `xl` | 1280px | Fine-tune hero display-xl. |

Rule of thumb: **design mobile first, layer on `sm:` / `md:` / `lg:`**. Never `max-` prefixes unless hiding decorative desktop-only flourishes.

---

## 10. Composition cheat sheet

The class strings that appear literally in the codebase more than three times — learn these by heart:

```txt
Section wrapper (light)
relative py-16 sm:py-24 md:py-32 overflow-hidden bg-white text-black border-t border-black/5

Container
mx-auto max-w-6xl px-4 sm:px-6

Card
border border-black/10 rounded-xl sm:rounded-2xl hover:border-black/20 hover:shadow-lg hover:shadow-black/5 transition-all duration-500

Eyebrow (plain)
text-[10px] sm:text-xs font-mono uppercase tracking-widest text-black/40

Eyebrow (pill)
inline-flex items-center gap-2 rounded-full border border-black/5 bg-black/[0.02] px-3 py-1.5

H2 (display-lg)
text-2xl sm:text-3xl md:text-4xl font-instrument font-medium

Body under H2
mt-4 text-base sm:text-lg text-black/60 leading-relaxed max-w-2xl

Nav CTA
rounded-full bg-white text-black hover:bg-white/90 font-mono text-[10px] sm:text-xs uppercase tracking-widest h-9 sm:h-10 px-4 sm:px-6
```

If your string doesn't match one of these, double-check tokens.md before adding it.

---

## 11. Cross-links

- See [components.md](./components.md) for how tokens compose into Button, Card, PillNav, Eyebrow, StatusDot, InfiniteSlider, SectionAnchor.
- See [sections.md](./sections.md) for canonical section templates (hero, content-with-media, grid-of-cards, cta-with-inset, stats-grid).
- See [validation.md](./validation.md) for the pre-merge checklist and the known-deviations backlog.
