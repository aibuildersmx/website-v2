import { heatmapGrid, DOW_LABELS } from "@/lib/aiby/heatmap";

const HOUR_MARKS = [0, 6, 12, 18, 23];

export function Heatmap({
  cells,
}: {
  cells: { dow: number; hour: number; count: number }[];
}) {
  const { rows, max } = heatmapGrid(cells);
  if (max === 0) {
    return <p className="py-8 text-sm text-gray-400">Sin actividad en este rango.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <div className="inline-flex min-w-full flex-col gap-1">
        {rows.map((row, dow) => (
          <div key={dow} className="flex items-center gap-1">
            <span className="w-8 shrink-0 text-right font-mono text-[10px] text-gray-400 dark:text-gray-500">
              {DOW_LABELS[dow]}
            </span>
            {row.map((count, hour) => (
              <span
                key={hour}
                title={`${DOW_LABELS[dow]} ${String(hour).padStart(2, "0")}:00 — ${count.toLocaleString("es-MX")} mensajes`}
                className="h-4 w-4 shrink-0 rounded-[3px] bg-black dark:bg-white"
                style={{ opacity: count === 0 ? 0.04 : 0.18 + 0.82 * (count / max) }}
              />
            ))}
          </div>
        ))}

        {/* Marcas de hora alineadas a la grilla (celda 16px + gap 4px = 20px). */}
        <div className="flex items-center gap-1">
          <span className="w-8 shrink-0" />
          <div className="relative h-4" style={{ width: 24 * 16 + 23 * 4 }}>
            {HOUR_MARKS.map((h) => (
              <span
                key={h}
                className="absolute top-0 font-mono text-[10px] text-gray-400 dark:text-gray-500"
                style={{ left: h * 20, transform: "translateX(-2px)" }}
              >
                {String(h).padStart(2, "0")}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-1.5">
        <span className="font-mono text-[10px] uppercase tracking-widest text-gray-400">menos</span>
        {[0.08, 0.3, 0.55, 0.8, 1].map((o) => (
          <span
            key={o}
            className="h-3 w-3 rounded-[3px] bg-black dark:bg-white"
            style={{ opacity: o }}
          />
        ))}
        <span className="font-mono text-[10px] uppercase tracking-widest text-gray-400">más</span>
      </div>
    </div>
  );
}
