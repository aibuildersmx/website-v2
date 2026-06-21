# Personas Curation Modal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn `/admin/comunidad/personas` into a fast manual-curation station: edit a person (name, contact match, tags, notes) in a modal opened from each list row, with contact auto-suggestions, a "Guardar y siguiente" stepper, and a "Sin contacto" pending filter.

**Architecture:** Extract the existing inline editor's field logic into a shared `useCurationState` hook + `CurationFields` view (DRY with the detail-page `PersonEditor`). A client `CuratorProvider` mounted on the list holds the serialized people array + open index; a per-row `EditButton` (sibling to the row `Link`, not nested) opens a shared `CuratorModal` that reuses the hook and adds Guardar / Guardar y siguiente. The pending filter is a pure `filterPeopleByMatch` helper applied server-side in `page.tsx`.

**Tech Stack:** Next.js 16 (App Router, client components, Server Actions), React 19 (`useState`/`useTransition`/`useContext`), Tailwind 4, vitest.

## Global Constraints

- **Reuse, don't duplicate.** The save path (`saveCommunityPerson`) and search (`searchContactsAction`) in `lib/actions/community.ts` already exist and are tested — do NOT reimplement them. Field state/markup is shared via one hook.
- **No keyboard save shortcuts.** Only `Esc` closes the modal (standard). No ⌘/Ctrl+Enter.
- **Palette B/N only** — reuse the exact classes already in `person-editor.tsx` (`rounded-2xl border-black/5`, `font-mono` eyebrows, chips, the dark `bg-gray-900` button). No new colors. Spanish (es_MX) copy.
- **Auth:** writes already gated inside the server action — no new gating needed.
- **`page.tsx` stays UNCOMMITTED.** It carries a parallel session's list redesign (ListPager, monogram, activity bar, `isMeaningfulName`). Build on the current working-tree version; at the end, commit only the new/owned files and leave `page.tsx` staged-free for the user. Verification (`build`) still runs against the full working tree.
- **Package manager:** `pnpm` only. Tests: `pnpm test` (vitest, `tests/**/*.test.ts`).
- **Nested-interactive rule:** the `EditButton` must NOT live inside the row `<Link>` (`<button>` inside `<a>` is invalid + clicks bubble to navigation). It is an absolutely-positioned sibling inside the `<li>`, with `e.stopPropagation()`.

---

## File Structure

- `lib/community/curation.ts` (NEW) — pure `filterPeopleByMatch` + `CurationPerson` type + `suggestQueryFor`. Testable, no React.
- `tests/community/curation.test.ts` (NEW) — unit tests for the pure helpers.
- `app/(admin)/admin/comunidad/personas/components/curation-fields.tsx` (NEW) — `useCurationState(initial)` hook returning state + `payload` + a `<CurationFields>` element (name, contact typeahead **with auto-suggest**, tags, notes). The single source of field truth.
- `app/(admin)/admin/comunidad/personas/components/person-editor.tsx` (MODIFY) — thin wrapper: use the hook + Guardar button + saved/error state. (Detail page; owned by us.)
- `app/(admin)/admin/comunidad/personas/components/curator.tsx` (NEW) — `CuratorProvider` (context: people + openIndex + open/close/next), `EditButton`, `CuratorModal` (uses the hook; Guardar + Guardar y siguiente; Esc + backdrop close).
- `app/(admin)/admin/comunidad/personas/page.tsx` (MODIFY, left uncommitted) — build `CurationPerson[]`, apply `filterPeopleByMatch`, wrap list in `CuratorProvider`, drop `EditButton` per row, render `CuratorModal`, add the `Sin contacto` filter chip.

---

## Task 1: Pure curation helpers

**Files:**
- Create: `lib/community/curation.ts`
- Test: `tests/community/curation.test.ts`

**Interfaces:**
- Produces:
  - `type CurationPerson = { jid: string; name: string | null; phone: string; displayName: string | null; notes: string | null; tags: string[]; contact: { id: string; email: string; name: string | null } | null }`
  - `filterPeopleByMatch<T extends { contact: CurationPerson["contact"] }>(people: T[], mode: string | undefined): T[]` — returns only `contact === null` when `mode === "pending"`, else the input unchanged.
  - `suggestQueryFor(p: { displayName: string | null; name: string | null }): string` — best query string for contact auto-suggest: trimmed `displayName` if 2+ chars, else trimmed `name` if 2+ chars, else `""`.

