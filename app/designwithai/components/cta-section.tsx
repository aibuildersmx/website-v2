import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, MessageCircle, Sparkles } from 'lucide-react';
import PixelCard from '@/components/PixelCard';

export default function CTASection() {
  return (
    <section id="registro" className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 bg-white overflow-hidden relative">
      <div className="w-full lg:w-[75vw] mx-auto relative">
        <PixelCard
          variant="default"
          gap={6}
          speed={40}
          colors="#ffffff,#a1a1aa,#52525b"
          noFocus
          className="group !h-auto !w-full !aspect-auto bg-black !border-black/20 !rounded-[2rem] sm:!rounded-[3rem]"
        >
          <div className="relative z-10 p-8 sm:p-12 md:p-16 flex flex-col items-center text-center gap-6 sm:gap-8 w-full">
            <div className="relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white/90 text-[10px] sm:text-xs font-mono uppercase tracking-widest overflow-hidden isolate">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[length:300%_100%] animate-[gradient-shift_4s_ease_infinite] bg-gradient-to-r from-purple-500/30 via-cyan-400/30 via-50% to-pink-500/30" />
              <Sparkles className="relative size-3 sm:size-3.5" />
              <span className="relative">Inscripciones Abiertas</span>
            </div>

            <div className="flex flex-col gap-4">
              <h2 className="font-instrument text-4xl sm:text-5xl md:text-6xl tracking-tight leading-[1.1] text-white">
                Empieza a diseñar con el poder de la Inteligencia Artificial
              </h2>
              <p className="text-base sm:text-lg text-white/60 max-w-xl mx-auto font-light">
                Reserva tu lugar hoy. Cupos limitados.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 w-full sm:w-auto">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto rounded-xl bg-white text-black hover:bg-white/90 font-mono uppercase tracking-widest px-8 h-14"
              >
                <Link
                  href="https://buy.stripe.com/cNi3cp2bn1Iz5D9gsZgnK03"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Reserva tu lugar
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
            
            <Link
              href="https://wa.me/523331904491"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors font-mono text-[10px] sm:text-xs uppercase tracking-widest"
            >
              <MessageCircle className="size-3.5" />
              <span>Contacto para dudas sobre el programa</span>
            </Link>
          </div>
        </PixelCard>
      </div>
    </section>
  );
}
