"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeroHeader } from "./header";
import Dither from "@/components/Dither";
import SplitText from "@/components/SplitText";
import { Linkedin } from "lucide-react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function HeroSection() {
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!gridRef.current) return;

      const images = gridRef.current.children;

      gsap.fromTo(
        images,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 80%",
            once: true,
          },
        }
      );
    },
    { scope: gridRef }
  );

  return (
    <div className="relative">
      <HeroHeader />
      <section className="fixed top-0 left-0 h-[100dvh] w-full flex flex-col pointer-events-none -z-10 bg-[#212121]">
        {/* Dither Background */}
        <div className="absolute inset-0 pointer-events-auto">
          <Dither />
        </div>

        {/* Main content area - Side by side layout */}
        <div className="flex-1 flex items-center w-full pt-16 pb-2 sm:pt-20 sm:pb-4 md:pt-32 md:pb-8 relative z-10 overflow-hidden">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 lg:gap-16">
              {/* Left Column: Text Content */}
              <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left">
                <SplitText
                  text="La comunidad líder de AI en México"
                  className="text-balance text-3xl sm:text-4xl md:text-5xl font-medium text-white lg:text-6xl xl:text-7xl leading-[1.1] font-instrument text-center lg:text-left"
                  delay={30}
                  duration={0.8}
                  ease="power3.out"
                  splitType="chars"
                  from={{ opacity: 0, y: 40 }}
                  to={{ opacity: 1, y: 0 }}
                  threshold={0.1}
                  rootMargin="-50px"
                  tag="h1"
                  textAlign="inherit"
                />
                <p className="mt-3 sm:mt-6 md:mt-8 max-w-lg font-sans text-pretty text-sm text-white/80 sm:text-lg md:text-xl">
                  Somos una comunidad de builders que transformamos ideas en
                  productos digitales reales usando IA como nuestro superpoder.
                </p>

                <div className="mt-8 md:mt-10 hidden lg:flex items-center gap-3 pointer-events-auto">
                  <Button
                    asChild
                    size="lg"
                    className="bg-white text-black hover:bg-white/90 px-10 py-7 font-sans text-lg font-medium rounded-xl"
                  >
                    <Link
                      href="https://chat.whatsapp.com/E7oCGyITLkX1aqFexJbbHm"
                      target="_blank"
                    >
                      <span className="font-sans text-nowrap">
                        Únete a nuestra comunidad
                      </span>
                    </Link>
                  </Button>
                  <Link
                    href="https://www.linkedin.com/company/aibuildersmexico"
                    target="_blank"
                    className="flex items-center justify-center size-14 rounded-xl border border-white/20 text-white/70 hover:text-white hover:border-white/40 bg-white/10 transition-all z-50"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="size-6" />
                  </Link>
                </div>
              </div>

              {/* Right Column: 2x2 Image Grid */}
              <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-end pointer-events-auto">
                <div
                  ref={gridRef}
                  className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 w-full max-w-[360px] sm:max-w-[400px] md:max-w-[500px] lg:max-w-none"
                >
                  <div className="relative aspect-square w-full bg-[#212121]/80 rounded-xl sm:rounded-2xl border border-white/10 overflow-hidden">
                    <Image
                      src="/hero1.avif"
                      alt="Hero 1"
                      fill
                      priority
                      sizes="(min-width: 1024px) 25vw, (min-width: 768px) 250px, (min-width: 640px) 200px, 50vw"
                      className="absolute inset-0 w-full h-full object-cover grayscale transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                  <div className="relative aspect-square w-full bg-[#212121]/80 rounded-xl sm:rounded-2xl border border-white/10 overflow-hidden">
                    <Image
                      src="/hero2.avif"
                      alt="Hero 2"
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 768px) 250px, (min-width: 640px) 200px, 50vw"
                      className="absolute inset-0 w-full h-full object-cover grayscale transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                  <div className="relative aspect-square w-full bg-[#212121]/80 rounded-xl sm:rounded-2xl border border-white/10 overflow-hidden">
                    <Image
                      src="/hero3.avif"
                      alt="Hero 3"
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 768px) 250px, (min-width: 640px) 200px, 50vw"
                      className="absolute inset-0 w-full h-full object-cover grayscale transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                  <div className="relative aspect-square w-full bg-[#212121]/80 rounded-xl sm:rounded-2xl border border-white/10 overflow-hidden">
                    <Image
                      src="/hero4.avif"
                      alt="Hero 4"
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 768px) 250px, (min-width: 640px) 200px, 50vw"
                      className="absolute inset-0 w-full h-full object-cover grayscale transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                </div>
                <div className="mt-3 sm:mt-6 flex lg:hidden w-full gap-2 sm:gap-3 pointer-events-auto shrink-0">
                  <Button
                    asChild
                    size="lg"
                    className="h-11 flex-1 bg-white text-black hover:bg-white/90 px-4 sm:h-auto sm:px-10 sm:py-7 font-sans text-sm font-medium rounded-xl sm:text-lg"
                  >
                    <Link
                      href="https://chat.whatsapp.com/E7oCGyITLkX1aqFexJbbHm"
                      target="_blank"
                    >
                      <span className="font-sans text-nowrap">
                        Únete a nuestra comunidad
                      </span>
                    </Link>
                  </Button>
                  <Link
                    href="https://www.linkedin.com/company/aibuildersmexico"
                    target="_blank"
                    className="flex items-center justify-center w-11 sm:w-14 shrink-0 rounded-xl bg-white text-black hover:bg-white/90 transition-all"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="size-5 sm:size-6" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
