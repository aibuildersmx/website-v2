import { Fragment } from "react";
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
    <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-stretch lg:gap-12">
      {/* Grilla — celdas cuadradas (aspect-square) que llenan el ancho */}
      <div className="min-w-0">
        <div
          className="grid items-center gap-1"
          style={{ gridTemplateColumns: "1.75rem repeat(24, minmax(0, 1fr))" }}
        >
          {rows.map((row, dow) => (
            <Fragment key={dow}>
              <span className="text-right font-mono text-[10px] text-gray-400 dark:text-gray-500">
                {DOW_LABELS[dow]}
              </span>
              {row.map((count, hour) => (
                <span
                  key={hour}
                  title={`${DOW_LABELS[dow]} ${pad(hour)}:00 — ${fmt(count)} mensajes`}
                  className="aspect-square w-full rounded-[4px] bg-black dark:bg-white"
                  style={{ opacity: count === 0 ? 0.04 : 0.16 + 0.84 * (count / max) }}
                />
              ))}
            </Fragment>
          ))}

          {/* Marcas de hora — comparten la misma grilla, así se alinean solas */}
          <span />
          {HOURS.map((h) => (
            <span
              key={h}
              className="mt-1 text-center font-mono text-[10px] text-gray-400 dark:text-gray-500"
            >
              {h % 3 === 0 ? pad(h) : ""}
            </span>
          ))}
        </div>

        <div className="mt-5 flex items-center gap-1.5">
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

      {/* Insights — grid 2×2 del doble de ancho, centrado para llenar el alto */}
      <div className="grid grid-cols-2 lg:content-center">
        <Insight
          label="Hora pico"
          value={`${DOW_LABELS[peak.dow]} · ${pad(peak.hour)}:00`}
          sub={`${fmt(peak.count)} mensajes`}
          className="pb-5 pr-6"
        />
        <Insight
          label="Día más activo"
          value={DOW_LABELS[busiestDay]}
          sub={`${fmt(dayTotals[busiestDay])} mensajes`}
          className="border-l border-black/5 pb-5 pl-6 dark:border-white/10"
        />
        <Insight
          label="Franja pico"
          value={`${pad(busiestHour)}:00 h`}
          sub={`${fmt(hourTotals[busiestHour])} mensajes`}
          className="border-t border-black/5 pr-6 pt-5 dark:border-white/10"
        />
        <Insight
          label="Total"
          value={fmt(total)}
          sub="en el rango"
          className="border-l border-t border-black/5 pl-6 pt-5 dark:border-white/10"
        />
      </div>
    </div>
  );
}

function Insight({
  label,
  value,
  sub,
  className = "",
}: {
  label: string;
  value: string;
  sub: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="font-mono text-[10px] uppercase tracking-widest text-gray-400">{label}</p>
      <p className="mt-1.5 text-xl font-medium tabular-nums text-gray-800 dark:text-gray-100">
        {value}
      </p>
      <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">{sub}</p>
    </div>
  );
}
