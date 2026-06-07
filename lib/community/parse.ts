import { parse } from "csv-parse/sync";
import { parseTimestamp, type ContactInput, type ContactSource } from "./types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BEEHIIV_UNSUB = new Set(["unsubscribed", "unsub", "inactive", "removed", "bounced"]);

function lower(row: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(row)) out[k.toLowerCase()] = v;
  return out;
}

function splitTags(raw: string | undefined): string[] {
  return (raw ?? "")
    .split(/[,;]/)
    .map((t) => t.trim())
    .filter(Boolean);
}

/** Beehiiv export: subscriber_id,api_subscription_id,email,tags,status,premium?,created_at */
export function parseBeehiiv(csv: string): ContactInput[] {
  const rows = parse(csv, { columns: true, skip_empty_lines: true, trim: true }) as Record<
    string,
    string
  >[];
  const out: ContactInput[] = [];
  for (const raw of rows) {
    const r = lower(raw);
    const email = (r.email ?? "").trim().toLowerCase();
    if (!EMAIL_RE.test(email)) continue;
    const status = (r.status ?? "").trim().toLowerCase();
    out.push({
      email,
      source: "beehiiv",
      tags: splitTags(r.tags),
      isPremium: (r["premium?"] ?? "").trim().toLowerCase() === "yes",
      newsletterSubscribed: !BEEHIIV_UNSUB.has(status),
      metadata: {
        subscriber_id: r.subscriber_id,
        api_subscription_id: r.api_subscription_id,
        status,
      },
      firstSeenAt: parseTimestamp(r.created_at),
    });
  }
  return out;
}

/**
 * Event-style export (Cursor attendees and leads). Shared shape:
 * id,name,email,locale,coupon_code_id,[opted_in_for_raffle,selected_prize_id,]registered_at,created_at,updated_at
 * Every contact is newsletter_subscribed=true (Ricardo's consent decision).
 */
export function parseEventCsv(csv: string, source: ContactSource): ContactInput[] {
  const rows = parse(csv, { columns: true, skip_empty_lines: true, trim: true }) as Record<
    string,
    string
  >[];
  const out: ContactInput[] = [];
  for (const raw of rows) {
    const r = lower(raw);
    const email = (r.email ?? "").trim().toLowerCase();
    if (!EMAIL_RE.test(email)) continue;
    const name = (r.name ?? "").trim() || undefined;
    const locale = (r.locale ?? "").trim() || undefined;
    const metadata: Record<string, unknown> = {};
    for (const key of ["id", "coupon_code_id", "opted_in_for_raffle", "selected_prize_id"]) {
      if (r[key] !== undefined && r[key] !== "" && r[key]?.toUpperCase() !== "NULL") {
        metadata[key] = r[key];
      }
    }
    out.push({
      email,
      name,
      locale,
      source,
      tags: [],
      isPremium: false,
      newsletterSubscribed: true,
      metadata,
      firstSeenAt: parseTimestamp(r.registered_at) ?? parseTimestamp(r.created_at),
    });
  }
  return out;
}
