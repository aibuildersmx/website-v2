"use client";

import { useState, useTransition } from "react";
import { updateJobStatus } from "@/lib/actions/aiby";
import type { JobStatus } from "@/lib/aiby/types";

const OPTIONS: { value: JobStatus; label: string }[] = [
  { value: "open", label: "Abierta" },
  { value: "closed", label: "Cerrada" },
  { value: "hidden", label: "Oculta" },
];

export function JobStatusControl({ jobId, status }: { jobId: number; status: string }) {
  const [current, setCurrent] = useState<string>(status);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onChange(next: JobStatus) {
    const prev = current;
    setCurrent(next);
    setError(null);
    startTransition(async () => {
      const res = await updateJobStatus(jobId, next);
      if ("error" in res) {
        setCurrent(prev);
        setError(res.error);
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <select
        aria-label="Status de la vacante"
        value={current}
        disabled={pending}
        onChange={(e) => onChange(e.target.value as JobStatus)}
        className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs text-gray-800 disabled:opacity-50 dark:border-white/15 dark:bg-neutral-900 dark:text-gray-100"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
