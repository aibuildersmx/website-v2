'use client'

import Link from 'next/link'
import { Briefcase, Mail, Newspaper, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HeroHeader } from '@/components/header'
import { NewsletterSignup } from '@/components/newsletter-signup'
import { BUILDER_COUNT_FORMATTED } from '@/lib/constants'

const VALUE_CARDS = [
    {
        icon: Newspaper,
        title: 'IA al día',
        description:
            'Los lanzamientos, modelos, herramientas y research que vale la pena seguir — explicado sin ruido.',
    },
    {
        icon: Users,
        title: 'LatAm tech y AI',
        description:
            'Qué está pasando en México y Latinoamérica: startups, comunidades, eventos, talento e infraestructura.',
    },
    {
        icon: Briefcase,
        title: 'Oportunidades',
        description:
            'Roles, proyectos y señales del mercado para quienes están construyendo productos de IA en la región.',
    },
]

export default function NewsletterPage() {
    return (
        <div className="relative min-h-screen bg-white text-black font-inter">
            <HeroHeader />

            {/* Hero — calm, no dither, no animation */}
            <section className="relative pt-32 sm:pt-40 pb-16 sm:pb-24">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center space-y-5 sm:space-y-6">
                    <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-black/40">
                        NEWSLETTER
                    </span>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-instrument font-medium leading-[1.1] text-balance">
                        Las mejores actualizaciones de IA, cada semana.
                    </h1>
                    <p className="font-inter text-base sm:text-lg md:text-xl text-black/60 leading-relaxed max-w-2xl mx-auto">
                        Curado por builders en el ecosistema de IA en México — no es un digest traducido del inglés. Updates de modelos, comunidad, eventos y vacantes en una sola lectura semanal.
                    </p>
                    <div className="pt-4">
                        <Button
                            asChild
                            size="lg"
                            className="bg-black text-white hover:bg-black/90 rounded-xl px-8 py-6 font-inter text-base"
                        >
                            <Link href="#subscribe">Suscribirme</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Value cards */}
            <section className="relative py-12 sm:py-16 md:py-24 border-t border-black/5">
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
                        {VALUE_CARDS.map((card) => (
                            <article
                                key={card.title}
                                className="group border border-black/10 rounded-xl sm:rounded-2xl p-6 sm:p-8 hover:border-black/20 hover:shadow-lg hover:shadow-black/5 transition-all duration-500"
                            >
                                <span className="inline-flex items-center justify-center size-10 rounded-full bg-black/[0.03] text-black/60 group-hover:bg-black group-hover:text-white transition-all duration-500">
                                    <card.icon className="size-5" />
                                </span>
                                <h2 className="mt-5 text-xl sm:text-2xl font-instrument font-medium">
                                    {card.title}
                                </h2>
                                <p className="mt-2 font-inter text-sm sm:text-base text-black/60 leading-relaxed">
                                    {card.description}
                                </p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* Subscribe */}
            <section
                id="subscribe"
                className="relative py-16 sm:py-24 md:py-32 border-t border-black/5 scroll-mt-20 sm:scroll-mt-24"
            >
                <div className="mx-auto max-w-2xl px-4 sm:px-6">
                    <div className="bg-black text-white p-8 sm:p-12 rounded-2xl sm:rounded-3xl overflow-hidden relative">
                        <div
                            className="absolute inset-0 opacity-10 pointer-events-none"
                            style={{
                                backgroundImage:
                                    'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                                backgroundSize: '24px 24px',
                            }}
                        />
                        <div className="relative z-10">
                            <div className="size-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 sm:mb-8">
                                <Mail className="size-6 text-white" />
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-instrument font-medium mb-4">
                                Suscríbete gratis
                            </h2>
                            <p className="font-inter text-white/60 mb-6 sm:mb-8 text-sm sm:text-base">
                                Sin spam. Cancela cuando quieras.
                            </p>
                            <NewsletterSignup tone="onDark" font="inter" />
                            <p className="mt-6 text-[10px] font-mono text-white/30 uppercase tracking-widest text-center">
                                Únete a +{BUILDER_COUNT_FORMATTED} builders hoy
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#212121] py-12 sm:py-16">
                <p className="text-white/30 text-[10px] sm:text-xs font-mono tracking-widest uppercase text-center px-4">
                    2026 — built in v0, hand crafted in cursor, made with ♥︎ by aibuilders.mx
                </p>
            </footer>
        </div>
    )
}
