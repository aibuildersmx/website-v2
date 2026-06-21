"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { channelKeys, inkFor } from "@/lib/aiby/series";

export function VolumeChart({
  series,
}: {
  series: Array<Record<string, number | string>>;
}) {
  const keys = channelKeys(series);
  if (series.length === 0) {
    return <p className="py-8 text-sm text-gray-400">Sin actividad en este rango.</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
        <CartesianGrid stroke="rgba(0,0,0,0.06)" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "#919191" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis tick={{ fontSize: 11, fill: "#919191" }} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{
            borderRadius: 12,
            border: "1px solid rgba(0,0,0,0.1)",
            fontSize: 12,
          }}
        />
        {keys.map((k, i) => (
          <Bar
            key={k}
            dataKey={k}
            stackId="msgs"
            fill={inkFor(i)}
            radius={i === keys.length - 1 ? [4, 4, 0, 0] : 0}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
