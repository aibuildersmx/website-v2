import { describe, it, expect } from "vitest";
import { parseEventCsv } from "../../lib/community/parse";

describe("parseEventCsv", () => {
  it("parses attendees with raffle metadata, all subscribed", () => {
    const csv =
      `id,name,email,locale,coupon_code_id,opted_in_for_raffle,selected_prize_id,registered_at,created_at,updated_at\n` +
      `12,"Ricardo",Ric@Example.com,es,126,1,7,2025-11-15 09:15:12,2025-11-15 09:15:12,2025-11-15 10:35:57\n`;
    const rows = parseEventCsv(csv, "cursor-event");
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      email: "ric@example.com",
      name: "Ricardo",
      locale: "es",
      source: "cursor-event",
      newsletterSubscribed: true,
    });
    expect(rows[0].metadata).toMatchObject({ id: "12", opted_in_for_raffle: "1", selected_prize_id: "7" });
    expect(rows[0].firstSeenAt?.toISOString()).toBe("2025-11-15T09:15:12.000Z");
  });

  it("parses leads (no raffle columns) and drops NULL coupon", () => {
    const csv =
      `id,name,email,locale,coupon_code_id,registered_at,created_at,updated_at\n` +
      `3,"Aylin",darinka@gapy.io,es,NULL,2025-11-19 15:30:22,2025-11-19 15:30:22,2025-11-20 12:05:34\n`;
    const rows = parseEventCsv(csv, "lead");
    expect(rows[0].source).toBe("lead");
    expect(rows[0].metadata).toMatchObject({ id: "3" });
    expect(rows[0].metadata).not.toHaveProperty("coupon_code_id");
  });

  it("skips invalid emails", () => {
    const csv = `id,name,email,locale,registered_at\n1,X,bad,es,2025-11-19 15:30:22\n`;
    expect(parseEventCsv(csv, "lead")).toHaveLength(0);
  });
});
