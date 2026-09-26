import "server-only";
import type { CouponEvent } from "./events";
import { addGuest, claimForAttendee, releaseCoupon } from "./queries";
import { sendCouponEmail } from "./email";

export type Delivery =
  | { ok: true; code: string; resent: boolean }
  | { ok: false; error: "not_eligible" | "sold_out" };

/**
 * Claim a guest's code and email it. Shared by the /creditos page and the admin
 * API (Aiby), so a code sent by hand and one claimed on the page are the same
 * code: whoever asks second just gets a re-send.
 *
 * If the email fails on a fresh claim the code goes back on the shelf and the
 * error propagates; a re-sent code stays theirs.
 */
export async function deliverEventCoupon(event: CouponEvent, email: string): Promise<Delivery> {
  if (event.open) await addGuest(event.guestList, email, null);
  const claim = await claimForAttendee(event, email);
  if (claim.kind !== "claimed") return { ok: false, error: claim.kind };

  try {
    await sendCouponEmail({ to: email, name: claim.name, code: claim.coupon.code, event });
  } catch (error) {
    if (claim.isNew) await releaseCoupon(claim.coupon.code);
    throw error;
  }
  return { ok: true, code: claim.coupon.code, resent: !claim.isNew };
}
