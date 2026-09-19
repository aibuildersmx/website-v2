import { timingSafeEqual } from "node:crypto";

/**
 * Shared-secret auth for the coupon API.
 *
 * The caller is Aiby's Grok Bot MCP, not a browser, so a single bearer secret
 * in the environment is enough — no session, no cookie. Compared in constant
 * time so the secret can't be recovered one byte at a time.
 */
export function isAuthorized(header: string | null, secret = process.env.COUPONS_API_KEY): boolean {
  if (!secret) return false; // unset secret must never mean "everyone is allowed"
  if (!header) return false;

  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  if (!match) return false;

  const provided = Buffer.from(match[1]);
  const expected = Buffer.from(secret);
  // timingSafeEqual throws on length mismatch, so guard first. Length is not secret.
  if (provided.length !== expected.length) return false;

  return timingSafeEqual(provided, expected);
}
