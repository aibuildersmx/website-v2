"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { inkFor } from "@/lib/aiby/series";

export function ChannelDonut({
  groups,
}: {
  groups: { alias: string; count: number }[];
}) {
  if (groups.length === 0) {
    return <p className="py-8 text-sm text-gray-400">Sin canales en este rango.</p>;
  }
  const data = [...groups].sort((a, b) => b.count - a.count);
  const total = data.reduce((s, g) => s + g.count, 0);

  return (
    <div>
      <div className="relative">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="alias"
              innerRadius={58}
              outerRadius={88}
              paddingAngle={2}
              startAngle={90}
              endAngle={-270}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={inkFor(i)} stroke="#fff" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "1px solid rgba(0,0,0,0.1)", fontSize: 12 }}
              formatter={(value, name) => {
                const n = Number(value);
                return [`${n.toLocaleString("es-MX")} (${Math.round((n / total) * 100)}%)`, name];
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-medium text-gray-800 dark:text-gray-100">
            {total.toLocaleString("es-MX")}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-gray-400">
            mensajes
          </span>
        </div>
      </div>

      <ul className="mt-4 flex flex-col gap-1.5">
        {data.map((g, i) => (
          <li key={g.alias} className="flex items-center gap-2 text-xs">
            <span
              aria-hidden
              className="size-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: inkFor(i) }}
            />
            <span className="truncate text-gray-600 dark:text-gray-300">{g.alias}</span>
            <span className="ml-auto font-mono text-gray-400 dark:text-gray-500">
              {g.count.toLocaleString("es-MX")}
            </span>
            <span className="w-9 text-right font-mono text-gray-300 dark:text-gray-600">
              {Math.round((g.count / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
