import { describe, it, expect } from "vitest";
import { parseTimestamp } from "../../lib/community/types";

describe("parseTimestamp", () => {
  it("parses a Beehiiv 'YYYY-MM-DD HH:MM:SS UTC' string", () => {
    const d = parseTimestamp("2025-08-04 19:40:05 UTC");
    expect(d?.toISOString()).toBe("2025-08-04T19:40:05.000Z");
  });

  it("parses a plain 'YYYY-MM-DD HH:MM:SS' string as UTC", () => {
    const d = parseTimestamp("2025-11-15 09:15:12");
    expect(d?.toISOString()).toBe("2025-11-15T09:15:12.000Z");
  });

  it("returns undefined for NULL, empty, or junk", () => {
    expect(parseTimestamp("NULL")).toBeUndefined();
    expect(parseTimestamp("")).toBeUndefined();
    expect(parseTimestamp("   ")).toBeUndefined();
    expect(parseTimestamp("not-a-date")).toBeUndefined();
  });
});
