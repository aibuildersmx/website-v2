'use client'

import Image from 'next/image'
import Link from 'next/link'
import {
    ArrowUpRight,
    Building2,
    DollarSign,
    Handshake,
    MessageSquareText,
    Monitor,
    ShieldCheck,
    Sparkles,
    Users,
} from 'lucide-react'

import DecryptedText from '@/app/launch/components/DecryptedText'
import { AnimatedGroup } from '@/app/launch/components/motion-primitives/animated-group'
import { TextEffect } from '@/app/launch/components/motion-primitives/text-effect'
import { Button } from '@/app/launch/components/ui/button'
import { transitionVariants } from '@/lib/utils'

const applicationHref = 'mailto:talent@aibuilders.mx?subject=La%20Residencia%20Application'

const benefits = [
    {
        icon: Building2,
        title: 'Coworking gratis por 6 semanas',
        description: 'Coworking gratis en Haab, en Condesa, con tiempo protegido y foco total para avanzar tu proyecto.',
    },
    {
        icon: Sparkles,
        title: 'Credits y apoyo adicional',
        description:
            'OpenAI ya confirmó credits para builders seleccionados. Dependiendo del caso, también puede haber web hosting y un posible stipend de $500 USD.',
    },
    {
        icon: MessageSquareText,
        title: 'Consejo personal con el equipo de AIBM',
        description: 'Feedback directo sobre producto, narrativa y decisiones clave para destrabar ejecución.',
    },
    {
        icon: Users,
        title: 'Mentores en México y EE. UU.',
        description: 'Introducciones a operadores y builders con contexto real para ayudarte a pensar mejor.',
    },
    {
        icon: Handshake,
        title: 'Partners de distribución global',
        description: 'Conexiones con personas y equipos que pueden acelerar reach en México y Estados Unidos.',
    },
    {
        icon: Monitor,
        title: 'Digital Track',
        description:
            'Además de la residencia presencial, también ofreceremos una residencia digital para un cohorte pequeño, con un meet semanal.',
    },
]

const criteria = [
    'Solo para los mejores builders.',
    'Storytelling y execution importan tanto como skill.',
    'Preferencia para miembros activos de la comunidad AIBM.',
    'Alta integridad: vas a representar a la comunidad y la marca.',
    'Gente de cualquier skill, background y nivel de experiencia puede aplicar.',
    'No hay idea demasiado grande ni demasiado pequeña.',
]

