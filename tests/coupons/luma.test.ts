import { describe, expect, it } from "vitest";
import { parseLumaGuests } from "@/lib/coupons/luma";

const CSV = [
  "api_id,name,first_name,last_name,email,approval_status,checked_in_at",
  "g1,Ana López,Ana,López,Ana@Example.com,approved,2026-09-19T17:05:00Z",
  "g2,,Beto,Ruiz,beto@example.com,approved,",
  "g3,Caro,Caro,,caro@example.com,declined,2026-09-19T17:10:00Z",
  "g4,Ana dup,Ana,,ana@example.com,approved,",
  "g5,Nadie,,,not-an-email,approved,",
].join("\n");

describe("parseLumaGuests", () => {
  it("keeps approved guests, lowercased and deduplicated", () => {
    expect(parseLumaGuests(CSV)).toEqual([
      { email: "ana@example.com", name: "Ana López" },
      { email: "beto@example.com", name: "Beto Ruiz" },
    ]);
  });

  it("drops guests who never checked in when asked", () => {
    expect(parseLumaGuests(CSV, { checkedInOnly: true }).map((g) => g.email)).toEqual(["ana@example.com"]);
  });
});
