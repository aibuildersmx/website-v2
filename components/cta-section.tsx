"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, MessageCircle, Mail, Linkedin } from 'lucide-react';
import Link from 'next/link';
import SplitText from '@/components/SplitText';
import { NewsletterSignup } from '@/components/newsletter-signup';
import { BUILDER_COUNT_FORMATTED } from '@/lib/constants';

export default function CTASection() {
  return (
    <section className="relative py-16 sm:py-24 md:py-32 overflow-hidden bg-white text-black border-t border-black/5">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-black/[0.02] rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-black/[0.02] rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          {/* Left Column: Text Content */}
          <div className="flex flex-col items-start">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-black/5 bg-black/[0.02] mb-4 sm:mb-6">
              <div className="size-1.5 rounded-full bg-black animate-pulse" />
              <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-black/60 font-bold">
                Únete a la comunidad
              </span>
            </div>
            
            <SplitText
              text="Construye el futuro con nosotros"
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-instrument font-medium leading-[1.1] mb-4 sm:mb-6"
              delay={30}
              duration={0.8}
              ease="power3.out"
              splitType="chars"
              from={{ opacity: 0, y: 40 }}
              to={{ opacity: 1, y: 0 }}
              textAlign="left"
              tag="h2"
            />
            
            <p className="mb-6 max-w-md font-sans text-base leading-relaxed text-black/60 sm:mb-10 sm:text-lg md:text-xl">
              Sé parte de la comunidad más activa de builders en México. Recibe las últimas noticias y conecta con otros expertos.
            </p>

            <div className="flex flex-row gap-3 sm:gap-4 w-full sm:w-auto items-center">
              <Button
                asChild
                size="lg"
                className="flex-1 bg-black px-5 py-5 font-sans text-sm font-medium text-white hover:bg-black/90 sm:flex-none sm:px-8 sm:py-6 sm:text-base rounded-xl group"
              >
                <Link href="https://chat.whatsapp.com/E7oCGyITLkX1aqFexJbbHm" target="_blank" className="flex items-center gap-2">
                  <MessageCircle className="size-4 sm:size-5" />
                  <span className="hidden font-sans sm:inline">Comunidad WhatsApp</span>
                  <span className="font-sans sm:hidden">WhatsApp</span>
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Link
                href="https://www.linkedin.com/company/aibuildersmexico"
                target="_blank"
                className="flex items-center justify-center size-11 sm:size-12 rounded-xl border border-black/10 text-black/60 hover:text-black hover:border-black/20 hover:bg-black/[0.02] transition-all shrink-0"
                aria-label="LinkedIn"
              >
                <Linkedin className="size-4 sm:size-5" />
              </Link>
            </div>
          </div>

          {/* Right Column: Newsletter Card */}
          <div className="relative">
            <div className="bg-black text-white p-6 sm:p-8 md:p-12 rounded-2xl sm:rounded-3xl overflow-hidden relative group">
              {/* Subtle pattern background */}
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
              </div>

              <div className="relative z-10">
                <div className="size-10 sm:size-12 bg-white/10 rounded-xl sm:rounded-2xl flex items-center justify-center mb-6 sm:mb-8">
                  <Mail className="size-5 sm:size-6 text-white" />
                </div>
                
                <h3 className="text-xl sm:text-2xl md:text-3xl font-instrument font-medium mb-3 sm:mb-4">
                  Newsletter 
                </h3>
                
                <p className="mb-6 font-sans text-balance text-sm text-white/60 sm:mb-8 sm:text-base">
                  Recibe herramientas, noticias y anuncions de eventos directamente en tu inbox. Sin spam, solo valor.
                </p>

                <NewsletterSignup tone="onDark" />
                
                <p className="mt-4 sm:mt-6 text-[9px] sm:text-[10px] font-mono text-white/30 uppercase tracking-widest text-center">
                  Únete a +{BUILDER_COUNT_FORMATTED} builders hoy
                </p>
              </div>
            </div>
            
            {/* Decorative shadow/glow */}
            <div className="absolute -inset-4 bg-black/5 blur-2xl -z-10 rounded-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
        </div>
      </div>
    </section>
  );
}
