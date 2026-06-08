import { describe, it, expect } from "vitest";
import { eventToSummary, formatDate, formatCount } from "../../lib/admin/metrics";

describe("eventToSummary", () => {
  it("arma el label de fecha desde month y day", () => {
    expect(
      eventToSummary({ title: "X", month: "JUN", day: "18", location: "Virtual" }),
    ).toEqual({ title: "X", dateLabel: "JUN 18", location: "Virtual" });
  });
});

describe("formatDate", () => {
  it("regresa em dash para null", () => {
    expect(formatDate(null)).toBe("—");
  });
  it("formatea como 'D mmm YYYY' en español (UTC)", () => {
    expect(formatDate(new Date("2026-05-14T12:00:00Z"))).toBe("14 may 2026");
  });
});

describe("formatCount", () => {
  it("regresa em dash para null", () => {
    expect(formatCount(null)).toBe("—");
  });
  it("agrupa miles con coma", () => {
    expect(formatCount(2256)).toBe("2,256");
  });
});
