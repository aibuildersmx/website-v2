import Link from "next/link";
import { getDashboardMetrics, formatCount, formatDate } from "@/lib/admin/metrics";
import { StatCard } from "./components/stat-card";
import { DashboardSection } from "./components/dashboard-section";

export default async function AdminHome() {
  const m = await getDashboardMetrics();

  return (
    <div>
      <h1 className="font-serif text-3xl text-gray-800 dark:text-gray-100">
        Panel de administración
      </h1>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Resumen de la comunidad de un vistazo.
      </p>

      {/* Acciones rápidas (Fase A: 2; "Nuevo evento" llega en Fase B). */}
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/admin/newsletter"
          className="rounded-full bg-black px-4 py-2 text-sm text-white transition hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80"
        >
          + Nuevo issue
        </Link>
        <Link
          href="/job-board/dashboard"
          className="rounded-full border border-black/10 px-4 py-2 text-sm text-gray-800 transition hover:border-black/30 dark:border-white/15 dark:text-gray-100 dark:hover:border-white/30"
        >
          + Nueva vacante
        </Link>
      </div>

      {/* Stat cards. */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          eyebrow="Comunidad"
          value={formatCount(m.contacts.total)}
          sublabel={
            m.contacts.last30d === null
              ? undefined
              : `+${m.contacts.last30d} últimos 30 días`
          }
        />
        <StatCard
          eyebrow="Newsletter"
          value={formatCount(m.newsletter.subscribers)}
          sublabel={`Último envío: ${formatDate(m.newsletter.lastIssueSentAt)}`}
          href="/admin/newsletter"
        />
        <StatCard
          eyebrow="Job Board"
          value={formatCount(m.jobs.active)}
          sublabel="Vacantes activas"
          href="/job-board/dashboard"
        />
        <StatCard
          eyebrow="Eventos"
          value={formatCount(m.events.upcomingCount)}
          sublabel="Próximos"
        />
      </div>

      {/* Listas cortas. */}
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <DashboardSection eyebrow="Próximos eventos">
          {m.events.upcoming.length === 0 ? (
            <p className="py-3 text-sm text-gray-400">Sin eventos próximos.</p>
          ) : (
            m.events.upcoming.map((e) => (
              <div
                key={e.title}
                className="flex items-baseline justify-between gap-3 py-3"
              >
                <span className="truncate text-sm text-gray-800 dark:text-gray-100">
                  {e.title}
                </span>
                <span className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-gray-400">
                  {e.dateLabel}
                </span>
              </div>
            ))
          )}
        </DashboardSection>

        <DashboardSection eyebrow="Últimos issues">
          {m.newsletter.recentIssues.length === 0 ? (
            <p className="py-3 text-sm text-gray-400">Sin issues todavía.</p>
          ) : (
            m.newsletter.recentIssues.map((i) => (
              <Link
                key={i.id}
                href={`/admin/newsletter/${i.id}`}
                className="group flex items-center gap-3 py-3"
              >
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${
                    i.status === "sent"
                      ? "bg-green-500"
                      : "bg-black/20 dark:bg-white/30"
                  }`}
                />
                <span className="truncate text-sm text-gray-800 group-hover:underline dark:text-gray-100">
                  {i.subject || i.slug}
                </span>
              </Link>
            ))
          )}
        </DashboardSection>
      </div>
    </div>
  );
}
