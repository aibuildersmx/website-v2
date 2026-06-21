import Link from "next/link";
import { getPerson } from "@/lib/aiby/client";
import { parseRange } from "@/lib/aiby/range";
import { StatCard } from "../../../components/stat-card";
import { DashboardSection } from "../../../components/dashboard-section";

export const dynamic = "force-dynamic";

function timeLabel(ts: string): string {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  }).format(new Date(ts));
}

export default async function PersonDetail({
  params,
  searchParams,
}: {
  params: Promise<{ jid: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { jid } = await params;
  const range = parseRange(await searchParams);

  let person: Awaited<ReturnType<typeof getPerson>> | null = null;
  let error: string | null = null;
  try {
    person = await getPerson(jid, range);
  } catch {
    error = "No se pudo cargar la persona.";
  }

  return (
    <div>
      <Link
        href="/admin/comunidad/personas"
        className="font-mono text-[11px] uppercase tracking-[0.15em] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      >
        ← Personas
      </Link>

      {error || !person ? (
        <p className="mt-8 rounded-2xl border border-black/5 bg-white p-6 text-sm text-gray-500 dark:border-white/10 dark:bg-neutral-900">
          {error ?? "Sin datos."}
        </p>
      ) : (
        <>
          <h1 className="mt-3 text-3xl font-medium text-gray-800 dark:text-gray-100">
            {person.name || person.phone}
          </h1>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <StatCard eyebrow="Mensajes" value={person.messageCount.toLocaleString("es-MX")} />
            <StatCard eyebrow="Top topics" value={String(person.topTopics.length)} />
            <StatCard eyebrow="Showcase" value={String(person.showcase.length)} />
          </div>

          {person.profile && (
            <div className="mt-8 rounded-2xl border border-black/5 bg-white p-6 dark:border-white/10 dark:bg-neutral-900">
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500">Perfil</p>
              {person.profile.expertise.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {person.profile.expertise.map((e) => (
                    <span key={e} className="rounded-full border border-black/10 px-3 py-1 text-xs text-gray-700 dark:border-white/15 dark:text-gray-200">
                      {e}
                    </span>
                  ))}
                </div>
              )}
              {person.profile.style_notes && (
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">{person.profile.style_notes}</p>
              )}
              {person.profile.links_authored.length > 0 && (
                <ul className="mt-3 flex flex-col gap-1">
                  {person.profile.links_authored.slice(0, 8).map((l) => (
                    <li key={l} className="truncate text-sm">
                      <a href={l} target="_blank" rel="noreferrer" className="text-gray-600 underline hover:text-gray-900 dark:text-gray-300">
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <DashboardSection eyebrow="Top topics">
              {person.topTopics.length === 0 ? (
                <p className="py-3 text-sm text-gray-400">Sin topics.</p>
              ) : (
                person.topTopics.map((t) => (
                  <Link
                    key={t.slug}
                    href={`/admin/comunidad/temas/${encodeURIComponent(t.slug)}`}
                    className="flex items-baseline justify-between gap-3 py-3"
                  >
                    <span className="truncate text-sm text-gray-800 hover:underline dark:text-gray-100">
                      {t.display_name}
                    </span>
                    <span className="shrink-0 font-mono text-xs text-gray-400">{t.count}</span>
                  </Link>
                ))
              )}
            </DashboardSection>

            <DashboardSection eyebrow="Mensajes recientes">
              {person.recentMessages.length === 0 ? (
                <p className="py-3 text-sm text-gray-400">Sin mensajes.</p>
              ) : (
                person.recentMessages.map((m) => (
                  <div key={m.id} className="py-3">
                    <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-300">{m.text}</p>
                    <p className="mt-1 text-[11px] font-medium text-gray-400">
                      {m.group_alias} · {timeLabel(m.ts)}
                    </p>
                  </div>
                ))
              )}
            </DashboardSection>
          </div>
        </>
      )}
    </div>
  );
}
