function timeLabel(ts: string): string {
  const d = new Date(ts);
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function RecentFeed({
  messages,
}: {
  messages: {
    id: number;
    ts: string;
    group_alias: string;
    sender_name: string | null;
    sender_phone: string;
    text: string;
  }[];
}) {
  if (messages.length === 0) {
    return <p className="py-3 text-sm text-gray-400">Sin mensajes recientes.</p>;
  }
  return (
    <div className="flex flex-col divide-y divide-black/5 dark:divide-white/10">
      {messages.map((m) => (
        <div key={m.id} className="py-3">
          <div className="flex items-baseline justify-between gap-3">
            <span className="truncate text-sm font-medium text-gray-800 dark:text-gray-100">
              {m.sender_name || m.sender_phone}
            </span>
            <span className="shrink-0 text-[11px] font-medium text-gray-400">
              {m.group_alias} · {timeLabel(m.ts)}
            </span>
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">{m.text}</p>
        </div>
      ))}
    </div>
  );
}