- [ ] **Step 1: Write the failing test**

Create `tests/community/curation.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { filterPeopleByMatch, suggestQueryFor } from "@/lib/community/curation";

const withContact = { jid: "a", contact: { id: "c1", email: "a@b.com", name: "A" } };
const noContact = { jid: "b", contact: null };

describe("filterPeopleByMatch", () => {
  it("returns only people without a contact when mode is 'pending'", () => {
    expect(filterPeopleByMatch([withContact, noContact], "pending")).toEqual([noContact]);
  });
  it("returns everyone unchanged for any other mode", () => {
    const all = [withContact, noContact];
    expect(filterPeopleByMatch(all, undefined)).toBe(all);
    expect(filterPeopleByMatch(all, "all")).toBe(all);
  });
});

describe("suggestQueryFor", () => {
  it("prefers a 2+ char displayName", () => {
    expect(suggestQueryFor({ displayName: "Ana López", name: "Fp" })).toBe("Ana López");
  });
  it("falls back to name when displayName is missing or too short", () => {
    expect(suggestQueryFor({ displayName: null, name: "Ricardo" })).toBe("Ricardo");
    expect(suggestQueryFor({ displayName: " ", name: "Ricardo" })).toBe("Ricardo");
  });
  it("returns '' when neither is usable", () => {
    expect(suggestQueryFor({ displayName: null, name: "J" })).toBe("");
    expect(suggestQueryFor({ displayName: "", name: null })).toBe("");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd "/Volumes/VELLENT USB/Sites/aibuilders" && pnpm test tests/community/curation.test.ts`
Expected: FAIL — module `@/lib/community/curation` not found.

- [ ] **Step 3: Implement the helpers**

Create `lib/community/curation.ts`:

```ts
export type CurationContact = { id: string; email: string; name: string | null };

export type CurationPerson = {
  jid: string;
  name: string | null;
  phone: string;
  displayName: string | null;
  notes: string | null;
  tags: string[];
  contact: CurationContact | null;
};

export function filterPeopleByMatch<T extends { contact: CurationContact | null }>(
  people: T[],
  mode: string | undefined,
): T[] {
  if (mode !== "pending") return people;
  return people.filter((p) => p.contact === null);
}

export function suggestQueryFor(p: { displayName: string | null; name: string | null }): string {
  const dn = (p.displayName ?? "").trim();
  if (dn.length >= 2) return dn;
  const n = (p.name ?? "").trim();
  if (n.length >= 2) return n;
  return "";
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd "/Volumes/VELLENT USB/Sites/aibuilders" && pnpm test tests/community/curation.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
cd "/Volumes/VELLENT USB/Sites/aibuilders" && git add lib/community/curation.ts tests/community/curation.test.ts && git commit -m "feat(comunidad): pure curation helpers (pending filter, suggest query)"
```

---

## Task 2: Shared `useCurationState` hook + `CurationFields`

**Files:**
- Create: `app/(admin)/admin/comunidad/personas/components/curation-fields.tsx`

**Interfaces:**
- Consumes: `searchContactsAction` from `@/lib/actions/community`; `suggestQueryFor` from `@/lib/community/curation`.
- Produces:
  - `type CurationInitial = { displayName: string; notes: string; tags: string[]; contact: CurationContact | null; phone: string | null }`
  - `useCurationState(initial: CurationInitial): { fields: ReactNode; payload: { displayName: string | null; contactId: string | null; notes: string | null; tags: string[]; phone: string | null } }`
  - The hook renders all fields (name, contact typeahead + auto-suggest chips, tags, notes) and exposes the `payload` ready for `saveCommunityPerson`.

This is a client UI module; no headless unit test (the project tests logic, not React render). Verified by `pnpm build` in Task 3/5 and the manual checklist.

- [ ] **Step 1: Create the hook + fields**

Create `app/(admin)/admin/comunidad/personas/components/curation-fields.tsx`:

