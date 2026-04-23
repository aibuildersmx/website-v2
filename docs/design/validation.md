# Validation & Reconciliation

> How to test whether a page, section, or feature follows the design system. Two parts: (1) a pass/fail checklist you or an agent can run pre-merge, (2) the **known-deviations backlog** — current parts of the site that do not yet comply, and what needs to change to reconcile them.

---

## Part 1 — Pre-Merge Checklist

Run this on any new or modified section before considering it done. Each item is **binary** (pass/fail). Anything less than 100% pass is a blocker or requires an explicit, documented waiver.

### 1.1 Structure

- [ ] Section wraps in `<section>` (not a bare `<div>`).
- [ ] Section uses one of the five canonical templates in [sections.md](./sections.md).
- [ ] Section uses `py-16 sm:py-24 md:py-32` (or the documented compact variant `py-12 sm:py-16 md:py-32` for stats).
- [ ] Inner container is `mx-auto max-w-6xl px-4 sm:px-6` — never `max-w-7xl`, never full-bleed.
- [ ] If the section is a navigable landmark, it has an `id` (`manifesto`, `events`, `team`, or a new one added to [components/header.tsx](../../components/header.tsx) nav items).
- [ ] If light-background section, `border-t border-black/5` is present (except first-on-page or dark-bg).

### 1.2 Typography

- [ ] Headings use `font-instrument font-medium`. No `font-bold`, no `font-semibold` on Instrument.
- [ ] Body copy uses Geist Sans default (no explicit `font-sans` needed).
- [ ] Eyebrows / meta / labels use `font-mono uppercase tracking-widest`.
- [ ] Heading leading is tight (`leading-[1.1]`, `leading-tight`).
- [ ] Subtitle copy uses `text-black/60 leading-relaxed` (or `text-white/80` on dark).
- [ ] No inline `font-italic` on Instrument Serif.

### 1.3 Color

- [ ] Only black (`#212121`), white, `black/*` opacity ramps, and approved status colors (`green-500`, `red-500`).
- [ ] Status colors are used only as state indicators (dots or pills) — never decoratively.
- [ ] No arbitrary hex values outside the tokens in [tokens.md](./tokens.md).
- [ ] Dark sections use `bg-[#212121]` (not `bg-black` or `bg-neutral-900`).

### 1.4 Components

