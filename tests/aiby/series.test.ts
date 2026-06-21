import { describe, it, expect } from "vitest";
import { channelKeys, INK_SCALE } from "@/lib/aiby/series";

describe("channelKeys", () => {
  it("returns every key except date, sorted", () => {
    const series = [
      { date: "2026-06-01", general: 3, anuncios: 1 },
      { date: "2026-06-02", general: 5 },
    ];
    expect(channelKeys(series)).toEqual(["anuncios", "general"]);
  });
  it("returns [] for empty series", () => {
    expect(channelKeys([])).toEqual([]);
  });
});

describe("INK_SCALE", () => {
  it("is non-empty and all greyscale-ish hex", () => {
    expect(INK_SCALE.length).toBeGreaterThan(0);
    for (const c of INK_SCALE) expect(c).toMatch(/^#[0-9a-fA-F]{6}$/);
  });
});