```tsx
"use client";

import { useEffect, useState, type ReactNode } from "react";
import { searchContactsAction } from "@/lib/actions/community";
import { suggestQueryFor, type CurationContact } from "@/lib/community/curation";

export type CurationInitial = {
  displayName: string;
  notes: string;
  tags: string[];
  contact: CurationContact | null;
  phone: string | null;
};

const FIELD =
  "w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-black/30 dark:border-white/15 dark:bg-neutral-900 dark:text-gray-100";
const LABEL = "text-xs font-medium text-gray-400 dark:text-gray-500";

export function useCurationState(initial: CurationInitial) {
  const [displayName, setDisplayName] = useState(initial.displayName);
  const [notes, setNotes] = useState(initial.notes);
  const [tags, setTags] = useState<string[]>(initial.tags);
  const [tagDraft, setTagDraft] = useState("");
  const [contact, setContact] = useState<CurationContact | null>(initial.contact);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CurationContact[]>([]);
  const [suggestions, setSuggestions] = useState<CurationContact[]>([]);

  // Auto-suggest: on mount, if no contact yet, search by the person's best name.
  useEffect(() => {
    let alive = true;
    if (!initial.contact) {
      const q = suggestQueryFor({ displayName: initial.displayName, name: null });
      if (q) {
        searchContactsAction(q).then((r) => {
          if (alive) setSuggestions(r.slice(0, 3));
        });
      }
    }
    return () => {
      alive = false;
    };
  }, [initial.contact, initial.displayName]);

  async function runSearch(q: string) {
    setQuery(q);
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    setResults(await searchContactsAction(q));
  }

  function pickContact(c: CurationContact) {
    setContact(c);
    setQuery("");
    setResults([]);
  }

  function addTag() {
    const t = tagDraft.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagDraft("");
  }

  const fields: ReactNode = (
    <div className="flex flex-col gap-4">
      <div>
        <label className={LABEL}>Nombre</label>
        <input
          className={`mt-1 ${FIELD}`}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Nombre curado"
        />
      </div>

      <div>
        <label className={LABEL}>Contacto</label>
        {contact ? (
          <div className="mt-1 flex items-center justify-between gap-3 rounded-xl border border-black/10 px-3 py-2 dark:border-white/15">
            <span className="truncate text-sm text-gray-800 dark:text-gray-100">
              {contact.name ?? "—"} · <span className="text-gray-400">{contact.email}</span>
            </span>
            <button
              type="button"
              onClick={() => setContact(null)}
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.15em] text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              Desvincular
            </button>
          </div>
        ) : (
          <>
            {suggestions.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-2">
                {suggestions.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => pickContact(c)}
                    className="rounded-full border border-black/10 px-3 py-1 text-xs text-gray-700 hover:border-black/30 dark:border-white/15 dark:text-gray-200"
                    title={c.email}
                  >
                    {c.name ?? c.email}
                  </button>
                ))}
              </div>
            )}
            <div className="relative mt-2">
              <input
                className={FIELD}
                value={query}
                onChange={(e) => runSearch(e.target.value)}
                placeholder="Buscar por nombre o email…"
              />
              {results.length > 0 && (
                <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-black/10 bg-white shadow-lg dark:border-white/15 dark:bg-neutral-900">
                  {results.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => pickContact(c)}
                        className="block w-full px-3 py-2 text-left text-sm hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                      >
                        <span className="text-gray-800 dark:text-gray-100">{c.name ?? "—"}</span>{" "}
                        <span className="text-gray-400">{c.email}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>

      <div>
        <label className={LABEL}>Tags</label>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          {tags.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTags(tags.filter((x) => x !== t))}
              className="rounded-full border border-black/10 px-3 py-1 text-xs text-gray-700 hover:border-black/30 dark:border-white/15 dark:text-gray-200"
            >
              {t} ×
            </button>
          ))}
          <input
            className="min-w-[8rem] flex-1 bg-transparent px-1 py-1 text-sm text-gray-800 outline-none dark:text-gray-100"
            value={tagDraft}
            onChange={(e) => setTagDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="añadir tag…"
          />
        </div>
      </div>

      <div>
        <label className={LABEL}>Notas</label>
        <textarea
          className={`mt-1 ${FIELD} min-h-[5rem] resize-y`}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notas internas…"
        />
      </div>
    </div>
  );

  const payload = {
    displayName: displayName.trim() === "" ? null : displayName,
    contactId: contact?.id ?? null,
    notes: notes.trim() === "" ? null : notes,
    tags,
    phone: initial.phone,
  };

  return { fields, payload };
}
```

