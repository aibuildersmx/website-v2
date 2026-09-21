/**
 * Events whose attendees claim a Cursor coupon from /creditos/<slug>.
 *
 * `batch` is the coupon_codes batch the codes come from, and also the key of
 * that event's guest list in coupon_eligible. Adding an event is: codes in
 * (`pnpm coupons:import`), guests in (`pnpm coupons:allow`), an entry here.
 */
export type CouponEvent = {
  slug: string;
  batch: string;
  title: string;
  /** Shown under the title, e.g. "Sábado 19 de septiembre · CDMX". */
  when: string;
  valueUsd: number;
};

export const COUPON_EVENTS: CouponEvent[] = [
  {
    slug: "cafe-cursor-cdmx",
    batch: "mexicocity_2026",
    title: "Café Cursor CDMX",
    when: "Sábado 19 de septiembre · CDMX",
    valueUsd: 50,
  },
];

export function findCouponEvent(slug: string): CouponEvent | undefined {
  return COUPON_EVENTS.find((e) => e.slug === slug);
}
