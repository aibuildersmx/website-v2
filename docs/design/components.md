# Components

> Opinionated rules for reusable primitives. Every entry is laid out as: **what it is → canonical classes → variants → when to use → when NOT to use → source of truth**. These primitives compose into the full-section templates in [sections.md](./sections.md); the raw values they use live in [tokens.md](./tokens.md).

---

## 1. Button

**What it is.** A clickable action. Primary CTA, secondary link, nav entry, or icon trigger.

**Canonical classes.** Use the shadcn-style `Button` from [components/ui/button.tsx](../../components/ui/button.tsx). The CVA variants already encode shadcn defaults; the AI Builders brand layers the following opinions on top.

### 1.1 Primary CTA — on dark background (hero, footer, dark inset card)

```tsx
<Button
  asChild
  size="lg"
  className="bg-white text-black hover:bg-white/90 px-10 py-7 text-lg font-medium rounded-xl"
>
  <Link href="...">Únete a nuestra comunidad</Link>
</Button>
```

- Radius: `rounded-xl`.
- Padding: `px-10 py-7` (desktop) — generous. On mobile shrink to `px-4 sm:px-10 py-4 sm:py-7`.
- Label: `font-medium`, not mono, not uppercase. This is the one place brand-sans label is allowed.

### 1.2 Primary CTA — on light background (homepage sections)

```tsx
<Button size="lg" className="bg-black text-white hover:bg-black/90 rounded-xl px-8">
  Registrarme
</Button>
```

Mirror of 1.1 — black fill with white text. Never tinted.

### 1.3 Nav CTA (the pill-nav "Únete" button)

```tsx
<Button
  asChild
  size="sm"
  className="rounded-full bg-white text-black hover:bg-white/90 px-4 sm:px-6 font-mono text-[10px] sm:text-xs uppercase tracking-widest h-9 sm:h-10"
>
  <Link href="...">Únete</Link>
</Button>
```

- **Always `rounded-full`** (no `rounded-xl` in the nav).
- **Always `font-mono uppercase tracking-widest`** — this is the one button that uses mono type.
- Height locked at `h-9 sm:h-10` to match pill nav rhythm.

### 1.4 Secondary / outline

Use shadcn `variant="outline"` with the `rounded-xl` override. Reserved for "learn more" / tertiary actions. Prefer a `Link` with hover underline over an outline button when possible — the brand does not over-use outlines.

### 1.5 Icon button (e.g. LinkedIn badge)

```tsx
<Link
  href="..."
  className="flex items-center justify-center size-14 rounded-xl border border-white/20 text-white/70 hover:text-white hover:border-white/40 bg-white/10 transition-all"
  aria-label="LinkedIn"
>
  <Linkedin className="size-6" />
</Link>
```

- Square `size-{9|10|14}` depending on context, **always `rounded-xl`** next to primary CTAs or **`rounded-full`** inside the pill nav.
- Include `aria-label`.
- Color: `text-*/70` idle, `hover:text-*` full-strength.

### When NOT to use a Button

- For inline text links inside paragraph copy. Use a plain `<Link>` with `underline-offset-4 hover:underline`.
- For nav menu items. Those are `<Link>` elements inside a `<ul>` with `px-5 py-2.5 text-xs font-mono uppercase tracking-widest text-white/70 hover:text-white rounded-full hover:bg-white/10` — see §3.

**Source of truth.** [components/ui/button.tsx](../../components/ui/button.tsx), [components/hero-section.tsx](../../components/hero-section.tsx), [components/header.tsx](../../components/header.tsx).

---

## 2. Card

**What it is.** The default content surface inside a grid (events, team, stats, job board). Always has a hairline border, generous radius, and a gentle hover.

**Canonical classes.**

```tsx
<div className="border border-black/10 rounded-xl sm:rounded-2xl bg-white hover:border-black/20 hover:shadow-lg hover:shadow-black/5 transition-all duration-500">
  {/* content */}
</div>
```

Or via the shadcn primitive at [components/ui/card.tsx](../../components/ui/card.tsx):

```tsx
<Card className="hover:border-black/20 hover:shadow-lg hover:shadow-black/5 transition-all duration-500">
  <CardContent>...</CardContent>
</Card>
```

### 2.1 Variants

