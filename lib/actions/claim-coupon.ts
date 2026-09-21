"use server";

import { headers } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";
import { findCouponEvent } from "@/lib/coupons/events";
import { claimForAttendee, releaseCoupon } from "@/lib/coupons/queries";
import { sendCouponEmail } from "@/lib/coupons/email";

export type ClaimCouponResult =
  | { ok: true; resent: boolean }
  | { ok: false; error: "invalid" | "not_eligible" | "sold_out" | "rate_limited" | "error" };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function claimEventCoupon(formData: FormData): Promise<ClaimCouponResult> {
  // Honeypot: bots fill it, humans never see it. Pretend it worked.
  if ((formData.get("company") as string | null)?.trim()) return { ok: true, resent: false };

  const event = findCouponEvent(String(formData.get("event") ?? ""));
  const raw = (formData.get("email") as string | null)?.trim() ?? "";
  if (!event || !raw || !EMAIL_RE.test(raw)) return { ok: false, error: "invalid" };
  const email = raw.toLowerCase();

  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  // Per IP: stops guessing emails off the list. Per email: stops re-sends being
  // used to flood one attendee's inbox.
  if (!rateLimit(`coupon:ip:${ip}`, 10, 10 * 60_000) || !rateLimit(`coupon:email:${email}`, 3, 60 * 60_000)) {
    return { ok: false, error: "rate_limited" };
  }

  try {
    const claim = await claimForAttendee(event.batch, email);
    if (claim.kind !== "claimed") return { ok: false, error: claim.kind };

    try {
      await sendCouponEmail({ to: email, name: claim.name, code: claim.coupon.code, event });
    } catch (error) {
      // Undelivered code goes back on the shelf; a re-sent one stays theirs.
      if (claim.isNew) await releaseCoupon(claim.coupon.code);
      throw error;
    }
    return { ok: true, resent: !claim.isNew };
  } catch (error) {
    console.error("claimEventCoupon failed:", error);
    return { ok: false, error: "error" };
  }
}
