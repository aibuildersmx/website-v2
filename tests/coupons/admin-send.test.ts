import { beforeEach, describe, expect, it, vi } from "vitest";

const addGuest = vi.fn();
const deliverEventCoupon = vi.fn();
const isAuthorized = vi.fn();

vi.mock("@/lib/coupons/queries", () => ({
  addGuest,
  claimCoupon: vi.fn(),
  countByState: vi.fn(),
  listCoupons: vi.fn(),
  refreshCoupon: vi.fn(),
}));
vi.mock("@/lib/coupons/deliver", () => ({ deliverEventCoupon }));
vi.mock("@/lib/coupons/auth", () => ({ isAuthorized }));

function send(email: string, event = "grok-bot-cdmx") {
  return new Request("http://localhost/api/admin/coupons", {
    method: "POST",
    headers: { authorization: "Bearer test", "content-type": "application/json" },
    body: JSON.stringify({ action: "send", event, email }),
  });
}

describe("POST /api/admin/coupons send", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isAuthorized.mockReturnValue(true);
    addGuest.mockResolvedValue(undefined);
    deliverEventCoupon.mockResolvedValue({ ok: true, code: "ABC123", resent: false });
  });

  it("rejects a throwaway domain before the guest list or a send", async () => {
    const { POST } = await import("@/app/api/admin/coupons/route");

    const res = await POST(send("a..b@PassInbox.com"));

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "disposable email addresses are not accepted" });
    expect(addGuest).not.toHaveBeenCalled();
    expect(deliverEventCoupon).not.toHaveBeenCalled();
  });

  it("rejects a disposable subdomain the same way", async () => {
    const { POST } = await import("@/app/api/admin/coupons/route");

    const res = await POST(send("bot@mail.mailinator.com"));

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "disposable email addresses are not accepted" });
    expect(addGuest).not.toHaveBeenCalled();
    expect(deliverEventCoupon).not.toHaveBeenCalled();
  });

  it("rejects consecutive dots before the guest list or a send", async () => {
    const { POST } = await import("@/app/api/admin/coupons/route");

    const res = await POST(send("a..b@gmail.com"));

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "valid email is required" });
    expect(addGuest).not.toHaveBeenCalled();
    expect(deliverEventCoupon).not.toHaveBeenCalled();
  });

  it("still sends a normal address", async () => {
    const { POST } = await import("@/app/api/admin/coupons/route");

    const res = await POST(send("Ana@Example.com"));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      event: "grok-bot-cdmx",
      email: "ana@example.com",
      code: "ABC123",
      resent: false,
    });
    expect(addGuest).toHaveBeenCalledWith("grok_bot_cdmx_2026", "ana@example.com", null);
    expect(deliverEventCoupon).toHaveBeenCalledWith(
      expect.objectContaining({ slug: "grok-bot-cdmx" }),
      "ana@example.com",
    );
  });
});
