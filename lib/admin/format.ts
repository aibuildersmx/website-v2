// Helpers puros de presentación del dashboard. Sin imports de DB para que se
// puedan testear (y reusar) sin abrir una conexión a Postgres/Supabase.

export type EventSummary = { title: string; dateLabel: string; location: string };

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

// Resume un evento del array a lo mínimo que muestra el dashboard.
export function eventToSummary(e: {
  title: string;
  month: string;
  day: string;
  location: string;
}): EventSummary {
  return { title: e.title, dateLabel: `${e.month} ${e.day}`, location: e.location };
}

// "14 may 2026" en UTC (determinista para tests); "—" si no hay fecha.
export function formatDate(d: Date | null): string {
  if (!d) return "—";
  return `${d.getUTCDate()} ${MESES[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

// "2,256" con separador de miles; "—" si es null.
export function formatCount(n: number | null): string {
  if (n === null) return "—";
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
