"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Gift, Ticket, Sparkles, Video } from 'lucide-react';
import Link from 'next/link';
import PixelCard from '@/components/PixelCard';

const modules = [
  {
    title: "Visuales que Paran el Scroll",
    description: "Domina AI image gen tools como Midjourney, Reve y Nano Banana para crear imágenes y videos que capturen la atención — desde landing pages hasta flyers y posters.",
    topics: [
      "Prompting efectivo para imagen y video",
      "Flujos con Midjourney, Reve y Nano Banana",
      "Assets para landings, flyers y posters",
    ],
    bonus: "Catálogo con prompts y +100 style references incluido",
    date: "ABR 16 · 5PM - 7PM",
    price: "$1,499 MXN",
    status: "ABIERTO",
    spots: "10 lugares",
    link: "https://buy.stripe.com/3cIeV7cQ1af50iPgsZgnK00",
  },
  {
    title: "Tu Landing Page en Minutos",
    description: "Arma tu primera landing con v0 + Cursor — el combo más poderoso para crear páginas responsivas y dinámicas sin el AI smell de gradientes morados, intercambiando entre modelos de Gemini y Anthropic.",
    topics: [
      "Setup de v0 + Cursor desde cero",
      "Prototipar, iterar y refinar con AI",
      "Cómo evitar el look genérico de AI",
    ],
    bonus: "Lista de +30 recursos para tus proyectos incluida",
    date: "ABR 23 · 5PM - 7PM",
    price: "$1,499 MXN",
    status: "ABIERTO",
    spots: "10 lugares",
    link: "https://buy.stripe.com/5kQaER9DP5YP4z590xgnK02",
  },
  {
    title: "Ship It: De Código a Producción",
    description: "Integra componentes de React, conecta herramientas vía MCP para agilizar tu workflow con librerías de íconos, componentes y animaciones. Cierra lanzando tu proyecto online con deployment en Vercel, GitHub y tu propio dominio.",
    topics: [
      "Conecta tu dominio personalizado",
      "Conexiones MCP para íconos y animaciones",
      "Deploy en Vercel + GitHub",
    ],
    bonus: "Lista de +20 componentes de React y librerías UI",
    date: "ABR 29 · 5PM - 7PM",
    price: "$1,499 MXN",
    status: "ABIERTO",
    spots: "10 lugares",
    link: "https://buy.stripe.com/7sYdR3eY99b1ghNgsZgnK01",
  }
];

export default function ModulesSection() {
  return (
    <section id="programa" className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 bg-white">
      <div className="w-full lg:w-[75vw] mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="font-instrument text-4xl sm:text-5xl md:text-6xl tracking-tight text-black mb-4">
            Programa del Curso
          </h2>
          <p className="text-black/60 font-mono uppercase tracking-widest text-xs sm:text-sm">
            De cero a landing page en 3 módulos
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
          {modules.map((mod, index) => (
            <Card key={index} className="group relative overflow-hidden bg-white border border-black/10 rounded-2xl hover:border-black/20 transition-all duration-500 hover:shadow-lg flex flex-col">
              <CardContent className="p-6 sm:p-8 flex flex-col flex-1 gap-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="size-10 sm:size-12 rounded-lg bg-black/[0.03] border border-black/5 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors duration-500">
                    <span className="font-mono text-lg font-bold">0{index + 1}</span>
                  </div>
                  <span className="text-sm font-instrument font-medium text-black/80">
                    {mod.price}
                  </span>
                </div>

                <div>
                  <h3 className="font-instrument text-2xl sm:text-3xl mb-2 text-black">
                    {mod.title}
                  </h3>
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-black/40">
                      {mod.date}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider text-blue-700">
                      <Video className="size-2.5" />
                      Live Zoom
                    </span>
                  </div>
                  <p className="mb-7 text-sm text-black/60 font-light">
                    {mod.description}
                  </p>
                </div>

                <div className="pt-6 border-t border-black/5">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <div className="inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1">
                      <div className="size-1.5 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[10px] font-mono uppercase tracking-wider text-green-700 font-medium">
                        {mod.status}
                      </span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-black/[0.02] px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-black/50 font-medium">
                      <Ticket className="size-3" />
                      <span>{mod.spots}</span>
                    </div>
                  </div>

                  <ul className="space-y-3">
                    {mod.topics.map((topic, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-black/70">
                        <span className="text-green-500 mt-0.5">•</span>
                        <span>{topic}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex items-start gap-2 rounded-lg bg-green-500/5 border border-green-500/10 px-3 py-2.5">
                    <Gift className="size-3.5 text-green-600 mt-0.5 shrink-0" />
                    <span className="text-xs text-green-700 font-medium">{mod.bonus}</span>
                  </div>
                </div>
              </CardContent>

              <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-0 mt-auto">
                <div className="pt-6 border-t border-black/5">
                  <Link
                    href={mod.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full rounded-full h-12 bg-black text-white font-mono text-xs font-bold uppercase tracking-[0.2em] hover:bg-black/80 hover:shadow-lg hover:shadow-black/5 transition-all duration-300"
                  >
                    Registrarme
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Full Bootcamp CTA Card */}
        <div className="mt-8 sm:mt-12">
          <PixelCard
            variant="default"
            gap={6}
            speed={40}
            colors="#ffffff,#a1a1aa,#52525b"
            noFocus
            className="group !h-auto !w-full !aspect-auto bg-black !border-black/20 !rounded-2xl"
          >
            <div className="relative z-10 p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 w-full">
              <div className="flex-1 text-center md:text-left">
                <div className="relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white/90 text-[10px] font-mono uppercase tracking-wider mb-6 overflow-hidden isolate">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[length:300%_100%] animate-[gradient-shift_4s_ease_infinite] bg-gradient-to-r from-purple-500/30 via-cyan-400/30 via-50% to-pink-500/30" />
                  <Sparkles className="relative size-3" />
                  <span className="relative">Mejor Valor</span>
                </div>
                <h3 className="font-instrument text-3xl sm:text-4xl md:text-5xl mb-4 text-white">
                  El Bootcamp Completo
                </h3>
                <p className="text-white/60 text-sm sm:text-base font-light max-w-xl mx-auto md:mx-0 mb-8">
                  Asegura tu lugar en los 3 módulos, obtén acceso a las grabaciones de por vida, comunidad privada y acceso a soporte directo de los instructores incluso después de las sesiones.
                </p>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 sm:gap-6 text-sm text-white/80 font-medium">
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">✓</span> Soporte offline
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">✓</span> Grabaciones de por vida
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">✓</span> Comunidad Privada
                  </div>
                </div>
              </div>

              <div className="w-full md:w-auto shrink-0 flex flex-col items-center gap-5">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-white/40 text-sm line-through decoration-white/20">$4,497 MXN</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-instrument text-4xl sm:text-5xl text-white">$4,000</span>
                    <span className="text-sm font-mono text-white/60">MXN</span>
                  </div>
                </div>
                <Link
                  href="https://buy.stripe.com/cNi3cp2bn1Iz5D9gsZgnK03"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full md:w-auto rounded-full px-10 h-14 bg-white text-black font-mono text-xs font-bold uppercase tracking-[0.2em] hover:bg-white/90 hover:scale-105 transition-all duration-300"
                >
                  Inscribirme al Bootcamp
                </Link>
                <div className="flex items-center gap-2 text-white/40 text-[10px] font-mono tracking-wider uppercase">
                  <Ticket className="size-3" />
                  <span>Cupo limitado</span>
                </div>
              </div>
            </div>
          </PixelCard>
        </div>
      </div>
    </section>
  );
}
