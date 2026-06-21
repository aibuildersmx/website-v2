import { eq, ilike, or, inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { communityPeople, contacts } from "@/lib/db/schema";

export type CommunityOverlay = {
  jid: string;
  displayName: string | null;
  notes: string | null;
  tags: string[];
  contact: { id: string; email: string; name: string | null } | null;
};

function toOverlay(row: {
  jid: string;
  displayName: string | null;
  notes: string | null;
  tags: string[];
  contactId: string | null;
  contactEmail: string | null;
  contactName: string | null;
}): CommunityOverlay {
  return {
    jid: row.jid,
    displayName: row.displayName,
    notes: row.notes,
    tags: row.tags,
    contact: row.contactId
      ? { id: row.contactId, email: row.contactEmail ?? "", name: row.contactName }
      : null,
  };
}

const baseSelect = {
  jid: communityPeople.jid,
  displayName: communityPeople.displayName,
  notes: communityPeople.notes,
  tags: communityPeople.tags,
  contactId: communityPeople.contactId,
  contactEmail: contacts.email,
  contactName: contacts.name,
};

export async function getOverlays(jids: string[]): Promise<Map<string, CommunityOverlay>> {
  if (jids.length === 0) return new Map();
  const rows = await db
    .select(baseSelect)
    .from(communityPeople)
    .leftJoin(contacts, eq(communityPeople.contactId, contacts.id))
    .where(inArray(communityPeople.jid, jids));
  return new Map(rows.map((r) => [r.jid, toOverlay(r)]));
}

export async function getOverlay(jid: string): Promise<CommunityOverlay | null> {
  const rows = await db
    .select(baseSelect)
    .from(communityPeople)
    .leftJoin(contacts, eq(communityPeople.contactId, contacts.id))
    .where(eq(communityPeople.jid, jid))
    .limit(1);
  return rows[0] ? toOverlay(rows[0]) : null;
}

export async function searchContacts(
  q: string,
  limit = 10,
): Promise<Array<{ id: string; email: string; name: string | null }>> {
  const term = q.trim();
  if (term.length < 2) return [];
  const like = `%${term}%`;
  return db
    .select({ id: contacts.id, email: contacts.email, name: contacts.name })
    .from(contacts)
    .where(or(ilike(contacts.name, like), ilike(contacts.email, like)))
    .orderBy(contacts.name)
    .limit(limit);
}

export async function upsertCommunityPerson(input: {
  jid: string;
  displayName: string | null;
  contactId: string | null;
  notes: string | null;
  tags: string[];
  phone: string | null;
}): Promise<void> {
  await db
    .insert(communityPeople)
    .values({
      jid: input.jid,
      displayName: input.displayName,
      contactId: input.contactId,
      notes: input.notes,
      tags: input.tags,
      phone: input.phone,
    })
    .onConflictDoUpdate({
      target: communityPeople.jid,
      set: {
        displayName: input.displayName,
        contactId: input.contactId,
        notes: input.notes,
        tags: input.tags,
        phone: input.phone,
        updatedAt: new Date(),
      },
    });
}
