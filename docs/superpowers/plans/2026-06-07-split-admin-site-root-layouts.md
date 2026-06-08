# Split Admin / Site into Independent Root Layouts

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Isolate the admin from the public site's CSS by giving each its own Next.js root layout — `app/(site)/` (public, keeps `globals.css`) and `app/(admin)/` (admin + login, with a minimal `admin.css`). The admin starts from a clean Tailwind slate, so the public `h1{serif}` / animations / `#212121` background no longer bleed in.

**Architecture:** Next.js App Router supports **multiple root layouts** via top-level route groups when there is **no** `app/layout.tsx`. We delete the current root layout, move every public route into `(site)` and the admin surface (admin + login) into `(admin)`, and give each group its own `<html>/<body>` + stylesheet. Shared font setup moves to `lib/fonts.ts`; the `next-themes` wrapper moves to `components/theme-provider.tsx`. Crossing the public↔admin boundary triggers a full reload (acceptable — it's a hard boundary).

**Tech Stack:** Next.js 16 (App Router, multiple root layouts), Tailwind CSS 4, next-themes, next/font/google, Vitest.

**Key facts (verified):**
- Admin is **self-contained**: it imports nothing from `@/components/ui` or other `@/app/*` routes.
- `login` is the **admin gateway** (imports the admin `ThemeToggle`, says "Panel de administración") → it goes into `(admin)`.
- Only `app/layout.tsx` imports the theme-provider; only `login` imports the admin ThemeToggle from outside admin.
- `@/app/*` imports in the codebase reference exactly these route roots: `admin`, `collab`, `launch`, `designwithai`, `residencia`. All must be repointed when their folders move.
- There are no special root files (`not-found`, `sitemap`, `robots`, `opengraph-image`, etc.).

---

## File Structure (after refactor)

```
app/
  globals.css                     ← unchanged; imported by (site)/layout via ../globals.css
  (site)/
    layout.tsx                    ← NEW root: <html><body> + globals.css + fonts + ThemeProvider + Analytics + site metadata
    page.tsx                      ← moved from app/page.tsx
    (blog)/ collab/ designwithai/ enterprise/ launch/ newsletter/
    photos/ pwc/ replay/ residencia/ residency/   ← all moved
  (admin)/
    layout.tsx                    ← NEW root: <html><body> + admin.css + fonts + ThemeProvider + admin metadata
    admin.css                     ← NEW minimal stylesheet (Tailwind + font tokens + dark variant)
    admin/                        ← moved from app/admin (keeps its nested layout.tsx: auth + AdminShell)
    login/                        ← moved from app/login
components/
  theme-provider.tsx              ← moved from app/collab/components/theme-provider.tsx
lib/
  fonts.ts                        ← NEW shared next/font setup
```

`app/layout.tsx` is **deleted** (a top-level root layout would override the group roots).

---

## Task 1: Extract shared fonts and theme-provider to neutral locations

Decouple the two pieces both root layouts need from their current homes (root layout / collab).

**Files:**
- Create: `lib/fonts.ts`
- Move: `app/collab/components/theme-provider.tsx` → `components/theme-provider.tsx`

- [ ] **Step 1: Create `lib/fonts.ts`**

```ts
import { Geist, Geist_Mono, Instrument_Serif, Instrument_Sans } from "next/font/google";

export const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
export const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
export const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
});
export const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Public site needs all four families; admin only needs Geist + Geist Mono.
export const siteFontVariables = `${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} ${instrumentSans.variable}`;
export const adminFontVariables = `${geistSans.variable} ${geistMono.variable}`;
```

- [ ] **Step 2: Move the theme-provider to `components/`**

Run:
```bash
git mv app/collab/components/theme-provider.tsx components/theme-provider.tsx
```

The file content is unchanged (it's a thin `next-themes` wrapper). Its only importer (`app/layout.tsx`) is rewritten in Task 3.

- [ ] **Step 3: Verify the move**

Run: `test -f components/theme-provider.tsx && echo OK`
Expected: `OK`

- [ ] **Step 4: Commit**

```bash
git add lib/fonts.ts components/theme-provider.tsx app/collab/components/theme-provider.tsx
git commit -m "refactor: extract shared fonts to lib/fonts and move theme-provider to components"
```

---

## Task 2: Create the `(site)` group and move all public routes into it

**Files:**
- Move: every public route folder/file under `app/` → `app/(site)/`

- [ ] **Step 1: Create the group dir and move public routes**

Run (each `git mv` preserves history; `(site)` is a route group so URLs are unchanged):
```bash
mkdir -p "app/(site)"
git mv app/page.tsx "app/(site)/page.tsx"
git mv "app/(blog)" "app/(site)/(blog)"
for d in collab designwithai enterprise launch newsletter photos pwc replay residencia residency; do
  git mv "app/$d" "app/(site)/$d"
done
```

- [ ] **Step 2: Verify only admin, login, layout.tsx, globals.css remain at the top level**

Run: `ls -1 app/`
Expected: `(site)`, `admin`, `login`, `globals.css`, `layout.tsx` (and nothing else routable).

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "refactor: move public routes into app/(site) route group"
```

---

## Task 3: Create the `(site)` root layout and delete the old root

**Files:**
- Create: `app/(site)/layout.tsx`
- Delete: `app/layout.tsx`

- [ ] **Step 1: Create `app/(site)/layout.tsx`**

This is the old root layout, rewired to the new shared modules (`globals.css` is one level up; fonts and theme-provider come from their neutral homes):

```tsx
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "../globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { siteFontVariables } from "@/lib/fonts";

const siteUrl = "https://aibuilders.mx";
const socialImage = "/twitter-card.png";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "AI Builders Mexico",
  description: "La Comunidad de AI en México",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "AI Builders Mexico",
    description: "La Comunidad de AI en México",
    type: "website",
    locale: "es_MX",
    siteName: "AI Builders Mexico",
    images: [
      {
        url: socialImage,
        width: 1024,
        height: 535,
        alt: "AI Builders Mexico",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Builders Mexico",
    description: "La Comunidad de AI en México",
    images: [socialImage],
  },
};

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${siteFontVariables} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          storageKey="aibm-theme"
        >
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Delete the old root layout**

Run:
```bash
git rm app/layout.tsx
```

- [ ] **Step 3: Commit** (build is intentionally still red until Task 4 repoints imports — that's expected)

```bash
git add -A
git commit -m "refactor: add (site) root layout, remove app/layout.tsx"
```

---

## Task 4: Repoint `@/app/*` imports for the moved public routes

Every import that pointed at a now-moved route root must gain the `(site)` segment.

**Files:**
- Modify: all `.ts`/`.tsx` files importing `@/app/{collab,launch,designwithai,residencia}/...`

- [ ] **Step 1: Rewrite the import paths**

Run (only these four route roots appear in `@/app/*` imports for public routes):
```bash
grep -rlE "@/app/(collab|launch|designwithai|residencia)/" app components lib --include="*.ts" --include="*.tsx" \
  | xargs sed -i '' -E 's#@/app/(collab|launch|designwithai|residencia)/#@/app/(site)/\1/#g'
```

- [ ] **Step 2: Verify no stale public `@/app/*` imports remain**

Run: `grep -rnE "@/app/(collab|launch|designwithai|residencia)/" app components lib --include="*.ts" --include="*.tsx" | grep -v "@/app/(site)/"`
Expected: no output (every match now has the `(site)` segment).

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "refactor: repoint @/app imports to (site) route group"
```

---

## Task 5: Create the `(admin)` group, move admin + login, add the root layout and minimal CSS

**Files:**
- Move: `app/admin` → `app/(admin)/admin`, `app/login` → `app/(admin)/login`
- Create: `app/(admin)/layout.tsx`, `app/(admin)/admin.css`
- Modify: `app/(admin)/login/page.tsx` (repoint the admin ThemeToggle import; drop serif)

- [ ] **Step 1: Move admin and login into the group**

```bash
mkdir -p "app/(admin)"
git mv app/admin "app/(admin)/admin"
git mv app/login "app/(admin)/login"
```

- [ ] **Step 2: Create `app/(admin)/admin.css`** (minimal — no serif heading rule, no front animations, no `#212121` html background)

```css
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
  --color-black: #212121;
}

@layer base {
  body {
    @apply font-sans antialiased;
  }
}
```

- [ ] **Step 3: Create `app/(admin)/layout.tsx`**

```tsx
import type { Metadata } from "next";
import "./admin.css";
import { ThemeProvider } from "@/components/theme-provider";
import { adminFontVariables } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "Admin · AI Builders",
  description: "Panel de administración de AI Builders México.",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${adminFontVariables} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          storageKey="aibm-admin-theme"
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Repoint the admin ThemeToggle import in login**

In `app/(admin)/login/page.tsx`, change:
```ts
import { ThemeToggle } from "@/app/admin/components/theme-toggle";
```
to:
```ts
import { ThemeToggle } from "@/app/(admin)/admin/components/theme-toggle";
```

- [ ] **Step 5: Drop serif from the login heading** (admin surface = Geist Sans)

In `app/(admin)/login/page.tsx`, change the `<h1>`:
```tsx
<h1 className="mb-2 font-serif text-3xl text-gray-800 dark:text-gray-100">
```
to:
```tsx
<h1 className="mb-2 text-3xl font-medium text-gray-800 dark:text-gray-100">
```

- [ ] **Step 6: Verify no stale `@/app/admin` imports remain**

Run: `grep -rnE "@/app/admin/" app components lib --include="*.ts" --include="*.tsx"`
Expected: no output (the only external one was login, now repointed; admin's internal imports use relative `./` paths).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "refactor: move admin + login into (admin) root group with minimal admin.css"
```

---

## Task 6: Remove the now-redundant `.admin-scope` override

With admin on its own stylesheet, the public `h1{serif}` rule never reaches it, so the scoped override and its marker class are dead.

**Files:**
- Modify: `app/globals.css` (remove the `.admin-scope` rule)
- Modify: `app/(admin)/admin/components/admin-shell.tsx` (remove the `admin-scope` class)

- [ ] **Step 1: Remove the `.admin-scope` rule from `app/globals.css`**

Delete this block:
```css
/* Admin: headings use Geist Sans, not Instrument Serif. Scoped to .admin-scope
   (set on the admin shell root) so the public site keeps its serif headings. */
.admin-scope :is(h1, h2, h3, h4, h5, h6) {
  font-family: var(--font-geist-sans);
}
```

- [ ] **Step 2: Remove the `admin-scope` class from the shell root**

In `app/(admin)/admin/components/admin-shell.tsx`, change:
```tsx
<div className="admin-scope min-h-screen bg-stone-100 dark:bg-neutral-950">
```
to:
```tsx
<div className="min-h-screen bg-stone-100 dark:bg-neutral-950">
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "refactor: drop .admin-scope override (admin now has its own stylesheet)"
```

---

## Task 7: Verification

**Files:** none (verification only).

- [ ] **Step 1: Build both roots**

Run: `pnpm build`
Expected: build succeeds; route list shows both `/` (public) and `/admin`, `/admin/newsletter`, `/login` rendering. No "multiple root layout" or missing-import errors.

- [ ] **Step 2: Lint + tests**

Run: `pnpm lint && pnpm test`
Expected: lint exit 0; tests `46 passed | 6 skipped` (unchanged — this refactor touches no tested logic).

- [ ] **Step 3: Confirm admin.css carries no serif heading rule**

Run: `grep -rnE "instrument-serif|h1,|font-serif" "app/(admin)/admin.css"`
Expected: no output (admin stylesheet is serif-free).

- [ ] **Step 4: Manual checklist (`pnpm dev`)**

- `/` and a few public pages (`/collab`, `/launch`, `/residencia`, a blog post) — headings still render **Instrument Serif**; animations (holographic/matrix/dither) and the dark `#212121` backgrounds intact.
- `/admin`, `/admin/newsletter`, `/admin/newsletter/<id>` — every heading renders **Geist Sans** (no serif anywhere); dark-mode toggle works; layout/spacing unchanged.
- `/login` — renders, heading in Geist Sans, theme toggle works, sign-in flow intact.
- Navigating `/` → `/admin` does a full reload (expected with separate roots).

- [ ] **Step 5: Confirm clean tree**

Run: `git status --short`
Expected: clean (all refactor changes committed).

---

## Risks & notes

- **Multiple root layouts**: valid in Next.js App Router only when there is no `app/layout.tsx`. Task 3 deletes it. If the build complains about a missing root layout for any path, a route was left at `app/` outside a group — move it into `(site)`.
- **Intentional red build between Tasks 3 and 4**: deleting the old root and moving routes breaks `@/app/*` imports until Task 4 repoints them. Don't run a full build expecting green until Task 4 is done.
- **`login` belongs to `(admin)`**, not `(site)` — it's the admin auth surface and shares the clean admin stylesheet.
- **next-themes storage keys** are intentionally different (`aibm-theme` vs `aibm-admin-theme`) so the two now-separate apps don't share a theme key. If you'd rather they stay in sync, use the same key in both layouts.
- **Font preloading**: admin loads only Geist + Geist Mono (`adminFontVariables`); the Instrument families are no longer requested on admin pages — a small win, and the reason for the split-variables in `lib/fonts.ts`.
```