- [ ] Cards use `border border-black/10 rounded-xl sm:rounded-2xl` + the canonical hover.
- [ ] Buttons use the shadcn `Button` primitive with one of the documented variants in [components.md § 1](./components.md#1-button).
- [ ] Nav items use `rounded-full` with mono uppercase label.
- [ ] Eyebrows match one of the two documented forms (plain or pill).
- [ ] Status dots use the correct state colors.

### 1.5 Motion

- [ ] Hover/interaction transitions use `duration-500` (cards) or `duration-300` (colors).
- [ ] At most one animated headline primitive (`SplitText`, `TextEffect`) per page.
- [ ] No `animate-spin` or `animate-bounce` on production content.
- [ ] No `transition-all` without a duration.

### 1.6 Content

- [ ] All user-facing copy is Spanish (`es_MX`) unless explicitly requested otherwise.
- [ ] Month abbreviations, if any, are Spanish (ENE, FEB, MAR, ABR, MAY, JUN, JUL, AUG, SEPT, OCT, NOV, DIC).
- [ ] All images have meaningful `alt` text (partner name, person name, subject).
- [ ] All external links use `target="_blank"` and `rel="..."` where appropriate.

### 1.7 Responsive

Verify at these breakpoints:

- [ ] Mobile (`< 640px`) — text scales down, grids collapse to 1 column, CTAs are full-width.
- [ ] Tablet (`sm` → `md`) — type and grids progress.
- [ ] Desktop (`lg` → `xl`) — hero shows side-by-side, pill nav centered, footer revealed.

### 1.8 Accessibility

- [ ] Icon-only buttons have `aria-label`.
- [ ] All interactive elements have visible focus (`focus-visible:` styles preserved from shadcn).
- [ ] Color contrast meets WCAG AA (the black/white palette passes; watch muted-on-muted combinations like `text-white/30`).
- [ ] `<section>` with heading → heading is `<h2>` (or `<h1>` if top-of-page hero).

---

## Part 2 — Agent Scoring Prompt

Paste this into an agent (Cursor, Claude, Codex) to audit an existing page or component against the system.

````txt
Score this file against the AI Builders Mexico design system.

File: [paste full path, e.g. components/events-section.tsx]

Rules to check (in order):
1. Section wrapper: `py-16 sm:py-24 md:py-32`, container `mx-auto max-w-6xl px-4 sm:px-6`, light bg has `border-t border-black/5`.
2. Landmark sections have an `id` that matches a nav link in `components/header.tsx`.
3. Headings use `font-instrument font-medium` with tight leading. No `font-bold`/`font-semibold` on Instrument.
4. Body uses default Geist Sans, eyebrows/labels use `font-mono uppercase tracking-widest`.
5. Colors only from the token palette: #212121, white, black/*, white/*, green-500, red-500.
6. Cards use: `border border-black/10 rounded-xl sm:rounded-2xl hover:border-black/20 hover:shadow-lg hover:shadow-black/5 transition-all duration-500`.
7. Nav is the pill-nav pattern (fixed, rounded-full, max-w-6xl, z-[100], backdrop-blur).
8. Motion: `duration-500` for cards, `duration-300` for colors. No `animate-spin`/`animate-bounce` on production content.
9. Copy is Spanish (es_MX).
10. Images have meaningful alt text.

For each rule, report: PASS | FAIL | N/A. For each FAIL, include the line number and the fix.

Output format:
- Section anatomy: PASS/FAIL
- Typography: PASS/FAIL
- Color: PASS/FAIL
- Components: PASS/FAIL
- Motion: PASS/FAIL
- Content: PASS/FAIL
- Accessibility: PASS/FAIL

Then a final Overall Score: <passed>/<total checks>. Do not propose refactors unless Overall Score is below 70%.
````

Use this same prompt shape to audit entire routes:

```txt
Audit every section imported by [app/page.tsx | app/launch/page.tsx | app/collab/page.tsx | app/designwithai/page.tsx | app/job-board/page.tsx].
For each section file, produce a row: { file, structure, typography, color, components, motion, content, a11y, overall_score }.
Rank routes from highest to lowest overall conformance.
```

---

## Part 3 — Known Deviations Backlog

As of April 23, 2026, the system is **not** uniformly applied. The homepage (`/`) and `/photos` are closest to canonical. The routes below have documented deviations. Reconcile them incrementally; do not block new feature work, but any touch of a file below should leave it **more** compliant, not less.

### 3.1 `/launch` — dark-only campaign page

**Source:** [app/launch/](../../app/launch/).

- **Deviation:** Hero headline ("LAUNCH") uses a bold sans (`TextEffect` over Geist) instead of Instrument Serif.
- **Deviation:** Isolated `HeroHeader` at [app/launch/components/header.tsx](../../app/launch/components/header.tsx) instead of the shared [components/header.tsx](../../components/header.tsx).
- **Deviation:** Isolated `FooterSection` at [app/launch/components/footer.tsx](../../app/launch/components/footer.tsx) — duplicates logic that should live in [components/footer.tsx](../../components/footer.tsx).
- **Deviation:** Layout is locked to `dark min-h-screen bg-black text-white`, which bypasses the shadcn theme system.

**Reconciliation actions:**

1. Migrate hero headline to Instrument Serif (or document the sans display as an intentional, named variant in [tokens.md](./tokens.md)).
2. Adopt the shared pill nav; delete the duplicate header.
3. Share the footer — pass props for dark/light variants if needed rather than forking.
4. Switch `bg-black` → `bg-[#212121]` to match the brand warm black.

### 3.2 `/collab` — dither-locked hero + system sections

**Source:** [app/collab/](../../app/collab/).

- **Deviation:** `DitherWrapper` forces `FORCE_DITHER_MODE: 'dark'` regardless of theme, creating a locked-dark top fold that visually drifts from the rest of the page.
- **Deviation:** Local `features-3.tsx` and `tilted-cards-section.tsx` define their own card variants that don't match the canonical card primitive.
- **Deviation:** Uses shadcn `Card` directly with zinc/muted tokens — not the brand's black/10 hairline card.
- **Deviation:** Isolated header ([app/collab/components/header.tsx](../../app/collab/components/header.tsx)) and footer.

**Reconciliation actions:**

1. Evaluate whether `DitherWrapper` should become the canonical hero background primitive in [components.md § 10](./components.md#10-motion-primitives-allowed-wrappers).
2. Migrate cards in `features-3` and `tilted-cards-section` to the canonical Card primitive; allow "tilted" as a documented variant if the effect earns its keep.
3. Adopt the shared pill nav and footer.
4. Confirm the eyebrow / H2 pattern is applied in every section; audit per [sections.md](./sections.md).

### 3.3 `/designwithai` — course campaign with decorative accents

**Source:** [app/designwithai/](../../app/designwithai/).

- **Deviation:** `PixelCard` CTA uses a gradient hover (purple / cyan / pink) — the **only** place the brand allows a non-monochrome accent today.
- **Deviation:** `RoleTicker` is a campaign-specific animation not documented in the design system.
- **Deviation:** `DitherBackground` is an alternative to `Dither` with scroll-linked motion.
- **Deviation:** Isolated header and footer.

**Reconciliation actions:**

1. Formally approve `PixelCard` as a **campaign-only accent** — add a note to [components.md](./components.md) under a new "Campaign Accents" section (v1.1).
2. Promote `RoleTicker` and the scroll hero into the design system as optional primitives, or fence them off as "course-only" with a comment at the top of the file.
3. Decide: one `Dither` primitive or two named variants (`DitherStatic`, `DitherScroll`). Document in [components.md § 10](./components.md#10-motion-primitives-allowed-wrappers).
4. Adopt the shared pill nav and footer.

### 3.4 `/job-board` — product surface with dual mode

**Source:** [app/job-board/](../../app/job-board/).

- **Deviation:** Runs a two-mode UI (default stone/white + AI dark/terminal). Controlled, intentional product surface.
- **Deviation:** Inline header in `page.tsx` — not the shared pill nav.
- **Deviation:** 13 of 15 card variants in [components/job-board/cards/](../../components/job-board/cards/) are **unused in production** (only `CleanLedgerCard` and `AiModeCard` are imported in app routes). They live on as a design gallery.
- **Deviation:** Uses `font-serif` for the default headline and mono for the AI headline, not the canonical Instrument Serif for both.
- **Deviation:** Links use `indigo` in one light-mode chat bubble — an accent outside the token palette.

**Reconciliation actions:**

1. Formally document `/job-board` in a v2 of this system as a product surface with explicit local tokens. Dual-mode UI is approved; just name it.
2. Move unused card variants to `components/job-board/cards/_gallery/` or delete. Keep only `CleanLedgerCard` and `AiModeCard` active.
3. Swap the inline header for the shared pill nav (light variant).
4. Either switch serif headlines to Instrument Serif or explicitly document the `font-serif` local fallback as an approved deviation.
5. Remove the `indigo` accent (or document it as a chat-only semantic color).

Cross-reference: the authoritative operations guide for job-board-scoped changes is [JOB-BOARD.md](../../JOB-BOARD.md). When a change touches both marketing design and job-board product, follow this file for visual rules and `JOB-BOARD.md` for scope rules.

### 3.5 `/photos` — passes

**Source:** [app/photos/](../../app/photos/).

Minor deviations only:

- Uses an isolated header ([app/photos/components/header.tsx](../../app/photos/components/header.tsx)) — light-variant of the pill nav.
- No footer. Photo marquee fills the viewport.

**Reconciliation actions:** Accept as-is. Document the light-pill-nav variant in [components.md § 3.3](./components.md#33-variants). No structural work needed.

---

## Part 4 — Reconciliation Priority

When time is budgeted, reconcile in this order (highest impact first):

1. **Pill nav** — unify [components/header.tsx](../../components/header.tsx) as the single source. Every campaign page switches to a shared header with light/dark variants. Highest visible impact.
2. **Footer** — consolidate to a single [components/footer.tsx](../../components/footer.tsx). Same reasoning.
3. **`/launch` headline → Instrument Serif** — brings the most-visited campaign page into the core brand.
4. **`/job-board` unused card variants** — move to a gallery folder; reduces cognitive load for agents.
5. **`/designwithai` `PixelCard` / `RoleTicker` documentation** — either approve as campaign accents or retire.
6. **`/collab` cards** — migrate `features-3` + `tilted-cards-section` to the canonical Card primitive.

---

## Part 5 — Versioning & Change Control

The design system is versioned in [README.md](./README.md). When changing any rule here:

1. Update all four files in this folder together (tokens, components, sections, validation).
2. Bump the version in `README.md § Versioning`.
3. Add a one-paragraph changelog entry at the bottom of that section.
4. Open a follow-up task to audit the 5 routes against the new rule.

---

## Cross-links

- Raw values: [tokens.md](./tokens.md).
- Primitive components: [components.md](./components.md).
- Section templates: [sections.md](./sections.md).
- Entry point: [README.md](./README.md).
- Job-board-specific operations guide: [JOB-BOARD.md](../../JOB-BOARD.md).
