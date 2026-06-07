import { describe, it, expect } from "vitest";
import { mergeContacts } from "../../lib/community/merge";
import type { ContactInput } from "../../lib/community/types";

function input(p: Partial<ContactInput> & { email: string; source: ContactInput["source"] }): ContactInput {
  return {
    tags: [],
    isPremium: false,
    newsletterSubscribed: true,
    metadata: {},
    ...p,
  };
}

describe("mergeContacts", () => {
  it("collapses the same email across sources into one row", () => {
    const merged = mergeContacts([
      input({ email: "a@x.com", source: "beehiiv", tags: ["dev"] }),
      input({ email: "a@x.com", source: "cursor-event", name: "Ada", locale: "es" }),
    ]);
    expect(merged).toHaveLength(1);
    expect(merged[0].sources).toEqual(["beehiiv", "cursor-event"]);
    expect(merged[0].name).toBe("Ada");
    expect(merged[0].locale).toBe("es");
    expect(merged[0].tags).toEqual(["dev"]);
  });

  it("namespaces metadata by source", () => {
    const merged = mergeContacts([
      input({ email: "a@x.com", source: "beehiiv", metadata: { subscriber_id: "s1" } }),
      input({ email: "a@x.com", source: "lead", metadata: { id: "9" } }),
    ]);
    expect(merged[0].metadata).toEqual({ beehiiv: { subscriber_id: "s1" }, lead: { id: "9" } });
  });

  it("an explicit opt-out anywhere wins (compliance)", () => {
    const merged = mergeContacts([
      input({ email: "a@x.com", source: "beehiiv", newsletterSubscribed: false }),
      input({ email: "a@x.com", source: "cursor-event", newsletterSubscribed: true }),
    ]);
    expect(merged[0].newsletterSubscribed).toBe(false);
  });

  it("ORs premium and keeps the earliest firstSeenAt", () => {
    const merged = mergeContacts([
      input({ email: "a@x.com", source: "beehiiv", isPremium: true, firstSeenAt: new Date("2025-08-01T00:00:00Z") }),
      input({ email: "a@x.com", source: "lead", firstSeenAt: new Date("2025-06-01T00:00:00Z") }),
    ]);
    expect(merged[0].isPremium).toBe(true);
    expect(merged[0].firstSeenAt?.toISOString()).toBe("2025-06-01T00:00:00.000Z");
  });

  it("keeps the first non-empty name and unions tags", () => {
    const merged = mergeContacts([
      input({ email: "a@x.com", source: "cursor-event", name: "First", tags: ["a"] }),
      input({ email: "a@x.com", source: "lead", name: "Second", tags: ["a", "b"] }),
    ]);
    expect(merged[0].name).toBe("First");
    expect(merged[0].tags).toEqual(["a", "b"]);
  });
});
