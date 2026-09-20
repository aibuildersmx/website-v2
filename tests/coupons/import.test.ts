import { describe, expect, it } from "vitest";
import { parseLine } from "@/scripts/coupons/import";

const NOW = new Date("2026-09-19T23:00:00Z");

describe("parseLine", () => {
  it("maps the legacy is_used flag onto sent_at, not redeemed_at", () => {
    // This is the whole point of the migration: is_used meant "we emailed it".
    const row = parseLine("aibm\t0CU0B136LMAS\t1\t2025-11-15 09:15:59\tAVAILABLE", NOW);

    expect(row).not.toBeNull();
    expect(row!.sentAt).toEqual(new Date("2025-11-15T09:15:59Z"));
    expect(row!.redeemedAt).toBeNull();
    expect(row!.checkStatus).toBe("available");
  });

  it("marks a coupon redeemed only when Cursor says so", () => {
    const row = parseLine("aibm\tBBBV5BBR1XHB\t1\t2025-11-15 09:16:26\tUSED", NOW);

    expect(row!.redeemedAt).toEqual(new Date("2025-11-15T09:16:26Z"));
    expect(row!.sentAt).toEqual(new Date("2025-11-15T09:16:26Z"));
  });

  it("leaves never-emailed coupons claimable", () => {
    const row = parseLine("cafe_cursor_toronto\tTX5ZDMNZG1A\t0\t\tAVAILABLE", NOW);

    expect(row!.sentAt).toBeNull();
    expect(row!.redeemedAt).toBeNull();
  });

  it("strips the trailing carriage return left by the old CSV import", () => {
    const row = parseLine("aibm\t0CU0B136LMAS\r\t1\t\tAVAILABLE", NOW);

    expect(row!.code).toBe("0CU0B136LMAS");
  });

  it("assigns the right credit per batch", () => {
    expect(parseLine("aibm\tA\t0\t\tAVAILABLE", NOW)!.valueCents).toBe(2000);
    expect(parseLine("cafe_cursor_toronto\tB\t0\t\tAVAILABLE", NOW)!.valueCents).toBe(5000);
  });

  it("flags an unknown batch with a zero value so the import refuses to run", () => {
    expect(parseLine("mystery_event\tC\t0\t\tAVAILABLE", NOW)!.valueCents).toBe(0);
  });

  it("skips malformed and blank lines", () => {
    expect(parseLine("", NOW)).toBeNull();
    expect(parseLine("aibm\tONLYTWO", NOW)).toBeNull();
    expect(parseLine("aibm\t\t0\t\tAVAILABLE", NOW)).toBeNull();
  });

  it("falls back to now when the legacy row has no timestamp", () => {
    expect(parseLine("aibm\tD\t1\t\tUSED", NOW)!.redeemedAt).toEqual(NOW);
  });
});
