"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
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
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="count" nameKey="alias" innerRadius={55} outerRadius={90} paddingAngle={2}>
          {data.map((_, i) => (
            <Cell key={i} fill={inkFor(i)} stroke="none" />
          ))}
        </Pie>
        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid rgba(0,0,0,0.1)", fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
