import { describe, it, expect } from "vitest";
import { parseSubscribers } from "../../scripts/newsletter/lib/subscribers";

describe("parseSubscribers", () => {
  it("parses valid rows, lowercasing and trimming email", () => {
    const csv = "email,first_name\n  Ada@Example.com ,Ada\n";
    const { valid, errors } = parseSubscribers(csv);
    expect(errors).toEqual([]);
    expect(valid).toEqual([{ email: "ada@example.com", firstName: "Ada" }]);
  });

  it("dedupes by email, keeping the first occurrence", () => {
    const csv = "email\nx@y.com\nX@Y.com\n";
    const { valid } = parseSubscribers(csv);
    expect(valid).toHaveLength(1);
    expect(valid[0].email).toBe("x@y.com");
  });

  it("skips rows marked unsubscribed via a status column", () => {
    const csv = "email,status\na@b.com,active\nc@d.com,unsubscribed\n";
    const { valid } = parseSubscribers(csv);
    expect(valid.map((v) => v.email)).toEqual(["a@b.com"]);
  });

  it("records an error for rows with a missing or invalid email", () => {
    const csv = "email,first_name\n,NoEmail\nnotanemail,Bad\n";
    const { valid, errors } = parseSubscribers(csv);
    expect(valid).toEqual([]);
    expect(errors).toHaveLength(2);
  });

  it("returns an error when there is no email column", () => {
    const csv = "name\nAda\n";
    const { valid, errors } = parseSubscribers(csv);
    expect(valid).toEqual([]);
    expect(errors[0]).toMatch(/email column/i);
  });
});
