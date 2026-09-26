import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ABUSE_ALIASES, IDENTITY_FIXTURES } from "./fixtures/identity";

const d = process.env.DATABASE_URL ? describe : describe.skip;

d("coupon claims key on the mailbox (integration)", () => {
  let q: typeof import("@/lib/coupons/queries");
  let policy: typeof import("@/lib/coupons/email-policy");
  let db: typeof import("@/lib/db/client").db;
  let schema: typeof import("@/lib/db/schema");
  let orm: typeof import("drizzle-orm");

  const run = `vitest-${Date.now()}`;
  const batch = `${run}-batch`;
  const openList = `${run}-open`;
  const lumaList = `${run}-luma`;
  const event = { batch, guestList: openList };

  async function guestRows(list: string) {
    return db.select().from(schema.couponEligible).where(orm.eq(schema.couponEligible.batch, list));
  }

  /** What an open event does per claim: join the list, then claim. */
  async function openClaim(email: string) {
    await q.addGuest(openList, email, null);
    return q.claimForAttendee(event, email);
  }

  beforeAll(async () => {
    q = await import("@/lib/coupons/queries");
    policy = await import("@/lib/coupons/email-policy");
    ({ db } = await import("@/lib/db/client"));
    schema = await import("@/lib/db/schema");
    orm = await import("drizzle-orm");
    await db
      .insert(schema.couponCodes)
      .values(Array.from({ length: 10 }, (_, i) => ({ code: `${run}-${i}`, batch, valueCents: 5000 })));
  });

  afterAll(async () => {
    await db.delete(schema.couponEligible).where(orm.inArray(schema.couponEligible.batch, [openList, lumaList]));
    await db.delete(schema.couponCodes).where(orm.eq(schema.couponCodes.batch, batch));
  });

  it("canonicalEmailSql agrees with couponIdentity on every fixture", async () => {
    for (const [email] of IDENTITY_FIXTURES) {
      const rows = await db.execute(orm.sql`select ${q.canonicalEmailSql(orm.sql`${email}::text`)} as id`);
      expect((rows as unknown as Array<{ id: string }>)[0].id, email).toBe(policy.couponIdentity(email));
    }
  });

  it("gives a second +alias of the same Gmail the first code again, never a new one", async () => {
    const first = await openClaim("saidromero19+1@gmail.com");
    expect(first).toMatchObject({ kind: "claimed", isNew: true });

    const second = await openClaim("saidromero19+2@gmail.com");
    expect(second).toMatchObject({ kind: "claimed", isNew: false });
    if (first.kind !== "claimed" || second.kind !== "claimed") throw new Error("unreachable");
    expect(second.coupon.code).toBe(first.coupon.code);

    for (const alias of ["said.romero19@gmail.com", "SAIDROMERO19+x@googlemail.com"]) {
      const again = await openClaim(alias);
      expect(again).toMatchObject({ kind: "claimed", isNew: false, coupon: { code: first.coupon.code } });
    }
    // Aliases don't pile up rows on the guest list either.
    expect((await guestRows(openList)).filter((r) => r.email.startsWith("said"))).toHaveLength(1);
  });

  it("hands out exactly one code when all eight aliases race", async () => {
    const aliases = ABUSE_ALIASES.map((a) => a.replace("saidromero19", "racer"));
    const results = await Promise.all(aliases.map(openClaim));
    const fresh = results.filter((r) => r.kind === "claimed" && r.isNew);
    const codes = new Set(results.map((r) => (r.kind === "claimed" ? r.coupon.code : r.kind)));
    expect(fresh).toHaveLength(1);
    expect(codes.size).toBe(1);
  });

  it("matches guest rows already stored as typed aliases, preferring the one holding a code", async () => {
    // What prod holds today: the abuse rows went in raw before this fix.
    const [code] = await db
      .update(schema.couponCodes)
      .set({ sentAt: new Date(), sentTo: "legacy+1@gmail.com" })
      .where(orm.eq(schema.couponCodes.code, `${run}-9`))
      .returning();
    await db.insert(schema.couponEligible).values([
      { batch: openList, email: "legacy+0@gmail.com" },
      { batch: openList, email: "legacy+1@gmail.com", couponId: code.id },
    ]);

    const claim = await openClaim("legacy+s@gmail.com");
    expect(claim).toMatchObject({ kind: "claimed", isNew: false, coupon: { code: `${run}-9` } });
  });

  it("keeps +tags on other domains as separate people", async () => {
    const a = await openClaim("ana@company.test");
    const b = await openClaim("ana+tag@company.test");
    expect(a).toMatchObject({ kind: "claimed", isNew: true });
    expect(b).toMatchObject({ kind: "claimed", isNew: true });
    if (a.kind !== "claimed" || b.kind !== "claimed") throw new Error("unreachable");
    expect(a.coupon.code).not.toBe(b.coupon.code);
  });

  it("lets a Luma guest claim under a Gmail alias of the address they registered", async () => {
    await db.insert(schema.couponEligible).values({ batch: lumaList, email: "juan.perez@gmail.com", name: "Juan" });
    const claim = await q.claimForAttendee({ batch, guestList: lumaList }, "juanperez+cdmx@googlemail.com");
    expect(claim).toMatchObject({ kind: "claimed", isNew: true, name: "Juan" });
    expect(await q.claimForAttendee({ batch, guestList: lumaList }, "someone.else@gmail.com")).toEqual({
      kind: "not_eligible",
    });
  });
});