(`Enter`/`,` inside the tag input only adds a tag — that is field behavior, not a save shortcut.)

- [ ] **Step 2: Typecheck via lint**

Run: `cd "/Volumes/VELLENT USB/Sites/aibuilders" && pnpm lint`
Expected: clean (no unused vars, no type errors surfaced by eslint).

- [ ] **Step 3: Commit**

```bash
cd "/Volumes/VELLENT USB/Sites/aibuilders" && git add "app/(admin)/admin/comunidad/personas/components/curation-fields.tsx" && git commit -m "feat(comunidad): shared useCurationState hook + fields w/ contact auto-suggest"
```

---

## Task 3: Refactor `PersonEditor` (detail page) onto the shared hook

**Files:**
- Modify: `app/(admin)/admin/comunidad/personas/components/person-editor.tsx`

**Interfaces:**
- Consumes: `useCurationState`, `CurationInitial` from `./curation-fields`; `saveCommunityPerson` from `@/lib/actions/community`.

- [ ] **Step 1: Replace the body with the hook-based version**

Overwrite `app/(admin)/admin/comunidad/personas/components/person-editor.tsx`:

```tsx
"use client";

import { useState, useTransition } from "react";
import { saveCommunityPerson } from "@/lib/actions/community";
import { useCurationState, type CurationInitial } from "./curation-fields";

export function PersonEditor({ jid, initial }: { jid: string; initial: CurationInitial }) {
  const { fields, payload } = useCurationState(initial);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function save() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const res = await saveCommunityPerson(jid, payload);
      if ("error" in res) setError(res.error);
      else setSaved(true);
    });
  }

  return (
    <div className="mt-8 rounded-2xl border border-black/5 bg-white p-6 dark:border-white/10 dark:bg-neutral-900">
      <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-gray-400">Editar perfil</p>
      <div className="mt-4">{fields}</div>
      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="rounded-full bg-gray-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-black disabled:opacity-50 dark:bg-white dark:text-gray-900"
        >
          {pending ? "Guardando…" : "Guardar"}
        </button>
        {saved && <span className="text-xs font-medium text-green-500">Guardado.</span>}
        {error && <span className="text-xs font-medium text-red-500">{error}</span>}
      </div>
    </div>
  );
}
```

The detail page (`[jid]/page.tsx`) passes `initial` with the same shape it already builds (`displayName`, `notes`, `tags`, `contact`, `phone`) — no change needed there since `CurationInitial` matches the existing prop.

- [ ] **Step 2: Build to confirm the detail page still compiles**

Run: `cd "/Volumes/VELLENT USB/Sites/aibuilders" && pnpm lint && set -a && . ./.env.local 2>/dev/null && set +a && pnpm build`
Expected: lint clean, build succeeds.

- [ ] **Step 3: Commit**

```bash
cd "/Volumes/VELLENT USB/Sites/aibuilders" && git add "app/(admin)/admin/comunidad/personas/components/person-editor.tsx" && git commit -m "refactor(comunidad): PersonEditor reuses shared curation hook"
```

---

## Task 4: `CuratorProvider` + `EditButton` + `CuratorModal`

**Files:**
- Create: `app/(admin)/admin/comunidad/personas/components/curator.tsx`

**Interfaces:**
- Consumes: `useCurationState` from `./curation-fields`; `saveCommunityPerson` from `@/lib/actions/community`; `CurationPerson` from `@/lib/community/curation`; React context.
- Produces:
  - `CuratorProvider({ people, children }: { people: CurationPerson[]; children: ReactNode })`
  - `EditButton({ index }: { index: number })` — opens the modal at that person.
  - `CuratorModal()` — renders the active person's form; Guardar + Guardar y siguiente; Esc + backdrop close.

- [ ] **Step 1: Create the curator module**

Create `app/(admin)/admin/comunidad/personas/components/curator.tsx`:

