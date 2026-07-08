"use client";

import { Button } from "@/components/ui/button";
import { MapPin, ArrowUpRight, Ticket } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { events, type EventCard } from "./events-data";

const isExternalLink = (link?: string) => Boolean(link?.startsWith("http"));
const eventTypeStyles: Record<string, string> = {
  Workshop: "border-blue-500/20 bg-blue-500/8 text-blue-700",
  Meetup: "border-emerald-500/20 bg-emerald-500/8 text-emerald-700",
  Webinar: "border-amber-500/20 bg-amber-500/8 text-amber-700",
};

function EventLogo({
  logo,
  alt,
  className,
}: {
  logo: string;
  alt: string;
  className: string;
}) {
  if (logo === "/v0-logo-black.svg") {
    return (
      <div
        aria-label={alt}
        role="img"
        className={className}
        style={{
          aspectRatio: "39.914 / 20.658",
          backgroundColor: "#2d2d2d",
          WebkitMaskImage: `url(${logo})`,
          maskImage: `url(${logo})`,
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
          WebkitMaskSize: "contain",
          maskSize: "contain",
        }}
      />
    );
  }

  return (
    <Image
      src={logo}
      alt={alt}
      width={128}
      height={32}
      unoptimized
      className={className}
      onError={(e) => (e.currentTarget.style.display = "none")}
    />
  );
}

function EventDate({ event, compact = false }: { event: EventCard; compact?: boolean }) {
  if (event.dateLabel) {
    return (
      <span
        className={cn(
          "font-mono font-bold uppercase tracking-wider text-black/70 leading-tight text-center",
          compact ? "text-[9px] sm:text-[10px]" : "text-[11px]",
        )}
      >
        {event.dateLabel}
      </span>
    );
  }

  return (
    <>
      <span
        className={cn(
          "font-mono font-bold text-black/40 leading-none uppercase tracking-wider",
          compact
            ? "text-[8px] sm:text-[10px] mb-0.5 sm:mb-1"
            : "text-[10px] tracking-widest font-medium",
        )}
      >
        {event.month}
      </span>
      <span
        className={cn(
          "font-instrument font-medium leading-none text-black/90",
          compact ? "text-lg sm:text-2xl" : "text-3xl",
        )}
      >
        {event.day}
      </span>
    </>
  );
}

