/**
 * Ask Cursor whether a coupon code is still redeemable.
 *
 * The public redeem page (https://cursor.com/referral?code=XXXX) renders the
 * answer client-side, so there is nothing to scrape from the HTML. This hits
 * the same endpoint that page calls. It needs no auth.
 *
 * Observed responses:
 *   {"isValid":true,...,"metadata":{"title":"You've received a $50.00 credit!"}}
 *   {"metadata":{"title":"Sorry, this code has already been used",...}}
 *   {}                                              -> no such code
 */

export const CURSOR_CHECK_ENDPOINT =
  "https://cursor.com/api/dashboard/check-referral-code";

export type CouponStatus = "available" | "used" | "invalid" | "unknown";

export type CouponCheck = {
  status: CouponStatus;
  /** Credit amount in cents, when Cursor tells us one. */
  valueCents: number | null;
  /** Cursor's own wording, kept for the admin UI and for statuses we don't model. */
  title: string | null;
};

type CursorResponse = {
  isValid?: boolean;
  userIsEligible?: boolean;
  metadata?: { title?: string; description?: string; discountType?: string };
};

export function redeemUrl(code: string): string {
  return `https://cursor.com/referral?code=${encodeURIComponent(code)}`;
}

/** "You've received a $50.00 credit!" -> 5000 */
function parseValueCents(title: string | null): number | null {
  if (!title) return null;
  const match = /\$([0-9]+(?:\.[0-9]{1,2})?)/.exec(title);
  if (!match) return null;
  return Math.round(Number.parseFloat(match[1]) * 100);
}

export function classify(body: CursorResponse): CouponCheck {
  const title = body.metadata?.title ?? null;
  const valueCents = parseValueCents(title);

  if (body.isValid === true) return { status: "available", valueCents, title };
  if (title && /already been used/i.test(title)) return { status: "used", valueCents, title };
  if (title && /(expired|no longer)/i.test(title)) return { status: "used", valueCents, title };
  // `{}` is what Cursor returns for a code it doesn't recognise at all.
  if (!title && body.isValid === undefined) return { status: "invalid", valueCents: null, title: null };
  return { status: "unknown", valueCents, title };
}

export async function checkCoupon(
  code: string,
  opts: { timeoutMs?: number; fetchImpl?: typeof fetch } = {},
): Promise<CouponCheck> {
  const { timeoutMs = 15_000, fetchImpl = fetch } = opts;
  const trimmed = code.trim();
  if (!trimmed) return { status: "invalid", valueCents: null, title: null };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetchImpl(CURSOR_CHECK_ENDPOINT, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "https://cursor.com",
        referer: redeemUrl(trimmed),
      },
      body: JSON.stringify({ referralCode: trimmed }),
      signal: controller.signal,
    });

    if (!res.ok) return { status: "unknown", valueCents: null, title: `http ${res.status}` };

    const body = (await res.json()) as CursorResponse;
    return classify(body);
  } catch (error) {
    // A network blip must never be mistaken for "this coupon is dead".
    const reason = error instanceof Error ? error.message : "request failed";
    return { status: "unknown", valueCents: null, title: reason };
  } finally {
    clearTimeout(timer);
  }
}
