import Link from "next/link";
import { getPeople } from "@/lib/aiby/client";
import { parseRange } from "@/lib/aiby/range";
import { getOverlays } from "@/lib/db/queries/community-people";
import { RangeChannelPicker } from "../components/range-channel-picker";
import { ListPager } from "../components/list-pager";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

// El scrape deja nombres basura (".", "J", "Fp", "H.S"). Solo aceptamos un
// nombre si tiene 3+ caracteres y al menos una letra; si no, caemos al teléfono.
function isMeaningfulName(name: string | null): name is string {
  if (!name) return false;
  const trimmed = name.trim();
  return trimmed.length >= 3 && /\p{L}/u.test(trimmed);
}

// Iniciales para el monograma. Si no hay nombre real, "#".
function initials(label: string, hasName: boolean): string {
  if (!hasName) return "#";
  const parts = label.trim().split(/\s+/).filter(Boolean);
  const letters = parts
    .map((p) => p.match(/\p{L}/u)?.[0] ?? "")
    .join("")
    .slice(0, 2);
  return letters.toUpperCase() || "#";
}

function buildHref(sp: Record<string, string | string[] | undefined>, page: number): string {
  const params = new URLSearchParams();
  const preset = typeof sp.preset === "string" ? sp.preset : undefined;
  const group = typeof sp.group === "string" ? sp.group : undefined;
  if (preset) params.set("preset", preset);
  if (group) params.set("group", group);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/admin/comunidad/personas?${qs}` : "/admin/comunidad/personas";
}

export default async function PersonasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const range = parseRange(sp);
  const pageRaw = Number.parseInt(typeof sp.page === "string" ? sp.page : "1", 10);
  const page = Number.isNaN(pageRaw) || pageRaw < 1 ? 1 : pageRaw;
  const offset = (page - 1) * PAGE_SIZE;

  let people: Awaited<ReturnType<typeof getPeople>>["people"] = [];
  let error: string | null = null;
  try {
    const res = await getPeople(range, { offset, limit: PAGE_SIZE });
    people = res.people;
  } catch {
    error = "No se pudo cargar la data del bot.";
  }

  const overlays = await getOverlays(people.map((p) => p.jid));

  const maxCount = people.reduce((m, p) => Math.max(m, p.count), 0) || 1;
  const hasNext = people.length === PAGE_SIZE;

  return (
    <div>
      <p className="text-xs font-medium text-gray-400 dark:text-gray-500">Comunidad</p>
      <h1 className="mt-1 text-3xl font-medium text-gray-800 dark:text-gray-100">Personas</h1>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Miembros activos, rankeados por mensajes.
      </p>

      <div className="mt-6">
        <RangeChannelPicker channels={[]} />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-black/5 bg-white dark:border-white/10 dark:bg-neutral-900">
        {error ? (
          <p className="px-6 py-16 text-center text-sm text-gray-400">{error}</p>
        ) : people.length === 0 ? (
          <p className="px-6 py-16 text-center text-sm text-gray-400">Sin personas en este rango.</p>
        ) : (
          <ul className="divide-y divide-black/5 dark:divide-white/10">
            {people.map((p, i) => {
              const overlay = overlays.get(p.jid);
              const curated = overlay?.displayName?.trim();
              const hasName = Boolean(curated) || isMeaningfulName(p.name);
              const label = curated || (isMeaningfulName(p.name) ? p.name.trim() : p.phone);
              const showPhone = hasName && p.phone && p.phone !== label;
              return (
                <li key={p.jid}>
                  <Link
                    href={`/admin/comunidad/personas/${encodeURIComponent(p.jid)}`}
                    className="group relative grid grid-cols-[auto_auto_1fr_auto] items-center gap-4 px-6 py-3 transition hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
                  >
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-y-1.5 left-0 z-0 rounded-r-full bg-black/[0.04] dark:bg-white/[0.06]"
                      style={{ width: `${Math.max(2, (p.count / maxCount) * 100)}%` }}
                    />
                    <span className="relative w-6 text-right font-mono text-xs text-gray-300 dark:text-gray-600">
                      {offset + i + 1}
                    </span>
                    <span
                      aria-hidden
                      className="relative flex size-8 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white font-mono text-[11px] font-medium text-gray-500 dark:border-white/15 dark:bg-neutral-900 dark:text-gray-400"
                    >
                      {initials(label, hasName)}
                    </span>
                    <span className="relative min-w-0">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-gray-800 group-hover:underline dark:text-gray-100">
                          {label}
                        </span>
                        {overlay?.contact && (
                          <span className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-gray-300 dark:text-gray-600">
                            ✓ contacto
                          </span>
                        )}
                      </span>
                      {showPhone && (
                        <span className="block truncate font-mono text-[11px] text-gray-400 dark:text-gray-500">
                          {p.phone}
                        </span>
                      )}
                    </span>
                    <span className="relative font-mono text-xs text-gray-500 dark:text-gray-400">
                      {p.count.toLocaleString("es-MX")}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <ListPager
        page={page}
        pageSize={PAGE_SIZE}
        count={people.length}
        hasNext={hasNext}
        hrefFor={(p) => buildHref(sp, p)}
      />
    </div>
  );
}
