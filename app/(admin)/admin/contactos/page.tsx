import Link from "next/link";
import { listContacts } from "@/lib/actions/contacts";

export const dynamic = "force-dynamic";

const dateFmt = new Intl.DateTimeFormat("es-MX", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function pageHref(q: string, page: number): string {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/admin/contactos?${qs}` : "/admin/contactos";
}

export default async function ContactsListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const requestedPage = Number.parseInt(sp.page ?? "1", 10);
  const { rows, total, page, pageSize } = await listContacts({
    q,
    page: Number.isNaN(requestedPage) ? 1 : requestedPage,
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-gray-400 dark:text-gray-500">
            Comunidad
          </p>
          <h1 className="mt-1 text-3xl font-medium text-gray-800 dark:text-gray-100">
            Contactos
          </h1>
        </div>
        <p className="text-xs font-medium text-gray-400 dark:text-gray-500">
          {total.toLocaleString("es-MX")} total
        </p>
      </div>

      <form method="get" className="mt-8">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Buscar por email o nombre…"
          className="w-full max-w-md rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm text-gray-800 outline-none transition focus:border-black/30 dark:border-white/10 dark:bg-neutral-900 dark:text-gray-100 dark:focus:border-white/30"
        />
      </form>

      <div className="mt-6 overflow-hidden rounded-2xl border border-black/5 bg-white dark:border-white/10 dark:bg-neutral-900">
        {rows.length === 0 ? (
          <p className="px-6 py-16 text-center text-sm text-gray-400 dark:text-gray-500">
            {q
              ? `Sin resultados para “${q}”.`
              : "Aún no hay contactos."}
          </p>
        ) : (
          <>
            <div className="grid grid-cols-[1fr_1.5fr_auto] gap-4 border-b border-black/5 px-6 py-2.5 font-mono text-[10px] uppercase tracking-[0.12em] text-gray-400 dark:border-white/10 dark:text-gray-500">
              <span>Nombre</span>
              <span>Email</span>
              <span className="text-right">Alta</span>
            </div>
            <ul className="divide-y divide-black/5 dark:divide-white/10">
              {rows.map((c) => (
                <li
                  key={c.id}
                  className="grid grid-cols-[1fr_1.5fr_auto] items-center gap-4 px-6 py-2.5"
                >
                  <span className="truncate text-sm font-medium text-gray-800 dark:text-gray-100">
                    {c.name || (
                      <span className="text-gray-300 dark:text-gray-600">Sin nombre</span>
                    )}
                  </span>
                  <span className="truncate text-sm text-gray-500 dark:text-gray-400">
                    {c.email}
                  </span>
                  <span className="text-right font-mono text-[11px] uppercase tracking-[0.1em] text-gray-400 dark:text-gray-500">
                    {dateFmt.format(c.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between gap-4">
          <p className="text-xs font-medium text-gray-400 dark:text-gray-500">
            Página {page} de {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <PagerLink href={pageHref(q, page - 1)} disabled={!hasPrev}>
              Anterior
            </PagerLink>
            <PagerLink href={pageHref(q, page + 1)} disabled={!hasNext}>
              Siguiente
            </PagerLink>
          </div>
        </div>
      )}
    </div>
  );
}

function PagerLink({
  href,
  disabled,
  children,
}: {
  href: string;
  disabled: boolean;
  children: React.ReactNode;
}) {
  const base =
    "rounded-full border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.15em] transition";
  if (disabled) {
    return (
      <span
        className={`${base} cursor-not-allowed border-black/5 text-gray-300 dark:border-white/5 dark:text-gray-600`}
      >
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className={`${base} border-black/10 text-gray-700 hover:bg-black/5 dark:border-white/15 dark:text-gray-200 dark:hover:bg-white/10`}
    >
      {children}
    </Link>
  );
}
