"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { RANGE_PRESETS } from "@/lib/aiby/range";

export function RangeChannelPicker({
  channels,
}: {
  channels: { alias: string; count: number }[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const preset = params.get("preset") ?? "week";
  const group = params.get("group") ?? "all";

  function update(key: "preset" | "group", value: string) {
    const next = new URLSearchParams(params.toString());
    next.set(key, value);
    router.push(`?${next.toString()}`);
  }

  const selectClass =
    "rounded-full border border-black/10 bg-white px-4 py-2 text-sm text-gray-800 dark:border-white/15 dark:bg-neutral-900 dark:text-gray-100";

  return (
    <div className="flex flex-wrap gap-3">
      <select
        aria-label="Rango"
        value={preset}
        onChange={(e) => update("preset", e.target.value)}
        className={selectClass}
      >
        {RANGE_PRESETS.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>
      <select
        aria-label="Canal"
        value={group}
        onChange={(e) => update("group", e.target.value)}
        className={selectClass}
      >
        <option value="all">Todos los canales</option>
        {channels.map((c) => (
          <option key={c.alias} value={c.alias}>
            {c.alias}
          </option>
        ))}
      </select>
    </div>
  );
}
