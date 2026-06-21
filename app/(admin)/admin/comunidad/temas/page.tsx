import Link from "next/link";
import { getTopics } from "@/lib/aiby/client";
import { parseRange } from "@/lib/aiby/range";
import { RangeChannelPicker } from "../components/range-channel-picker";

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

  const hasPrev = page > 1;
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
                  className="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-6 py-3 transition hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
                >
                  <span className="w-6 text-right font-mono text-xs text-gray-300 dark:text-gray-600">
                    {offset + i + 1}
                  </span>
                  <span className="truncate text-sm font-medium text-gray-800 hover:underline dark:text-gray-100">
                    {t.display_name}
                  </span>
                  <span className="font-mono text-xs text-gray-400 dark:text-gray-500">
                    {t.count.toLocaleString("es-MX")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {(hasPrev || hasNext) && (
        <div className="mt-6 flex items-center justify-between gap-4">
          <p className="text-xs font-medium text-gray-400 dark:text-gray-500">Página {page}</p>
          <div className="flex items-center gap-2">
            <Pager href={buildHref(sp, page - 1)} disabled={!hasPrev}>Anterior</Pager>
            <Pager href={buildHref(sp, page + 1)} disabled={!hasNext}>Siguiente</Pager>
          </div>
        </div>
      )}
    </div>
  );
}

function Pager({ href, disabled, children }: { href: string; disabled: boolean; children: React.ReactNode }) {
  const base = "rounded-full border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.15em] transition";
  if (disabled) {
    return <span className={`${base} cursor-not-allowed border-black/5 text-gray-300 dark:border-white/5 dark:text-gray-600`}>{children}</span>;
  }
  return <Link href={href} className={`${base} border-black/10 text-gray-700 hover:bg-black/5 dark:border-white/15 dark:text-gray-200 dark:hover:bg-white/10`}>{children}</Link>;
}
