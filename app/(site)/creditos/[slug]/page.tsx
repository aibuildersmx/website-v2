import type { Metadata } from "next";
import Image from "next/image";
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

const STEPS = [
  { title: "Abre el correo", body: "Llega desde AI Builders México con tu código de un solo uso." },
  { title: "Canjear en Cursor", body: "El botón del correo abre cursor.com con el código ya puesto." },
  { title: "Inicia sesión", body: "Con la cuenta donde quieras el crédito. Se aplica al momento." },
];

export default async function CreditsPage({ params }: Props) {
  const event = findCouponEvent((await params).slug);
  if (!event) notFound();

  return (
    <main className="min-h-screen bg-[#212121] font-sans text-white caret-white selection:bg-white selection:text-[#212121]">
      <HeroHeader />

      <section className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden">
        <Image
          src={event.heroImage}
          alt={`Asistentes trabajando en sus laptops en ${event.title}`}
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-[70%_center] brightness-[0.55] contrast-125 grayscale"
        />
        {/* Scrim: keeps the headline and form legible over any part of the photo. */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#212121] via-[#212121]/70 to-[#212121]/20" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#212121]/95 via-[#212121]/60 to-[#212121]/10" />

        <div className="mx-auto w-full max-w-6xl px-4 pt-40 pb-16 sm:px-6 sm:pb-24">
          <h1 className="max-w-4xl font-instrument text-5xl leading-[0.95] font-medium tracking-[-0.02em] text-balance sm:text-7xl md:text-8xl">
            Tus ${event.valueUsd} USD en créditos de Cursor.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
            Gracias por venir a {event.title}. Escribe el correo con el que te registraste en Luma y te mandamos
            tu código.
          </p>

          <div className="mt-10 max-w-xl">
            <ClaimForm slug={event.slug} />
          </div>

        </div>
      </section>

      <section className="border-t border-white/10 py-16 sm:py-24 md:py-32">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
            <Image
              src={event.detailImage}
              alt="Pins de Cursor junto a un sticker de AI Builders México"
              fill
              sizes="(min-width: 768px) 40vw, 100vw"
              className="object-cover grayscale"
            />
          </div>

          <div>
            <h2 className="font-instrument text-4xl leading-[1.05] font-medium tracking-[-0.02em] text-balance sm:text-5xl">
              Del correo a tu cuenta en tres pasos.
            </h2>
            <ol className="mt-10 border-t border-white/15">
              {STEPS.map((step, i) => (
                <li key={step.title} className="grid grid-cols-[3rem_minmax(0,1fr)] gap-4 border-b border-white/15 py-6">
                  <span className="font-mono text-sm tabular-nums text-white/50">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <p className="text-lg font-medium text-white">{step.title}</p>
                    <p className="mt-1 text-base leading-relaxed text-white/60">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-8 text-sm leading-relaxed text-white/50">
              Un código por asistente. ¿No te llega? Revisa spam o escríbenos a{" "}
              <a
                href="mailto:hola@aibuilders.lat"
                className="text-white underline decoration-white/30 underline-offset-4 transition-colors hover:decoration-white"
              >
                hola@aibuilders.lat
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
