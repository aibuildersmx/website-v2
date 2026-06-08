import type { ReactNode } from "react";

// Tarjeta contenedora de una lista corta (eyebrow mono + items con divisores).
export function DashboardSection({
  eyebrow,
  children,
}: {
  eyebrow: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-6 dark:border-white/10 dark:bg-neutral-900">
      <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500">
        {eyebrow}
      </p>
      <div className="mt-2 flex flex-col divide-y divide-black/5 dark:divide-white/10">
        {children}
      </div>
    </div>
  );
}
