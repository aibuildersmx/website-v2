import { describe, expect, it } from "vitest";
import {
  DISPOSABLE_EMAIL_DOMAINS,
  couponEmailProblem,
  couponIdentity,
  isDisposableEmailDomain,
} from "@/lib/coupons/email-policy";
import { ABUSE_ALIASES, IDENTITY_FIXTURES } from "./fixtures/identity";

describe("couponIdentity", () => {
  it("maps every fixture to its mailbox", () => {
    for (const [email, identity] of IDENTITY_FIXTURES) expect(couponIdentity(email), email).toBe(identity);
  });

  it("collapses the eight aliases from the grok-bot-cdmx abuse into one identity", () => {
    expect(new Set(ABUSE_ALIASES.map(couponIdentity))).toEqual(new Set(["saidromero19@gmail.com"]));
  });

  it("leaves +tags on other domains distinct", () => {
    expect(couponIdentity("user+tag@company.com")).not.toBe(couponIdentity("user@company.com"));
  });
});

describe("couponEmailProblem", () => {
  it("includes the domain used in the coupon abuse", () => {
    expect(DISPOSABLE_EMAIL_DOMAINS).toContain("passinbox.com");
    expect(couponEmailProblem("attacker@passinbox.com")).toBe("disposable");
    expect(couponEmailProblem("Attacker@PassInbox.com")).toBe("disposable");
    expect(couponEmailProblem("a..b@passinbox.com")).toBe("disposable");
    expect(isDisposableEmailDomain("mail.passinbox.com")).toBe(true);
  });

  it("rejects other common throwaway providers and their subdomains", () => {
    expect(couponEmailProblem("a@mailinator.com")).toBe("disposable");
    expect(couponEmailProblem("a@guerrillamail.com")).toBe("disposable");
    expect(couponEmailProblem("a@yopmail.com")).toBe("disposable");
    expect(couponEmailProblem("a@bot.mail.mailinator.com")).toBe("disposable");
  });

  it("does not treat a lookalike or a privacy relay as disposable", () => {
    expect(couponEmailProblem("a@notpassinbox.com")).toBeNull();
    expect(couponEmailProblem("a@passinbox.com.attacker.test")).toBeNull();
    expect(couponEmailProblem("hide@privaterelay.appleid.com")).toBeNull();
    expect(isDisposableEmailDomain("notpassinbox.com")).toBe(false);
  });

  it("rejects consecutive dots and leading or trailing dots", () => {
    expect(couponEmailProblem("a..b@gmail.com")).toBe("malformed");
    expect(couponEmailProblem(".a@gmail.com")).toBe("malformed");
    expect(couponEmailProblem("a.@gmail.com")).toBe("malformed");
    expect(couponEmailProblem("a@gmail..com")).toBe("malformed");
    expect(couponEmailProblem("a@.gmail.com")).toBe("malformed");
    expect(couponEmailProblem("a@gmail.com.")).toBe("malformed");
  });

  it("rejects addresses that are not emails", () => {
    expect(couponEmailProblem("nope")).toBe("malformed");
    expect(couponEmailProblem("a@b")).toBe("malformed");
    expect(couponEmailProblem("a b@gmail.com")).toBe("malformed");
    expect(couponEmailProblem("@gmail.com")).toBe("malformed");
    expect(couponEmailProblem("")).toBe("malformed");
  });

  it("accepts an ordinary address, including dots and a plus tag", () => {
    expect(couponEmailProblem("Ana.Maria+event@Example.com")).toBeNull();
    expect(couponEmailProblem("a@b.com")).toBeNull();
    // A single +address still works once; uniqueness is on the mailbox.
    expect(couponEmailProblem("saidromero19+1@gmail.com")).toBeNull();
  });

  it("rejects a Gmail address with no mailbox left once the tag is stripped", () => {
    expect(couponEmailProblem("+x@gmail.com")).toBe("malformed");
    expect(couponEmailProblem("+x@googlemail.com")).toBe("malformed");
  });
});
