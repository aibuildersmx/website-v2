import { describe, expect, it } from "vitest";
import {
  DISPOSABLE_EMAIL_DOMAINS,
  couponEmailProblem,
  isDisposableEmailDomain,
} from "@/lib/coupons/email-policy";

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
  });
});
