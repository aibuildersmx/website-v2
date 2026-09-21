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
  /** Tabular date for the page's data strip, e.g. "19.09.2026". */
  date: string;
  valueUsd: number;
  /** Full-bleed hero photo from the event, and a detail shot for the how-to. */
  heroImage: string;
  detailImage: string;
};

export const COUPON_EVENTS: CouponEvent[] = [
  {
    slug: "cafe-cursor-cdmx",
    batch: "mexicocity_2026",
    title: "Café Cursor CDMX",
    when: "Sábado 19 de septiembre · CDMX",
    date: "19.09.2026",
    valueUsd: 50,
    heroImage: "/images/event-photos/cafe-cursor-mexico/DSC00431.jpg",
    detailImage: "/images/event-photos/cafe-cursor-mexico/DSC00449.jpg",
  },
];

export function findCouponEvent(slug: string): CouponEvent | undefined {
  return COUPON_EVENTS.find((e) => e.slug === slug);
}
