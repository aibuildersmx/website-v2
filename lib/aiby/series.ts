// Helpers para alimentar recharts desde la API, respetando la paleta B/N.

// Rampa de grises (de tinta a casi-blanco) para series múltiples. Sin color.
export const INK_SCALE = [
  "#212121",
  "#454545",
  "#6b6b6b",
  "#919191",
  "#b7b7b7",
  "#d6d6d6",
];

export function channelKeys(series: Array<Record<string, number | string>>): string[] {
  const keys = new Set<string>();
  for (const row of series) {
    for (const k of Object.keys(row)) if (k !== "date") keys.add(k);
  }
  return [...keys].sort();
}

export function inkFor(index: number): string {
  return INK_SCALE[index % INK_SCALE.length];
}
