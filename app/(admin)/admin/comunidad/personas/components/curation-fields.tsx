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
              className="shrink-0 font-mono text-[11px] font-bold uppercase tracking-normal text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
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
