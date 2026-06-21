import { describe, it, expect } from "vitest";
import { parseRange } from "@/lib/aiby/range";

describe("parseRange", () => {
  it("defaults to week with no group", () => {
    expect(parseRange({})).toEqual({ preset: "week", group: undefined });
  });
  it("accepts a valid preset and group", () => {
    expect(parseRange({ preset: "month", group: "general" })).toEqual({
      preset: "month",
      group: "general",
    });
  });
  it("falls back to week on an invalid preset", () => {
    expect(parseRange({ preset: "decade" })).toEqual({ preset: "week", group: undefined });
  });
  it("treats group=all as no filter", () => {
    expect(parseRange({ preset: "day", group: "all" })).toEqual({
      preset: "day",
      group: undefined,
    });
  });
});
