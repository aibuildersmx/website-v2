import { heatmapGrid, DOW_LABELS } from "@/lib/aiby/heatmap";

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
      <div className="flex flex-col gap-1">
        {rows.map((row, dow) => (
          <div key={dow} className="flex items-center gap-1">
            <span className="w-8 shrink-0 text-right text-[10px] font-medium text-gray-400">
              {DOW_LABELS[dow]}
            </span>
            {row.map((count, hour) => (
              <span
                key={hour}
                title={`${DOW_LABELS[dow]} ${hour}:00 — ${count} mensajes`}
                className="h-3.5 w-3.5 shrink-0 rounded-[3px] bg-black dark:bg-white"
                style={{ opacity: count === 0 ? 0.05 : 0.15 + 0.85 * (count / max) }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
