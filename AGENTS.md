# AGENTS.md

This guide helps non-developers work safely in this project with AI agents (Cursor/Codex).

If you can describe what you want in plain language, an agent can usually do it for you.

## Job Board First (Important)

If your request is job-board-only, start with `JOB-BOARD.md`.

- Use it as the primary guide for `/job-board/demo` and `/job-board/dashboard`
- Keep changes scoped to job-board files unless a shared dependency requires otherwise

## Design System (Required Reading)

Before you ask an agent to build, change, or test any visual part of the site, point the agent at the design system. It is the "what does the site look like, and how do we keep it consistent" rulebook.

**The rules, in three sentences:**

- The site is black and white only. Black is `#212121`. The only other colors are green for "open" and red for "full" or "closed".
- Headings use Instrument Serif. Small labels (eyebrows, nav items, metadata) use Geist Mono in uppercase with wide letter spacing. Body text uses Geist Sans.
- Every section is the same width (`max-w-6xl`) with the same vertical padding (`py-16 sm:py-24 md:py-32`) and the same pill-shaped navigation at the top of the page.

**Where the rules live:**

- [docs/design/README.md](docs/design/README.md) — the start here page, with the mission and golden rules.
- [docs/design/tokens.md](docs/design/tokens.md) — the "colors, fonts, sizes, spacing" reference.
- [docs/design/components.md](docs/design/components.md) — the "buttons, cards, nav, eyebrows" reference.
- [docs/design/sections.md](docs/design/sections.md) — five ready-to-copy section templates (Hero, Content With Media, Grid Of Cards, CTA With Inset, Stats Grid).
- [docs/design/validation.md](docs/design/validation.md) — a checklist to tell the agent "make sure this passes", plus a copy-paste prompt to score any existing page.

**How to ask an agent to use it:**

```txt
Before you build or edit anything visual, read docs/design/README.md and the linked files.
Follow the rules in docs/design/tokens.md and docs/design/components.md.
Use one of the five templates in docs/design/sections.md as your starting point.
When you're done, run the pre-merge checklist in docs/design/validation.md and report pass/fail for each rule.
```

**How to test existing pages:**

Open [docs/design/validation.md](docs/design/validation.md), copy the scoring prompt under "Part 2 — Agent Scoring Prompt", paste it into the agent along with the file you want audited, and ask for a pass/fail report per rule.

## What This Project Is

- Public website for AI Builders (`/`)
- Job board demo (`/job-board/demo`)
- Recruiter dashboard (`/job-board/dashboard`)
- Event photo gallery (`/photos`)
- Backed by Supabase for job data

### Core Stack (So You Can Talk To Agents Clearly)

- Next.js 16 (App Router)
- Tailwind CSS 4
- Supabase (jobs data)
- `pnpm` as package manager (prefer `pnpm`, not `npm`/`yarn`)

### Content Language Rule

- Keep user-facing copy in Spanish (`es_MX`) unless explicitly requested otherwise.
- Keep tone community-first, clear, and professional.

## How To Work (No Coding Required)

Use prompts like this with your agent:

1. Explain the goal in one sentence.
2. Name the page/section.
3. Provide exact copy/assets/links.
4. Ask the agent to run checks and summarize changes.

Template:

```txt
Update the [page/section] in this project.
Goal: [what outcome you want]
Copy changes: [paste exact text]
Links: [paste URLs]
Assets: [file names in /public]
Constraints: keep current design style and mobile behavior.
Then run lint and tell me what changed.
```

## Golden Rules (Important)

- Do not expose secrets in code, screenshots, or commits.
- Never edit `.env*` values through the agent unless you explicitly approve it.
- Keep visual style consistent (black/white minimal aesthetic).
- Preserve responsive behavior (mobile + desktop).
- For content-only edits, avoid touching animation or infrastructure logic.
- Ask the agent for a preview checklist after every change.
- Ask the agent to run both `pnpm lint` and `pnpm build` before declaring done.

## Run and Verify Locally

Use this when you or your agent need a clean validation pass:

```bash
pnpm install
pnpm dev
```

Then preview at `http://localhost:3000`.

Before finalizing bigger changes:

```bash
pnpm lint
pnpm build
```

## Project Map (Plain English)

