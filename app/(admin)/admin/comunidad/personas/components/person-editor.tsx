"use client";

import { useState, useTransition } from "react";
import { saveCommunityPerson, searchContactsAction } from "@/lib/actions/community";

type Contact = { id: string; email: string; name: string | null };

export function PersonEditor({
  jid,
  initial,
}: {
  jid: string;
  initial: {
    displayName: string;
    notes: string;
    tags: string[];
    contact: Contact | null;
    phone: string | null;
  };
}) {
  const [displayName, setDisplayName] = useState(initial.displayName);
  const [notes, setNotes] = useState(initial.notes);
  const [tags, setTags] = useState<string[]>(initial.tags);
  const [tagDraft, setTagDraft] = useState("");
  const [contact, setContact] = useState<Contact | null>(initial.contact);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Contact[]>([]);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runSearch(q: string) {
    setQuery(q);
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    setResults(await searchContactsAction(q));
  }

  function addTag() {
    const t = tagDraft.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagDraft("");
  }

  function save() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const res = await saveCommunityPerson(jid, {
        displayName,
        contactId: contact?.id ?? null,
        notes,
        tags,
        phone: initial.phone,
      });
      if ("error" in res) setError(res.error);
      else setSaved(true);
    });
  }

  const field =
    "w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-black/30 dark:border-white/15 dark:bg-neutral-900 dark:text-gray-100";
  const label = "text-xs font-medium text-gray-400 dark:text-gray-500";

  return (
    <div className="mt-8 rounded-2xl border border-black/5 bg-white p-6 dark:border-white/10 dark:bg-neutral-900">
      <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-gray-400">Editar perfil</p>

      <div className="mt-4 flex flex-col gap-4">
        <div>
          <label className={label}>Nombre</label>
          <input
            className={`mt-1 ${field}`}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Nombre curado"
          />
        </div>

        <div>
          <label className={label}>Contacto</label>
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
            <div className="relative mt-1">
              <input
                className={field}
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
                        onClick={() => {
                          setContact(c);
                          setQuery("");
                          setResults([]);
                        }}
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
          )}
        </div>

        <div>
          <label className={label}>Tags</label>
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
          <label className={label}>Notas</label>
          <textarea
            className={`mt-1 ${field} min-h-[5rem] resize-y`}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notas internas…"
          />
        </div>

        <div className="flex items-center gap-3">
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
    </div>
  );
}
