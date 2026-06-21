import { describe, it, expect } from "vitest";
import { filterPeopleByMatch, suggestQueryFor } from "@/lib/community/curation";

const withContact = { jid: "a", contact: { id: "c1", email: "a@b.com", name: "A" } };
const noContact = { jid: "b", contact: null };

describe("filterPeopleByMatch", () => {
  it("returns only people without a contact when mode is 'pending'", () => {
    expect(filterPeopleByMatch([withContact, noContact], "pending")).toEqual([noContact]);
  });
  it("returns everyone unchanged for any other mode", () => {
    const all = [withContact, noContact];
    expect(filterPeopleByMatch(all, undefined)).toBe(all);
    expect(filterPeopleByMatch(all, "all")).toBe(all);
  });
});

describe("suggestQueryFor", () => {
  it("prefers a 2+ char displayName", () => {
    expect(suggestQueryFor({ displayName: "Ana López", name: "Fp" })).toBe("Ana López");
  });
  it("falls back to name when displayName is missing or too short", () => {
    expect(suggestQueryFor({ displayName: null, name: "Ricardo" })).toBe("Ricardo");
    expect(suggestQueryFor({ displayName: " ", name: "Ricardo" })).toBe("Ricardo");
  });
  it("returns '' when neither is usable", () => {
    expect(suggestQueryFor({ displayName: null, name: "J" })).toBe("");
    expect(suggestQueryFor({ displayName: "", name: null })).toBe("");
  });
});
