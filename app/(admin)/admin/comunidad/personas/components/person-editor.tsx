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
