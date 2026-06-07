import { sql } from "drizzle-orm";
import type { DB } from "../db/client";
import { contacts } from "../db/schema";
import type { MergedContact } from "./types";

export interface ImportResult {
  inserted: number;
  updated: number;
}

/**
 * Upsert merged contacts by email. The merged set is the desired state, so on
 * conflict we overwrite the mutable fields and bump updated_at. Idempotent for
 * the same input set. `xmax = 0` distinguishes a fresh insert from an update.
 */
export async function importContacts(db: DB, merged: MergedContact[]): Promise<ImportResult> {
  let inserted = 0;
  let updated = 0;

  for (const c of merged) {
    const rows = await db
      .insert(contacts)
      .values({
        email: c.email,
        name: c.name,
        locale: c.locale,
        sources: c.sources,
        tags: c.tags,
        isPremium: c.isPremium,
        newsletterSubscribed: c.newsletterSubscribed,
        metadata: c.metadata,
        firstSeenAt: c.firstSeenAt,
      })
      .onConflictDoUpdate({
        target: contacts.email,
        set: {
          name: c.name,
          locale: c.locale,
          sources: c.sources,
          tags: c.tags,
          isPremium: c.isPremium,
          newsletterSubscribed: c.newsletterSubscribed,
          metadata: c.metadata,
          firstSeenAt: c.firstSeenAt,
          updatedAt: sql`now()`,
        },
      })
      .returning({ isInsert: sql<boolean>`(xmax = 0)` });

    if (rows[0]?.isInsert) inserted++;
    else updated++;
  }

  return { inserted, updated };
}
