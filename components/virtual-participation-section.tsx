import Link from "next/link";
import { Globe2 } from "lucide-react";

const aiBuildersLatHref = "https://aibuilders.lat";

export function VirtualParticipationSection() {
  return (
    <section className="relative overflow-hidden border-t border-black/5 bg-white py-12 text-black sm:py-24 md:py-32">
      <div className="pointer-events-none absolute -top-24 left-1/4 size-72 rounded-full bg-black/[0.02] blur-3xl" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl rounded-2xl border border-black/10 bg-white p-6 text-center shadow-lg shadow-black/[0.03] sm:rounded-3xl sm:p-10 md:p-12">
          <h2 className="font-instrument text-2xl font-medium leading-tight text-black sm:text-4xl md:text-5xl">
            ¿Estás fuera de México?
          </h2>
          <p className="mx-auto mt-4 max-w-xl font-sans text-base leading-relaxed text-black/60 sm:text-lg">
            Únete a la comunidad internacional de AI Builders con newsletter, blog
            y pláticas virtuales.
          </p>

          <div className="mx-auto mt-8 flex justify-center">
            <Link
              href={aiBuildersLatHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-black px-5 font-sans text-sm font-medium text-white transition-colors duration-300 hover:bg-black/90 sm:h-12 sm:px-6 sm:text-base"
            >
              <Globe2 className="size-4 sm:size-5" />
              Visitar aibuilders.lat
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
