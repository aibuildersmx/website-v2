import { sql } from "drizzle-orm";
import type { DB } from "../db/client";
import { contacts } from "../db/schema";
import type { MergedContact } from "./types";

export interface ImportResult {
  inserted: number;
  updated: number;
}

const CHUNK_SIZE = 500;

function toRow(c: MergedContact) {
  return {
    email: c.email,
    name: c.name,
    locale: c.locale,
    sources: c.sources,
    tags: c.tags,
    isPremium: c.isPremium,
    newsletterSubscribed: c.newsletterSubscribed,
    metadata: c.metadata,
    firstSeenAt: c.firstSeenAt,
  };
}

async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastErr: unknown;
  for (let a = 0; a < attempts; a++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 500 * (a + 1)));
    }
  }
  throw lastErr;
}

/**
 * Upsert merged contacts by email. The merged set is the desired state, so on
 * conflict we overwrite the mutable fields and bump updated_at. Idempotent for
 * the same input set. `xmax = 0` distinguishes a fresh insert from an update.
 *
 * Assumes a FULL re-import (every source CSV present), so the merged value is
 * authoritative and overwriting `firstSeenAt` is safe. If incremental imports
 * are ever added, switch `firstSeenAt` to `least(contacts.firstSeenAt, excluded)`
 * so a narrower run can't clobber an earlier timestamp.
 *
 * Upserts in chunks of CHUNK_SIZE via a single multi-row insert per chunk
 * (the ON CONFLICT `set` references `excluded.*`, the proposed row), with a
 * small retry so a transient connection timeout doesn't abort the import.
 * Merged emails are unique (deduped upstream), so no chunk hits the
 * "ON CONFLICT cannot affect row a second time" error.
 */
export async function importContacts(db: DB, merged: MergedContact[]): Promise<ImportResult> {
  let inserted = 0;
  let updated = 0;

  for (let i = 0; i < merged.length; i += CHUNK_SIZE) {
    const chunk = merged.slice(i, i + CHUNK_SIZE).map(toRow);
    if (chunk.length === 0) continue;
    const rows = await withRetry(() =>
      db
        .insert(contacts)
        .values(chunk)
        .onConflictDoUpdate({
          target: contacts.email,
          set: {
            name: sql`excluded.name`,
            locale: sql`excluded.locale`,
            sources: sql`excluded.sources`,
            tags: sql`excluded.tags`,
            isPremium: sql`excluded.is_premium`,
            newsletterSubscribed: sql`excluded.newsletter_subscribed`,
            metadata: sql`excluded.metadata`,
            firstSeenAt: sql`excluded.first_seen_at`,
            updatedAt: sql`now()`,
          },
        })
        .returning({ isInsert: sql<boolean>`(xmax = 0)` }),
    );
    for (const r of rows) {
      if (r.isInsert) inserted++;
      else updated++;
    }
  }

  return { inserted, updated };
}
