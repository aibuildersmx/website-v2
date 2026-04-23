# Blog — Contributing Guide

> Everything you need to ship a blog post to [aibuilders.mx/blog](https://aibuilders.mx/blog) without breaking the design system.

Posts live in [`content/blog/`](../../content/blog/) as `.mdx` files — one file per post. They're rendered by the dynamic route at [`app/(blog)/blog/[slug]/page.tsx`](../../app/(blog)/blog/[slug]/page.tsx) and listed on the index at [`app/(blog)/blog/page.tsx`](../../app/(blog)/blog/page.tsx).

**If you are a human contributor**, this is the one doc you need to read. Everything else is reference material.

**If you are an AI agent**, read the full `docs/blog/` set (this file, [frontmatter.md](./frontmatter.md), [components.md](./components.md)) before creating or editing any MDX post. The root [CLAUDE.md](../../CLAUDE.md) and [AGENTS.md](../../AGENTS.md) enforce this.

---

## TL;DR — Add a new post in 5 steps

1. **Copy the template.** Duplicate [`docs/blog/_template.mdx`](./_template.mdx) into `content/blog/` and rename it to your slug:
   ```bash
   cp docs/blog/_template.mdx content/blog/mi-nuevo-post.mdx
   ```
   The filename (minus `.mdx`) becomes the URL: `/blog/mi-nuevo-post`.

2. **Fill in the frontmatter.** The YAML block at the top of the file. Full schema in [frontmatter.md](./frontmatter.md). At minimum, you need `title`, `description`, `date`, `readTime`, and `tocItems`.

3. **Write the body in markdown.** Plain headings (`##`, `###`), paragraphs, lists, links, images, code fences, and GFM tables all work out of the box. Reach for the JSX components in [components.md](./components.md) **only when plain markdown isn't enough**.

4. **Verify locally.**
   ```bash
   pnpm dev
   # Open http://localhost:3000/blog and click your post
   ```
   Then run the full build to catch anything the dev server tolerates:
   ```bash
   pnpm run build
   ```

5. **Commit and open a PR.** No extra registration needed — new posts are auto-discovered by [`lib/blog/posts.ts`](../../lib/blog/posts.ts) from the filesystem.

---

## File layout

```
content/blog/
├── _template.mdx                  ← lives in docs/, not here; don't commit drafts prefixed with _
├── mi-post.mdx                    ← your post
└── otro-post.mdx

docs/blog/
├── CONTRIBUTING.md                ← this file
├── frontmatter.md                 ← every frontmatter field explained
├── components.md                  ← every MDX component explained
└── _template.mdx                  ← copy-and-rename starter

components/blog/
├── post-shell.tsx                 ← header + TOC + article column (don't edit)
├── code-block.tsx                 ← rendered by triple-backtick fences
├── terminal.tsx                   ← <Terminal> component
├── shared.tsx                     ← Callout, SectionTitle, SubSection, Prose
└── mdx/                           ← StepList, CheckList, ResourceLinks, …
```

**Do not** create a `.tsx` file under `app/(blog)/<slug>/`. That pattern is deprecated. All new posts go through MDX.

**Do not** edit [`components/blog/post-shell.tsx`](../../components/blog/post-shell.tsx) or the files under [`components/blog/mdx/`](../../components/blog/mdx/) to tweak a single post. If you need a new visual pattern, propose a new reusable component and document it in [components.md](./components.md).

---

## The golden rules

1. **Plain markdown first.** Headings, paragraphs, lists, links, inline `code`, code fences, GFM tables. The rendered `.post-content` wrapper styles them automatically — they'll match the design system without you touching styles.
2. **Reach for a component only when the pattern repeats.** A single-paragraph warning is a `<Callout type="warning">`. A single recommended download CTA is a `<DownloadButton>`. A generic green-checkmark list of 3+ items is a `<CheckList>`. Don't invent ad-hoc styling — if your idea doesn't fit any documented component, ask in the PR before shipping a new one.
3. **Respect the TOC.** Every `<SectionTitle>` must have an `id` and a matching entry in the `tocItems` frontmatter. The sticky TOC highlights the current section via IntersectionObserver — missing IDs silently break that behavior.
4. **Images go in `public/images/blog/<slug>/`.** Use `<PostImage src="/images/blog/mi-post/screenshot.png" alt="…" width={800} height={500} />` for screenshots, or plain markdown `![alt](/path)` when you don't need the figure treatment.
5. **Copy is Spanish (`es_MX`)** — same rule as the rest of the site. See the root [design system README](../design/README.md) for tone.
6. **Theme-aware, automatically.** The blog has its own light/dark toggle (scoped to `/blog`). Every documented component already handles both. If you find yourself reaching for `dark:` Tailwind classes inside an MDX file, stop — that's a signal you should be using a component instead.

---

## Common pitfalls

- **Frontmatter stops working after you add a quote.** YAML strings with `:`, `'`, `"`, or `#` must be wrapped in double quotes. When in doubt, quote it.
- **A function prop to a client component errors at build.** MDX files are server components, and components like `<CommandReference>` reject function references (e.g. Lucide icons) across the boundary. Pass a string key instead (see [components.md — CommandReference](./components.md#commandreference)).
- **The TOC skips a section.** You forgot to add its `id` to the frontmatter `tocItems` array. The sticky TOC only renders what's in the array.
- **Links underline even inside styled cards.** The CSS targets `.post-content a:not(.no-underline)` — custom components opt out by setting `className="…no-underline"`. Don't re-style links globally.

---

## Need something that doesn't exist yet?

1. Check [components.md](./components.md) — we may already have it under a name you didn't guess.
2. If it's truly missing, propose it in the PR description **before** writing inline styles. New components live in [`components/blog/mdx/`](../../components/blog/mdx/), use `'use client'` when they need `useBlogTheme()`, and must be documented in [components.md](./components.md) and registered in [`mdx-components.tsx`](../../mdx-components.tsx) in the same commit.

---

## For AI agents

Copy-paste this prompt into the agent before it touches any blog post:

```
You are adding a blog post to aibuilders.mx. Before writing anything:

1. Read docs/blog/CONTRIBUTING.md (this file), docs/blog/frontmatter.md,
   and docs/blog/components.md in full.
2. Copy docs/blog/_template.mdx to content/blog/<slug>.mdx where <slug>
   is the URL-safe filename (kebab-case, no .mdx extension in the slug).
3. Fill in the frontmatter using ONLY fields documented in frontmatter.md.
4. Prefer plain markdown. Only reach for a JSX component that is listed
   in components.md. Do not invent new components or ad-hoc styles inside
   the MDX file. Do not add dark: Tailwind classes — the components are
   already theme-aware.
5. Every <SectionTitle id="…"> must have a matching tocItems entry.
6. Images for the post go under public/images/blog/<slug>/ and are
   referenced with <PostImage /> or plain markdown.
7. Run pnpm run build to catch MDX parse errors and server/client
   boundary issues before marking the task complete.
```
