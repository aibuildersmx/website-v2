import { getJobs } from "@/lib/aiby/client";
import { parseRange } from "@/lib/aiby/range";
import { RangeChannelPicker } from "../components/range-channel-picker";
import { ListPager } from "../components/list-pager";
import { JobStatusControl } from "./components/job-status-control";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "", label: "Todas" },
  { value: "open", label: "Abiertas" },
  { value: "closed", label: "Cerradas" },
  { value: "hidden", label: "Ocultas" },
];

function str(v: string | string[] | undefined): string {
  return typeof v === "string" ? v : "";
}

function filterHref(
  sp: Record<string, string | string[] | undefined>,
  patch: Record<string, string>,
): string {
  const params = new URLSearchParams();
  for (const k of ["preset", "group", "mode", "status", "q"]) {
    const v = str(sp[k]);
    if (v) params.set(k, v);
  }
  for (const [k, v] of Object.entries(patch)) {
    if (v) params.set(k, v);
    else params.delete(k);
  }
  const qs = params.toString();
  return qs ? `/admin/comunidad/jobs?${qs}` : "/admin/comunidad/jobs";
}

// Como filterHref, pero conservando los filtros actuales y fijando la página.
function pageHref(
  sp: Record<string, string | string[] | undefined>,
  page: number,
): string {
  const params = new URLSearchParams();
  for (const k of ["preset", "group", "mode", "status", "q"]) {
    const v = str(sp[k]);
    if (v) params.set(k, v);
  }
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/admin/comunidad/jobs?${qs}` : "/admin/comunidad/jobs";
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const range = parseRange(sp);
  const status = str(sp.status);
  const mode = str(sp.mode);
  const search = str(sp.q);
  const pageRaw = Number.parseInt(str(sp.page) || "1", 10);
  const page = Number.isNaN(pageRaw) || pageRaw < 1 ? 1 : pageRaw;
  const offset = (page - 1) * PAGE_SIZE;

  let data: Awaited<ReturnType<typeof getJobs>> | null = null;
  let error: string | null = null;
  try {
    data = await getJobs(range, { status, mode, search, limit: PAGE_SIZE, offset });
  } catch {
    error = "No se pudo cargar la data del bot.";
  }

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const hasNext = offset + items.length < total;

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-gray-400 dark:text-gray-500">Comunidad</p>
          <h1 className="mt-1 text-3xl font-medium text-gray-800 dark:text-gray-100">Jobs</h1>
        </div>
        {data && (
          <p className="text-xs font-medium text-gray-400 dark:text-gray-500">
            {data.total.toLocaleString("es-MX")} total
          </p>
        )}
      </div>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Vacantes posteadas en la comunidad. Cambia su status para curar.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <RangeChannelPicker channels={[]} />
        <form method="get" className="flex flex-wrap items-center gap-2">
          {range.preset && <input type="hidden" name="preset" value={range.preset} />}
          {mode && <input type="hidden" name="mode" value={mode} />}
          {status && <input type="hidden" name="status" value={status} />}
          <input
            type="search"
            name="q"
            defaultValue={search}
            placeholder="Buscar vacante…"
            className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm text-gray-800 outline-none dark:border-white/15 dark:bg-neutral-900 dark:text-gray-100"
          />
        </form>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => {
          const active = status === f.value;
          return (
            <a
              key={f.value || "all"}
              href={filterHref(sp, { status: f.value })}
              className={`rounded-full border px-3 py-1.5 text-xs transition ${
                active
                  ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                  : "border-black/10 text-gray-600 hover:bg-black/5 dark:border-white/15 dark:text-gray-300 dark:hover:bg-white/10"
              }`}
            >
              {f.label}
            </a>
          );
        })}
        {data && data.facets.modes.length > 0 && (
          <span className="mx-1 self-center text-black/10 dark:text-white/15">|</span>
        )}
        {data?.facets.modes.map((m) => {
          const active = mode === m.key;
          return (
            <a
              key={m.key}
              href={filterHref(sp, { mode: active ? "" : m.key })}
              className={`rounded-full border px-3 py-1.5 text-xs transition ${
                active
                  ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                  : "border-black/10 text-gray-600 hover:bg-black/5 dark:border-white/15 dark:text-gray-300 dark:hover:bg-white/10"
              }`}
            >
              {m.key} ({m.count})
            </a>
          );
        })}
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {error ? (
          <p className="rounded-2xl border border-black/5 bg-white px-6 py-16 text-center text-sm text-gray-400 dark:border-white/10 dark:bg-neutral-900">
            {error}
          </p>
        ) : items.length === 0 ? (
          <p className="rounded-2xl border border-black/5 bg-white px-6 py-16 text-center text-sm text-gray-400 dark:border-white/10 dark:bg-neutral-900">
            Sin vacantes con estos filtros.
          </p>
        ) : (
          items.map((j) => (
            <div
              key={j.id}
              className="rounded-2xl border border-black/5 bg-white p-5 dark:border-white/10 dark:bg-neutral-900"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="truncate text-base font-medium text-gray-800 dark:text-gray-100">
                    {j.title}
                  </h2>
                  <p className="mt-0.5 text-xs font-medium text-gray-400 dark:text-gray-500">
                    {[j.company, j.location, j.mode, j.seniority].filter(Boolean).join(" · ") || "—"}
                  </p>
                </div>
                <JobStatusControl jobId={j.id} status={j.status} />
              </div>
              <p className="mt-3 line-clamp-3 text-sm text-gray-500 dark:text-gray-400">{j.summary}</p>
              {(j.stack.length > 0 || j.links.length > 0) && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {j.stack.slice(0, 8).map((s) => (
                    <span
                      key={s}
                      className="rounded-full border border-black/10 px-2.5 py-0.5 text-[11px] text-gray-600 dark:border-white/15 dark:text-gray-300"
                    >
                      {s}
                    </span>
                  ))}
                  {j.links.slice(0, 3).map((l) => (
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

      <ListPager
        page={page}
        pageSize={PAGE_SIZE}
        count={items.length}
        hasNext={hasNext}
        total={total}
        hrefFor={(p) => pageHref(sp, p)}
      />
    </div>
  );
}
