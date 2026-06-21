import Link from "next/link";
import { getTopic } from "@/lib/aiby/client";
import { parseRange } from "@/lib/aiby/range";
import { StatCard } from "../../../components/stat-card";
import { DashboardSection } from "../../../components/dashboard-section";

export const dynamic = "force-dynamic";

function timeLabel(ts: string): string {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  }).format(new Date(ts));
}

export default async function TopicDetail({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const range = parseRange(await searchParams);

  let topic: Awaited<ReturnType<typeof getTopic>> | null = null;
  let error: string | null = null;
  try {
    topic = await getTopic(slug, range);
  } catch {
    error = "No se pudo cargar el tema.";
  }

  return (
    <div>
      <Link
        href="/admin/comunidad/temas"
        className="font-mono text-[11px] uppercase tracking-[0.15em] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      >
        ← Temas
      </Link>

      {error || !topic ? (
        <p className="mt-8 rounded-2xl border border-black/5 bg-white p-6 text-sm text-gray-500 dark:border-white/10 dark:bg-neutral-900">
          {error ?? "Sin datos."}
        </p>
      ) : (
        <>
          <h1 className="mt-3 text-3xl font-medium text-gray-800 dark:text-gray-100">
            {topic.display_name}
          </h1>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <StatCard eyebrow="Menciones" value={topic.mention_count.toLocaleString("es-MX")} />
            <StatCard eyebrow="Contribuyentes" value={String(topic.contributors.length)} />
            <StatCard eyebrow="Showcase" value={String(topic.showcase.length)} />
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <DashboardSection eyebrow="Top personas">
              {topic.topPeople.length === 0 ? (
                <p className="py-3 text-sm text-gray-400">Sin personas.</p>
              ) : (
                topic.topPeople.map((p) => (
                  <Link
                    key={p.jid}
                    href={`/admin/comunidad/personas/${encodeURIComponent(p.jid)}`}
                    className="flex items-baseline justify-between gap-3 py-3"
                  >
                    <span className="truncate text-sm text-gray-800 hover:underline dark:text-gray-100">
                      {p.name || p.phone}
                    </span>
                    <span className="shrink-0 font-mono text-xs text-gray-400">{p.count}</span>
                  </Link>
                ))
              )}
            </DashboardSection>

            <DashboardSection eyebrow="Contribuyentes">
              {topic.contributors.length === 0 ? (
                <p className="py-3 text-sm text-gray-400">Sin contribuyentes.</p>
              ) : (
                topic.contributors.map((c) => (
                  <div key={`${c.name}-${c.jid ?? "x"}`} className="flex items-baseline justify-between gap-3 py-3">
                    <span className="truncate text-sm text-gray-800 dark:text-gray-100">{c.name}</span>
                    <span className="shrink-0 font-mono text-[10px] uppercase tracking-wide text-gray-400">
                      {c.sources.join(" · ")}
                    </span>
                  </div>
                ))
              )}
            </DashboardSection>
          </div>

          <div className="mt-4 rounded-2xl border border-black/5 bg-white p-6 dark:border-white/10 dark:bg-neutral-900">
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500">Mensajes recientes</p>
            <div className="mt-2 flex flex-col divide-y divide-black/5 dark:divide-white/10">
              {topic.recentMessages.length === 0 ? (
                <p className="py-3 text-sm text-gray-400">Sin mensajes.</p>
              ) : (
                topic.recentMessages.map((m) => (
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
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