- `app/*`: routes/pages
  - `app/page.tsx`: homepage
  - `app/photos/page.tsx`: photos gallery
  - `app/job-board/demo/page.tsx`: public jobs page
  - `app/job-board/dashboard/page.tsx`: recruiter dashboard
  - `app/collab/*`: isolated collab page
- `components/*`: reusable and section components
- `lib/supabase/*`: DB clients/types
- `lib/actions/jobs.ts`: job CRUD actions
- `public/*`: static assets (images/logos)
- `supabase/migrations/*`: database schema history

## Safe Areas You Can Request Changes In

These are the best places for non-dev content updates:

### Homepage Content

- Hero text, CTA buttons, partner logos: `components/hero-section.tsx`
- Stats numbers/labels: `components/stats.tsx`
- Manifesto/content block: `components/content-3.tsx`
- Upcoming and past events: `components/events-section.tsx`
- Team members: `components/team.tsx`
- Community/newsletter CTA: `components/cta-section.tsx`

### Photos Page

- Photo list + alt text: `app/photos/page.tsx`
- Image files: `public/images/event-photos/...`

### Job Board (Public Demo)

- Main listing experience: `app/job-board/demo/page.tsx`
- Card visuals/components: `components/job-board/cards/*`

### Recruiter Dashboard (Internal UI)

- Dashboard UI + job form behavior: `app/job-board/dashboard/page.tsx`

## Data + Backend Areas (Use Extra Care)

- Supabase client/server setup: `lib/supabase/client.ts`, `lib/supabase/server.ts`
- Job server actions: `lib/actions/jobs.ts`
- DB schema/migrations: `supabase/migrations/*`

Only request changes here if you really need behavior/data model changes.

## Tasks You Can Ask For (Examples)

### 1) Update Event Cards

```txt
Update upcoming events in `components/events-section.tsx`.
Replace all current upcoming events with these 3 events: [paste data].
Keep same card design and spacing.
Also update past events list to include: [paste list].
Run lint and summarize exactly what changed.
```

Event object pattern to provide:

```txt
title, description, month, day, location, attendees, status, price, buttonText, buttonDisabled, tags, logo, link
```

### 2) Update Team Section

```txt
Update `components/team.tsx` with these members: [name, role, image, link].
Keep existing style and hover effects.
Ensure all images have meaningful alt text.
```

### 3) Add New Event Photos

```txt
I added new files to `public/images/event-photos/[folder]`.
Update `app/photos/page.tsx` to include them with good alt text.
Keep current layout and speed behavior.
```

### 4) Change Hero + CTA Copy

```txt
Update homepage copy in `components/hero-section.tsx` and `components/cta-section.tsx`.
Use this copy exactly: [paste copy].
Do not change layout, only text and links.
```

### 5) Job Board Filters/Text Refresh

```txt
In `app/job-board/demo/page.tsx`, update header copy and helper text to this: [paste].
Keep current filtering logic and AI mode behavior unchanged.
```

## Things To Avoid Unless You Mean It

- `lib/supabase/*` credentials logic
- SQL migrations in `supabase/migrations/*`
- Global app shell files (`app/layout.tsx`) unless required
- Large animation refactors in hero/job-board pages
- Tooling config files (`next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`)
- Dependency and lock files (`package.json`, `pnpm-lock.yaml`) unless explicitly requested

## Definition of Done (Ask Agent To Confirm)

For each task, require this output:

- What files changed
- Why each file changed
- Lint result (`pnpm lint`)
- Manual test checklist by route:
  - `/`
  - `/job-board/demo`
  - `/job-board/dashboard`
  - `/photos`
- Any risks or follow-ups

## Quick Recovery Playbook

If something looks wrong:

1. Ask the agent: "Revert only the last change you made and keep everything else."
2. Ask for a smaller scoped change.
3. Re-test only the affected route.
4. Re-run `pnpm lint` and `pnpm build` before moving on.

## Project Conventions (For Agents)

- Package manager: prefer `pnpm` (`pnpm-lock.yaml` exists)
- Framework: Next.js App Router (`app/*`)
- Keep TypeScript types strict where present
- Preserve existing component patterns and utility class style

## One-Line Super Prompt

Use this when you want high-quality edits quickly:

```txt
Act as a careful maintainer for this repo. Make only the minimum safe changes needed, keep design and responsive behavior intact, avoid backend/schema edits unless requested, run lint, and return a concise file-by-file change summary plus test checklist.
```