export default function ResidencyPage() {
    const scrollTo = (id: string) => (event: React.MouseEvent) => {
        event.preventDefault()
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }

    return (
        <main className="relative overflow-hidden bg-[#f0f4f8]">
            {/* Hero */}
            <section className="relative min-h-screen flex items-center px-6 pt-24 pb-16 sm:pt-28">
                <img
                    src="/residency.png"
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover -scale-x-100"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#5a9fd4]/30 via-transparent to-[#f0f4f8]" />
                <div className="relative mx-auto w-full max-w-6xl">
                    <div className="max-w-4xl">
                        <div className="mb-8 sm:mb-10">
                            <DecryptedText
                                text="AIBM · 1 DE JUNIO – 15 DE JULIO"
                                animateOn="view"
                                revealDirection="start"
                                sequential
                                useOriginalCharsOnly={false}
                                speed={70}
                                className="font-mono text-[#1a2a3a]/70 uppercase text-xs sm:text-sm tracking-[0.3em]"
                            />
                        </div>

                        <TextEffect
                            preset="fade-in-blur"
                            speedSegment={0.3}
                            as="h1"
                            className="font-instrument text-[3.25rem] sm:text-[5rem] md:text-[6.1rem] lg:text-[7rem] font-medium tracking-tight text-[#1a2a3a] leading-[1.02]"
                        >
                            LA RESIDENCIA
                        </TextEffect>

                        <TextEffect
                            per="word"
                            preset="fade-in-blur"
                            speedSegment={0.3}
                            delay={0.25}
                            as="p"
                            className="mt-8 max-w-3xl text-xl sm:text-2xl md:text-3xl text-[#1a2a3a] font-medium leading-relaxed"
                        >
                            Seis semanas de espacio, mentoría y respaldo para builders con proyectos reales.
                        </TextEffect>

                        <AnimatedGroup
                            triggerOnView
                            variants={{
                                container: {
                                    visible: {
                                        transition: {
                                            staggerChildren: 0.05,
                                            delayChildren: 0.8,
                                        },
                                    },
                                },
                                ...transitionVariants,
                            }}
                            className="mt-12 flex flex-wrap gap-4"
                        >
                            <Button
                                asChild
                                size="lg"
                                className="bg-[#1a2a3a] text-white hover:bg-[#2a3a4a] px-10 py-7 text-lg font-medium rounded-xl"
                            >
                                <Link href={applicationHref}>
                                    Aplicar a La Residencia
                                </Link>
                            </Button>
                            <Button
                                asChild
                                size="lg"
                                variant="outline"
                                className="border-[#1a2a3a]/20 text-[#1a2a3a] hover:bg-[#1a2a3a]/5 px-10 py-7 text-lg font-medium rounded-xl"
                            >
                                <a href="#programa" onClick={scrollTo('programa')}>
                                    Ver detalles
                                </a>
                            </Button>
                        </AnimatedGroup>
                    </div>

                </div>
            </section>

            <section className="relative px-6 pb-12 sm:pb-16">
                <div className="mx-auto max-w-6xl">
                    <div className="flex flex-col items-center gap-5 text-center">
                        <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#5a9fd4]">
                            Patrocinado por
                        </p>
                        <div className="inline-flex items-center text-[#1a2a3a]">
                            <Image
                                src="/openai.svg"
                                alt="OpenAI"
                                width={28}
                                height={28}
                                className="mr-3 h-7 w-7"
                            />
                            <Image
                                src="/openai-text.svg"
                                alt="OpenAI wordmark"
                                width={96}
                                height={28}
                                className="h-6 w-auto"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits */}
            <section id="programa" className="relative px-6 py-24 sm:py-32 bg-white">
                <div className="mx-auto max-w-6xl">
                    <TextEffect
                        triggerOnView
                        preset="fade-in-blur"
                        speedSegment={0.3}
                        as="h2"
                        className="text-3xl sm:text-4xl md:text-5xl font-medium text-[#1a2a3a] mb-4"
                    >
                        Lo que recibes
                    </TextEffect>
                    <TextEffect
                        triggerOnView
                        per="line"
                        preset="fade-in-blur"
                        speedSegment={0.3}
                        delay={0.2}
                        as="p"
                        className="max-w-2xl text-lg text-[#3a5a7a] mb-16"
                    >
                        Esto no es solo un escritorio. Es tiempo, contexto y acceso para builders que pueden convertir
                        una oportunidad en impulso real.
                    </TextEffect>

                    <AnimatedGroup
                        triggerOnView
                        variants={{
                            container: {
                                visible: {
                                    transition: {
                                        staggerChildren: 0.08,
                                        delayChildren: 0.25,
                                    },
                                },
                            },
                            ...transitionVariants,
                        }}
                        className="grid auto-rows-fr grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                        >
                        {benefits.map((benefit) => (
                            <div
                                key={benefit.title}
                                className="flex h-full min-h-[270px] flex-col rounded-2xl border border-[#5a9fd4]/10 bg-[#f0f4f8]/60 p-8 transition-colors hover:bg-[#e8eff6]"
                            >
                                <benefit.icon className="mb-6 size-8 text-[#5a9fd4]" strokeWidth={1.5} />
                                <h3 className="min-h-[4.25rem] text-xl font-medium leading-tight text-[#1a2a3a]">
                                    {benefit.title}
                                </h3>
                                <p className="mt-5 text-sm leading-relaxed text-[#3a5a7a]">{benefit.description}</p>
                            </div>
                        ))}
                    </AnimatedGroup>

                    <TextEffect
                        triggerOnView
                        per="line"
                        preset="fade-in-blur"
                        speedSegment={0.3}
                        delay={0.3}
                        as="p"
                        className="mt-10 text-sm font-mono uppercase tracking-[0.25em] text-[#5a9fd4]/60"
                    >
                        La residencia sucede en Haab, CDMX.
                    </TextEffect>
                </div>
            </section>

            {/* Criteria */}
            <section id="perfil" className="relative px-6 py-24 sm:py-32 border-y border-[#5a9fd4]/10 bg-[#f0f4f8]">
                <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start">
                    <div>
                        <TextEffect
                            triggerOnView
                            preset="fade-in-blur"
                            speedSegment={0.3}
                            as="h2"
                            className="text-3xl sm:text-4xl md:text-5xl font-medium text-[#1a2a3a]"
                        >
                            A quién buscamos
                        </TextEffect>
                        <TextEffect
                            triggerOnView
                            per="line"
                            preset="fade-in-blur"
                            speedSegment={0.3}
                            delay={0.2}
                            as="p"
                            className="mt-6 max-w-md text-lg text-[#3a5a7a] leading-relaxed"
                        >
                            Queremos gente que construya en serio y que haga que la comunidad se vea mejor por tenerla cerca.
                        </TextEffect>
                    </div>

                    <AnimatedGroup
                        triggerOnView
                        variants={{
                            container: {
                                visible: {
                                    transition: {
                                        staggerChildren: 0.08,
                                        delayChildren: 0.25,
                                    },
                                },
                            },
                            ...transitionVariants,
                        }}
                        className="grid gap-4"
                    >
                        {criteria.map((item) => (
                            <div
                                key={item}
                                className="flex gap-4 rounded-2xl border border-[#5a9fd4]/10 bg-white/80 px-5 py-5"
                            >
                                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-[#5a9fd4]" strokeWidth={1.5} />
                                <p className="text-base leading-relaxed text-[#2a3a4a]">{item}</p>
                            </div>
                        ))}
                    </AnimatedGroup>
                </div>
            </section>

            {/* Three pillars */}
            <section className="relative px-6 py-24 sm:py-32 bg-white">
                <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-3">
                    {[
                        {
                            icon: Users,
                            title: 'Builders first',
                            description: 'No importa si eres engineer, designer, founder u operador. Importa si puedes mover algo real.',
                        },
                        {
                            icon: DollarSign,
                            title: 'Skin in the game',
                            description: 'El espacio y el apoyo son gratis, pero la barra es alta. Queremos compromiso, no turismo de startup.',
                        },
                        {
                            icon: ArrowUpRight,
                            title: 'Dos mercados',
                            description: 'La residencia está pensada para gente que puede construir con ambición local y distribución global.',
                        },
                    ].map((item) => (
                        <div key={item.title} className="border-t border-[#5a9fd4]/15 pt-6">
                            <item.icon className="size-6 text-[#5a9fd4] mb-4" strokeWidth={1.5} />
                            <h3 className="text-xl text-[#1a2a3a] mb-2">{item.title}</h3>
                            <p className="text-sm leading-relaxed text-[#3a5a7a]">{item.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section id="aplica" className="px-2 pb-16 sm:pb-24 md:pb-32 bg-white">
                <div className="mx-auto max-w-5xl rounded-3xl border border-[#5a9fd4]/15 bg-[#f0f4f8] px-6 py-12 md:py-20 lg:py-28">
                    <div className="text-center">
                        <TextEffect
                            triggerOnView
                            preset="fade-in-blur"
                            speedSegment={0.3}
                            as="h2"
                            className="text-balance text-3xl sm:text-4xl md:text-5xl font-medium text-[#1a2a3a]"
                        >
                            Si eres la persona correcta, aplica.
                        </TextEffect>
                        <TextEffect
                            triggerOnView
                            per="line"
                            preset="fade-in-blur"
                            speedSegment={0.3}
                            delay={0.25}
                            as="p"
                            className="mt-6 text-lg sm:text-xl text-[#3a5a7a] font-mono"
                        >
                            Empieza junio 1. Queremos builders con criterio, ambición e integridad.
                        </TextEffect>

                        <AnimatedGroup
                            triggerOnView
                            variants={{
                                container: {
                                    visible: {
                                        transition: {
                                            staggerChildren: 0.05,
                                            delayChildren: 0.65,
                                        },
                                    },
                                },
                                ...transitionVariants,
                            }}
                            className="mt-12 flex flex-wrap justify-center gap-4"
                        >
                            <Button
                                asChild
                                size="lg"
                                className="bg-[#1a2a3a] text-white hover:bg-[#2a3a4a] px-10 py-7 text-lg font-medium rounded-xl"
                            >
                                <Link href={applicationHref}>
                                    Abrir aplicación
                                </Link>
                            </Button>
                        </AnimatedGroup>

                        <p className="mt-8 text-[#5a9fd4]/60 text-xs font-mono uppercase tracking-widest">
                            APLICACIÓN POR EMAIL · SUBJECT: LA RESIDENCIA APPLICATION
                        </p>
                    </div>
                </div>
            </section>
        </main>
    )
}
