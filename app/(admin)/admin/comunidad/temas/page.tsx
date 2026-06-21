import Link from "next/link";
import { getTopics } from "@/lib/aiby/client";
import { parseRange } from "@/lib/aiby/range";
import { RangeChannelPicker } from "../components/range-channel-picker";
import { ListPager } from "../components/list-pager";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

function buildHref(sp: Record<string, string | string[] | undefined>, page: number): string {
  const params = new URLSearchParams();
  const preset = typeof sp.preset === "string" ? sp.preset : undefined;
  const group = typeof sp.group === "string" ? sp.group : undefined;
  if (preset) params.set("preset", preset);
  if (group) params.set("group", group);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/admin/comunidad/temas?${qs}` : "/admin/comunidad/temas";
}

export default async function TemasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const range = parseRange(sp);
  const pageRaw = Number.parseInt(typeof sp.page === "string" ? sp.page : "1", 10);
  const page = Number.isNaN(pageRaw) || pageRaw < 1 ? 1 : pageRaw;
  const offset = (page - 1) * PAGE_SIZE;

  let topics: Awaited<ReturnType<typeof getTopics>>["topics"] = [];
  let error: string | null = null;
  try {
    const res = await getTopics(range, { offset, limit: PAGE_SIZE });
    topics = res.topics;
  } catch {
    error = "No se pudo cargar la data del bot.";
  }

  const maxCount = topics.reduce((m, t) => Math.max(m, t.count), 0) || 1;
  const hasNext = topics.length === PAGE_SIZE;

  return (
    <div>
      <p className="text-xs font-medium text-gray-400 dark:text-gray-500">Comunidad</p>
      <h1 className="mt-1 text-3xl font-medium text-gray-800 dark:text-gray-100">Temas</h1>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        De qué se habla, rankeado por menciones.
      </p>

      <div className="mt-6">
        <RangeChannelPicker channels={[]} />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-black/5 bg-white dark:border-white/10 dark:bg-neutral-900">
        {error ? (
          <p className="px-6 py-16 text-center text-sm text-gray-400">{error}</p>
        ) : topics.length === 0 ? (
          <p className="px-6 py-16 text-center text-sm text-gray-400">Sin temas en este rango.</p>
        ) : (
          <ul className="divide-y divide-black/5 dark:divide-white/10">
            {topics.map((t, i) => (
              <li key={t.slug}>
                <Link
                  href={`/admin/comunidad/temas/${encodeURIComponent(t.slug)}`}
                  className="group relative grid grid-cols-[auto_1fr_auto] items-center gap-4 px-6 py-3 transition hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-y-1.5 left-0 z-0 rounded-r-full bg-black/[0.04] dark:bg-white/[0.06]"
                    style={{ width: `${Math.max(2, (t.count / maxCount) * 100)}%` }}
                  />
                  <span className="relative w-6 text-right font-mono text-xs text-gray-300 dark:text-gray-600">
                    {offset + i + 1}
                  </span>
                  <span className="relative truncate text-sm font-medium text-gray-800 group-hover:underline dark:text-gray-100">
                    {t.display_name}
                  </span>
                  <span className="relative font-mono text-xs text-gray-500 dark:text-gray-400">
                    {t.count.toLocaleString("es-MX")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ListPager
        page={page}
        pageSize={PAGE_SIZE}
        count={topics.length}
        hasNext={hasNext}
        hrefFor={(p) => buildHref(sp, p)}
      />
    </div>
  );
}