| Variant | When | Adjustment |
|---|---|---|
| Default | Team, stats, events | As above. |
| Compact | Past events, dense lists | `rounded-lg sm:rounded-xl`, reduce padding to `p-4 sm:p-5`. |
| Featured | Hero-adjacent highlights | `rounded-2xl sm:rounded-3xl`, add inner muted fill `bg-black/[0.01]`. |
| Inset dark | CTA block right column (see [components/cta-section.tsx](../../components/cta-section.tsx)) | `bg-black text-white rounded-2xl sm:rounded-3xl`, dot-grid overlay at `opacity-10`. |
| Media card | Manifesto image panel | No border; large radius `rounded-2xl sm:rounded-3xl`; image with `grayscale hover:grayscale-0`. |

### 2.2 Internal structure

```
Card
├── Optional media (top, aspect-ratio locked)
├── Header row
│   ├── Eyebrow / meta (font-mono text-black/40)
│   └── Status dot / pill
├── Title (font-instrument or font-sans medium)
├── Body copy (text-black/60 leading-relaxed)
└── Footer / CTA row
```

### When NOT to use Card

- For standalone content blocks that span the full section width — use section wrapper instead.
- For the dark footer strip — it's a fixed layout element, not a card.
- For job-board gallery variants (Holographic, Matrix, CRT, etc.) — those live under [components/job-board/cards/](../../components/job-board/cards/) and are **not** part of this design system; they are a separate experimental surface. See [validation.md § Known Deviations](./validation.md#known-deviations-backlog).

**Source of truth.** [components/ui/card.tsx](../../components/ui/card.tsx), [components/events-section.tsx](../../components/events-section.tsx), [components/team.tsx](../../components/team.tsx), [components/stats.tsx](../../components/stats.tsx).

---

## 3. Pill Navigation

**What it is.** The single, canonical site navigation. Fixed at the top, centered, rounded-full, with backdrop blur. Deepens its background and shadow on scroll.

**Canonical classes.**

```tsx
<header className="fixed top-4 sm:top-6 inset-x-0 z-[100] flex justify-center pointer-events-none px-3 sm:px-6">
  <nav className={cn(
    "pointer-events-auto flex items-center justify-between p-1.5 sm:p-2 rounded-full border transition-all duration-500 ease-in-out w-full max-w-6xl",
    scrolled
      ? "bg-black/80 backdrop-blur-xl border-white/10 shadow-2xl shadow-black/20"
      : "bg-black/50 backdrop-blur-md border-white/5 shadow-lg"
  )}>
    {/* Logo, menu items, right-side CTA + social */}
  </nav>
</header>
```

### 3.1 Anatomy

- **Left:** logo at `h-4 sm:h-5 w-auto`, wrapped in a `rounded-full hover:bg-white/10` link.
- **Center:** menu `<ul>` (hidden on `<sm`). Items use `px-5 py-2.5 text-xs font-mono uppercase tracking-widest text-white/70 hover:text-white transition-colors rounded-full hover:bg-white/10`.
- **Right:** social icon buttons + primary nav CTA (see §1.3).

### 3.2 Scrolled state

Detected with `scrollY > 20`. Transitions: `duration-500 ease-in-out`. Background darkens, blur intensifies, shadow deepens.

### 3.3 Variants

| Surface | Variant |
|---|---|
| Dark pages (homepage, /launch, /job-board AI mode) | Dark-glass variant above. |
| Light pages (/photos, /job-board default) | Mirror — swap to `bg-white/80 backdrop-blur-xl border-black/10 shadow-lg` at scroll; menu items flip to `text-black/70 hover:text-black`. |

Either variant **must** preserve: `rounded-full`, `fixed top-4 sm:top-6`, `z-[100]`, `max-w-6xl`, `transition-all duration-500`.

### When NOT to use Pill Navigation

- Sub-routes that need an in-page tab nav — those are **not** this nav. Use a secondary bar inside the main content area, still `rounded-full` and mono-labeled, but not fixed.
- The dashboard admin UI may use a different chrome pattern (it's product, not marketing), but even there the primary nav should be the pill.

**Source of truth.** [components/header.tsx](../../components/header.tsx).

---

## 4. Eyebrow

**What it is.** The small mono-uppercase label that sits above section headings to name or categorize the section.

### 4.1 Plain eyebrow

Used in team/stats sections.

```tsx
<span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-black/40">
  El Equipo
</span>
```

- Never longer than 3–4 words.
- Color promotes on hover only if the whole section block is an anchor (rare).

### 4.2 Pill eyebrow

Used in CTA sections and hero-adjacent callouts.

```tsx
<div className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-black/[0.02] px-3 py-1.5">
  <span className="relative flex size-1.5">
    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-black/40 opacity-75" />
    <span className="relative inline-flex size-1.5 rounded-full bg-black" />
  </span>
  <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest font-bold text-black/60">
    Comunidad Activa
  </span>
</div>
```

- Pulsing dot only for **live/active** state (e.g. "accepting registrations").
- Use `bg-white/[0.05]` + `border-white/10` + white text on dark sections.

### When NOT to use Eyebrow

- Above the hero H1 — the hero is the top of the page, it doesn't need a "what section is this" label.
- Inside a card — cards use `meta` typography instead (same mono+uppercase, but without the section-header relationship).

**Source of truth.** [components/team.tsx](../../components/team.tsx), [components/cta-section.tsx](../../components/cta-section.tsx).

---

## 5. Status Dot

**What it is.** A tiny colored dot used inside cards, pills, or meta rows to communicate state.

**Canonical classes.**

```tsx
<span className={cn(
  "inline-block rounded-full size-1.5 sm:size-2 shrink-0",
  status === "ABIERTO" && "bg-green-500",
  status === "LLENO" && "bg-red-500",
  status === "PRÓXIMO" && "bg-black/20",
)} />
```

### 5.1 State matrix

| Dot | Meaning | Paired label (mono uppercase) |
|---|---|---|
| `bg-green-500` | Open, live, active | `ABIERTO`, `EN VIVO`, `DISPONIBLE` |
| `bg-red-500` | Closed, full, unavailable | `LLENO`, `CERRADO`, `CANCELADO` |
| `bg-black/20` (or `bg-white/20`) | Neutral, upcoming, pending | `PRÓXIMO`, `BORRADOR`, `PENDIENTE` |

### 5.2 Animated variant (reserved)

Only for "live now" contexts — wrap in the pulsing-dot pattern from §4.2.

### When NOT to use Status Dot

- As decoration. If it doesn't communicate a real state, remove it.
- On buttons. Buttons communicate action, not status.

**Source of truth.** [components/events-section.tsx](../../components/events-section.tsx), [components/cta-section.tsx](../../components/cta-section.tsx).

---

## 6. Infinite Logo Slider

**What it is.** A continuously-scrolling strip of partner logos. Used twice: in the homepage hero bottom and in the stats section on mobile.

**Canonical classes.**

```tsx
<InfiniteSlider speedOnHover={20} speed={40} gap={112}>
  <div className="flex items-center">
    <img className="mx-auto h-6 w-fit" src="/cursor-logo-dark.svg" alt="Cursor" />
  </div>
  {/* repeat for each partner */}
</InfiniteSlider>
```

### 6.1 Rules

- `speed={40}` and `speedOnHover={20}` — slow down on hover, never speed up.
- `gap={112}` — brand-standard spacing. Do not tighten or widen.
- Logos: `h-6 w-fit` to `h-8 w-fit`, `mx-auto`.
- Use `invert` class on dark-only SVGs shown against dark backgrounds.
- Always wrap in `<div className="flex items-center">` even for single-image children.
- Always include meaningful `alt` text (partner name).

### 6.2 Label prefix

On the homepage, the slider is preceded by a "Partners:" mono label in a right-aligned column:

```tsx
<div className="md:max-w-44 md:border-r md:border-white/20 md:pr-6">
  <p className="text-end text-xs sm:text-sm text-white/70">Partners:</p>
</div>
```

### When NOT to use Infinite Slider

- For navigation or non-decorative content — animated scroll hurts accessibility and reading.
- With more than 8–10 logos — the pattern loses rhythm. Subsample if the partner list grows.

**Source of truth.** [components/ui/infinite-slider.tsx](../../components/ui/infinite-slider.tsx), [components/hero-section.tsx](../../components/hero-section.tsx), [components/stats.tsx](../../components/stats.tsx).

---

## 7. Section Anchor

**What it is.** Not a visual component — a structural requirement. Every top-level landmark section declares an `id` that matches a nav link.

### 7.1 Canonical IDs

| `id` | Section | Referenced by |
|---|---|---|
| `#manifesto` | Content / about block ([components/content-3.tsx](../../components/content-3.tsx)) | Header nav "Manifesto". |
| `#events` | Events section ([components/events-section.tsx](../../components/events-section.tsx)) | Header nav "Events". |
| `#team` | Team section ([components/team.tsx](../../components/team.tsx)) | Header nav "Team". |

### 7.2 Rules

- IDs are **lowercase, single word, English** (nav labels are English in the homepage nav for historical reasons; copy inside the section stays Spanish).
- Never duplicate an `id` across a route.
- If a new landmark section is added, update both the section `id` and the [components/header.tsx](../../components/header.tsx) `menuItems` array.

### When NOT to set an `id`

- On sub-blocks inside a section (nested cards, grids). Only the outermost `<section>` gets the anchor.
- On CTAs, footers, or decorative strips.

**Source of truth.** [components/header.tsx](../../components/header.tsx).

---

## 8. Footer

**What it is.** A fixed, dark (`#212121`), scrolled-past footer strip that sits behind the page. Not visually attached to sections — it reveals as the last section ends.

**Canonical classes.** See [components/footer.tsx](../../components/footer.tsx):

```tsx
<div className="fixed bottom-0 inset-x-0 -z-20 h-[200px] bg-[#212121] flex flex-col items-center justify-center gap-6">
  {/* Logo, social icons, mono legal line */}
</div>
```

- **Fixed + negative z-index.** The footer always sits behind the main content, revealed only when content scrolls above it.
- **Height fixed at `h-[200px]`.** Do not expand.
- **Text is `text-white/30`** with mono uppercase legal line (`text-xs font-mono tracking-widest uppercase`).
- **Social icons:** `rounded-full`, `text-white/30`, `hover:text-white/60 hover:bg-white/5`.

### When NOT to customize the footer

- Don't add a section-style multi-column footer on marketing pages. This minimal strip is the brand voice.
- The job board and admin dashboard may use an **inline** footer (below content, not fixed) for operational reasons — still `bg-[#212121]`, still mono legal line.

**Source of truth.** [components/footer.tsx](../../components/footer.tsx).

---

## 9. Input & Form Controls

**What it is.** Inputs mostly live inside the CTA newsletter form and the job board dashboard. The marketing site keeps forms minimal.

### 9.1 Newsletter input (on dark inset card)

```tsx
<input
  type="email"
  placeholder="tu@email.com"
  className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-white/30 focus:outline-none transition-colors"
/>
```

### 9.2 Rules

- `rounded-xl` (match button radius).
- Border: `border-white/10` on dark, `border-black/10` on light.
- Focus: `focus:border-white/30` / `focus:border-black/30` and `focus:outline-none` (let the shadcn ring handle a11y).
- Placeholder: `placeholder:text-white/40` / `placeholder:text-black/40`.
- Label (if visible): mono uppercase above the input.

### When NOT to use custom inputs

- Use shadcn `<Input />` / `<Select />` / `<Textarea />` from [components/ui/](../../components/ui/) for admin and dashboard surfaces. They already consume the `--border`, `--ring`, `--input` tokens and stay consistent with dark/light modes.

**Source of truth.** [components/cta-section.tsx](../../components/cta-section.tsx), [components/ui/select.tsx](../../components/ui/select.tsx).

---

## 10. Motion Primitives (allowed wrappers)

These live in `app/collab/components/motion-primitives/` and `app/launch/components/motion-primitives/`. They are **allowed** on marketing pages but not required. Use **one** per section, never nested.

| Primitive | What it does | Allowed for |
|---|---|---|
| `SplitText` | Character-level fade/rise on hero H1. | Hero H1 only. |
| `TextEffect` | Word-level reveal. | Campaign headlines. |
| `AnimatedGroup` | Stagger-reveal of siblings. | Grids under heading. |
| `DecryptedText` | Glitch-decode effect on mono labels. | Dark sections only. |
| `InfiniteSlider` | Continuous horizontal loop. | Partner logos only (see §6). |

### Forbidden

- GSAP ScrollTrigger animations on body paragraphs. Headlines only.
- Framer Motion `whileHover={{ scale: 1.1 }}` or similar without a paired color/shadow change. Hovers must mirror the card hover token.
- Any animation that runs **indefinitely** on body content (only decorative layers like `Dither` and `InfiniteSlider` loop).

**Source of truth.** [components/SplitText.jsx](../../components/SplitText.jsx), [components/ui/infinite-slider.tsx](../../components/ui/infinite-slider.tsx), [app/collab/components/motion-primitives/](../../app/collab/components/motion-primitives/).

---

## 11. Cross-links

- Raw values for every class above: [tokens.md](./tokens.md).
- How these primitives assemble into full sections: [sections.md](./sections.md).
- How to check an existing component against these rules: [validation.md](./validation.md).
