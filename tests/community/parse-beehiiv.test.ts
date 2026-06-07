import { describe, it, expect } from "vitest";
import { parseBeehiiv } from "../../lib/community/parse";

const HEADER = "subscriber_id,api_subscription_id,email,tags,status,premium?,created_at";

describe("parseBeehiiv", () => {
  it("parses an active subscriber as newsletter_subscribed", () => {
    const csv = `${HEADER}\nsub_1,api_1,Ada@Example.com,"",active,No,2025-08-04 19:40:05 UTC\n`;
    const rows = parseBeehiiv(csv);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      email: "ada@example.com",
      source: "beehiiv",
      newsletterSubscribed: true,
      isPremium: false,
    });
    expect(rows[0].firstSeenAt?.toISOString()).toBe("2025-08-04T19:40:05.000Z");
    expect(rows[0].metadata).toMatchObject({ subscriber_id: "sub_1", status: "active" });
  });

  it("marks unsubscribed/bounced rows as not subscribed (still imported)", () => {
    const csv =
      `${HEADER}\n` +
      `s1,a1,unsub@x.com,"",unsubscribed,No,2025-08-04 19:40:05 UTC\n` +
      `s2,a2,bounce@x.com,"",bounced,No,2025-08-04 19:40:05 UTC\n`;
    const rows = parseBeehiiv(csv);
    expect(rows.map((r) => r.email)).toEqual(["unsub@x.com", "bounce@x.com"]);
    expect(rows.every((r) => r.newsletterSubscribed === false)).toBe(true);
  });

  it("reads premium and splits tags", () => {
    const csv = `${HEADER}\ns1,a1,pro@x.com,"ai, dev",active,Yes,2025-08-04 19:40:05 UTC\n`;
    const rows = parseBeehiiv(csv);
    expect(rows[0].isPremium).toBe(true);
    expect(rows[0].tags).toEqual(["ai", "dev"]);
  });

  it("skips rows with an invalid email", () => {
    const csv = `${HEADER}\ns1,a1,not-an-email,"",active,No,2025-08-04 19:40:05 UTC\n`;
    expect(parseBeehiiv(csv)).toHaveLength(0);
  });
});
