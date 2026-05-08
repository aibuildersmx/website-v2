"use client";

import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { cn } from "@/lib/utils";

const AUTOPLAY_DURATION_MS = 6000;
const PROGRESS_TICK_MS = 100;
const OFFERING_COLUMN_LAYOUTS = [
  "minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr)",
  "minmax(0, 1fr) minmax(0, 2fr) minmax(0, 1fr)",
  "minmax(0, 1fr) minmax(0, 1fr) minmax(0, 2fr)",
];

const offerings = [
  {
    eyebrow: "01",
    title: "Workshops",
    description:
      "Sesiones de 1 a 3 días, presenciales o remotas, diseñadas alrededor de los retos reales que tu equipo enfrenta. Trabajamos con líderes, managers y equipos técnicos. Cada workshop combina teoría aplicada, manos en código y un framework concreto para llevar lo aprendido al día a día.",
    image: "/images/offering/workshops.png",
    alt: "Builders trabajando en una sesión de workshop",
  },
  {
    eyebrow: "02",
    title: "Consultoría Estratégica",
    description:
      "Trabajamos como retainer mensual, no por proyecto ni por hora. Tu equipo de liderazgo recibe acceso directo a los founders de AI Builders cada semana. Ideal para C-levels y heads of product/engineering que necesitan un partner constante mientras adoptan IA: priorización, arquitectura, contratación y conexiones a la red de builders.",
    image: "/images/offering/consultoria.png",
    alt: "Equipo revisando prototipos con AI",
  },
  {
    eyebrow: "03",
    title: "Reclutamiento",
    description:
      "Acceso a +3,880 builders en México: ML/AI engineers senior, founding engineers y AI product leaders. Cuando publicamos un rol en la red, las mejores postulaciones llegan en días.",
    image: "/images/offering/reclutamiento.png",
    alt: "Evento presencial de AI Builders México",
  },
];

export default function OfferingSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [timerSeed, setTimerSeed] = useState(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      return;
    }

    const startedAt = Date.now();

    const intervalId = window.setInterval(() => {
      const nextProgress =
        ((Date.now() - startedAt) / AUTOPLAY_DURATION_MS) * 100;

      if (nextProgress >= 100) {
        setActiveIndex((currentIndex) => (currentIndex + 1) % offerings.length);
        setProgress(0);
        return;
      }

      setProgress(nextProgress);
    }, PROGRESS_TICK_MS);

    return () => window.clearInterval(intervalId);
  }, [activeIndex, timerSeed]);

  const selectOffering = (index: number) => {
    setActiveIndex(index);
    setProgress(0);
    setTimerSeed((currentSeed) => currentSeed + 1);
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLElement>,
    index: number,
  ) => {
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    selectOffering(index);
  };

  return (
    <section
      id="offering"
      className="relative overflow-hidden border-t border-black/5 bg-white py-16 text-black sm:py-24 md:py-32"
      aria-labelledby="offering-heading"
    >
      <div className="pointer-events-none absolute -top-24 left-1/4 size-72 rounded-full bg-black/[0.02] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-1/4 size-80 rounded-full bg-black/[0.02] blur-3xl" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <header className="mx-auto flex max-w-3xl flex-col items-center space-y-4 text-center sm:space-y-6">
          <span className="text-[10px] font-mono uppercase tracking-widest text-black/40 sm:text-xs">
            PARA EMPRESAS
          </span>
          <h2
            id="offering-heading"
            className="text-balance text-2xl font-instrument font-medium leading-tight sm:text-3xl md:text-4xl"
          >
            Lleva la inteligencia artificial al corazón de tu organización.
          </h2>
        </header>

        <div
          className="mt-12 flex flex-col gap-4 sm:mt-16 sm:gap-6 md:mt-20 lg:grid lg:items-stretch lg:transition-[grid-template-columns] lg:duration-500 lg:ease-out"
          style={
            {
              gridTemplateColumns: OFFERING_COLUMN_LAYOUTS[activeIndex],
            } as CSSProperties
          }
        >
          {offerings.map((offering, index) => {
            const isActive = activeIndex === index;

            return (
              <article
                key={offering.title}
                role="button"
                tabIndex={0}
                aria-expanded={isActive}
                aria-label={`Abrir ${offering.title}`}
                onClick={() => selectOffering(index)}
                onKeyDown={(event) => handleKeyDown(event, index)}
                className={cn(
                  "group relative flex h-[36rem] min-h-0 cursor-pointer flex-col overflow-hidden rounded-xl border border-black/10 bg-white text-left outline-none transition-[border-color,box-shadow,transform] duration-500 ease-out hover:border-black/20 hover:shadow-lg hover:shadow-black/5 focus-visible:border-black/30 focus-visible:ring-2 focus-visible:ring-black/10 sm:rounded-2xl lg:min-w-0",
                  isActive && "lg:shadow-lg lg:shadow-black/5",
                )}
              >
                <div className="relative h-44 shrink-0 overflow-hidden border-b border-black/5 bg-black/[0.02] sm:h-48">
                  <Image
                    src={offering.image}
                    alt={offering.alt}
                    fill
                    sizes={isActive ? "(min-width: 1024px) 560px, 100vw" : "(min-width: 1024px) 280px, 100vw"}
                    className={cn(
                      "h-full w-full object-cover grayscale transition-all duration-500 group-hover:scale-105 group-hover:grayscale-0",
                      isActive && "grayscale-0",
                    )}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/10" />
                </div>

                <div className="flex min-h-0 flex-1 flex-col p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-black/40">
                      {offering.eyebrow}
                    </span>
                  </div>

                  <h3
                    className="mt-5 font-instrument text-xl font-medium leading-tight text-black transition-colors duration-500 sm:text-2xl"
                  >
                    {offering.title}
                  </h3>

                  <div
                    aria-hidden={!isActive}
                    className={cn(
                      "mt-6 grid transition-[grid-template-rows] duration-500 ease-out sm:mt-7",
                      isActive ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                    )}
                  >
                    <p
                      className={cn(
                        "min-h-0 overflow-hidden text-sm leading-relaxed text-black/60 transition-[opacity,filter,transform] duration-500 ease-out",
                        isActive
                          ? "translate-y-0 opacity-100 blur-0 delay-150 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:8]"
                          : "translate-y-1 opacity-0 blur-sm delay-0",
                      )}
                    >
                      {offering.description}
                    </p>
                  </div>

                  <div
                    aria-hidden="true"
                    className={cn(
                      "transition-[height] duration-500 ease-out",
                      isActive ? "h-4 sm:h-5" : "h-2",
                    )}
                  />

                  <div className="mt-auto shrink-0 pt-4">
                    <div className="h-px overflow-hidden bg-black/10">
                      <div
                        className="h-full bg-black transition-[width] duration-100 ease-linear"
                        style={{ width: isActive ? `${progress}%` : "0%" }}
                      />
                    </div>
                    <div className="mt-3 flex items-center justify-end gap-4">
                      <Link
                        href="/enterprise"
                        aria-label={`Ver ${offering.title} para empresas`}
                        onClick={(event) => event.stopPropagation()}
                        onKeyDown={(event) => event.stopPropagation()}
                        className="rounded-full p-1 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-black/10"
                      >
                        <ArrowUpRight
                          className={cn(
                            "size-4 transition-all duration-300",
                            isActive
                              ? "translate-x-0 text-black"
                              : "text-black/30 group-hover:translate-x-0.5 group-hover:text-black",
                          )}
                        />
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
