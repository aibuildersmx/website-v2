"use server";

import { count, desc, ilike, or, type SQL } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { contacts } from "@/lib/db/schema";
import { getUser } from "@/lib/auth";

async function gate(): Promise<boolean> {
  return Boolean(await getUser());
}

const CONTACTS_PAGE_SIZE = 15;

export interface ContactListItem {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
}

export interface ContactListResult {
  rows: ContactListItem[];
  total: number;
  page: number;
  pageSize: number;
  q: string;
}

// Read-only, paginated list of community contacts with an optional email/name
// search. Mirrors the newsletter list pattern (gated server action + projection)
// but pages server-side since the table holds thousands of rows.
export async function listContacts(opts: {
  q?: string;
  page?: number;
}): Promise<ContactListResult> {
  const q = (opts.q ?? "").trim();
  const page = Math.max(1, Math.floor(opts.page ?? 1));
  const pageSize = CONTACTS_PAGE_SIZE;
  const empty: ContactListResult = { rows: [], total: 0, page, pageSize, q };

  if (!(await gate())) return empty;

  const where: SQL | undefined = q
    ? or(ilike(contacts.email, `%${q}%`), ilike(contacts.name, `%${q}%`))
    : undefined;

  const [{ total }] = await db
    .select({ total: count() })
    .from(contacts)
    .where(where);

  const rows = await db
    .select({
      id: contacts.id,
      email: contacts.email,
      name: contacts.name,
      createdAt: contacts.createdAt,
    })
    .from(contacts)
    .where(where)
    .orderBy(desc(contacts.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return { rows, total: Number(total), page, pageSize, q };
}
