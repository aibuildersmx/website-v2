'use client'

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
        icon: Monitor,
        title: 'Oficina privada 24/7',
        description: 'Incluye widescreen monitor y Mac mini para que llegues a construir, no a improvisar setup.',
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
        icon: Sparkles,
        title: 'Posibles credits y apoyo adicional',
        description: 'Dependiendo del caso: credits con frontier labs, web hosting y un posible stipend de $500 USD.',
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
        <main className="relative overflow-hidden bg-black">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_36%),radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.08),transparent_28%)]" />

            <section className="relative min-h-screen flex items-center px-6 pt-32 pb-16 sm:pt-36">
                <div className="mx-auto flex w-full max-w-6xl flex-col gap-14 lg:grid lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)] lg:items-start">
                    <div className="max-w-4xl">
                        <div className="mb-8 sm:mb-10">
                            <DecryptedText
                                text="AIBM · LA RESIDENCIA · EMPIEZA JUNIO 1"
                                animateOn="view"
                                revealDirection="start"
                                sequential
                                useOriginalCharsOnly={false}
                                speed={70}
                                className="font-mono text-neutral-400 uppercase text-xs sm:text-sm tracking-[0.3em]"
                            />
                        </div>

                        <TextEffect
                            preset="fade-in-blur"
                            speedSegment={0.3}
                            as="h1"
                            className="font-instrument text-[3.25rem] sm:text-[5rem] md:text-[6.1rem] lg:text-[7rem] font-medium tracking-tight text-white leading-[1.02]"
                        >
                            LA RESIDENCIA
                        </TextEffect>

                        <TextEffect
                            per="word"
                            preset="fade-in-blur"
                            speedSegment={0.3}
                            delay={0.25}
                            as="p"
                            className="mt-8 max-w-3xl text-xl sm:text-2xl md:text-3xl text-white font-medium"
                        >
                            Tiempo, espacio y respaldo para los builders que van a marcar la siguiente ola.
                        </TextEffect>

                        <TextEffect
                            per="line"
                            preset="fade-in-blur"
                            speedSegment={0.3}
                            delay={0.45}
                            as="p"
                            className="mt-6 max-w-2xl text-base sm:text-lg text-neutral-400 leading-relaxed"
                        >
                            Seis semanas de coworking gratis, oficina privada 24/7, consejo directo de AIBM y acceso
                            a mentores, partners y apoyo para empujar proyectos con ambicion real.
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
                                className="bg-white text-black hover:bg-white/90 px-10 py-7 text-lg font-medium rounded-xl"
                            >
                                <Link href={applicationHref}>
                                    Aplicar a La Residencia
                                </Link>
                            </Button>
                            <Button
                                asChild
                                size="lg"
                                variant="outline"
                                className="border-white/20 text-white hover:bg-white/10 px-10 py-7 text-lg font-medium rounded-xl"
                            >
                                <a href="#programa" onClick={scrollTo('programa')}>
                                    Ver detalles
                                </a>
                            </Button>
                        </AnimatedGroup>
                    </div>

                    <AnimatedGroup
                        triggerOnView
                        variants={{
                            container: {
                                visible: {
                                    transition: {
                                        staggerChildren: 0.08,
                                        delayChildren: 0.95,
                                    },
                                },
                            },
                            ...transitionVariants,
                        }}
                        className="grid gap-3 sm:max-w-md lg:ml-auto lg:pt-6"
                    >
                        {[
                            ['Duración', '6 semanas'],
                            ['Inicio', 'Junio 1'],
                            ['Formato', 'Coworking + oficina privada 24/7'],
                            ['Enfoque', 'Builders que fortalecen el ecosistema'],
                        ].map(([label, value]) => (
                            <div
                                key={label}
                                className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 backdrop-blur-sm"
                            >
                                <p className="text-[11px] font-mono uppercase tracking-[0.3em] text-white/45">{label}</p>
                                <p className="mt-2 text-lg text-white">{value}</p>
                            </div>
                        ))}
                    </AnimatedGroup>
                </div>
            </section>

            <section id="programa" className="relative px-6 py-24 sm:py-32">
                <div className="mx-auto max-w-6xl">
                    <TextEffect
                        triggerOnView
                        preset="fade-in-blur"
                        speedSegment={0.3}
                        as="h2"
                        className="text-3xl sm:text-4xl md:text-5xl font-medium text-white mb-4"
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
                        className="max-w-2xl text-lg text-neutral-400 mb-16"
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
                        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                        >
                        {benefits.map((benefit) => (
                            <div
                                key={benefit.title}
                                className="flex min-h-[270px] flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-8 hover:bg-white/[0.05] transition-colors"
                            >
                                <benefit.icon className="mb-6 size-8 text-white" strokeWidth={1.5} />
                                <h3 className="min-h-[4.25rem] text-xl font-medium leading-tight text-white">
                                    {benefit.title}
                                </h3>
                                <p className="mt-5 text-sm leading-relaxed text-neutral-400">{benefit.description}</p>
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
                        className="mt-10 text-sm font-mono uppercase tracking-[0.25em] text-white/35"
                    >
                        La residencia sucede en Haab, CDMX.
                    </TextEffect>
                </div>
            </section>

            <section id="perfil" className="relative px-6 py-24 sm:py-32 border-y border-white/10 bg-white/[0.02]">
                <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start">
                    <div>
                        <TextEffect
                            triggerOnView
                            preset="fade-in-blur"
                            speedSegment={0.3}
                            as="h2"
                            className="text-3xl sm:text-4xl md:text-5xl font-medium text-white"
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
                            className="mt-6 max-w-md text-lg text-neutral-400 leading-relaxed"
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
                                className="flex gap-4 rounded-2xl border border-white/10 bg-black/40 px-5 py-5"
                            >
                                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-white" strokeWidth={1.5} />
                                <p className="text-base leading-relaxed text-neutral-300">{item}</p>
                            </div>
                        ))}
                    </AnimatedGroup>
                </div>
            </section>

            <section className="relative px-6 py-24 sm:py-32">
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
                        <div key={item.title} className="border-t border-white/10 pt-6">
                            <item.icon className="size-6 text-white mb-4" strokeWidth={1.5} />
                            <h3 className="text-xl text-white mb-2">{item.title}</h3>
                            <p className="text-sm leading-relaxed text-neutral-400">{item.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section id="aplica" className="px-2 pb-16 sm:pb-24 md:pb-32">
                <div className="mx-auto max-w-5xl rounded-3xl border border-white/10 px-6 py-12 md:py-20 lg:py-28">
                    <div className="text-center">
                        <TextEffect
                            triggerOnView
                            preset="fade-in-blur"
                            speedSegment={0.3}
                            as="h2"
                            className="text-balance text-3xl sm:text-4xl md:text-5xl font-medium text-white"
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
                            className="mt-6 text-lg sm:text-xl text-neutral-400 font-mono"
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
                                className="bg-white text-black hover:bg-white/90 px-10 py-7 text-lg font-medium rounded-xl"
                            >
                                <Link href={applicationHref}>
                                    Abrir aplicación
                                </Link>
                            </Button>
                        </AnimatedGroup>

                        <p className="mt-8 text-neutral-500 text-xs font-mono uppercase tracking-widest">
                            APLICACIÓN POR EMAIL · SUBJECT: LA RESIDENCIA APPLICATION
                        </p>
                    </div>
                </div>
            </section>
        </main>
    )
}
