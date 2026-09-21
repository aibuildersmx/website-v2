import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HeroHeader } from "@/components/header";
import Footer from "@/components/footer";
import { COUPON_EVENTS, findCouponEvent } from "@/lib/coupons/events";
import { ClaimForm } from "./claim-form";

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

  return (
    <main className="min-h-screen bg-white text-black">
      <HeroHeader />

      <section className="relative bg-white px-4 pt-32 pb-16 sm:px-6 sm:pt-40 sm:pb-24 md:pb-32">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end">
          <div className="space-y-6">
            <span className="text-[10px] font-mono uppercase tracking-widest text-black/40 sm:text-xs">
              {event.title} · {event.when}
            </span>
            <h1 className="font-instrument text-3xl font-medium leading-[1.1] text-balance sm:text-5xl md:text-6xl">
              Tus ${event.valueUsd} USD en créditos de Cursor.
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-black/60 sm:text-lg">
              Gracias por venir. Escribe el correo con el que te registraste en Luma y te mandamos tu código
              para canjearlo.
            </p>
          </div>

          <div className="rounded-2xl border border-black/10 bg-black/[0.01] p-5 sm:p-6 md:p-8">
            <p className="mb-5 text-[10px] font-mono uppercase tracking-widest text-black/40 sm:text-xs">
              Un código por asistente
            </p>
            <ClaimForm slug={event.slug} />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
