import { getShowcase } from "@/lib/aiby/client";
import { parseRange } from "@/lib/aiby/range";
import { RangeChannelPicker } from "../components/range-channel-picker";
import { ListPager } from "../components/list-pager";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 6;

const dateFmt = new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "short", year: "numeric" });

function buildHref(sp: Record<string, string | string[] | undefined>, page: number): string {
  const params = new URLSearchParams();
  const preset = typeof sp.preset === "string" ? sp.preset : undefined;
  const group = typeof sp.group === "string" ? sp.group : undefined;
  if (preset) params.set("preset", preset);
  if (group) params.set("group", group);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/admin/comunidad/showcase?${qs}` : "/admin/comunidad/showcase";
}

export default async function ShowcasePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const range = parseRange(sp);
  const pageRaw = Number.parseInt(typeof sp.page === "string" ? sp.page : "1", 10);
  const page = Number.isNaN(pageRaw) || pageRaw < 1 ? 1 : pageRaw;
  const offset = (page - 1) * PAGE_SIZE;

  // La API de showcase no soporta offset: sobre-pedimos hasta el final de la
  // página actual y cortamos del lado del servidor. El volumen es bajo.
  let all: Awaited<ReturnType<typeof getShowcase>>["items"] = [];
  let error: string | null = null;
  try {
    const res = await getShowcase(range, page * PAGE_SIZE + 1);
    all = res.items;
  } catch {
    error = "No se pudo cargar la data del bot.";
  }

  const hasNext = all.length > page * PAGE_SIZE;
  const items = all.slice(offset, offset + PAGE_SIZE);

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

      {error ? (
        <p className="mt-6 rounded-2xl border border-black/5 bg-white px-6 py-16 text-center text-sm text-gray-400 dark:border-white/10 dark:bg-neutral-900">
          {error}
        </p>
      ) : items.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-black/5 bg-white px-6 py-16 text-center text-sm text-gray-400 dark:border-white/10 dark:bg-neutral-900">
          Sin proyectos en este rango.
        </p>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {items.map((s) => {
            const score = Math.round(s.reaction_score);
            return (
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
                  {score > 0 && (
                    <span className="shrink-0 font-mono text-xs text-gray-400 dark:text-gray-500">
                      ★ {score}
                    </span>
                  )}
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
            );
          })}
        </div>
      )}

      <ListPager
        page={page}
        pageSize={PAGE_SIZE}
        count={items.length}
        hasNext={hasNext}
        hrefFor={(p) => buildHref(sp, p)}
      />
    </div>
  );
}
