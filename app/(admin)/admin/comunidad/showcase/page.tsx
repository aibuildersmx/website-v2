import { getShowcase } from "@/lib/aiby/client";
import { parseRange } from "@/lib/aiby/range";
import { RangeChannelPicker } from "../components/range-channel-picker";

export const dynamic = "force-dynamic";

const dateFmt = new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "short", year: "numeric" });

export default async function ShowcasePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const range = parseRange(await searchParams);

  let items: Awaited<ReturnType<typeof getShowcase>>["items"] = [];
  let error: string | null = null;
  try {
    const res = await getShowcase(range, 40);
    items = res.items;
  } catch {
    error = "No se pudo cargar la data del bot.";
  }

  return (
    <div>
      <p className="text-xs font-medium text-gray-400 dark:text-gray-500">Comunidad</p>
      <h1 className="mt-1 text-3xl font-medium text-gray-800 dark:text-gray-100">Showcase</h1>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Proyectos que la comunidad presume, rankeados por reacciones.
      </p>

      <div className="mt-6">
        <RangeChannelPicker channels={[]} />
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {error ? (
          <p className="rounded-2xl border border-black/5 bg-white px-6 py-16 text-center text-sm text-gray-400 dark:border-white/10 dark:bg-neutral-900">
            {error}
          </p>
        ) : items.length === 0 ? (
          <p className="rounded-2xl border border-black/5 bg-white px-6 py-16 text-center text-sm text-gray-400 dark:border-white/10 dark:bg-neutral-900">
            Sin proyectos en este rango.
          </p>
        ) : (
          items.map((s) => (
            <div
              key={s.id}
              className="rounded-2xl border border-black/5 bg-white p-5 dark:border-white/10 dark:bg-neutral-900"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="truncate text-base font-medium text-gray-800 dark:text-gray-100">
                    {s.title}
                  </h2>
                  <p className="mt-0.5 text-xs font-medium text-gray-400 dark:text-gray-500">
                    {[s.author_name || "Anónimo", dateFmt.format(new Date(s.date))].join(" · ")}
                  </p>
                </div>
                <span className="shrink-0 font-mono text-xs text-gray-400 dark:text-gray-500">
                  ★ {Math.round(s.reaction_score)}
                </span>
              </div>
              <p className="mt-3 line-clamp-3 text-sm text-gray-500 dark:text-gray-400">{s.description}</p>
              {(s.tags.length > 0 || s.links.length > 0) && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {s.tags.slice(0, 8).map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-black/10 px-2.5 py-0.5 text-[11px] text-gray-600 dark:border-white/15 dark:text-gray-300"
                    >
                      {t}
                    </span>
                  ))}
                  {s.links.slice(0, 3).map((l) => (
                    <a
                      key={l}
                      href={l}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-gray-500 underline hover:text-gray-800 dark:text-gray-400"
                    >
                      link
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
