import { beforeEach, describe, expect, it, vi } from "vitest";

const claimForAttendee = vi.fn();
const releaseCoupon = vi.fn();
const sendCouponEmail = vi.fn();
const rateLimit = vi.fn();
const headers = vi.fn();

vi.mock("@/lib/coupons/queries", () => ({ claimForAttendee, releaseCoupon }));
vi.mock("@/lib/coupons/email", () => ({ sendCouponEmail }));
vi.mock("@/lib/rate-limit", () => ({ rateLimit }));
vi.mock("next/headers", () => ({ headers }));

function fd(fields: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.set(k, v);
  return f;
}

const coupon = { code: "ABC123" };

describe("claimEventCoupon", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    rateLimit.mockReturnValue(true);
    headers.mockResolvedValue(new Map([["x-forwarded-for", "1.2.3.4"]]));
    sendCouponEmail.mockResolvedValue(undefined);
  });

  it("claims from the event's batch and emails the code", async () => {
    claimForAttendee.mockResolvedValue({ kind: "claimed", coupon, name: "Ana", isNew: true });
    const { claimEventCoupon } = await import("@/lib/actions/claim-coupon");

    expect(await claimEventCoupon(fd({ event: "cafe-cursor-cdmx", email: "Ana@Example.com" }))).toEqual({
      ok: true,
      resent: false,
    });
    expect(claimForAttendee).toHaveBeenCalledWith("mexicocity_2026", "ana@example.com");
    expect(sendCouponEmail).toHaveBeenCalledWith(expect.objectContaining({ to: "ana@example.com", code: "ABC123" }));
  });

  it("says so when the code was already theirs", async () => {
    claimForAttendee.mockResolvedValue({ kind: "claimed", coupon, name: null, isNew: false });
    const { claimEventCoupon } = await import("@/lib/actions/claim-coupon");
    expect(await claimEventCoupon(fd({ event: "cafe-cursor-cdmx", email: "a@b.com" }))).toEqual({
      ok: true,
      resent: true,
    });
  });

  it("refuses emails off the guest list without sending", async () => {
    claimForAttendee.mockResolvedValue({ kind: "not_eligible" });
    const { claimEventCoupon } = await import("@/lib/actions/claim-coupon");
    expect(await claimEventCoupon(fd({ event: "cafe-cursor-cdmx", email: "x@y.com" }))).toEqual({
      ok: false,
      error: "not_eligible",
    });
    expect(sendCouponEmail).not.toHaveBeenCalled();
  });

  it("puts a new code back when the email fails", async () => {
    claimForAttendee.mockResolvedValue({ kind: "claimed", coupon, name: null, isNew: true });
    sendCouponEmail.mockRejectedValue(new Error("resend down"));
    const { claimEventCoupon } = await import("@/lib/actions/claim-coupon");

    expect(await claimEventCoupon(fd({ event: "cafe-cursor-cdmx", email: "a@b.com" }))).toEqual({
      ok: false,
      error: "error",
    });
    expect(releaseCoupon).toHaveBeenCalledWith("ABC123");
  });

  it("keeps a re-sent code assigned when the email fails", async () => {
    claimForAttendee.mockResolvedValue({ kind: "claimed", coupon, name: null, isNew: false });
    sendCouponEmail.mockRejectedValue(new Error("resend down"));
    const { claimEventCoupon } = await import("@/lib/actions/claim-coupon");

    await claimEventCoupon(fd({ event: "cafe-cursor-cdmx", email: "a@b.com" }));
    expect(releaseCoupon).not.toHaveBeenCalled();
  });

  it("rejects unknown events and bad emails before touching the DB", async () => {
    const { claimEventCoupon } = await import("@/lib/actions/claim-coupon");
    expect(await claimEventCoupon(fd({ event: "nope", email: "a@b.com" }))).toEqual({ ok: false, error: "invalid" });
    expect(await claimEventCoupon(fd({ event: "cafe-cursor-cdmx", email: "nope" }))).toEqual({
      ok: false,
      error: "invalid",
    });
    expect(claimForAttendee).not.toHaveBeenCalled();
  });

  it("stops when rate limited", async () => {
    rateLimit.mockReturnValue(false);
    const { claimEventCoupon } = await import("@/lib/actions/claim-coupon");
    expect(await claimEventCoupon(fd({ event: "cafe-cursor-cdmx", email: "a@b.com" }))).toEqual({
      ok: false,
      error: "rate_limited",
    });
    expect(claimForAttendee).not.toHaveBeenCalled();
  });
});
