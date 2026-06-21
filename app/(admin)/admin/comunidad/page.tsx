import { getOverview, getVolume, getHeatmap, getRecent } from "@/lib/aiby/client";
import { parseRange } from "@/lib/aiby/range";
import { StatCard } from "../components/stat-card";
import { RangeChannelPicker } from "./components/range-channel-picker";
import { VolumeChart } from "./components/volume-chart";
import { ChannelDonut } from "./components/channel-donut";
import { Heatmap } from "./components/heatmap";
import { RecentFeed } from "./components/recent-feed";

export const dynamic = "force-dynamic";

function formatCount(n: number): string {
  return new Intl.NumberFormat("es-MX").format(n);
}

export default async function ComunidadPulso({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const range = parseRange(await searchParams);

  let overview: Awaited<ReturnType<typeof getOverview>> | null = null;
  let volume: Awaited<ReturnType<typeof getVolume>> | null = null;
  let heatmap: Awaited<ReturnType<typeof getHeatmap>> | null = null;
  let recent: Awaited<ReturnType<typeof getRecent>> | null = null;
  let error: string | null = null;
  try {
    [overview, volume, heatmap, recent] = await Promise.all([
      getOverview(range),
      getVolume(range),
      getHeatmap(range),
      getRecent(range, 12),
    ]);
  } catch {
    error = "No se pudo cargar la data del bot.";
  }

  return (
    <div>
      <h1 className="text-3xl font-medium text-gray-800 dark:text-gray-100">Pulso</h1>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Salud de la comunidad de un vistazo.
      </p>

      {overview && (
        <div className="mt-6">
          <RangeChannelPicker channels={overview.groups} />
        </div>
      )}

      {error || !overview ? (
        <p className="mt-8 rounded-2xl border border-black/5 bg-white p-6 text-sm text-gray-500 dark:border-white/10 dark:bg-neutral-900">
          {error ?? "Sin datos."}
        </p>
      ) : (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard eyebrow="Mensajes" value={formatCount(overview.totals.messages)} />
            <StatCard
              eyebrow="Gente activa"
              value={formatCount(overview.totals.activePeople)}
              href="/admin/comunidad/personas"
            />
            <StatCard
              eyebrow="Topics"
              value={formatCount(overview.totals.topics)}
              href="/admin/comunidad/temas"
            />
            <StatCard
              eyebrow="Showcase"
              value={formatCount(overview.totals.showcase)}
              href="/admin/comunidad/showcase"
            />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-black/5 bg-white p-6 lg:col-span-2 dark:border-white/10 dark:bg-neutral-900">
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500">
                Volumen de mensajes
              </p>
              <div className="mt-4">
                <VolumeChart series={volume?.series ?? []} />
              </div>
            </div>
            <div className="rounded-2xl border border-black/5 bg-white p-6 dark:border-white/10 dark:bg-neutral-900">
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500">Por canal</p>
              <div className="mt-4">
                <ChannelDonut groups={overview.groups} />
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-black/5 bg-white p-6 dark:border-white/10 dark:bg-neutral-900">
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500">
              Actividad por hora
            </p>
            <div className="mt-4">
              <Heatmap cells={heatmap?.cells ?? []} />
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-black/5 bg-white p-6 dark:border-white/10 dark:bg-neutral-900">
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500">
              Mensajes recientes
            </p>
            <div className="mt-2">
              <RecentFeed messages={recent?.messages ?? []} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
