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

import DecryptedText from '@/app/(site)/launch/components/DecryptedText'
import { AnimatedGroup } from '@/app/(site)/launch/components/motion-primitives/animated-group'
import { TextEffect } from '@/app/(site)/launch/components/motion-primitives/text-effect'
import { Button } from '@/app/(site)/launch/components/ui/button'
import { transitionVariants } from '@/lib/motion'

const applicationHref = 'https://forms.gle/Bga8XyuNzsHnk6cQA'

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
            'Credits de OpenAI, hosting web gratis y un posible stipend de $500 USD, dependiendo del caso.',
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
        <main className="relative overflow-hidden bg-white text-black">
            {/* Hero */}
            <section className="relative flex min-h-screen items-center overflow-hidden px-4 pb-16 pt-24 sm:px-6 sm:pt-28">
                <Image
                    src="/images/residencia/engraving-collage.jpg"
                    alt=""
                    fill
                    priority
                    className="absolute inset-0 h-full w-full object-cover opacity-45 mix-blend-multiply grayscale contrast-150"
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(255,255,255,0.78),transparent_32%),linear-gradient(90deg,rgba(255,255,255,0.97)_0%,rgba(255,255,255,0.86)_42%,rgba(255,255,255,0.34)_100%)]" />
                <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-white to-transparent" />
                <div className="relative mx-auto w-full max-w-6xl">
                    <div className="max-w-4xl">
                        <div className="mb-8 sm:mb-10">
                            <DecryptedText
                                text="AIBM · 24 DE JUNIO – 7 DE AGOSTO"
                                animateOn="view"
                                revealDirection="start"
                                sequential
                                useOriginalCharsOnly={false}
                                speed={18}
                                className="font-mono text-black/60 uppercase text-xs sm:text-sm tracking-[0.3em]"
                            />
                        </div>

                        <TextEffect
                            preset="fade-in-blur"
                            speedSegment={1.2}
                            as="h1"
                            className="font-instrument text-[3.25rem] sm:text-[5rem] md:text-[6.1rem] lg:text-[7rem] font-medium text-black leading-[1.02]"
                        >
                            LA RESIDENCIA
                        </TextEffect>

                        <TextEffect
                            preset="fade-in-blur"
                            speedSegment={1.2}
                            delay={0.05}
                            as="p"
                            className="mt-8 max-w-3xl font-sans text-xl font-normal leading-relaxed text-black/65 sm:text-2xl md:text-3xl"
                        >
                            Seis semanas de espacio, mentoría y respaldo para builders con proyectos reales.
                        </TextEffect>

                        <AnimatedGroup
                            triggerOnView
                            variants={{
                                container: {
                                    visible: {
                                        transition: {
                                            staggerChildren: 0.015,
                                            delayChildren: 0.12,
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
                                className="bg-black text-white hover:bg-black/90 px-10 py-7 font-sans text-lg font-medium rounded-xl"
                            >
                                <Link href={applicationHref}>
                                    Aplicar a La Residencia
                                </Link>
                            </Button>
                            <Button
                                asChild
                                size="lg"
                                variant="outline"
                                className="border-black/40 bg-white/40 text-black hover:border-black hover:bg-white/80 hover:text-black hover:ring-1 hover:ring-black focus-visible:border-black px-10 py-7 font-sans text-lg font-medium rounded-xl"
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
                        <p className="font-mono text-xs uppercase tracking-[0.3em] text-black/40">
                            Partners
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5 text-black">
                            <div className="inline-flex items-center gap-3" aria-label="Codex">
                                <div
                                    aria-hidden
                                    className="h-7 w-7 bg-current"
                                    style={{
                                        WebkitMaskImage: 'url(/codex.svg)',
                                        maskImage: 'url(/codex.svg)',
                                        WebkitMaskRepeat: 'no-repeat',
                                        maskRepeat: 'no-repeat',
                                        WebkitMaskPosition: 'center',
                                        maskPosition: 'center',
                                        WebkitMaskSize: 'contain',
                                        maskSize: 'contain',
                                    }}
                                />
                                <span className="font-mono text-xl font-semibold leading-none">
                                    Codex
                                </span>
                            </div>
                            <div
                                role="img"
                                aria-label="v0"
                                className="h-6"
                                style={{
                                    aspectRatio: '39.914 / 20.658',
                                    backgroundColor: 'currentColor',
                                    WebkitMaskImage: 'url(/v0-logo-black.svg)',
                                    maskImage: 'url(/v0-logo-black.svg)',
                                    WebkitMaskRepeat: 'no-repeat',
                                    maskRepeat: 'no-repeat',
                                    WebkitMaskPosition: 'center',
                                    maskPosition: 'center',
                                    WebkitMaskSize: 'contain',
                                    maskSize: 'contain',
                                }}
                            />
                            <div
                                role="img"
                                aria-label="Cursor"
                                className="h-6"
                                style={{
                                    aspectRatio: '2238.7 / 532.09',
                                    backgroundColor: 'currentColor',
                                    WebkitMaskImage: 'url(/cursor-logo-dark.svg)',
                                    maskImage: 'url(/cursor-logo-dark.svg)',
                                    WebkitMaskRepeat: 'no-repeat',
                                    maskRepeat: 'no-repeat',
                                    WebkitMaskPosition: 'center',
                                    maskPosition: 'center',
                                    WebkitMaskSize: 'contain',
                                    maskSize: 'contain',
                                }}
                            />
                            <div
                                role="img"
                                aria-label="Reve"
                                className="h-7"
                                style={{
                                    aspectRatio: '776 / 259',
                                    backgroundColor: 'currentColor',
                                    WebkitMaskImage: 'url(/reve-logo-black.svg)',
                                    maskImage: 'url(/reve-logo-black.svg)',
                                    WebkitMaskRepeat: 'no-repeat',
                                    maskRepeat: 'no-repeat',
                                    WebkitMaskPosition: 'center',
                                    maskPosition: 'center',
                                    WebkitMaskSize: 'contain',
                                    maskSize: 'contain',
                                }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits */}
            <section id="programa" className="relative overflow-hidden border-t border-black/5 bg-white px-4 py-16 text-black sm:px-6 sm:py-24 md:py-32">
                <div className="mx-auto max-w-6xl">
                    <TextEffect
                        triggerOnView
                        preset="fade-in-blur"
                        speedSegment={1.2}
                        as="h2"
                        className="font-instrument text-3xl sm:text-4xl md:text-5xl font-medium leading-[1.1] text-black mb-4"
                    >
                        Lo que recibes
                    </TextEffect>
                    <TextEffect
                        triggerOnView
                        per="line"
                        preset="fade-in-blur"
                        speedSegment={1.2}
                        delay={0.05}
                        as="p"
                        className="mb-16 max-w-2xl font-sans text-lg leading-relaxed text-black/60"
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
                                        staggerChildren: 0.02,
                                        delayChildren: 0.05,
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
                                className="flex h-full min-h-[270px] flex-col rounded-xl border border-black/10 bg-white p-8 transition-all duration-500 hover:border-black/20 hover:shadow-lg hover:shadow-black/5 sm:rounded-2xl"
                            >
                                <benefit.icon className="mb-6 size-8 text-black/60" strokeWidth={1.5} />
                                <h3 className="min-h-[4.25rem] font-sans text-xl font-medium leading-tight text-black">
                                    {benefit.title}
                                </h3>
                                <p className="mt-5 font-sans text-sm leading-relaxed text-black/60">{benefit.description}</p>
                            </div>
                        ))}
                    </AnimatedGroup>

                </div>
            </section>

            {/* Criteria */}
            <section id="perfil" className="relative overflow-hidden border-t border-black/5 bg-white px-4 py-16 text-black sm:px-6 sm:py-24 md:py-32">
                <Image
                    src="/images/residencia/engraving-collage.jpg"
                    alt=""
                    fill
                    className="absolute inset-0 h-full w-full object-cover opacity-[0.08] mix-blend-multiply grayscale contrast-150"
                />
                <div className="relative mx-auto grid max-w-6xl gap-14 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start">
                    <div>
                        <TextEffect
                            triggerOnView
                            preset="fade-in-blur"
                            speedSegment={1.2}
                            as="h2"
                            className="font-instrument text-3xl sm:text-4xl md:text-5xl font-medium leading-[1.1] text-black"
                        >
                            A quién buscamos
                        </TextEffect>
                        <TextEffect
                            triggerOnView
                            per="line"
                            preset="fade-in-blur"
                            speedSegment={1.2}
                            delay={0.05}
                            as="p"
                            className="mt-6 max-w-md font-sans text-lg leading-relaxed text-black/60"
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
                                        staggerChildren: 0.02,
                                        delayChildren: 0.05,
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
                                className="relative flex gap-4 rounded-xl border border-black/10 bg-white/85 px-5 py-5 backdrop-blur-sm sm:rounded-2xl"
                            >
                                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-black/60" strokeWidth={1.5} />
                                <p className="font-sans text-base leading-relaxed text-black/70">{item}</p>
                            </div>
                        ))}
                    </AnimatedGroup>
                </div>
            </section>

            {/* Three pillars */}
            <section className="relative border-t border-black/5 bg-white px-4 py-16 text-black sm:px-6 sm:py-24 md:py-32">
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
                        <div key={item.title} className="border-t border-black/10 pt-6">
                            <item.icon className="size-6 text-black/60 mb-4" strokeWidth={1.5} />
                            <h3 className="text-xl text-black mb-2">{item.title}</h3>
                            <p className="text-sm leading-relaxed text-black/60">{item.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section id="aplica" className="bg-white px-2 pb-16 sm:pb-24 md:pb-32">
                <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-black/10 bg-white px-6 py-12 md:py-20 lg:py-28">
                    <Image
                        src="/images/residencia/engraving-collage.jpg"
                        alt=""
                        fill
                        className="absolute inset-0 h-full w-full object-cover opacity-15 mix-blend-multiply grayscale contrast-150"
                    />
                    <div className="relative text-center">
                        <TextEffect
                            triggerOnView
                            preset="fade-in-blur"
                            speedSegment={1.2}
                            as="h2"
                            className="text-balance font-instrument text-3xl sm:text-4xl md:text-5xl font-medium leading-[1.1] text-black"
                        >
                            Si eres la persona correcta, aplica.
                        </TextEffect>
                        <TextEffect
                            triggerOnView
                            per="line"
                            preset="fade-in-blur"
                            speedSegment={1.2}
                            delay={0.05}
                            as="p"
                            className="mt-6 text-lg sm:text-xl text-black/70 font-mono"
                        >
                            Empieza junio 24. Queremos builders con criterio, ambición e integridad.
                        </TextEffect>

                        <AnimatedGroup
                            triggerOnView
                            variants={{
                                container: {
                                    visible: {
                                        transition: {
                                            staggerChildren: 0.015,
                                            delayChildren: 0.1,
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
                                className="bg-black text-white hover:bg-black/90 px-10 py-7 font-sans text-lg font-medium rounded-xl"
                            >
                                <Link href={applicationHref}>
                                    Abrir aplicación
                                </Link>
                            </Button>
                        </AnimatedGroup>
                    </div>
                </div>
            </section>
        </main>
    )
}
