import { describe, it, expect } from "vitest";
import { parseCursorAttendees } from "../../lib/community/parse";

const HEADER = "_creationTime,_id,couponId,email,name";

describe("parseCursorAttendees", () => {
  it("parses a Convex attendee row, all subscribed, epoch-millis timestamp", () => {
    const csv =
      `${HEADER}\n` +
      `1773873720598.4993,"docid_1","coupon_1","Dulce@Nolte.io","dulce"\n`;
    const rows = parseCursorAttendees(csv);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      email: "dulce@nolte.io",
      name: "dulce",
      source: "cursor-attendees",
      newsletterSubscribed: true,
      isPremium: false,
      tags: [],
    });
    expect(rows[0].firstSeenAt?.getTime()).toBe(1773873720598);
    expect(rows[0].metadata).toMatchObject({ _id: "docid_1", couponId: "coupon_1" });
  });

  it("skips invalid emails and omits empty/NULL coupon from metadata", () => {
    const csv =
      `${HEADER}\n` +
      `1773907436599,"docid_2","NULL","valid@x.com","Valid"\n` +
      `1773907436599,"docid_3","c3","not-an-email","Bad"\n`;
    const rows = parseCursorAttendees(csv);
    expect(rows.map((r) => r.email)).toEqual(["valid@x.com"]);
    expect(rows[0].metadata).not.toHaveProperty("couponId");
    expect(rows[0].metadata).toMatchObject({ _id: "docid_2" });
  });
});
