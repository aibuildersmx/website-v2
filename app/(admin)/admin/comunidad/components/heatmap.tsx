import { heatmapGrid, DOW_LABELS } from "@/lib/aiby/heatmap";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const pad = (n: number) => String(n).padStart(2, "0");
const fmt = (n: number) => n.toLocaleString("es-MX");

export function Heatmap({
  cells,
}: {
  cells: { dow: number; hour: number; count: number }[];
}) {
  const { rows, max } = heatmapGrid(cells);
  if (max === 0) {
    return <p className="py-8 text-sm text-gray-400">Sin actividad en este rango.</p>;
  }

  // Insights derivados de la misma grilla.
  let total = 0;
  let peak = { dow: 0, hour: 0, count: 0 };
  const dayTotals = new Array(7).fill(0);
  const hourTotals = new Array(24).fill(0);
  rows.forEach((row, dow) =>
    row.forEach((count, hour) => {
      total += count;
      dayTotals[dow] += count;
      hourTotals[hour] += count;
      if (count > peak.count) peak = { dow, hour, count };
    }),
  );
  const busiestDay = dayTotals.indexOf(Math.max(...dayTotals));
  const busiestHour = hourTotals.indexOf(Math.max(...hourTotals));

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_180px] lg:gap-8">
      {/* Grilla — se estira a todo el ancho disponible */}
      <div>
        <div className="flex flex-col gap-1">
          {rows.map((row, dow) => (
            <div key={dow} className="flex items-center gap-1">
              <span className="w-7 shrink-0 text-right font-mono text-[10px] text-gray-400 dark:text-gray-500">
                {DOW_LABELS[dow]}
              </span>
              <div className="flex flex-1 gap-1">
                {row.map((count, hour) => (
                  <span
                    key={hour}
                    title={`${DOW_LABELS[dow]} ${pad(hour)}:00 — ${fmt(count)} mensajes`}
                    className="h-5 flex-1 rounded-[3px] bg-black dark:bg-white"
                    style={{ opacity: count === 0 ? 0.04 : 0.16 + 0.84 * (count / max) }}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Marcas de hora — mismo flex que la grilla, así se alinean solas */}
          <div className="mt-0.5 flex items-center gap-1">
            <span className="w-7 shrink-0" />
            <div className="flex flex-1 gap-1">
              {HOURS.map((h) => (
                <span
                  key={h}
                  className="flex-1 text-center font-mono text-[10px] text-gray-400 dark:text-gray-500"
                >
                  {h % 3 === 0 ? pad(h) : ""}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-1.5">
          <span className="font-mono text-[10px] uppercase tracking-widest text-gray-400">
            menos
          </span>
          {[0.08, 0.3, 0.55, 0.8, 1].map((o) => (
            <span
              key={o}
              className="h-3 w-3 rounded-[3px] bg-black dark:bg-white"
              style={{ opacity: o }}
            />
          ))}
          <span className="font-mono text-[10px] uppercase tracking-widest text-gray-400">
            más
          </span>
        </div>
      </div>

      {/* Insights — llenan la columna derecha con info útil */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 lg:grid-cols-1 lg:gap-0 lg:divide-y lg:divide-black/5 lg:dark:divide-white/10">
        <Insight
          label="Hora pico"
          value={`${DOW_LABELS[peak.dow]} · ${pad(peak.hour)}:00`}
          sub={`${fmt(peak.count)} mensajes`}
        />
        <Insight
          label="Día más activo"
          value={DOW_LABELS[busiestDay]}
          sub={`${fmt(dayTotals[busiestDay])} mensajes`}
        />
        <Insight
          label="Franja pico"
          value={`${pad(busiestHour)}:00 h`}
          sub={`${fmt(hourTotals[busiestHour])} mensajes`}
        />
        <Insight label="Total" value={fmt(total)} sub="en el rango" />
      </div>
    </div>
  );
}

function Insight({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="lg:py-4 lg:first:pt-0 lg:last:pb-0">
      <p className="font-mono text-[10px] uppercase tracking-widest text-gray-400">{label}</p>
      <p className="mt-1 text-lg font-medium tabular-nums text-gray-800 dark:text-gray-100">
        {value}
      </p>
      <p className="text-xs text-gray-400 dark:text-gray-500">{sub}</p>
    </div>
  );
}
