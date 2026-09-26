import Image from "next/image";
import { HeroHeader } from "@/components/header";
import Footer from "@/components/footer";
import type { CouponEvent } from "@/lib/coupons/events";
import { ClaimForm } from "./claim-form";
import { STEPS } from "./cursor-credits";
import { GrokOrb, GrokPointer } from "./grok-orb";

/**
 * Grok Bot Meetup look: the Luma cover's black stage, white type, the orb face
 * rising from the corner, and teal (#00BCA6) as the single accent.
 */
export function GrokCredits({ event }: { event: Extract<CouponEvent, { theme: "grok" }> }) {
  return (
    <main className="min-h-screen bg-[#000] font-sans text-white caret-white selection:bg-[#00BCA6] selection:text-black">
      <HeroHeader />

      <section className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden">
        {/* Phone: the orb peeks in from the top corner, above the copy. From sm up it rises from the bottom right, as on the Luma cover. */}
        <GrokOrb
          follow
          className="absolute top-24 right-[-5rem] -z-10 w-56 sm:top-auto sm:right-[-14%] sm:bottom-[-34%] sm:w-[60vw] md:right-[-6%] md:bottom-[-30%] md:w-[52vw] md:max-w-[820px]"
        />
        {/* The cover's little teal bot with a pointer chasing it, plus a couple of bots drifting further back. */}
        <div className="absolute top-[22%] right-[10%] -z-10 hidden items-start gap-3 sm:flex md:top-[18%] md:right-[16%]">
          <GrokPointer className="mt-6 w-9 md:w-11" />
          <GrokOrb ink="#00BCA6" follow float={10} seed={3} className="w-16 md:w-20" />
        </div>
        <GrokOrb ink="#54B9A6" float={14} seed={7} className="absolute top-[30%] left-[58%] -z-20 hidden w-7 opacity-50 md:block" />
        <GrokOrb ink="#00BCA6" float={8} seed={11} className="absolute top-[13%] left-[6%] -z-20 w-6 opacity-40 sm:w-8" />
        <div className="mx-auto w-full max-w-6xl px-4 pt-40 pb-16 sm:px-6 sm:pb-24">
          <p className="flex items-center gap-2 font-mono text-xs tracking-widest text-white/60 uppercase">
            <span className="size-2 rounded-full bg-[#00BCA6]" aria-hidden="true" />
            {event.title}
          </p>
          <h1 className="mt-6 max-w-3xl font-sans text-5xl leading-[0.98] font-medium tracking-[-0.035em] text-balance sm:text-7xl md:text-8xl">
            Tus ${event.valueUsd} USD <span className="text-white/45">en créditos de Cursor.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
            Gracias por venir al Grok Bot Meetup. Escribe tu correo y te mandamos tu código.
          </p>

          <div className="mt-10 max-w-xl">
            <ClaimForm slug={event.slug} closed={event.closed} checkClassName="text-[#00BCA6]" />
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 py-16 sm:py-24 md:py-32">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16">
          <div className="flex flex-col justify-between gap-10">
            <h2 className="font-sans text-4xl leading-[1.02] font-medium tracking-[-0.03em] text-balance sm:text-5xl">
              Del correo a tu cuenta en tres pasos.
            </h2>
            <div>
              <p className="font-mono text-xs tracking-widest text-white/40 uppercase">Con</p>
              {/* Monochrome SVG (currentColor renders black): inverted to sit white on black. */}
              <Image src="/spacexai-logo.svg" alt="SpaceXAI" width={205} height={25} className="mt-3 h-5 w-auto invert sm:h-6" />
            </div>
          </div>

          <div>
            <ol className="border-t border-white/15">
              {STEPS.map((step, i) => (
                <li key={step.title} className="grid grid-cols-[3rem_minmax(0,1fr)] gap-4 border-b border-white/15 py-6">
                  <span className="font-mono text-sm tabular-nums text-[#00BCA6]">{String(i + 1).padStart(2, "0")}</span>
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
                className="text-white underline decoration-white/30 underline-offset-4 transition-colors hover:decoration-[#00BCA6]"
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
