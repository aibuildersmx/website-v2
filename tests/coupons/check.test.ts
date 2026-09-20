import { describe, expect, it, vi } from "vitest";
import {
  CURSOR_CHECK_ENDPOINT,
  checkCoupon,
  classify,
  redeemUrl,
} from "@/lib/coupons/check";

// Payloads copied verbatim from real responses on 2026-09-19.
const AVAILABLE = {
  isValid: true,
  userIsEligible: true,
  metadata: {
    title: "You've received a $50.00 credit!",
    description:
      "The credit will automatically be applied to your next monthly subscription or usage based bills until it is fully used.",
    discountType: "CREDIT",
  },
};

const USED = {
  metadata: {
    title: "Sorry, this code has already been used",
    description: "Each referral code can only be redeemed once.",
  },
};

describe("classify", () => {
  it("reads an available coupon and its amount", () => {
    expect(classify(AVAILABLE)).toEqual({
      status: "available",
      valueCents: 5000,
      title: "You've received a $50.00 credit!",
    });
  });

  it("reads a spent coupon", () => {
    const result = classify(USED);
    expect(result.status).toBe("used");
    expect(result.title).toMatch(/already been used/);
  });

  it("treats an empty object as a code Cursor has never seen", () => {
    expect(classify({})).toEqual({ status: "invalid", valueCents: null, title: null });
  });

  it("parses $20.00 as 2000 cents", () => {
    expect(classify({ isValid: true, metadata: { title: "You've received a $20.00 credit!" } }).valueCents).toBe(2000);
  });

  it("falls back to unknown for wording it does not model", () => {
    expect(classify({ metadata: { title: "Something else entirely" } }).status).toBe("unknown");
  });
});

describe("redeemUrl", () => {
  it("builds the public redeem link", () => {
    expect(redeemUrl("ABC123")).toBe("https://cursor.com/referral?code=ABC123");
  });

  it("escapes codes with url-unsafe characters", () => {
    expect(redeemUrl("a b/c&d")).toBe("https://cursor.com/referral?code=a%20b%2Fc%26d");
  });
});

describe("checkCoupon", () => {
  it("posts the code to Cursor and classifies the answer", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => AVAILABLE,
    });

    const result = await checkCoupon("0FJM8DZVAUZA", { fetchImpl: fetchImpl as unknown as typeof fetch });

    expect(result.status).toBe("available");
    expect(result.valueCents).toBe(5000);

    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe(CURSOR_CHECK_ENDPOINT);
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({ referralCode: "0FJM8DZVAUZA" });
  });

  it("trims surrounding whitespace before asking", async () => {
    // The MySQL import left a trailing \r on 293 of 300 codes; never send that.
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, json: async () => AVAILABLE });

    await checkCoupon("  ABC123\r\n", { fetchImpl: fetchImpl as unknown as typeof fetch });

    expect(JSON.parse(fetchImpl.mock.calls[0][1].body)).toEqual({ referralCode: "ABC123" });
  });

  it("returns invalid for an empty code without calling Cursor", async () => {
    const fetchImpl = vi.fn();
    expect((await checkCoupon("   ", { fetchImpl: fetchImpl as unknown as typeof fetch })).status).toBe("invalid");
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("reports unknown — never 'used' — when the request fails", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error("ECONNRESET"));

    const result = await checkCoupon("ABC123", { fetchImpl: fetchImpl as unknown as typeof fetch });

    expect(result.status).toBe("unknown");
    expect(result.title).toBe("ECONNRESET");
  });

  it("reports unknown on a non-200 response", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false, status: 503, json: async () => ({}) });

    expect((await checkCoupon("ABC123", { fetchImpl: fetchImpl as unknown as typeof fetch })).status).toBe("unknown");
  });
});
