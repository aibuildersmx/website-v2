import { describe, it, expect } from "vitest";
import { heatmapGrid } from "@/lib/aiby/heatmap";

describe("heatmapGrid", () => {
  it("builds a 7x24 matrix with counts placed by dow/hour", () => {
    const { rows, max } = heatmapGrid([
      { dow: 0, hour: 0, count: 2 },
      { dow: 6, hour: 23, count: 9 },
    ]);
    expect(rows).toHaveLength(7);
    expect(rows[0]).toHaveLength(24);
    expect(rows[0][0]).toBe(2);
    expect(rows[6][23]).toBe(9);
    expect(rows[3][12]).toBe(0);
    expect(max).toBe(9);
  });
  it("max is 0 for empty cells", () => {
    expect(heatmapGrid([]).max).toBe(0);
  });
});
