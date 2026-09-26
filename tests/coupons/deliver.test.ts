import { beforeEach, describe, expect, it, vi } from "vitest";
import { findCouponEvent } from "@/lib/coupons/events";

const claimForAttendee = vi.fn();
const releaseCoupon = vi.fn();
const addGuest = vi.fn();
const sendCouponEmail = vi.fn();

vi.mock("@/lib/coupons/queries", () => ({ addGuest, claimForAttendee, releaseCoupon }));
vi.mock("@/lib/coupons/email", () => ({ sendCouponEmail }));

describe("deliverEventCoupon", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("refuses a throwaway domain before a guest row, a code, or Resend", async () => {
    const { deliverEventCoupon } = await import("@/lib/coupons/deliver");
    const event = findCouponEvent("grok-bot-cdmx");
    expect(event).toBeDefined();

    expect(await deliverEventCoupon(event!, "a@passinbox.com")).toEqual({ ok: false, error: "disposable" });
    expect(addGuest).not.toHaveBeenCalled();
    expect(claimForAttendee).not.toHaveBeenCalled();
    expect(sendCouponEmail).not.toHaveBeenCalled();
  });

  it("still delivers for a closed event: only the public page is shut, not the admin send", async () => {
    const { deliverEventCoupon } = await import("@/lib/coupons/deliver");
    const event = findCouponEvent("grok-bot-cdmx");
    expect(event?.closed).toBe(true);
    claimForAttendee.mockResolvedValue({ kind: "claimed", coupon: { code: "ABC123" }, name: null, isNew: true });
    sendCouponEmail.mockResolvedValue(undefined);

    expect(await deliverEventCoupon(event!, "ana@example.com")).toEqual({ ok: true, code: "ABC123", resent: false });
    expect(sendCouponEmail).toHaveBeenCalledWith(expect.objectContaining({ to: "ana@example.com" }));
  });

  it("refuses a malformed local part before a code or Resend", async () => {
    const { deliverEventCoupon } = await import("@/lib/coupons/deliver");
    const event = findCouponEvent("cafe-cursor-cdmx");

    expect(await deliverEventCoupon(event!, "a..b@gmail.com")).toEqual({ ok: false, error: "invalid" });
    expect(claimForAttendee).not.toHaveBeenCalled();
    expect(sendCouponEmail).not.toHaveBeenCalled();
    expect(releaseCoupon).not.toHaveBeenCalled();
  });
});
