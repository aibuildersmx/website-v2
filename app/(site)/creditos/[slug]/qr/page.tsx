import type { Metadata } from "next";
import Image from "next/image";
import { Wifi } from "lucide-react";
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
  /** Venue WiFi override, e.g. ?red=…&pass=… (wins over VENUE_WIFI). */
  searchParams: Promise<{ red?: string; pass?: string }>;
};

const QR_SRC: Record<string, string> = {
  "grok-bot-cdmx": "/images/grok/qr-grok-bot-cdmx.svg",
};

/** The venue's network, shown under the QR. Only for the day of the event. */
const VENUE_WIFI: Record<string, { red: string; pass: string }> = {
  "grok-bot-cdmx": { red: "Igeneris", pass: "IgenerisLuisUrbina4" },
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
  const query = await searchParams;
  const red = query.red ?? VENUE_WIFI[slug]?.red;
  const pass = query.pass ?? VENUE_WIFI[slug]?.pass;
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
      <GrokOrb ink="#54B9A6" float={14} seed={7} className="absolute top-[84vh] left-[52vw] -z-10 w-[3.5vh] opacity-50" />

      {/* Venue WiFi in the gap between the copy and the QR, big enough to read from the back. */}
      {red ? (
        <div className="absolute top-[36vh] left-[40.5vw] flex w-[20vw] flex-col items-center rounded-[min(3vh,1.8vw)] border border-[#00BCA6]/50 bg-[#00BCA6]/15 px-[1.4vw] py-[3vh] text-center text-white">
          <Wifi className="size-[min(5vh,3vw)]" strokeWidth={2} aria-hidden="true" />
          <p className="mt-[2vh] font-mono text-[min(1.6vh,1vw)] tracking-[0.16em] text-white/60 uppercase">Red</p>
          <p className="text-[min(3.2vh,1.8vw)] leading-tight font-medium whitespace-nowrap">{red}</p>
          {pass ? (
            <>
              <p className="mt-[1.8vh] font-mono text-[min(1.6vh,1vw)] tracking-[0.16em] text-white/60 uppercase">Contraseña</p>
              <p className="text-[min(2.8vh,1.5vw)] leading-tight font-medium whitespace-nowrap">{pass}</p>
            </>
          ) : null}
        </div>
      ) : null}

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
        </div>
      </div>
    </main>
  );
}
