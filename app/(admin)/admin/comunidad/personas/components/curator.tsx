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
      className="relative z-10 rounded-full border border-black/10 bg-white px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-normal text-gray-500 opacity-0 transition group-hover:opacity-100 focus:opacity-100 max-sm:opacity-100 dark:border-white/15 dark:bg-neutral-900 dark:text-gray-300"
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
        <CuratorForm
          key={person.jid}
          person={person}
          hasNext={hasNext}
          onSaved={close}
          onSavedNext={next}
          onClose={close}
        />
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
          className="rounded-full bg-gray-900 px-5 py-2 text-sm font-bold text-white transition hover:bg-black disabled:opacity-50 dark:bg-white dark:text-gray-900"
        >
          {pending ? "Guardando…" : "Guardar"}
        </button>
        {hasNext && (
          <button
            type="button"
            onClick={() => save(true)}
            disabled={pending}
            className="rounded-full border border-black/10 px-5 py-2 text-sm font-bold text-gray-700 transition hover:bg-black/5 disabled:opacity-50 dark:border-white/15 dark:text-gray-200 dark:hover:bg-white/10"
          >
            Guardar y siguiente →
          </button>
        )}
        {error && <span className="text-xs font-medium text-red-500">{error}</span>}
      </div>
    </>
  );
}
