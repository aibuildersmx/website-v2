import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Pie de paginación compartido por las listas de Comunidad (Temas, Personas, Jobs, Showcase).
// Si `total` viene, muestra "1–25 de N"; si no (APIs cursor-less), muestra "Página N".
export function ListPager({
  page,
  pageSize,
  count,
  hasNext,
  total,
  hrefFor,
}: {
  page: number;
  pageSize: number;
  count: number;
  hasNext: boolean;
  total?: number;
  hrefFor: (page: number) => string;
}) {
  const hasPrev = page > 1;
  if (!hasPrev && !hasNext) return null;

  const from = count === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = (page - 1) * pageSize + count;
  const summary =
    typeof total === "number"
      ? `${from.toLocaleString("es-MX")}–${to.toLocaleString("es-MX")} de ${total.toLocaleString("es-MX")}`
      : `Página ${page}`;

  return (
    <nav className="mt-6 flex items-center justify-between gap-4">
      <p className="font-mono text-[11px] uppercase tracking-widest text-gray-400 dark:text-gray-500">
        {summary}
      </p>
      <div className="flex items-center gap-2">
        <PagerLink href={hrefFor(page - 1)} disabled={!hasPrev} label="Anterior">
          <ChevronLeft className="size-3.5" />
          <span>Anterior</span>
        </PagerLink>
        <PagerLink href={hrefFor(page + 1)} disabled={!hasNext} label="Siguiente">
          <span>Siguiente</span>
          <ChevronRight className="size-3.5" />
        </PagerLink>
      </div>
    </nav>
  );
}

function PagerLink({
  href,
  disabled,
  label,
  children,
}: {
  href: string;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  const base =
    "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.15em] transition";
  if (disabled) {
    return (
      <span
        aria-disabled
        className={`${base} cursor-not-allowed border-black/5 text-gray-300 dark:border-white/5 dark:text-gray-600`}
      >
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      aria-label={label}
      className={`${base} border-black/10 text-gray-700 hover:bg-black/5 dark:border-white/15 dark:text-gray-200 dark:hover:bg-white/10`}
    >
      {children}
    </Link>
  );
}
