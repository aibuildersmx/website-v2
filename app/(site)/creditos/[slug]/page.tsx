import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { COUPON_EVENTS, findCouponEvent } from "@/lib/coupons/events";
import { CursorCredits } from "./cursor-credits";
import { GrokCredits } from "./grok-credits";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return COUPON_EVENTS.map((e) => ({ slug: e.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const event = findCouponEvent((await params).slug);
  return {
    title: event ? `Créditos de Cursor · ${event.title} - AI Builders Mexico` : "Créditos de Cursor",
    robots: { index: false, follow: false },
  };
}

export default async function CreditsPage({ params }: Props) {
  const event = findCouponEvent((await params).slug);
  if (!event) notFound();
  return event.theme === "grok" ? <GrokCredits event={event} /> : <CursorCredits event={event} />;
}