export default function EventsSection() {
  return (
    <section
      className="relative py-16 sm:py-24 md:py-32 overflow-hidden bg-white text-black border-t border-black/5"
      id="events"
    >
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-black/[0.02] rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-black/[0.02] rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        {/* Upcoming Events Header */}

        {/* Upcoming Events Grid */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event, index) => (
            <div
              key={index}
              className={cn(
                "group relative flex flex-col md:flex-col bg-white border border-black/10 rounded-2xl overflow-hidden hover:border-black/20 transition-all duration-500 hover:shadow-lg hover:shadow-black/5",
                event.link && event.buttonDisabled ? "cursor-pointer" : "cursor-default",
              )}
            >
              {event.link && event.buttonDisabled && (
                <Link
                  href={event.link}
                  target={isExternalLink(event.link) ? "_blank" : undefined}
                  rel={isExternalLink(event.link) ? "noopener noreferrer" : undefined}
                  aria-label={`Ver detalles de ${event.title}`}
                  className="absolute inset-0 z-10"
                />
              )}

              {/* Mobile Layout (Horizontal/Subtle) */}
              <div className="flex md:hidden items-center p-4 sm:p-6 gap-3 sm:gap-5">
                <div className="flex flex-col items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl bg-black/[0.03] border border-black/5 shrink-0">
                  <EventDate event={event} compact />
                </div>

                <div className="flex-1 min-w-0 py-1">
                  <div className="flex items-center gap-2 mb-2 sm:mb-3">
                    <div
                      className={`size-1.5 rounded-full ${
                        event.status === "ABIERTO"
                          ? "bg-green-500 animate-pulse"
                          : event.status === "CUPO LLENO" || event.status === "AGOTADO"
                            ? "bg-red-500"
                            : "bg-black/20"
                      }`}
                    />
                    <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-black/40 font-medium">
                      {event.status}
                    </span>
                  </div>

                  {event.logo && (
                    <div className="h-4 sm:h-5 w-fit mb-2 sm:mb-3">
                      <EventLogo
                        logo={event.logo}
                        alt={`${event.title} logo`}
                        className="h-full w-auto grayscale opacity-80"
                      />
                    </div>
                  )}

                  <h3 className="text-lg sm:text-2xl font-instrument font-medium leading-[1.2] text-black/90 mb-1.5 sm:mb-2">
                    {event.title}
                  </h3>
                  <div className="flex items-center gap-2 sm:gap-3 text-[9px] sm:text-[10px] font-mono text-black/40 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <MapPin className="size-2.5 sm:size-3" />
                      <span className="truncate">
                        {event.location.split(",")[0]}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Ticket className="size-2.5 sm:size-3" />
                      <span>{event.attendees.split(" ")[0]}</span>
                    </div>
                  </div>
                  <div className="mt-2 sm:mt-3">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.18em] ${
                        eventTypeStyles[event.tags[0]] ??
                        "border-black/10 bg-black/[0.03] text-black/60"
                      }`}
                    >
                      {event.tags[0]}
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  <Button
                    asChild={!!event.link && !event.buttonDisabled}
                    disabled={event.buttonDisabled}
                    size="icon"
                    className={`size-10 rounded-full transition-all duration-300 ${
                      event.buttonDisabled
                        ? "bg-transparent border border-black/10 text-black/20 cursor-default"
                        : "bg-black text-white cursor-pointer"
                    }`}
                  >
                    {event.link && !event.buttonDisabled ? (
                      <Link
                        href={event.link}
                        target={isExternalLink(event.link) ? "_blank" : undefined}
                        rel={
                          isExternalLink(event.link)
                            ? "noopener noreferrer"
                            : undefined
                        }
                      >
                        <ArrowUpRight className="size-3.5 sm:size-4" />
                      </Link>
                    ) : (
                      <ArrowUpRight className="size-3.5 sm:size-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Desktop Layout (Original) */}
              <div className="hidden md:flex flex-col h-full">
                {/* Header with Date & Status */}
                <div className="flex items-stretch border-b border-black/5 bg-black/[0.01]">
                  <div className="flex flex-col justify-center items-center w-24 py-6 border-r border-black/5">
                    <EventDate event={event} />
                  </div>
                  <div className="flex-1 flex items-center justify-end px-5 py-2">
                    <div
                      className={`flex items-center gap-2 px-3 py-1 rounded-full border ${
                        event.status === "ABIERTO"
                          ? "border-black/5 bg-white"
                          : event.status === "AGOTADO"
                            ? "border-red-200 bg-red-50"
                            : "border-black/5 bg-white"
                      }`}
                    >
                      <div
                        className={`size-1.5 rounded-full ${
                          event.status === "ABIERTO"
                            ? "bg-green-500 animate-pulse"
                            : event.status === "CUPO LLENO" || event.status === "AGOTADO"
                              ? "bg-red-500"
                              : "bg-black/20"
                        }`}
                      />
                      <span
                        className={`text-[10px] font-mono uppercase tracking-wider font-medium ${
                          event.status === "AGOTADO"
                            ? "text-red-600"
                            : "text-black/60"
                        }`}
                      >
                        {event.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-6 flex flex-col justify-between gap-16">
                  <div className="space-y-6">
                    {event.logo && (
                      <div className="h-8 w-fit">
                        <EventLogo
                          logo={event.logo}
                          alt={`${event.title} logo`}
                          className="h-full w-auto grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                        />
                      </div>
                    )}
                    <h3 className="text-3xl font-instrument font-medium leading-[1.1] text-black/90 group-hover:text-black transition-colors">
                      {event.title}
                    </h3>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2.5 text-xs font-mono text-black/40 uppercase tracking-[0.1em] font-medium">
                      <MapPin className="size-4" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs font-mono text-black/40 uppercase tracking-[0.1em] font-medium">
                      <Ticket className="size-4" />
                      <span>{event.attendees}</span>
                    </div>
                    <div>
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.18em] ${
                          eventTypeStyles[event.tags[0]] ??
                          "border-black/10 bg-black/[0.03] text-black/60"
                        }`}
                      >
                        {event.tags[0]}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Footer */}
                <div className="p-6 border-t border-black/5 bg-black/[0.01]">
                  <div className="flex items-center">
                    <Button
                      asChild={!!event.link && !event.buttonDisabled}
                      disabled={event.buttonDisabled}
                      className={`w-full rounded-full h-12 px-6 font-mono text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 ${
                        event.buttonDisabled
                          ? "bg-transparent border border-black/10 text-black/20 cursor-default"
                          : "bg-black text-white hover:bg-black/80 hover:shadow-lg hover:shadow-black/5 cursor-pointer"
                      }`}
                    >
                      {event.link && !event.buttonDisabled ? (
                        <Link
                          href={event.link}
                          target={isExternalLink(event.link) ? "_blank" : undefined}
                          rel={
                            isExternalLink(event.link)
                              ? "noopener noreferrer"
                              : undefined
                          }
                          className="group/cta flex w-full items-center justify-center"
                        >
                          <span>{event.buttonText}</span>
                          <span className="inline-block max-w-0 overflow-hidden opacity-0 group-hover/cta:max-w-[1.5em] group-hover/cta:opacity-100 group-hover/cta:ml-2 transition-all duration-300">
                            →
                          </span>
                        </Link>
                      ) : (
                        event.buttonText
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center sm:mt-10">
          <Link
            href="/eventos"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-black px-6 font-mono text-[10px] font-bold uppercase tracking-widest text-white transition-colors duration-300 hover:bg-black/90 sm:h-12 sm:px-7 sm:text-xs"
          >
            Ver todos los eventos
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
