import { beforeEach, describe, expect, it, vi } from "vitest";

const claimForAttendee = vi.fn();
const releaseCoupon = vi.fn();
const addGuest = vi.fn();
const sendCouponEmail = vi.fn();
const rateLimit = vi.fn();
const headers = vi.fn();
const reportClaim = vi.fn();

vi.mock("@/lib/coupons/queries", () => ({ addGuest, claimForAttendee, releaseCoupon }));
vi.mock("@/lib/coupons/email", () => ({ sendCouponEmail }));
vi.mock("@/lib/rate-limit", () => ({ rateLimit }));
vi.mock("next/headers", () => ({ headers }));
vi.mock("@/lib/coupons/alerts", () => ({ reportClaim }));

// The flow under test runs with claims open; the "closed" test flips one back.
const closedSlugs = new Set<string>();
vi.mock("@/lib/coupons/events", async (importActual) => {
  const actual = await importActual<typeof import("@/lib/coupons/events")>();
  return {
    ...actual,
    findCouponEvent: (slug: string) => {
      const event = actual.findCouponEvent(slug);
      return event && { ...event, closed: closedSlugs.has(slug) };
    },
  };
});

function fd(fields: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.set(k, v);
  return f;
}

const coupon = { code: "ABC123" };

describe("claimEventCoupon", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    closedSlugs.clear();
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
    expect(claimForAttendee).toHaveBeenCalledWith(
      expect.objectContaining({ batch: "mexicocity_2026", guestList: "mexicocity_2026" }),
      "ana@example.com",
    );
    expect(sendCouponEmail).toHaveBeenCalledWith(expect.objectContaining({ to: "ana@example.com", code: "ABC123" }));
    expect(addGuest).not.toHaveBeenCalled(); // Café Cursor still needs the Luma list
    expect(reportClaim).toHaveBeenCalledWith(expect.objectContaining({ outcome: "claimed", ip: "1.2.3.4" }));
  });

  it("Grok Bot is open: any email joins its own guest list, codes come from the shared batch", async () => {
    claimForAttendee.mockResolvedValue({ kind: "claimed", coupon, name: null, isNew: true });
    const { claimEventCoupon } = await import("@/lib/actions/claim-coupon");

    expect(await claimEventCoupon(fd({ event: "grok-bot-cdmx", email: "a@b.com" }))).toEqual({ ok: true, resent: false });
    expect(addGuest).toHaveBeenCalledWith("grok_bot_cdmx_2026", "a@b.com", null);
    expect(claimForAttendee).toHaveBeenCalledWith(
      expect.objectContaining({ batch: "mexicocity_2026", guestList: "grok_bot_cdmx_2026" }),
      "a@b.com",
    );
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

  it("rejects throwaway domains before assigning or emailing a code", async () => {
    const { claimEventCoupon } = await import("@/lib/actions/claim-coupon");

    expect(await claimEventCoupon(fd({ event: "grok-bot-cdmx", email: "a..b@PassInbox.com" }))).toEqual({
      ok: false,
      error: "disposable",
    });
    expect(await claimEventCoupon(fd({ event: "cafe-cursor-cdmx", email: "bot@mail.mailinator.com" }))).toEqual({
      ok: false,
      error: "disposable",
    });
    expect(claimForAttendee).not.toHaveBeenCalled();
    expect(sendCouponEmail).not.toHaveBeenCalled();
    expect(addGuest).not.toHaveBeenCalled();
    expect(rateLimit).not.toHaveBeenCalled();
    expect(reportClaim).not.toHaveBeenCalled();
  });

  it("rejects consecutive and edge dots before assigning or emailing a code", async () => {
    const { claimEventCoupon } = await import("@/lib/actions/claim-coupon");

    for (const email of ["a..b@gmail.com", ".a@gmail.com", "a.@gmail.com", "a@gmail..com"]) {
      expect(await claimEventCoupon(fd({ event: "cafe-cursor-cdmx", email }))).toEqual({
        ok: false,
        error: "invalid",
      });
    }
    expect(claimForAttendee).not.toHaveBeenCalled();
    expect(sendCouponEmail).not.toHaveBeenCalled();
  });

  it("refuses a closed event before rate limits, the DB, or Resend, even for bots", async () => {
    closedSlugs.add("grok-bot-cdmx");
    const { claimEventCoupon } = await import("@/lib/actions/claim-coupon");

    expect(await claimEventCoupon(fd({ event: "grok-bot-cdmx", email: "a@b.com" }))).toEqual({
      ok: false,
      error: "closed",
    });
    expect(await claimEventCoupon(fd({ event: "grok-bot-cdmx", email: "a@b.com", company: "x" }))).toEqual({
      ok: false,
      error: "closed",
    });
    expect(rateLimit).not.toHaveBeenCalled();
    expect(addGuest).not.toHaveBeenCalled();
    expect(claimForAttendee).not.toHaveBeenCalled();
    expect(sendCouponEmail).not.toHaveBeenCalled();
    expect(reportClaim).not.toHaveBeenCalled();
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