```tsx
"use client";

import { createContext, useContext, useEffect, useState, useTransition, type ReactNode } from "react";
import { saveCommunityPerson } from "@/lib/actions/community";
import { useCurationState } from "./curation-fields";
import type { CurationPerson } from "@/lib/community/curation";

type Ctx = {
  people: CurationPerson[];
  openIndex: number | null;
  open: (i: number) => void;
  close: () => void;
  next: () => void;
};

const CuratorCtx = createContext<Ctx | null>(null);

function useCurator(): Ctx {
  const c = useContext(CuratorCtx);
  if (!c) throw new Error("useCurator must be used inside CuratorProvider");
  return c;
}

export function CuratorProvider({ people, children }: { people: CurationPerson[]; children: ReactNode }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const open = (i: number) => setOpenIndex(i);
  const close = () => setOpenIndex(null);
  const next = () => setOpenIndex((i) => (i === null || i + 1 >= people.length ? null : i + 1));
  return (
    <CuratorCtx.Provider value={{ people, openIndex, open, close, next }}>
      {children}
      <CuratorModal />
    </CuratorCtx.Provider>
  );
}

export function EditButton({ index }: { index: number }) {
  const { open } = useCurator();
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        open(index);
      }}
      className="relative z-10 rounded-full border border-black/10 bg-white px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-gray-500 opacity-0 transition group-hover:opacity-100 focus:opacity-100 max-sm:opacity-100 dark:border-white/15 dark:bg-neutral-900 dark:text-gray-300"
    >
      Editar
    </button>
  );
}

function CuratorModal() {
  const { people, openIndex, close, next } = useCurator();
  const person = openIndex === null ? null : people[openIndex];

  useEffect(() => {
    if (!person) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [person, close]);

  if (!person) return null;

  const hasNext = openIndex !== null && openIndex + 1 < people.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-[8vh] backdrop-blur-sm"
      onClick={close}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-black/10 bg-white p-6 shadow-xl dark:border-white/15 dark:bg-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* keyed so the form fully resets when stepping to the next person */}
        <CuratorForm key={person.jid} person={person} hasNext={hasNext} onSaved={close} onSavedNext={next} onClose={close} />
      </div>
    </div>
  );
}

function CuratorForm({
  person,
  hasNext,
  onSaved,
  onSavedNext,
  onClose,
}: {
  person: CurationPerson;
  hasNext: boolean;
  onSaved: () => void;
  onSavedNext: () => void;
  onClose: () => void;
}) {
  const { fields, payload } = useCurationState({
    displayName: person.displayName ?? person.name ?? "",
    notes: person.notes ?? "",
    tags: person.tags,
    contact: person.contact,
    phone: person.phone ?? null,
  });
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function save(advance: boolean) {
    setError(null);
    startTransition(async () => {
      const res = await saveCommunityPerson(person.jid, payload);
      if ("error" in res) {
        setError(res.error);
        return;
      }
      if (advance && hasNext) onSavedNext();
      else onSaved();
    });
  }

  const heading = person.displayName || person.name || person.phone;

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-gray-400">Curar persona</p>
          <h2 className="mt-1 truncate text-xl font-medium text-gray-800 dark:text-gray-100">{heading}</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-full p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          aria-label="Cerrar"
        >
          ✕
        </button>
      </div>

      <div className="mt-5">{fields}</div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => save(false)}
          disabled={pending}
          className="rounded-full bg-gray-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-black disabled:opacity-50 dark:bg-white dark:text-gray-900"
        >
          {pending ? "Guardando…" : "Guardar"}
        </button>
        {hasNext && (
          <button
            type="button"
            onClick={() => save(true)}
            disabled={pending}
            className="rounded-full border border-black/10 px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-black/5 disabled:opacity-50 dark:border-white/15 dark:text-gray-200 dark:hover:bg-white/10"
          >
            Guardar y siguiente →
          </button>
        )}
        {error && <span className="text-xs font-medium text-red-500">{error}</span>}
      </div>
    </>
  );
}
```

- [ ] **Step 2: Typecheck via lint**

