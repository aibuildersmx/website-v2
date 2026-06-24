export type ContactSource =
  | "beehiiv"
  | "cursor-event"
  | "lead"
  | "cursor-attendees"
  | "public-signup";

/** One normalized row from a single CSV source. */
export interface ContactInput {
  email: string; // lowercased, validated
  name?: string;
  locale?: string;
  source: ContactSource;
  tags: string[];
  isPremium: boolean;
  newsletterSubscribed: boolean;
  metadata: Record<string, unknown>; // source-native fields
  firstSeenAt?: Date;
}

/** One human after merging all sources by email. */
export interface MergedContact {
  email: string;
  name?: string;
  locale?: string;
  sources: ContactSource[];
  tags: string[];
  isPremium: boolean;
  newsletterSubscribed: boolean;
  metadata: Record<string, unknown>; // namespaced: { beehiiv: {...}, "cursor-event": {...} }
  firstSeenAt?: Date;
}

/**
 * Parse timestamps from the CSVs. Beehiiv uses "2025-08-04 19:40:05 UTC";
 * the event CSVs use "2025-11-15 09:15:12" (treated as UTC). "NULL"/empty/junk
 * return undefined.
 */
export function parseTimestamp(raw: string | undefined): Date | undefined {
  const s = (raw ?? "").trim();
  if (!s || s.toUpperCase() === "NULL") return undefined;
  // Normalize "YYYY-MM-DD HH:MM:SS[ UTC]" → ISO "YYYY-MM-DDTHH:MM:SSZ".
  const normalized = s.replace(/\s+UTC$/i, "").replace(/ +/, "T") + "Z";
  const d = new Date(normalized);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

/**
 * Parse an epoch-millis timestamp (possibly a float, e.g. Convex `_creationTime`
 * "1773873720598.4993") into a Date, rounding to the nearest millisecond.
 * Empty/NULL/junk/non-positive return undefined.
 */
export function parseEpochMillis(raw: string | undefined): Date | undefined {
  const s = (raw ?? "").trim();
  if (!s || s.toUpperCase() === "NULL") return undefined;
  const n = Number(s);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  const d = new Date(Math.round(n));
  return Number.isNaN(d.getTime()) ? undefined : d;
}
