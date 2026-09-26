"use server";

import { headers } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";
import { findCouponEvent } from "@/lib/coupons/events";
import { couponEmailProblem, couponIdentity } from "@/lib/coupons/email-policy";
import { reportClaim } from "@/lib/coupons/alerts";
import { deliverEventCoupon } from "@/lib/coupons/deliver";

export type ClaimCouponResult =
  | { ok: true; resent: boolean }
  | { ok: false; error: "invalid" | "disposable" | "not_eligible" | "sold_out" | "rate_limited" | "error" };

export async function claimEventCoupon(formData: FormData): Promise<ClaimCouponResult> {
  // Honeypot: bots fill it, humans never see it. Pretend it worked.
  if ((formData.get("company") as string | null)?.trim()) return { ok: true, resent: false };

  const event = findCouponEvent(String(formData.get("event") ?? ""));
  const raw = (formData.get("email") as string | null)?.trim() ?? "";
  if (!event || !raw) return { ok: false, error: "invalid" };
  const email = raw.toLowerCase();
  // Before rate limits and before a code is assigned or emailed.
  const problem = couponEmailProblem(email);
  if (problem === "malformed") return { ok: false, error: "invalid" };
  if (problem === "disposable") return { ok: false, error: "disposable" };

  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  // Per IP: stops guessing emails off the list. Per email: stops re-sends being
  // used to flood one attendee's inbox.
  if (
    !rateLimit(`coupon:ip:${ip}`, 10, 10 * 60_000) ||
    !rateLimit(`coupon:email:${couponIdentity(email)}`, 3, 60 * 60_000)
  ) {
    reportClaim({ event, email, ip, outcome: "rate_limited" });
    return { ok: false, error: "rate_limited" };
  }

  try {
    const delivery = await deliverEventCoupon(event, email);
    if (!delivery.ok) {
      if (delivery.error === "sold_out") reportClaim({ event, email, ip, outcome: "sold_out" });
      return { ok: false, error: delivery.error };
    }
    reportClaim({ event, email, ip, outcome: delivery.resent ? "resent" : "claimed" });
    return { ok: true, resent: delivery.resent };
  } catch (error) {
    console.error("claimEventCoupon failed:", error);
    reportClaim({ event, email, ip, outcome: "error" });
    return { ok: false, error: "error" };
  }
}