Run: `cd "/Volumes/VELLENT USB/Sites/aibuilders" && pnpm lint`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
cd "/Volumes/VELLENT USB/Sites/aibuilders" && git add "app/(admin)/admin/comunidad/personas/components/curator.tsx" && git commit -m "feat(comunidad): curator modal — edit from list, guardar y siguiente, esc to close"
```

---

## Task 5: Wire the list page (`page.tsx`) — left uncommitted

**Files:**
- Modify: `app/(admin)/admin/comunidad/personas/page.tsx` (current working-tree version with the parallel redesign — DO NOT revert that)

**Interfaces:**
- Consumes: `CuratorProvider`, `EditButton` from `./components/curator`; `filterPeopleByMatch`, `type CurationPerson` from `@/lib/community/curation`.

- [ ] **Step 1: Imports**

Add to the import block of `page.tsx`:

```ts
import { CuratorProvider, EditButton } from "./components/curator";
import { filterPeopleByMatch, type CurationPerson } from "@/lib/community/curation";
```

- [ ] **Step 2: Build the curation array + apply the pending filter**

Right after `const overlays = await getOverlays(people.map((p) => p.jid));`, add:

```ts
  const matchMode = typeof sp.match === "string" ? sp.match : undefined;

  const curationPeople: CurationPerson[] = people.map((p) => {
    const o = overlays.get(p.jid);
    return {
      jid: p.jid,
      name: p.name,
      phone: p.phone,
      displayName: o?.displayName ?? null,
      notes: o?.notes ?? null,
      tags: o?.tags ?? [],
      contact: o?.contact ?? null,
    };
  });

  const visible = filterPeopleByMatch(curationPeople, matchMode);
```

Keep the existing `hasNext` based on the raw fetch (`people.length === PAGE_SIZE`) so the activity pager is unaffected by the filter.

- [ ] **Step 3: Render from `visible`, wrap in the provider, add the filter chip + per-row EditButton**

Replace the list region. The card `<div className="mt-6 overflow-hidden rounded-2xl …">` and its `<ul>` get wrapped by `<CuratorProvider people={visible}>`, the `.map` iterates `visible` (each item is a `CurationPerson`; pull the matching bot person fields from it — `jid/name/phone/contact` are all present, plus `displayName`), and each `<li>` gains a trailing `<EditButton index={i} />` as a sibling of the `<Link>`.

Add the filter chip just under the `<RangeChannelPicker />` block:

```tsx
      <div className="mt-4 flex items-center gap-2">
        <FilterChip active={matchMode !== "pending"} href={buildMatchHref(sp, undefined)}>
          Todos
        </FilterChip>
        <FilterChip active={matchMode === "pending"} href={buildMatchHref(sp, "pending")}>
          Sin contacto
        </FilterChip>
      </div>
```

Add these helpers near `buildHref` (mirror its preset/group preservation, drop `page` so the filter resets to page 1):

```tsx
function buildMatchHref(sp: Record<string, string | string[] | undefined>, match: string | undefined): string {
  const params = new URLSearchParams();
  const preset = typeof sp.preset === "string" ? sp.preset : undefined;
  const group = typeof sp.group === "string" ? sp.group : undefined;
  if (preset) params.set("preset", preset);
  if (group) params.set("group", group);
  if (match) params.set("match", match);
  const qs = params.toString();
  return qs ? `/admin/comunidad/personas?${qs}` : "/admin/comunidad/personas";
}

