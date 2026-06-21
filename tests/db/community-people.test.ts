import { describe, it, expect, beforeAll, afterAll } from "vitest";

const hasDb = !!process.env.DATABASE_URL;
const d = hasDb ? describe : describe.skip;

describe("community-people guards (no DB needed)", () => {
  it("getOverlays returns an empty Map for an empty jid list without hitting the DB", async () => {
    const { getOverlays } = await import("@/lib/db/queries/community-people");
    const res = await getOverlays([]);
    expect(res instanceof Map).toBe(true);
    expect(res.size).toBe(0);
  });

  it("searchContacts returns [] for a query shorter than 2 chars without hitting the DB", async () => {
    const { searchContacts } = await import("@/lib/db/queries/community-people");
    expect(await searchContacts("a")).toEqual([]);
    expect(await searchContacts(" ")).toEqual([]);
  });
});

d("community-people (integration)", () => {
  let mod: typeof import("@/lib/db/queries/community-people");
  let db: typeof import("@/lib/db/client").db;
  let schema: typeof import("@/lib/db/schema");
  const jid = "vitest-jid@s.whatsapp.net";
  let contactId: string;

  beforeAll(async () => {
    mod = await import("@/lib/db/queries/community-people");
    ({ db } = await import("@/lib/db/client"));
    schema = await import("@/lib/db/schema");
    const [c] = await db
      .insert(schema.contacts)
      .values({ email: "vitest+curation@example.com", name: "Vitest Person" })
      .onConflictDoUpdate({ target: schema.contacts.email, set: { name: "Vitest Person" } })
      .returning();
    contactId = c.id;
  });

  afterAll(async () => {
    const { eq } = await import("drizzle-orm");
    await db.delete(schema.communityPeople).where(eq(schema.communityPeople.jid, jid));
    await db.delete(schema.contacts).where(eq(schema.contacts.email, "vitest+curation@example.com"));
  });

  it("upsert then getOverlay round-trips with the joined contact", async () => {
    await mod.upsertCommunityPerson({
      jid, displayName: "Curated Name", contactId, notes: "nota", tags: ["mentor"], phone: "52",
    });
    const overlay = await mod.getOverlay(jid);
    expect(overlay?.displayName).toBe("Curated Name");
    expect(overlay?.tags).toEqual(["mentor"]);
    expect(overlay?.contact?.email).toBe("vitest+curation@example.com");
  });

  it("upsert again updates in place (no duplicate row)", async () => {
    await mod.upsertCommunityPerson({
      jid, displayName: "Updated", contactId: null, notes: null, tags: [], phone: "52",
    });
    const overlay = await mod.getOverlay(jid);
    expect(overlay?.displayName).toBe("Updated");
    expect(overlay?.contact).toBeNull();
    const all = await mod.getOverlays([jid]);
    expect(all.size).toBe(1);
  });

  it("searchContacts finds the contact by name fragment", async () => {
    const res = await mod.searchContacts("Vitest Per");
    expect(res.some((c) => c.email === "vitest+curation@example.com")).toBe(true);
  });
});
