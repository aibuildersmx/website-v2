"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { motion, useScroll, useTransform } from 'motion/react';
import DitherBackground from './dither-background';
import RoleTicker from './role-ticker';

export default function HeroSection() {
  const { scrollY } = useScroll();
  
  // As the user scrolls down 800px, the hero fades out slightly and scales down slightly
  const opacity = useTransform(scrollY, [0, 800], [1, 0.4]);
  const scale = useTransform(scrollY, [0, 800], [1, 0.95]);

  return (
    <section className="sticky top-0 h-[100dvh] bg-[#212121] overflow-hidden">
      <motion.div 
        style={{ opacity, scale }}
        className="w-full h-full flex items-center justify-center pt-20 pb-12 px-4 sm:px-6 relative"
      >
        <DitherBackground />

        <div className="w-full lg:w-[75vw] mx-auto flex flex-col items-center text-center gap-14 sm:gap-20 relative z-10">
          <RoleTicker />

          <div className="flex flex-col gap-8 sm:gap-12">
            <h1 className="font-instrument text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-white leading-[1.1]">
              Prompt to Production Bootcamp
            </h1>
            <p className="text-xl sm:text-2xl text-white/85 max-w-3xl mx-auto font-light leading-relaxed">
              <strong className="font-semibold">Eleva</strong> tus skills como AI builder. Crea imágenes impactantes,{' '}
              <strong className="font-semibold">prototipa</strong> interfaces dinámicas y <strong className="font-semibold">lanza</strong>{' '}
              proyectos web con calidad top.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-12 sm:mt-16 w-full sm:w-auto">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto rounded-xl bg-white text-black hover:bg-white/90 font-mono uppercase tracking-widest px-8"
            >
              <Link href="#programa">
                Ver el programa
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
