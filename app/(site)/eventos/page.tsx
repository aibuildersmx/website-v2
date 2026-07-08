import type { Metadata } from "next";
import { HeroHeader } from "@/components/header";
import Footer from "@/components/footer";
import { PastEventsGrid } from "@/components/past-events-grid";

export const metadata: Metadata = {
  title: "Eventos - AI Builders Mexico",
  description:
    "Archivo de eventos de AI Builders Mexico: meetups, workshops, webinars y sesiones para builders de IA.",
};

export default function EventsArchivePage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <HeroHeader />

      <section className="relative bg-white px-4 pt-32 pb-16 sm:px-6 sm:pt-40 sm:pb-24 md:pb-32">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl space-y-5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-black/40 sm:text-xs">
              Eventos
            </span>
            <h1 className="font-instrument text-4xl font-medium leading-[1.1] text-balance sm:text-5xl md:text-6xl">
              Meetups, workshops y sesiones de AI Builders.
            </h1>
            <p className="max-w-2xl font-inter text-base leading-relaxed text-black/60 sm:text-lg">
              Revisa el archivo de eventos pasados de la comunidad: sesiones virtuales,
              encuentros presenciales y workshops para builders en México.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-black/5 bg-white py-16 text-black sm:py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-8 flex items-center gap-3 sm:mb-12 sm:gap-4">
            <h2 className="whitespace-nowrap font-instrument text-xl font-medium sm:text-2xl">
              Eventos Pasados
            </h2>
            <div className="h-px flex-1 bg-black/5" />
          </div>
          <PastEventsGrid />
        </div>
      </section>

      <Footer />
    </main>
  );
}
