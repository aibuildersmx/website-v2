# JOB-BOARD.md — AI Builders Job Board Guide

> Focused operating guide for making safe changes only in the job board area of this repo.

---

## Scope

Work only on:

- Public board: `/job-board/demo` -> `app/job-board/demo/page.tsx`
- Recruiter dashboard: `/job-board/dashboard` -> `app/job-board/dashboard/page.tsx`
- Job board shared UI/data: `components/job-board/*`
- Job data actions (when explicitly needed): `lib/actions/jobs.ts`
- Supabase typing/client usage (when explicitly needed): `lib/supabase/*`

Avoid unrelated pages (`/`, `/photos`, `/collab`) unless a dependency forces a shared fix.

---

## Stack and Rules

- Framework: Next.js App Router + TypeScript
- Styling: Tailwind CSS
- Data: Supabase (jobs, companies, applications)
- Package manager: use `pnpm` only
- User-facing copy: Spanish (`es_MX`) unless requested otherwise

---

## Job Board Architecture (Quick)

- `app/job-board/page.tsx`
  - Entry route that redirects to `/job-board/demo`.
- `app/job-board/demo/page.tsx`
  - Public listing experience (search/filter/AI-related UI behavior).
  - Reads jobs from Supabase and falls back to local sample data if needed.
- `app/job-board/dashboard/page.tsx`
  - Internal CRUD interface for creating/updating/deleting jobs.
- `components/job-board/job-data.ts`
  - Local fallback/sample jobs used when backend data is unavailable.
- `lib/actions/jobs.ts`
  - Server actions for job operations.
- `lib/supabase/types.ts`
  - Canonical DB types for safer updates.

---

## Safe Change Zones

### Content/UI only (lowest risk)

- Header/subheader text
- Card copy and visual tweaks in `components/job-board/*`
- Filters labels/placeholders (without changing filtering logic)
- Empty states/loading states copy

### Behavior changes (medium/high risk)

- Filtering/sorting/search logic
- Dashboard form validation and field mapping
- Supabase query shape and status mapping
- Create/edit/delete server action behavior

For behavior changes, keep edits minimal and verify both demo and dashboard flows.

---

## Guardrails (Do Not Break)

- Do not edit `.env*` values.
- Do not change DB migrations in `supabase/migrations/*` unless explicitly requested.
- Do not refactor unrelated global app files (`app/layout.tsx`, global theming, analytics) for a board task.
- Do not manually edit dependency versions or lockfiles unless requested.
- Preserve responsive behavior for both demo and dashboard.

---

## Common Tasks

### Update fallback jobs

Edit `components/job-board/job-data.ts` only.

### Refresh public board copy

Edit `app/job-board/demo/page.tsx` copy strings only; keep filtering and AI mode behavior unchanged.

### Modify dashboard form fields

Edit `app/job-board/dashboard/page.tsx`, then confirm field names align with `lib/actions/jobs.ts` and Supabase column names.

### Adjust server-side CRUD behavior

Edit `lib/actions/jobs.ts` and verify reads/writes in both demo and dashboard.

---

## Suggested Prompt Template (Job Board Only)

```txt
Update only the job board in this project.
Goal: [desired outcome]
Area: [demo | dashboard | shared components | actions]
Copy changes: [exact text]
Behavior constraints: [what must not change]
Data constraints: [Supabase/fallback expectations]
Then run pnpm lint and pnpm build, and report:
- files changed
- why each file changed
- manual checks for /job-board/demo and /job-board/dashboard
- risks/follow-ups
```

---

## Validation Checklist

Run:

```bash
pnpm lint
pnpm build
```

Manual checks:

- `/job-board/demo`
  - List renders correctly
  - Search/filter behavior still works
  - Empty/loading/error states look correct
- `/job-board/dashboard`
  - Create job works
  - Edit job works
  - Delete/status update works
  - Validation messages are clear and in Spanish where user-facing

---

## Definition of Done (Job Board Tasks)

- Only job-board-relevant files were changed
- No secrets or env values touched
- `pnpm lint` passes
- `pnpm build` passes
- Demo and dashboard manual checks completed
- Risks and follow-up items documented

---

*Created: February 2026*
