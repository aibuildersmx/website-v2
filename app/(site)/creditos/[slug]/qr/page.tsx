import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { COUPON_EVENTS, findCouponEvent } from "@/lib/coupons/events";
import { GrokOrb, GrokPointer } from "../grok-orb";
import { StayAwake } from "./stay-awake";

/**
 * The meetup's QR card, for projecting on a wall: one 16:9 screen, no nav, no
 * scroll. Everything is sized off the viewport so any projector resolution
 * gets the same composition. The QR stays black on white with its own quiet
 * zone, since a projected code is scanned from across a room.
 *
 * The QR is a static SVG in public/images/grok/ (generated with the `qrcode`
 * package, errorCorrection M), pointing at this event's /creditos page.
 */

type Props = {
  params: Promise<{ slug: string }>;
  /**
   * Venue WiFi, e.g. ?red=Igeneris&pass=… . Read from the URL, never stored:
   * this repo is public, and each venue has its own network.
   */
  searchParams: Promise<{ red?: string; pass?: string }>;
};

const QR_SRC: Record<string, string> = {
  "grok-bot-cdmx": "/images/grok/qr-grok-bot-cdmx.svg",
};

export function generateStaticParams() {
  return COUPON_EVENTS.filter((e) => QR_SRC[e.slug]).map((e) => ({ slug: e.slug }));
}

export const dynamicParams = false;

export const metadata: Metadata = {
  title: "QR · Grok Bot Meetup CDMX - AI Builders Mexico",
  robots: { index: false, follow: false },
};

export default async function QrScreen({ params, searchParams }: Props) {
  const { slug } = await params;
  const { red, pass } = await searchParams;
  const event = findCouponEvent(slug);
  const qr = QR_SRC[slug];
  if (!event || !qr) notFound();

  return (
    <main className="relative isolate flex h-[100svh] w-full cursor-none items-center overflow-hidden bg-[#000] font-sans text-white">
      <StayAwake />

      {/* The face rises from the bottom-left with both eyes in view, as on the phone layout. */}
      <GrokOrb className="absolute bottom-[-21vh] left-[-3vw] -z-10 w-[min(60vh,36vw)]" />
      <div className="absolute top-[8vh] left-[42vw] -z-10 flex items-start gap-[1.2vh]">
        <GrokPointer className="mt-[3vh] w-[4.5vh]" />
        <GrokOrb ink="#00BCA6" float={10} seed={3} className="w-[9vh]" />
      </div>
      <GrokOrb ink="#54B9A6" float={14} seed={7} className="absolute top-[70vh] left-[44vw] -z-10 w-[3.5vh] opacity-50" />

      <div className="mx-auto grid h-full w-full max-w-[92vw] grid-cols-[minmax(0,1fr)_auto] items-center gap-[6vw]">
        <div className="self-start pt-[8vh]">
          <div className="flex items-center gap-[1.6vh]">
            <Image src="/AIBM-logo-dark.svg" alt="AI Builders México" width={393} height={95} className="h-[4.2vh] w-auto" />
            <span className="font-mono text-[2.4vh] text-white/40">×</span>
            {/* Monochrome SVG (currentColor renders black): inverted to sit white on black. */}
            <Image src="/spacexai-logo.svg" alt="SpaceXAI" width={205} height={25} className="h-[2.4vh] w-auto invert" />
          </div>

          <h1 className="mt-[5vh] font-sans text-[min(7vh,4.2vw)] leading-[1.02] font-normal tracking-[-0.035em]">
            Grok Bot
            <br />
            Mexico City Meetup
            <br />
            <span className="text-white/45">Sábado, 26 de Sept</span>
          </h1>

          <p className="mt-[4vh] text-[min(3.6vh,2.2vw)] leading-[1.2] font-medium tracking-[-0.02em]">
            Escanea y reclama tus <span className="text-[#00BCA6]">${event.valueUsd} USD</span>
            <br />
            en créditos de Cursor.
          </p>
        </div>

        <div>
        <div className="rounded-[min(4vh,2.6vw)] bg-white p-[min(3.6vh,2.3vw)]">
          {/* Unoptimized: the SVG QR reaches the screen untouched, crisp at any projector size. */}
          <Image src={qr} alt={`Código QR a aibuilders.mx/creditos/${event.slug}`} width={33} height={33} unoptimized className="block size-[min(48vh,30vw)] [image-rendering:pixelated]" priority />
          <p className="mt-[2.6vh] text-center font-mono text-[2vh] tracking-[0.16em] text-black/50 uppercase">
            Escanea con tu cámara
          </p>
        </div>
        <p className="mt-[2.4vh] text-center font-mono text-[min(2.4vh,1.5vw)] text-white/50">aibuilders.mx/creditos/{event.slug}</p>
        {red ? (
          <p className="mt-[2.2vh] flex flex-wrap items-baseline justify-center gap-x-[1.4vh] font-mono text-[min(2.6vh,1.6vw)] text-white">
            <span className="text-[#00BCA6] tracking-[0.16em] uppercase">WiFi</span>
            <span>{red}</span>
            {pass ? (
              <>
                <span className="text-white/40">·</span>
                <span>{pass}</span>
              </>
            ) : null}
          </p>
        ) : null}
        </div>
      </div>
    </main>
  );
}
