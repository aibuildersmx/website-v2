import Link from "next/link";
import { ArrowLeft, CalendarDays, Home } from "lucide-react";
import { HeroHeader } from "@/components/header";
import Footer from "@/components/footer";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-white text-black">
      <HeroHeader />

      <section className="relative bg-white px-4 pt-32 pb-16 sm:px-6 sm:pt-40 sm:pb-24 md:pb-32">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-[10px] font-mono uppercase tracking-widest text-black/40 sm:text-xs">
              404
            </span>
            <h1 className="mt-5 font-instrument text-4xl font-medium leading-[1.1] text-balance sm:text-5xl md:text-6xl">
              Esta página no existe.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-black/60 sm:text-lg">
              El enlace pudo cambiar o ya no estar disponible. Puedes volver al inicio o
              revisar los próximos eventos de la comunidad.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/"
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-black px-5 font-sans text-sm font-medium text-white transition-colors duration-300 hover:bg-black/90 sm:w-auto sm:px-6"
              >
                <Home className="size-4" />
                Volver al inicio
              </Link>
              <Link
                href="/eventos"
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-5 font-sans text-sm font-medium text-black/70 transition-colors duration-300 hover:border-black/20 hover:text-black sm:w-auto sm:px-6"
              >
                Ver eventos
                <CalendarDays className="size-4" />
              </Link>
            </div>

            <Link
              href="mailto:hola@aibuilders.lat"
              className="mt-8 inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-black/40 transition-colors duration-300 hover:text-black"
            >
              <ArrowLeft className="size-3.5" />
              Reportar enlace roto
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
