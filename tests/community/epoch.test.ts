import { describe, it, expect } from "vitest";
import { parseEpochMillis } from "../../lib/community/types";

describe("parseEpochMillis", () => {
  it("parses a float epoch-millis string, rounding to the nearest ms", () => {
    expect(parseEpochMillis("1773873720598.4993")?.getTime()).toBe(1773873720598);
  });
  it("parses an integer epoch-millis string", () => {
    expect(parseEpochMillis("1773907436599")?.getTime()).toBe(1773907436599);
  });
  it("returns undefined for empty, NULL, junk, undefined, and non-positive", () => {
    expect(parseEpochMillis("")).toBeUndefined();
    expect(parseEpochMillis("   ")).toBeUndefined();
    expect(parseEpochMillis("NULL")).toBeUndefined();
    expect(parseEpochMillis("abc")).toBeUndefined();
    expect(parseEpochMillis(undefined)).toBeUndefined();
    expect(parseEpochMillis("0")).toBeUndefined();
    expect(parseEpochMillis("-5")).toBeUndefined();
  });
});
