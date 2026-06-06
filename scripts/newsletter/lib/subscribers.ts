import { parse } from "csv-parse/sync";

export interface Subscriber {
  email: string;
  firstName?: string;
}

export interface ParseResult {
  valid: Subscriber[];
  errors: string[];
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_KEYS = ["first_name", "firstname", "name", "nombre"];
const STATUS_KEYS = ["status", "state", "subscription_status"];
const UNSUB_VALUES = new Set(["unsubscribed", "unsub", "inactive", "removed", "bounced"]);

export function parseSubscribers(csv: string): ParseResult {
  const errors: string[] = [];
  let rows: Record<string, string>[];
  try {
    rows = parse(csv, { columns: true, skip_empty_lines: true, trim: true });
  } catch (e) {
    return { valid: [], errors: [`CSV parse error: ${(e as Error).message}`] };
  }

  if (rows.length === 0) return { valid: [], errors: ["CSV has no data rows"] };

  const header = Object.keys(rows[0]).map((k) => k.toLowerCase());
  if (!header.includes("email")) {
    return { valid: [], errors: ["CSV has no email column"] };
  }

  const seen = new Set<string>();
  const valid: Subscriber[] = [];

  rows.forEach((row, i) => {
    const lower: Record<string, string> = {};
    for (const [k, v] of Object.entries(row)) lower[k.toLowerCase()] = v;

    const email = (lower.email ?? "").trim().toLowerCase();
    if (!EMAIL_RE.test(email)) {
      errors.push(`Row ${i + 2}: invalid or missing email ("${lower.email ?? ""}")`);
      return;
    }

    const statusKey = STATUS_KEYS.find((k) => k in lower);
    if (statusKey && UNSUB_VALUES.has((lower[statusKey] ?? "").trim().toLowerCase())) {
      return; // intentionally skipped, not an error
    }

    if (seen.has(email)) return;
    seen.add(email);

    const nameKey = NAME_KEYS.find((k) => k in lower && lower[k]?.trim());
    const firstName = nameKey ? lower[nameKey].trim() : undefined;
    valid.push(firstName ? { email, firstName } : { email });
  });

  return { valid, errors };
}
