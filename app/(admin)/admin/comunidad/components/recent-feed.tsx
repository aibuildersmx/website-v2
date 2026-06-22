"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 4;

type Message = {
  id: number;
  ts: string;
  group_alias: string;
  sender_name: string | null;
  sender_phone: string;
  text: string;
};

function timeLabel(ts: string): string {
  const d = new Date(ts);
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function RecentFeed({ messages }: { messages: Message[] }) {
  const [page, setPage] = useState(0);
  const reduce = useReducedMotion();

  if (messages.length === 0) {
    return <p className="py-3 text-sm text-gray-400">Sin mensajes recientes.</p>;
  }

  const pages = Math.ceil(messages.length / PAGE_SIZE);
  const safePage = Math.min(page, pages - 1);
  const start = safePage * PAGE_SIZE;
  const slice = messages.slice(start, start + PAGE_SIZE);

  return (
    <div>
      {/* min-height fija para que el card no salte al cambiar de página */}
      <div className="min-h-[19rem]">
        <AnimatePresence mode="wait">
          <motion.div
            key={safePage}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col divide-y divide-black/5 dark:divide-white/10"
          >
            {slice.map((m) => (
              <div key={m.id} className="py-3 first:pt-0">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="truncate text-sm font-medium text-gray-800 dark:text-gray-100">
                    {m.sender_name || m.sender_phone}
                  </span>
                  <span className="shrink-0 text-[11px] font-medium text-gray-400">
                    {m.group_alias} · {timeLabel(m.ts)}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                  {m.text}
                </p>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {pages > 1 && (
        <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-3 dark:border-white/10">
          <span className="font-mono text-[11px] uppercase tracking-widest text-gray-400">
            {start + 1}–{Math.min(start + PAGE_SIZE, messages.length)} de {messages.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={safePage === 0}
              aria-label="Página anterior"
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-black/10 text-gray-500 transition hover:border-black/30 hover:text-gray-800 disabled:pointer-events-none disabled:opacity-30 dark:border-white/15 dark:text-gray-400 dark:hover:border-white/30 dark:hover:text-gray-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[2.5rem] text-center text-xs tabular-nums text-gray-500 dark:text-gray-400">
              {safePage + 1} / {pages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
              disabled={safePage === pages - 1}
              aria-label="Página siguiente"
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-black/10 text-gray-500 transition hover:border-black/30 hover:text-gray-800 disabled:pointer-events-none disabled:opacity-30 dark:border-white/15 dark:text-gray-400 dark:hover:border-white/30 dark:hover:text-gray-100"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
