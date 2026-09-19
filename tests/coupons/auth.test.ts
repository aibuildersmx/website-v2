import { describe, expect, it } from "vitest";
import { isAuthorized } from "@/lib/coupons/auth";

const SECRET = "s3cr3t-token-value";

describe("isAuthorized", () => {
  it("accepts the right bearer token", () => {
    expect(isAuthorized(`Bearer ${SECRET}`, SECRET)).toBe(true);
  });

  it("is case-insensitive about the Bearer keyword and tolerates padding", () => {
    expect(isAuthorized(`  bearer   ${SECRET}  `, SECRET)).toBe(true);
  });

  it("rejects a wrong token of the same length", () => {
    expect(isAuthorized(`Bearer ${"x".repeat(SECRET.length)}`, SECRET)).toBe(false);
  });

  it("rejects a token that is merely a prefix", () => {
    expect(isAuthorized(`Bearer ${SECRET.slice(0, -1)}`, SECRET)).toBe(false);
  });

  it("rejects a missing header", () => {
    expect(isAuthorized(null, SECRET)).toBe(false);
  });

  it("rejects a header without the Bearer scheme", () => {
    expect(isAuthorized(SECRET, SECRET)).toBe(false);
  });

  it("denies everyone when the secret is unset", () => {
    // An unconfigured deploy must fail closed, not open.
    expect(isAuthorized("Bearer anything", undefined)).toBe(false);
    expect(isAuthorized("Bearer ", "")).toBe(false);
  });
});
