"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, MessageCircle, Mail, Send } from 'lucide-react';
import Link from 'next/link';
import SplitText from '@/components/SplitText';

export default function CTASection() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-white text-black border-t border-black/5">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-black/[0.02] rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-black/[0.02] rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column: Text Content */}
          <div className="flex flex-col items-start">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-black/5 bg-black/[0.02] mb-6">
              <div className="size-1.5 rounded-full bg-black animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-black/60 font-bold">
                Únete a la comunidad
              </span>
            </div>
            
            <SplitText
              text="Construye el futuro con nosotros"
              className="text-4xl md:text-5xl lg:text-6xl font-instrument font-medium leading-[1.1] mb-6"
              delay={30}
              duration={0.8}
              ease="power3.out"
              splitType="chars"
              from={{ opacity: 0, y: 40 }}
              to={{ opacity: 1, y: 0 }}
              textAlign="left"
              tag="h2"
            />
            
            <p className="text-lg md:text-xl text-black/60 max-w-md mb-10 leading-relaxed">
              Sé parte de la comunidad más activa de builders en México. Recibe las últimas noticias y conecta con otros expertos.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Button
                asChild
                size="lg"
                className="bg-black text-white hover:bg-black/90 px-8 py-6 text-base font-medium rounded-xl group"
              >
                <Link href="https://chat.whatsapp.com/E7oCGyITLkX1aqFexJbbHm" target="_blank" className="flex items-center gap-2">
                  <MessageCircle className="size-5" />
                  <span>Comunidad WhatsApp</span>
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Column: Newsletter Card */}
          <div className="relative">
            <div className="bg-black text-white p-8 md:p-12 rounded-3xl overflow-hidden relative group">
              {/* Subtle pattern background */}
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
              </div>

              <div className="relative z-10">
                <div className="size-12 bg-white/10 rounded-2xl flex items-center justify-center mb-8">
                  <Mail className="size-6 text-white" />
                </div>
                
                <h3 className="text-2xl md:text-3xl font-instrument font-medium mb-4">
                  Newsletter 
                </h3>
                
                <p className="text-white/60 mb-8 text-balance">
                  Recibe herramientas, noticias y anuncions de eventos directamente en tu inbox. Sin spam, solo valor.
                </p>

                <form className="space-y-4" action="https://aibuildersmx.beehiiv.com/" method="GET" target="_blank">
                  <div className="relative">
                    <input 
                      type="email" 
                      name="email"
                      placeholder="tu@email.com" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                    />
                  </div>
                  <Button 
                    type="submit"
                    className="w-full bg-white text-black hover:bg-white/90 py-6 text-base font-bold rounded-xl flex items-center justify-center gap-2 group"
                  >
                    <span>Suscribirme</span>
                    <Send className="size-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </Button>
                </form>
                
                <p className="mt-6 text-[10px] font-mono text-white/30 uppercase tracking-widest text-center">
                  Únete a +1,000 builders hoy
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
