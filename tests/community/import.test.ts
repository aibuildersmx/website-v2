import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { MergedContact } from "../../lib/community/types";

// Integration test: only runs when a test DATABASE_URL is provided.
const hasDb = !!process.env.DATABASE_URL;
const d = hasDb ? describe : describe.skip;

d("importContacts (integration)", () => {
  let importContacts: typeof import("../../lib/community/import").importContacts;
  let db: typeof import("../../lib/db/client").db;
  let contacts: typeof import("../../lib/db/schema").contacts;
  const testEmail = "vitest+merge@example.com";

  const batchEmails = ["vitest+batch1@example.com", "vitest+batch2@example.com"];

  beforeAll(async () => {
    ({ importContacts } = await import("../../lib/community/import"));
    ({ db } = await import("../../lib/db/client"));
    ({ contacts } = await import("../../lib/db/schema"));
    const { inArray } = await import("drizzle-orm");
    await db.delete(contacts).where(inArray(contacts.email, [testEmail, ...batchEmails]));
  });

  afterAll(async () => {
    const { inArray } = await import("drizzle-orm");
    await db.delete(contacts).where(inArray(contacts.email, [testEmail, ...batchEmails]));
  });

  function row(over: Partial<MergedContact> = {}): MergedContact {
    return {
      email: testEmail,
      sources: ["beehiiv"],
      tags: [],
      isPremium: false,
      newsletterSubscribed: true,
      metadata: {},
      ...over,
    };
  }

  it("inserts a new contact, then is idempotent on re-run", async () => {
    const first = await importContacts(db, [row({ name: "First" })]);
    expect(first.inserted).toBe(1);
    expect(first.updated).toBe(0);

    const second = await importContacts(db, [row({ name: "Updated", tags: ["x"] })]);
    expect(second.inserted).toBe(0);
    expect(second.updated).toBe(1);

    const { eq } = await import("drizzle-orm");
    const [stored] = await db.select().from(contacts).where(eq(contacts.email, testEmail));
    expect(stored.name).toBe("Updated");
    expect(stored.tags).toEqual(["x"]);
  });

  it("upserts a multi-row batch, counting inserts then updates", async () => {
    const { inArray } = await import("drizzle-orm");
    const emails = ["vitest+batch1@example.com", "vitest+batch2@example.com"];
    const batch = (name: string): MergedContact[] =>
      emails.map((email) => ({
        email,
        name,
        sources: ["beehiiv"],
        tags: [],
        isPremium: false,
        newsletterSubscribed: true,
        metadata: {},
      }));

    const first = await importContacts(db, batch("B1"));
    expect(first.inserted).toBe(2);
    expect(first.updated).toBe(0);

    const second = await importContacts(db, batch("B2"));
    expect(second.inserted).toBe(0);
    expect(second.updated).toBe(2);

    const stored = await db.select().from(contacts).where(inArray(contacts.email, emails));
    expect(stored.every((s) => s.name === "B2")).toBe(true);
  });
});
