export function heatmapGrid(cells: Array<{ dow: number; hour: number; count: number }>): {
  rows: number[][];
  max: number;
} {
  const rows: number[][] = Array.from({ length: 7 }, () => new Array(24).fill(0));
  let max = 0;
  for (const c of cells) {
    if (c.dow < 0 || c.dow > 6 || c.hour < 0 || c.hour > 23) continue;
    rows[c.dow][c.hour] = c.count;
    if (c.count > max) max = c.count;
  }
  return { rows, max };
}

export const DOW_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
