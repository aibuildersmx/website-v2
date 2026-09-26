import "server-only";
import { and, asc, count, eq, isNull, isNotNull, lt, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { couponCodes, couponEligible, type CouponCodeRow } from "@/lib/db/schema";
import { checkCoupon, type CouponStatus } from "./check";
import { couponIdentity } from "./email-policy";

/**
 * `couponIdentity` in SQL, so guest rows stored as typed (`juan.perez+2@gmail.com`)
 * still match their mailbox. Keep in step with lib/coupons/email-policy.ts.
 */
export function canonicalEmailSql(column: SQL | typeof couponEligible.email): SQL {
  const email = sql`lower(${column})`;
  return sql`(case when split_part(${email}, '@', 2) in ('gmail.com', 'googlemail.com')
    then replace(split_part(split_part(${email}, '@', 1), '+', 1), '.', '') || '@gmail.com'
    else ${email} end)`;
}

export type CouponFilter = {
  batch?: string;
  /** "claimable" = never handed out and not known-dead. */
  state?: "claimable" | "sent" | "redeemed" | "all";
  limit?: number;
};

function stateCondition(state: CouponFilter["state"]) {
  switch (state) {
    case "claimable":
      return and(isNull(couponCodes.sentAt), isNull(couponCodes.redeemedAt));
    case "sent":
      // handed out but Cursor still says it has credit — the money at risk
      return and(isNotNull(couponCodes.sentAt), isNull(couponCodes.redeemedAt));
    case "redeemed":
      return isNotNull(couponCodes.redeemedAt);
    default:
      return undefined;
  }
}

export async function listCoupons(filter: CouponFilter = {}): Promise<CouponCodeRow[]> {
  const { batch, state = "all", limit = 100 } = filter;
  const conditions = [stateCondition(state), batch ? eq(couponCodes.batch, batch) : undefined].filter(
    (c): c is NonNullable<typeof c> => c !== undefined,
  );

  return db
    .select()
    .from(couponCodes)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(asc(couponCodes.id))
    .limit(Math.min(limit, 500));
}

export async function countByState(batch?: string) {
  const rows = await db
    .select({
      batch: couponCodes.batch,
      claimable: count(sql`case when ${couponCodes.sentAt} is null and ${couponCodes.redeemedAt} is null then 1 end`),
      sent: count(sql`case when ${couponCodes.sentAt} is not null and ${couponCodes.redeemedAt} is null then 1 end`),
      redeemed: count(sql`case when ${couponCodes.redeemedAt} is not null then 1 end`),
      total: count(),
    })
    .from(couponCodes)
    .where(batch ? eq(couponCodes.batch, batch) : undefined)
    .groupBy(couponCodes.batch);

  return rows;
}

/**
 * Hand out one coupon, atomically.
 *
 * `FOR UPDATE SKIP LOCKED` is the point: two concurrent claims must never walk
 * away with the same code. The row is locked, marked sent, and released.
 */
export async function claimCoupon(input: {
  batch: string;
  sentTo?: string | null;
}): Promise<CouponCodeRow | null> {
  const { batch, sentTo = null } = input;
  return db.transaction((tx) => claimInTx(tx, batch, sentTo));
}

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

async function claimInTx(tx: Tx, batch: string, sentTo: string | null): Promise<CouponCodeRow | null> {
  const [candidate] = await tx
    .select({ id: couponCodes.id })
    .from(couponCodes)
    .where(and(eq(couponCodes.batch, batch), isNull(couponCodes.sentAt), isNull(couponCodes.redeemedAt)))
    .orderBy(asc(couponCodes.id))
    .limit(1)
    .for("update", { skipLocked: true });

  if (!candidate) return null;

  const [claimed] = await tx
    .update(couponCodes)
    .set({ sentAt: new Date(), sentTo, updatedAt: new Date() })
    .where(eq(couponCodes.id, candidate.id))
    .returning();

  return claimed ?? null;
}

export type AttendeeClaim =
  | { kind: "not_eligible" }
  | { kind: "sold_out" }
  | { kind: "claimed"; coupon: CouponCodeRow; name: string | null; isNew: boolean };

/**
 * Hand an event attendee their coupon: only if they're on the event's guest
 * list, and always the same code for the same guest. Asking twice re-sends,
 * never re-claims. The code is pinned on the guest-list row, not looked up by
 * email, because two events can share a batch and a guest of both gets two.
 *
 * A guest is a mailbox, not a string: Gmail aliases (`a.b+2@gmail.com`,
 * `ab@googlemail.com`) all find the same row, and a row that already holds a
 * code wins, so an alias only ever gets that code re-sent.
 *
 * The advisory lock serializes concurrent claims for one mailbox (double-click,
 * two tabs, a burst of aliases), which SKIP LOCKED alone would happily turn
 * into two codes.
 */
export async function claimForAttendee(
  event: { batch: string; guestList: string },
  email: string,
): Promise<AttendeeClaim> {
  const identity = couponIdentity(email);
  return db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${`coupon:${event.guestList}:${identity}`}))`);

    const [guest] = await tx
      .select({ id: couponEligible.id, name: couponEligible.name, couponId: couponEligible.couponId })
      .from(couponEligible)
      .where(and(eq(couponEligible.batch, event.guestList), sql`${canonicalEmailSql(couponEligible.email)} = ${identity}`))
      .orderBy(sql`${couponEligible.couponId} is null`, asc(couponEligible.createdAt))
      .limit(1);
    if (!guest) return { kind: "not_eligible" };

    if (guest.couponId) {
      const [existing] = await tx.select().from(couponCodes).where(eq(couponCodes.id, guest.couponId)).limit(1);
      if (existing) return { kind: "claimed", coupon: existing, name: guest.name, isNew: false };
    }

    const coupon = await claimInTx(tx, event.batch, email);
    if (!coupon) return { kind: "sold_out" };
    await tx.update(couponEligible).set({ couponId: coupon.id }).where(eq(couponEligible.id, guest.id));
    return { kind: "claimed", coupon, name: guest.name, isNew: true };
  });
}

/**
 * Put someone on an event's guest list by hand (a walk-in, a sponsor, someone
 * who registered with another email). No-op if they're already on it, under
 * this address or any alias of the same mailbox.
 */
export async function addGuest(guestList: string, email: string, name: string | null) {
  await db.execute(sql`
    insert into ${couponEligible} (batch, email, name)
    select ${guestList}, ${email}, ${name}
    where not exists (
      select 1 from ${couponEligible}
      where ${couponEligible.batch} = ${guestList}
        and ${canonicalEmailSql(couponEligible.email)} = ${couponIdentity(email)}
    )
    on conflict (batch, email) do nothing
  `);
}

/**
 * Put a claimed code back on the shelf. Used when the email carrying it failed
 * to send, so a Resend hiccup doesn't strand a $50 code on someone's name.
 */
export async function releaseCoupon(code: string) {
  await db.transaction(async (tx) => {
    const [row] = await tx
      .update(couponCodes)
      .set({ sentAt: null, sentTo: null, updatedAt: new Date() })
      .where(and(eq(couponCodes.code, code), isNull(couponCodes.redeemedAt)))
      .returning({ id: couponCodes.id });
    if (row) await tx.update(couponEligible).set({ couponId: null }).where(eq(couponEligible.couponId, row.id));
  });
}

/** Write one live check result back to the row. */
export async function recordCheck(code: string, status: CouponStatus, valueCents: number | null) {
  const now = new Date();
  const dead = status === "used" || status === "invalid";

  const [row] = await db
    .update(couponCodes)
    .set({
      checkedAt: now,
      checkStatus: status,
      // Only a definite answer may set redeemedAt; "unknown" must never bury a live coupon.
      ...(dead ? { redeemedAt: now } : {}),
      ...(status === "available" ? { redeemedAt: null } : {}),
      ...(valueCents !== null ? { valueCents } : {}),
      updatedAt: now,
    })
    .where(eq(couponCodes.code, code))
    .returning();

  return row ?? null;
}

/** Check a single coupon against Cursor and persist the answer. */
export async function refreshCoupon(code: string) {
  const result = await checkCoupon(code);
  const row = await recordCheck(code, result.status, result.valueCents);
  return { ...result, row };
}

/**
 * The cron sweep: re-check coupons we handed out but have never seen redeemed.
 * Cursor has no webhook, so polling is the only way this ever closes.
 */
export async function refreshStale(options: { limit?: number; olderThanHours?: number } = {}) {
  const { limit = 50, olderThanHours = 20 } = options;
  const cutoff = new Date(Date.now() - olderThanHours * 3600_000);

  const due = await db
    .select({ code: couponCodes.code })
    .from(couponCodes)
    .where(
      and(
        isNull(couponCodes.redeemedAt),
        or(isNull(couponCodes.checkedAt), lt(couponCodes.checkedAt, cutoff)),
      ),
    )
    .orderBy(asc(couponCodes.checkedAt))
    .limit(limit);

  const results: Array<{ code: string; status: CouponStatus }> = [];
  for (const { code } of due) {
    const { status } = await refreshCoupon(code);
    results.push({ code, status });
  }
  return results;
}
