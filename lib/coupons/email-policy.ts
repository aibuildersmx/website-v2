import "server-only";

/**
 * Throwaway inboxes we will not assign or email a coupon to.
 *
 * Add a provider's apex domain. Subdomains are rejected too
 * (`a@mail.passinbox.com`). Privacy relays (iCloud Hide My Email, SimpleLogin,
 * Firefox Relay, DuckDuckGo) are intentionally absent — those are real mailboxes.
 */
export const DISPOSABLE_EMAIL_DOMAINS = [
  "10minutemail.com",
  "10minutemail.net",
  "burnermail.io",
  "discard.email",
  "discardmail.com",
  "dispostable.com",
  "dropmail.me",
  "emailfake.com",
  "emailondeck.com",
  "fakeinbox.com",
  "fakemailgenerator.com",
  "generator.email",
  "getairmail.com",
  "getnada.com",
  "grr.la",
  "guerrillamail.biz",
  "guerrillamail.com",
  "guerrillamail.de",
  "guerrillamail.info",
  "guerrillamail.net",
  "guerrillamail.org",
  "guerrillamailblock.com",
  "inboxkitten.com",
  "mailcatch.com",
  "maildrop.cc",
  "mailinator.com",
  "mailnesia.com",
  "mailnull.com",
  "mintemail.com",
  "moakt.com",
  "mohmal.com",
  "mytemp.email",
  "nada.email",
  "passinbox.com",
  "pokemail.net",
  "sharklasers.com",
  "spam4.me",
  "spamgourmet.com",
  "temp-mail.org",
  "tempail.com",
  "tempinbox.com",
  "tempmail.com",
  "tempmailo.com",
  "throwaway.email",
  "throwawaymail.com",
  "tmpmail.net",
  "tmpmail.org",
  "trash-mail.com",
  "trashmail.com",
  "yopmail.com",
  "yopmail.fr",
  "yopmail.net",
] as const;

const DISPOSABLE = new Set<string>(DISPOSABLE_EMAIL_DOMAINS);

export type CouponEmailProblem = "malformed" | "disposable";

/** Apex or parent of `domain` is on the throwaway list. */
export function isDisposableEmailDomain(domain: string): boolean {
  let host = domain.trim().toLowerCase().replace(/^\.+|\.+$/g, "");
  while (host) {
    if (DISPOSABLE.has(host)) return true;
    const dot = host.indexOf(".");
    if (dot === -1) return false;
    host = host.slice(dot + 1);
  }
  return false;
}

function hasEdgeOrConsecutiveDots(part: string): boolean {
  return part.startsWith(".") || part.endsWith(".") || part.includes("..");
}

/** Gmail ignores dots and anything from `+` on, and googlemail.com is the same inbox. */
export const GMAIL_DOMAINS = ["gmail.com", "googlemail.com"] as const;

/**
 * The mailbox an address really lands in, so aliases count as one person:
 * `Juan.Perez+2@googlemail.com` → `juanperez@gmail.com`. Other domains are only
 * lowercased: `ana+x@empresa.mx` stays distinct, since not every server treats
 * `+` as a tag.
 *
 * `canonicalEmailSql` in lib/coupons/queries.ts is the same rule in SQL and must
 * change with it.
 */
export function couponIdentity(email: string): string {
  const normalized = email.trim().toLowerCase();
  const at = normalized.lastIndexOf("@");
  if (at === -1) return normalized;
  const local = normalized.slice(0, at);
  const domain = normalized.slice(at + 1);
  if (!(GMAIL_DOMAINS as readonly string[]).includes(domain)) return normalized;
  return `${local.split("+")[0].replace(/\./g, "")}@gmail.com`;
}

/**
 * Why this address must not receive a coupon, or null when it may.
 * A throwaway domain wins over a messy local-part, so `a..b@passinbox.com`
 * is `disposable`. Dot abuse on a real domain is `malformed`.
 */
export function couponEmailProblem(email: string): CouponEmailProblem | null {
  const normalized = email.trim().toLowerCase();
  if (!normalized || /\s/.test(normalized)) return "malformed";

  const at = normalized.indexOf("@");
  if (at <= 0 || at !== normalized.lastIndexOf("@")) return "malformed";

  const local = normalized.slice(0, at);
  const domain = normalized.slice(at + 1);
  if (!local || !domain.includes(".")) return "malformed";

  if (isDisposableEmailDomain(domain)) return "disposable";
  if (hasEdgeOrConsecutiveDots(local) || hasEdgeOrConsecutiveDots(domain)) return "malformed";
  if (couponIdentity(normalized).startsWith("@")) return "malformed"; // "+x@gmail.com"
  return null;
}
