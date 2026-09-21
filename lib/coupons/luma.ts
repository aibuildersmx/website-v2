import { parse } from "csv-parse/sync";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type Guest = { email: string; name: string | null };

/**
 * Luma guest export: api_id,name,first_name,last_name,email,…,approval_status,checked_in_at,…
 *
 * Keeps approved guests only. With `checkedInOnly`, also drops anyone who never
 * got their QR scanned at the door. Emails are lowercased and deduplicated.
 */
export function parseLumaGuests(csv: string, options: { checkedInOnly?: boolean } = {}): Guest[] {
  const rows = parse(csv, { columns: true, skip_empty_lines: true, trim: true, bom: true }) as Record<
    string,
    string
  >[];

  const seen = new Map<string, Guest>();
  for (const raw of rows) {
    const r: Record<string, string> = {};
    for (const [k, v] of Object.entries(raw)) r[k.toLowerCase()] = v;

    const email = (r.email ?? "").trim().toLowerCase();
    if (!EMAIL_RE.test(email)) continue;

    const status = (r.approval_status ?? "approved").trim().toLowerCase();
    if (status !== "approved") continue;
    if (options.checkedInOnly && !(r.checked_in_at ?? "").trim()) continue;

    const name =
      (r.name ?? "").trim() || [r.first_name, r.last_name].map((s) => (s ?? "").trim()).filter(Boolean).join(" ");
    if (!seen.has(email)) seen.set(email, { email, name: name || null });
  }
  return [...seen.values()];
}
