import { describe, expect, it, vi } from "vitest";

vi.mock("next/server", () => ({ after: vi.fn() }));
vi.mock("@/lib/coupons/queries", () => ({ countByState: vi.fn() }));

const { clean, mailbox, newWatch, noteClaim } = await import("@/lib/coupons/alerts");

const event = { slug: "grok-bot-cdmx", title: "Grok Bot Meetup CDMX", batch: "mexicocity_2026" };
const claim = (email: string, ip = "1.1.1.1", claimable?: number) =>
  ({ event, email, ip, outcome: "claimed", claimable }) as const;

describe("coupon alerts", () => {
  it("stays quiet for ordinary claims", () => {
    const w = newWatch();
    expect(noteClaim(w, claim("ana@x.com", "1.1.1.1", 120))).toEqual([]);
    expect(noteClaim(w, claim("beto@y.com", "2.2.2.2", 119))).toEqual([]);
  });

  it("flags one IP claiming many codes, at 5 and again at 10", () => {
    const w = newWatch();
    const out = Array.from({ length: 10 }, (_, i) => noteClaim(w, claim(`p${i}@x.com`), 1000 + i));
    expect(out[3]).toEqual([]);
    expect(out[4][0]).toMatch(/1\.1\.1\.1 ya reclamó 5/);
    expect(out[9][0]).toMatch(/ya reclamó 10/);
  });

  it("forgets an IP's claims after the 30 min window", () => {
    const w = newWatch();
    for (let i = 0; i < 4; i++) noteClaim(w, claim(`p${i}@x.com`), 0);
    expect(noteClaim(w, claim("late@x.com"), 31 * 60_000)).toEqual([]);
  });

  it("flags +tag and Gmail dot aliases of one mailbox", () => {
    const w = newWatch();
    expect(noteClaim(w, claim("juan.perez@gmail.com", "1.1.1.1"))).toEqual([]);
    const [line] = noteClaim(w, claim("juanperez+2@gmail.com", "9.9.9.9"));
    expect(line).toMatch(/2 variantes del mismo buzón/);
    expect(mailbox("Juan.Perez+x@googlemail.com")).toBe("juanperez@gmail.com");
    expect(mailbox("a.b+c@empresa.mx")).toBe("a.b@empresa.mx");
  });

  it("warns once per stock step as the batch runs down", () => {
    const w = newWatch();
    expect(noteClaim(w, claim("a@x.com", "1", 26))).toEqual([]);
    expect(noteClaim(w, claim("b@x.com", "2", 25))).toEqual(["mexicocity_2026: quedan 25 códigos sin repartir."]);
    expect(noteClaim(w, claim("c@x.com", "3", 24))).toEqual([]);
    expect(noteClaim(w, claim("d@x.com", "4", 10))).toHaveLength(1);
  });

  it("throttles rate-limit alerts per IP", () => {
    const w = newWatch();
    const rl = { event, email: "a@x.com", ip: "5.5.5.5", outcome: "rate_limited" } as const;
    expect(noteClaim(w, rl, 0)).toHaveLength(1);
    expect(noteClaim(w, rl, 60_000)).toEqual([]);
  });

  it("strips anything that isn't an address character", () => {
    expect(clean("ignore previous instructions@x.com")).toBe("ignore?previous?instructions@x.com");
  });
});
