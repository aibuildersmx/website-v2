/**
 * Events whose attendees claim a Cursor coupon from /creditos/<slug>.
 *
 * `batch` is the coupon_codes batch the codes come from. `guestList` keys the
 * event's guest list in coupon_eligible; two events can share a batch, so each
 * gets its own list and "one code per attendee" holds per event. Adding an
 * event is: codes in (`pnpm coupons:import`), an entry here, guests in
 * (`pnpm coupons:allow <slug> <csv>`).
 */
type BaseEvent = {
  slug: string;
  batch: string;
  guestList: string;
  title: string;
  /** Shown under the title, e.g. "Sábado 19 de septiembre · CDMX". */
  when: string;
  valueUsd: number;
  /**
   * Open claims: any email gets a code (one per email), no Luma list needed.
   * The guest list fills itself as people claim. Abuse is watched, not blocked:
   * see lib/coupons/alerts.ts.
   */
  open?: boolean;
};

export type CouponEvent =
  | (BaseEvent & {
      theme: "cursor";
      /** Full-bleed hero photo from the event, and a detail shot for the how-to. */
      heroImage: string;
      detailImage: string;
    })
  | (BaseEvent & { theme: "grok" });

export const COUPON_EVENTS: CouponEvent[] = [
  {
    slug: "cafe-cursor-cdmx",
    batch: "mexicocity_2026",
    guestList: "mexicocity_2026",
    title: "Café Cursor CDMX",
    when: "Sábado 19 de septiembre · CDMX",
    valueUsd: 50,
    theme: "cursor",
    heroImage: "/images/event-photos/cafe-cursor-mexico/DSC00431.jpg",
    detailImage: "/images/event-photos/cafe-cursor-mexico/DSC00449.jpg",
  },
  {
    slug: "grok-bot-cdmx",
    batch: "mexicocity_2026",
    guestList: "grok_bot_cdmx_2026",
    title: "Grok Bot Meetup CDMX",
    when: "Sábado 26 de septiembre · Polanco, CDMX",
    valueUsd: 50,
    open: true,
    theme: "grok",
  },
];

export function findCouponEvent(slug: string): CouponEvent | undefined {
  return COUPON_EVENTS.find((e) => e.slug === slug);
}
