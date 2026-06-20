# CLAUDE.md — AI Builders Mexico Website

> This guide is written so that **anyone** — even without coding experience — can make changes to the AI Builders Mexico website using Cursor + AI. Think of this file as your map to the entire project.

---

## Design System (Required Reading)

Before creating any new section, feature, or visual change, read the design system. It is the single source of truth for how the site looks, feels, and composes.

**TL;DR:**

- **Palette is binary.** Black (`#212121`) and white only. Neutrals are `black/5`, `/10`, `/20`, `/40`, `/60`. Status is `green-500` / `red-500`. No other colors.
- **Typography is fixed.** Instrument Serif for every heading (`font-instrument font-medium`), Geist Mono for eyebrows/labels (`font-mono uppercase tracking-widest`), Geist Sans for body.
- **Layout is fixed.** Every section wraps in `py-16 sm:py-24 md:py-32` with a `mx-auto max-w-6xl px-4 sm:px-6` container and — on light backgrounds — a `border-t border-black/5`. The nav is always the fixed, centered, `rounded-full` pill.

**Read in this order:**

1. [docs/design/README.md](docs/design/README.md) — mission, golden rules, type hierarchy diagram, TOC.
2. [docs/design/tokens.md](docs/design/tokens.md) — raw values (colors, fonts, spacing, radii, shadows, motion).
3. [docs/design/components.md](docs/design/components.md) — canonical class strings for Button, Card, Pill Navigation, Eyebrow, Status Dot, Infinite Slider, Section Anchor, Footer, Input.
4. [docs/design/sections.md](docs/design/sections.md) — five ready-to-copy section templates (Hero, Content With Media, Grid Of Cards, CTA With Inset, Stats Grid).
5. [docs/design/validation.md](docs/design/validation.md) — pre-merge checklist, agent scoring prompt, and the known-deviations backlog for `/launch`, `/collab`, `/designwithai`.

**When building a new section:** `tokens.md` → `sections.md` → `components.md` → validate with `validation.md`. When auditing an existing page, paste the scoring prompt in `validation.md § Part 2` into the agent.

---

## Blog Posts (Required Reading)

The blog lives at `/blog` and its posts are **MDX files** in [`content/blog/`](content/blog/) — one file per post. This is how contributors (humans and agents) add articles safely without touching page routes or copy-pasting ad-hoc styles. **Never** create a `.tsx` file under `app/(blog)/<slug>/` for a new post; that pattern has been retired.

Before you create, edit, or refactor any blog post, read the blog docs in order:

1. [docs/blog/CONTRIBUTING.md](docs/blog/CONTRIBUTING.md) — the 5-step "add a post" flow, folder layout, golden rules, and common pitfalls.
2. [docs/blog/frontmatter.md](docs/blog/frontmatter.md) — every YAML field, required vs optional, with examples.
3. [docs/blog/components.md](docs/blog/components.md) — every MDX component (`Callout`, `StepList`, `CheckList`, `CommandReference`, …), its props, and when to use it vs plain markdown.
4. [docs/blog/_template.mdx](docs/blog/_template.mdx) — copy-and-rename starter.

**TL;DR:**

- Posts are auto-discovered from `content/blog/*.mdx` by [`lib/blog/posts.ts`](lib/blog/posts.ts) — no registry to update.
- The filename (minus `.mdx`) is the slug: `mi-post.mdx` → `/blog/mi-post`.
- Plain markdown first. Reach for a JSX component **only when it's documented in [components.md](docs/blog/components.md)**.
- Every `<SectionTitle id="…">` in the body needs a matching `tocItems` entry in the frontmatter.
- Images for a post go under `public/images/blog/<slug>/`.
- Run `pnpm run build` before marking work complete — the dev server is more forgiving than the production build (MDX parse errors, server/client boundary issues).

### Copy-paste agent prompt for "add a blog post"

Use this to start any blog-post task so the agent doesn't invent new patterns:

