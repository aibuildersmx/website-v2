# Enterprise & Newsletter Pages — Implementation Report

**Date:** 2026-05-01
**Branch:** main (committed directly per repo convention)
**Spec:** `docs/superpowers/specs/2026-05-01-enterprise-and-newsletter-pages-design.md`
**Plan:** `docs/superpowers/plans/2026-05-01-enterprise-and-newsletter-pages.md`
**Commits:** `8248c13` → `2f0fb8d` (15 commits total: 13 plan tasks + 1 review-fix commit + spec + plan)

## What was built

Two new marketing routes plus supporting refactors:

### `/enterprise` (B2B landing page)
Hero (dither, fixed) → Workshops → Consulting → Recruiting → Talks → Final CTA → Footer. Each service section is anchor-deep-linkable (`#workshops`, `#consulting`, `#recruiting`, `#talks`). All CTAs open `mailto:1996byk@gmail.com` with section-specific pre-filled subjects.

### `/newsletter` (subscribe pitch page)
Calm hero (no dither, no animation) → 3-card "what you get" → dark Beehiiv subscribe form → footer.

### Supporting changes
- `<CheckList>` extracted from `components/blog/mdx/check-list.tsx` to `components/ui/check-list.tsx` so it can be used outside MDX. Blog wrapper preserved — existing posts render unchanged.
- "Enterprise" added to global pill nav with `new` badge.
- 6 corporate partner logos added under `public/logos/enterprise/` (4 real SVG wordmarks from Wikipedia Commons, 2 text placeholders for T1 and Grupo Gigante).

## Files

**Created (15):**
- `app/enterprise/page.tsx`
- `app/enterprise/layout.tsx`
- `app/enterprise/components/enterprise-data.ts`
- `app/enterprise/components/enterprise-hero.tsx`
- `app/enterprise/components/workshops-section.tsx`
- `app/enterprise/components/consulting-section.tsx`
- `app/enterprise/components/recruiting-section.tsx`
- `app/enterprise/components/talks-section.tsx`
- `app/enterprise/components/enterprise-cta.tsx`
- `app/enterprise/components/partner-logo-strip.tsx`
- `app/newsletter/page.tsx`
- `app/newsletter/layout.tsx`
- `components/ui/check-list.tsx`
- 6 logo SVGs in `public/logos/enterprise/`

**Modified (2):**
- `components/header.tsx` — appended Enterprise to `menuItems`
- `components/blog/mdx/check-list.tsx` — refactored to thin wrapper around shared component

## Design decisions made during implementation

A code review surfaced three issues that were fixed before completion (commit `2f0fb8d`):

1. **Removed recruiting card index numbers.** The plan specified `/ 01 / 02 / 03` decorative labels, but the spec was explicit: "Three cards (no index numbers)." Spec wins. Removed the absolute-positioned spans in `recruiting-section.tsx`.

2. **Pricing pill / CTA eyebrow now uses canonical pattern.** The plan used a simplified `animate-pulse` single dot. The design system at `docs/design/components.md §4.2` requires a two-layer `animate-ping` + solid-dot pattern. Updated both the consulting pricing pill and the EnterpriseCTA eyebrow to match the canonical pill-eyebrow.

3. **Added `scroll-mt-20 sm:scroll-mt-24` to anchor sections.** Without it, anchor jumps to `#workshops` etc. would land with the section title hidden behind the fixed pill nav. Applied to all four enterprise service sections plus the `#subscribe` section on `/newsletter`.

## Test results

The codebase has no test framework (no Vitest, Jest, Playwright). Verification per CLAUDE.md is `pnpm build` + `pnpm lint` + manual visual.

| Check | Result |
|---|---|
| `pnpm build` | ✅ Pass — both `/enterprise` and `/newsletter` prerendered as static pages alongside the existing 25 routes. |
| `pnpm lint` | ⚠ Exits 1 with 14 errors — but **all 14 are pre-existing** in unrelated files (`Dither.tsx`, `Dither.jsx`, `PixelCard.tsx`, `SplitText.jsx`, `bootcamp-chat-widget.tsx`, etc.). New files contribute 3 `@next/next/no-img-element` warnings, consistent with existing codebase convention (`components/hero-section.tsx`, `team.tsx`, `stats.tsx` all use `<img>`). No new errors. |
| TypeScript | ✅ Type-checks during build. |
| Visual verification | Not performed — autonomous mode. **Recommend manual pass at 375px / 768px / 1280px before sharing the URL externally.** Specifically check anchor-link scroll behavior, hero composition over the dither, and the pill nav fitting 5 items at lg. |

## Concerns to flag for the user

1. **Two logos are text placeholders.** T1 and Grupo Gigante render as black mono-font SVG text. They're passable but not real brand assets. If you want to swap in the actual logos, drop SVG files at `public/logos/enterprise/t1.svg` and `public/logos/enterprise/grupo-gigante.svg` (same paths) — no code changes required. The `PartnerLogoStrip` component also has an `onError` text fallback so missing files won't break the page.

2. **Mailto target.** All section CTAs send to `mailto:1996byk@gmail.com`. Confirmed from this session, but worth a final sanity check — your CLAUDE.md identifies `benkim96@gmail.com` as your email. The session-provided `1996byk@gmail.com` is what I used per your direct answer to Q5.

3. **Copy is first-pass.** All Spanish copy in `enterprise-data.ts` (and `newsletter/page.tsx` value cards + hero) was drafted in this session. You'll likely want to refine it. All copy lives in `app/enterprise/components/enterprise-data.ts` (single source of truth) — edit there and all sections update.

4. **Mobile hero secondary CTA.** The "Ver servicios" anchor button only appears on `lg+`. Mobile users see only the primary mailto CTA. Documented as acceptable in spec §1; flagging it as a deliberate trade-off.

5. **Hero composition not visually verified.** The `EnterpriseHero` uses the same `fixed top-0` + `mt-[100vh]` pattern as the homepage. Build success doesn't guarantee scroll behavior is correct on every viewport. Worth a manual pass.

6. **Pre-existing lint errors** (14 of them in unrelated files) are blocking `pnpm lint` from cleanly passing. Out of scope for this task but worth a cleanup PR sometime.

7. **Newsletter form behavior.** Form submits via `GET` to `https://aibuildersmx.beehiiv.com/` — opens Beehiiv's hosted subscribe page in a new tab rather than subscribing in-place. Documented as v1 trade-off in the spec; flagged as future upgrade if you want in-page subscription.

## Suggested follow-ups

- Real T1 + Grupo Gigante logo SVGs (drop-in replacement, no code changes).
- Manual visual + interaction QA before launch.
- Schedule removal of the `isNew` badge on the Enterprise nav item ~6 weeks post-launch (the badge is useful at launch; becomes noise long-term).
- Consider Beehiiv iframe embed for in-page newsletter subscribe.
- Optional: extract the duplicated `<footer>` block (now in 3 places) into a shared `components/page-footer.tsx`. Pre-existing pattern, but minor DRY win.

## Process notes

- Brainstorming → spec → plan → implementation → review → fix → report cycle, all in one session.
- One implementer subagent handled all 13 plan tasks sequentially with per-task commits. Took ~17 minutes.
- One code-reviewer subagent at the end. Surfaced 3 actionable issues, all fixed in a single follow-up commit.
- Total of 15 commits on `main`, all individually meaningful and reviewable.