function FilterChip({ active, href, children }: { active: boolean; href: string; children: React.ReactNode }) {
  const base = "rounded-full border px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] transition";
  return (
    <Link
      href={href}
      className={
        active
          ? `${base} border-transparent bg-gray-900 text-white dark:bg-white dark:text-gray-900`
          : `${base} border-black/10 text-gray-500 hover:bg-black/5 dark:border-white/15 dark:text-gray-300 dark:hover:bg-white/10`
      }
    >
      {children}
    </Link>
  );
}
```

The list body becomes (preserving the redesigned row markup — rank, monogram, activity bar, name/phone, count — and just changing the data source to `visible` items and appending the EditButton):

```tsx
      <CuratorProvider people={visible}>
        <div className="mt-6 overflow-hidden rounded-2xl border border-black/5 bg-white dark:border-white/10 dark:bg-neutral-900">
          {error ? (
            <p className="px-6 py-16 text-center text-sm text-gray-400">{error}</p>
          ) : visible.length === 0 ? (
            <p className="px-6 py-16 text-center text-sm text-gray-400">
              {matchMode === "pending" ? "Nadie sin contacto en esta página." : "Sin personas en este rango."}
            </p>
          ) : (
            <ul className="divide-y divide-black/5 dark:divide-white/10">
              {visible.map((p, i) => {
                const curated = p.displayName?.trim();
                const hasName = Boolean(curated) || isMeaningfulName(p.name);
                const label = curated || (isMeaningfulName(p.name) ? p.name.trim() : p.phone);
                const showPhone = hasName && p.phone && p.phone !== label;
                return (
                  <li key={p.jid} className="relative">
                    <Link
                      href={`/admin/comunidad/personas/${encodeURIComponent(p.jid)}`}
                      className="group relative grid grid-cols-[auto_auto_1fr_auto] items-center gap-4 px-6 py-3 transition hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
                    >
                      <span className="relative w-6 text-right font-mono text-xs text-gray-300 dark:text-gray-600">
                        {offset + i + 1}
                      </span>
                      <span
                        aria-hidden
                        className="relative flex size-8 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white font-mono text-[11px] font-medium text-gray-500 dark:border-white/15 dark:bg-neutral-900 dark:text-gray-400"
                      >
                        {initials(label, hasName)}
                      </span>
                      <span className="relative min-w-0">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium text-gray-800 group-hover:underline dark:text-gray-100">
                            {label}
                          </span>
                          {p.contact && (
                            <span className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-gray-300 dark:text-gray-600">
                              ✓ contacto
                            </span>
                          )}
                        </span>
                        {showPhone && (
                          <span className="block truncate font-mono text-[11px] text-gray-400 dark:text-gray-500">
                            {p.phone}
                          </span>
                        )}
                      </span>
                      <span className="relative" />
                    </Link>
                    <div className="absolute inset-y-0 right-6 flex items-center">
                      <EditButton index={i} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </CuratorProvider>
```

Note: the activity-bar `<span>` (the `bg-black/[0.04]` background sized by `p.count`) depends on `p.count`, which is NOT on `CurationPerson`. To keep the bar, either (a) add `count` to the `curationPeople` map and to render, or (b) drop the bar in the modal-enabled list. **Add `count` to keep the redesign intact:** include `count: p.count` in the `curationPeople` map objects and extend the local render to read `p.count`. Add `count: number` to the mapped object inline (it does not need to be on the shared `CurationPerson` type — use an intersection: `const curationPeople: (CurationPerson & { count: number })[] = ...` and pass `people={visible}` where `CuratorProvider` accepts the wider array, since it only reads `CurationPerson` fields).

- [ ] **Step 4: Lint + build**

Run: `cd "/Volumes/VELLENT USB/Sites/aibuilders" && pnpm lint && set -a && . ./.env.local 2>/dev/null && set +a && pnpm build`
Expected: lint clean, build succeeds.

- [ ] **Step 5: Do NOT commit `page.tsx`**

Leave it in the working tree for the user's parallel redesign session. Confirm it is uncommitted:

```bash
cd "/Volumes/VELLENT USB/Sites/aibuilders" && git status --short "app/(admin)/admin/comunidad/personas/page.tsx"
```
Expected: shows ` M app/(admin)/admin/comunidad/personas/page.tsx` (modified, unstaged).

---

## Final verification

- [ ] **Tests:** `cd "/Volumes/VELLENT USB/Sites/aibuilders" && pnpm test` → all green (the new `tests/community/curation.test.ts` included).
- [ ] **Build:** `pnpm lint && pnpm build` → clean.
- [ ] **Manual checklist (logged in, dev server):**
  - List row: hover shows `Editar`; click opens the modal, the row's `Link` does NOT navigate.
  - Modal shows auto-suggested contact chips (when the person's name yields matches); one click assigns.
  - Typeahead search assigns a contact; Desvincular clears it.
  - Edit name/tags/notes; **Guardar** closes and the row reflects the change.
  - **Guardar y siguiente →** saves and opens the next person; hidden on the last row.
  - **Esc** and backdrop click close the modal.
  - `Sin contacto` chip filters to unmatched rows; `Todos` restores. Switching chips resets to page 1.
- [ ] **Commits:** `lib/community/curation.ts` + tests, `curation-fields.tsx`, `person-editor.tsx`, `curator.tsx` are committed; `page.tsx` is intentionally left uncommitted.
- [ ] Tell the user `page.tsx` is staged-free so they can commit it from their redesign session.