```txt
You are adding a blog post to aibuilders.mx. Before writing anything:

1. Read docs/blog/CONTRIBUTING.md, docs/blog/frontmatter.md, and
   docs/blog/components.md in full.
2. Copy docs/blog/_template.mdx to content/blog/<slug>.mdx where <slug>
   is kebab-case (no .mdx in the slug).
3. Fill in the frontmatter using ONLY fields documented in frontmatter.md.
4. Prefer plain markdown. Only reach for a JSX component that is listed
   in components.md. Do not invent new components or ad-hoc styles inside
   the MDX file. Do not add dark: Tailwind classes — the components are
   already theme-aware.
5. Every <SectionTitle id="..."> must have a matching tocItems entry.
6. Images go under public/images/blog/<slug>/ and are referenced with
   <PostImage /> or plain markdown.
7. Run pnpm run build to catch MDX parse errors and server/client
   boundary issues before marking the task complete.
```

---

## What Is This Project?

This is the **AI Builders Mexico** community website ([aibuilders.mx](https://aibuilders.mx)). It's built with:

- **Next.js 16** — A React framework that handles pages, routing, and server-side features
- **Tailwind CSS 4** — Utility-first styling (classes like `bg-white`, `text-black`, `p-4`)
- **Railway Postgres + Drizzle ORM** — The database (community contacts, admin users/sessions, newsletter issues), accessed via `lib/db/`
- **pnpm** — The package manager (like npm, but faster). Always use `pnpm`, never `npm` or `yarn`

The site is in **Spanish** (es_MX). All user-facing text should stay in Spanish unless specified otherwise.

---

## Golden Rules

- **Never expose secrets** in code, screenshots, or commits. Do not edit `.env*` values unless explicitly approved.
- **Keep the visual style consistent** — black/white minimal aesthetic throughout.
- **Preserve responsive behavior** — always check both mobile and desktop after changes.
- **Content-only edits should stay content-only** — don't touch animation or infrastructure logic when you're just updating text.
- **Ask the agent for a preview checklist** after every change.
- **Run lint and build checks** before considering any task done.

---

## How to Run the Project

```bash
# Install dependencies (only needed once, or after pulling new changes)
pnpm install

# Start the development server
pnpm dev
```

Then open **http://localhost:3000** in your browser. Changes you make will appear automatically.

```bash
# Check for errors before deploying
pnpm build
```

---

## Project Structure (Plain English)

```
aibuilders/
│
├── app/                        ← PAGES (each folder = a URL route)
│   ├── page.tsx                ← Homepage (aibuilders.mx/)
│   ├── layout.tsx              ← Wraps every page (fonts, theme, analytics)
│   ├── globals.css             ← Global styles, colors, animations
│   │
│   ├── collab/                 ← Collaboration page (/collab)
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   └── components/         ← Components ONLY used on the collab page
│   │
│   ├── photos/                 ← Event photos gallery (/photos)
│   │   ├── page.tsx
│   │   └── components/
│   │
│   └── admin/                  ← Admin dashboard (/admin) — newsletter, metrics
│       ├── layout.tsx          ← Auth gate (redirects to /login)
│       └── newsletter/         ← Newsletter ("The Build Log") management
│
├── components/                 ← SHARED components (used across pages)
│   ├── hero-section.tsx        ← Big hero at the top of homepage
│   ├── header.tsx              ← Navigation bar
│   ├── footer.tsx              ← Footer at bottom
│   ├── events-section.tsx      ← Upcoming + past events
│   ├── team.tsx                ← Team member cards
│   ├── stats.tsx               ← Community statistics (1500+ Builders, etc.)
│   ├── cta-section.tsx         ← Call-to-action / newsletter signup
│   ├── content-3.tsx           ← Manifesto / about section
│   ├── gallery/                ← Photo gallery components
│   └── ui/                     ← Reusable UI primitives (buttons, cards, etc.)
│
├── lib/                        ← LOGIC & UTILITIES
│   ├── utils.ts                ← Helper functions
│   ├── db/                     ← Drizzle client + schema (Railway Postgres)
│   ├── auth/                   ← Session/auth helpers
│   └── actions/                ← Server actions (newsletter, webinar leads)
│
├── public/                     ← STATIC FILES (images, logos, icons)
│   ├── favicon.svg
│   ├── og-image.png            ← Social media preview image
│   └── images/event-photos/    ← Event photography
│
├── drizzle/                    ← Generated SQL migrations (Railway Postgres)
│
├── types/                      ← TypeScript type definitions
├── hooks/                      ← React hooks (use-mobile.tsx)
└── package.json                ← Project dependencies and scripts
```

---

## How to Talk to AI Agents (Prompt Templates)

You don't need to know code. Just describe what you want clearly. Use this template:

```txt
Update the [page/section] in this project.
Goal: [what outcome you want]
Copy changes: [paste exact text]
Links: [paste URLs]
Assets: [file names in /public]
Constraints: keep current design style and mobile behavior.
Then run lint and tell me what changed.
```

### Example Prompts You Can Copy & Paste

**Update events:**
```txt
Update upcoming events in `components/events-section.tsx`.
Replace all current upcoming events with these 3 events: [paste data].
Keep same card design and spacing.
Also update past events list to include: [paste list].
Run lint and summarize exactly what changed.
```

**Update team members:**
```txt
Update `components/team.tsx` with these members: [name, role, image, link].
Keep existing style and hover effects.
Ensure all images have meaningful alt text.
```

**Add event photos:**
```txt
I added new files to `public/images/event-photos/[folder]`.
Update `app/photos/page.tsx` to include them with good alt text.
Keep current layout and speed behavior.
```

**Change hero or CTA copy:**
```txt
Update homepage copy in `components/hero-section.tsx` and `components/cta-section.tsx`.
Use this copy exactly: [paste copy].
Do not change layout, only text and links.
```

### One-Line Super Prompt

When you want high-quality edits quickly, start your request with this:

```txt
Act as a careful maintainer for this repo. Make only the minimum safe changes needed, keep design and responsive behavior intact, avoid backend/schema edits unless requested, run lint, and return a concise file-by-file change summary plus test checklist.
```

---

## Common Tasks — How to Do Things

### 1. Update Events (Upcoming or Past)

**File:** `components/events-section.tsx`

Events are stored as arrays near the top of the file.

**To add a new upcoming event**, add an object to the `events` array:

```typescript
{
  title: "Nombre del Evento",
  description: "Descripción breve del evento.",
  month: "MAR",                    // 3-letter month abbreviation
  day: "25",                       // Day number as string
  location: "CDMX, Roma Norte",    // Location
  attendees: "100 lugares",        // Capacity
  status: "ABIERTO",              // "ABIERTO" (green dot) or "PRÓXIMO" (gray dot)
  price: "Gratis",
  buttonText: "Registrarme",       // Button label
  buttonDisabled: false,           // false = clickable, true = grayed out
  tags: ["Workshop", "AI"],
  logo: "/favicon.svg",            // Logo path from /public folder
  link: "https://luma.com/...",    // Registration link
}
```

**To add a past event**, add an object to the `pastEvents` array:

```typescript
{
  title: "Nombre del Evento",
  month: "FEB",
  day: "12",
  location: "Ciudad de México, Presencial",
  logo: "/cursor-logo-event.svg",  // Optional
}
```

**To move an event from upcoming to past:** Cut the event object from `events`, simplify it (remove description, attendees, etc.), and paste it at the beginning of `pastEvents`.

---

### 2. Update Team Members

**File:** `components/team.tsx`

Team data is in the `members` array at the top:

```typescript
{
  name: "Full Name",
  role: "Co-Founder",               // Their title
  avatar: "/name.avif",             // Photo path in /public, or a URL
  link: "https://their-website.com", // Where clicking their card goes
}
```

To add a team member's photo: place the image file in the `/public` folder and reference it as `"/filename.avif"`.

---

### 3. Update Community Statistics

**File:** `components/stats.tsx`

Stats are in the `stats` array at the top:

```typescript
{
  label: "Builders",        // Label shown below the number
  value: "1500+",           // The big number displayed
  icon: Users,              // Icon from lucide-react
}
```

Just change the `value` string to update a number.

---

### 4. Add Event Photos

**File:** `app/photos/page.tsx`

Photos are listed as paths in arrays. Add new photos by:

1. Place photo files (JPG) in `/public/images/event-photos/[event-name]/`
2. Add the path strings to the photo arrays in `app/photos/page.tsx`

---

### 5. Update the Hero Section

**File:** `components/hero-section.tsx`

This is the big animated section at the top of the homepage. It contains:
- The main heading and subtext
- CTA buttons (WhatsApp, LinkedIn)
- Partner logo slider
- Background images (hero1-4.avif in `/public`)

---

### 6. Update the Header / Navigation

**File:** `components/header.tsx`

Contains navigation links (Manifesto, Events, Team) and the WhatsApp CTA button. Scroll behavior and styling are handled here.

---

### 7. Update the CTA / Newsletter Section

**File:** `components/cta-section.tsx`

Contains the WhatsApp community link and the Beehiiv newsletter signup form.

---

### 8. Add Partner Logos

Partner logos appear in two places:
- **Homepage hero slider:** `components/hero-section.tsx` (look for `InfiniteSlider`)
- **Mobile stats section:** `components/stats.tsx` (look for `InfiniteSlider`)

To add a logo:
1. Place the SVG/PNG in `/public`
2. Add an `<img>` tag inside the `InfiniteSlider` component, following the pattern of existing logos

---

### 9. Update the Collab Page

The `/collab` page has its own isolated set of components in `app/collab/components/`. It includes:
- Its own header, footer, hero section
- A features section, tilted cards section, and call-to-action
- A WebGL dither background effect
- Dark/light theme support

---

## Important Rules

### Do NOT Touch (Unless You Know What You're Doing)

| File/Folder | Why |
|---|---|
| `app/layout.tsx` | Root layout — fonts, theme provider, analytics. Breaking this breaks everything. |
| `lib/db/` | Database connection (Drizzle + Railway Postgres). Sensitive config. |
| `lib/auth/` | Session/auth logic. |
| `next.config.ts` | Next.js config. |
| `tsconfig.json` | TypeScript config. |
| `package.json` | Dependencies. Don't manually edit versions. |
| `pnpm-lock.yaml` | Auto-generated lock file. Never edit manually. |
| `drizzle/` & `lib/db/schema.ts` | Database schema/migrations. Changes here affect the live database. |
| `postcss.config.mjs` | PostCSS/Tailwind pipeline config. |
| `eslint.config.mjs` | Linting rules. |

### Naming Conventions

- **Components** use PascalCase: `HeroSection`, `TeamSection`
- **Files** use kebab-case: `hero-section.tsx`, `events-section.tsx`
- **CSS/Styling** uses Tailwind utility classes — avoid writing raw CSS unless necessary
- **Images** go in `/public` and are referenced with paths starting from `/` (e.g., `/favicon.svg`)

### Language & Content

- All user-facing text is in **Spanish** (es_MX)
- Keep the tone consistent: professional but approachable, community-focused
- Month abbreviations in events use Spanish: ENE, FEB, MAR, ABR, MAY, JUN, JUL, AUG, SEPT, OCT, NOV, DIC

### Code Style

- Use `"use client"` at the top of files that use React hooks (`useState`, `useEffect`, etc.) or browser APIs
- Import paths use the `@/` alias which maps to the project root (e.g., `@/components/ui/button`)
- The project uses TypeScript — define types for data structures
- Use Tailwind CSS classes for styling, not inline styles or CSS modules
- Prefer `lucide-react` for icons (already installed)

---

## Database (Railway Postgres + Drizzle)

The site uses Railway Postgres accessed through **Drizzle ORM**. Current tables:

| Table | Purpose |
|---|---|
| `contacts` | Community email list (source/tags, newsletter opt-in) |
| `users` | Admin accounts (email + password hash) |
| `sessions` | Admin login sessions (cookie token hashes) |
| `newsletter_issues` | "The Build Log" newsletter issues (JSONB content) |

- **Client + schema** live in `lib/db/client.ts` and `lib/db/schema.ts`.
- **Auth** is a custom session cookie (`lib/auth/`), validated server-side — no third-party auth provider.
- **Migrations** are generated by Drizzle Kit into `drizzle/` (`pnpm db:generate` → `pnpm db:migrate`).

Environment variable needed (in `.env.local`, not committed to git):
- `DATABASE_URL` — Railway Postgres connection string

> Note: the job board was removed (June 2026) pending a redesign; it will be rebuilt with a fresh schema later.

---

## Animations & Effects

The site uses several animation libraries:

- **GSAP** — Used in the hero section for scroll-triggered text animations
- **Framer Motion** — Used for page transitions and element animations
- **Custom CSS animations** — Holographic effects, matrix rain, CRT flicker (defined in `globals.css`)
- **WebGL Dither** — 3D background effect using `@react-three/fiber` (collab page)

Be careful editing animation code — it can be complex. If you just need to change text or images within animated sections, that's safe.

---

## Deployment

The project deploys on **Railway**. Key points:

- Pushing to `main` triggers automatic deployment
- The `pnpm build` command must succeed before deploying
- Vercel Analytics is integrated (`@vercel/analytics`)
- OG image for social sharing is at `/public/og-image.png`

---

## Quick Reference — "I Want To..."

| I want to... | Go to... |
|---|---|
| Add a new event | `components/events-section.tsx` → `events` array |
| Move event to past | `components/events-section.tsx` → move from `events` to `pastEvents` |
| Change stats numbers | `components/stats.tsx` → `stats` array |
| Update team info | `components/team.tsx` → `members` array |
| Add event photos | Place in `public/images/event-photos/`, update `app/photos/page.tsx` |
| Change hero text | `components/hero-section.tsx` |
| Edit navigation links | `components/header.tsx` |
| Update CTA / newsletter | `components/cta-section.tsx` |
| Add partner logo | `components/hero-section.tsx` and `components/stats.tsx` (InfiniteSlider) |
| Edit collab page | `app/collab/components/` (isolated components) |
| Add a new page | Create a new folder in `app/` with a `page.tsx` file |
| Change global styles/colors | `app/globals.css` |
| Update site metadata (SEO) | `app/layout.tsx` → `metadata` object |
| Add a new image/asset | Place file in `/public`, reference as `"/filename.ext"` |
| Convert an HTML newsletter into a draft | Use the `newsletter-from-html` skill (`.claude/skills/`) — maps the HTML to the `Issue` format, wraps links, creates the Railway draft |
| Add a new blog post | Copy `docs/blog/_template.mdx` → `content/blog/<slug>.mdx`; read [docs/blog/CONTRIBUTING.md](docs/blog/CONTRIBUTING.md) first |
| Edit an existing blog post | Edit the matching `content/blog/<slug>.mdx`; check [components.md](docs/blog/components.md) before inventing styles |
| Add a new blog MDX component | Create in `components/blog/mdx/<name>.tsx`, register in `mdx-components.tsx`, document in `docs/blog/components.md` — all in the same commit |

---

## Definition of Done (Ask the Agent to Confirm)

After every task, require this output from the AI agent:

- **What files changed** — list of every file touched
- **Why each file changed** — one-line reason per file
- **Lint result** — output of `pnpm lint`
- **Manual test checklist** by route:
  - `/` (homepage)
  - `/photos` (gallery)
  - `/collab` (collaboration page)
  - `/admin` (admin dashboard — requires login)
- **Any risks or follow-ups** — things to watch out for

---

## Quick Recovery Playbook

If something looks wrong after a change:

1. **Ask the agent:** "Revert only the last change you made and keep everything else."
2. **If that doesn't work:** Run `git checkout .` to revert ALL uncommitted changes.
3. **To revert a specific file:** Run `git checkout [filename]` (e.g., `git checkout components/events-section.tsx`).
4. **Narrow the scope:** Ask for a smaller, more targeted change and re-test only the affected route.
5. **Nuclear option:** Run `git stash` to save your changes aside, verify the site works, then `git stash pop` to bring changes back for debugging.

---

## Tips for Non-Developers Using AI

1. **Be specific** — Instead of "make it look better," say "change the hero heading text to 'Construye con AI'" or "add a new event card for March 25th workshop."

2. **One thing at a time** — Make one change, check it in the browser, then move to the next change.

3. **Always preview** — After making changes, check `http://localhost:3000` to see if it looks right. Check mobile sizes too.

4. **If something breaks** — You can always undo with `git checkout .` to revert all changes, or `git checkout [filename]` to revert a specific file.

5. **Content changes are safe** — Editing text, numbers, links, and image paths in data arrays is the safest type of change. Structure and logic changes carry more risk.

6. **Ask AI to check** — After making changes, ask the AI to run `pnpm build` to verify nothing is broken.

---

*Last updated: February 2026*
