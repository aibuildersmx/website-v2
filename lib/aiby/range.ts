import type { AibyRange } from "./client";

export const RANGE_PRESETS: { value: AibyRange["preset"]; label: string }[] = [
  { value: "day", label: "Hoy" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mes" },
  { value: "quarter", label: "Trimestre" },
  { value: "year", label: "Año" },
];

const VALID = new Set(RANGE_PRESETS.map((p) => p.value));

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export function parseRange(
  searchParams: Record<string, string | string[] | undefined>,
): AibyRange {
  const presetRaw = first(searchParams.preset);
  const preset = (VALID.has(presetRaw as AibyRange["preset"])
    ? presetRaw
    : "week") as AibyRange["preset"];
  const groupRaw = first(searchParams.group);
  const group = !groupRaw || groupRaw === "all" ? undefined : groupRaw;
  return { preset, group };
}
