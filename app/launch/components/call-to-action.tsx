'use client'
import {Button} from '@/app/launch/components/ui/button'
import Link from 'next/link'
import {TextEffect} from "@/app/launch/components/motion-primitives/text-effect"
import {AnimatedGroup} from "@/app/launch/components/motion-primitives/animated-group"
import {transitionVariants} from "@/lib/utils"

export default function CallToAction() {
    return (
        <section id="aplica" className="py-16 sm:py-24 md:py-32 mx-2">
            <div className="mx-auto max-w-5xl rounded-3xl border border-white/10 px-6 py-12 md:py-20 lg:py-32">
                <div className="text-center">
                    <TextEffect
                        triggerOnView
                        preset="fade-in-blur"
                        speedSegment={0.3}
                        as="h2"
                        className="text-balance text-3xl sm:text-4xl md:text-5xl font-medium lg:text-5xl text-white"
                    >
                        Listo para lanzar?
                    </TextEffect>
                    <TextEffect
                        triggerOnView
                        per="line"
                        preset="fade-in-blur"
                        speedSegment={0.3}
                        delay={0.3}
                        as="p"
                        className="mt-6 text-neutral-400 text-lg sm:text-xl font-mono"
                    >
                        6 semanas. Tu producto. Tu equipo. Sin excusas.
                    </TextEffect>
                    <AnimatedGroup
                        triggerOnView
                        variants={{
                            container: {
                                visible: {
                                    transition: {
                                        staggerChildren: 0.05,
                                        delayChildren: 0.75,
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
                            <Link href="https://chat.whatsapp.com/EiadTAJlAyrJI5EI5bPF3t" target="_blank" rel="noopener noreferrer">
                                <span>Aplica ahora</span>
                            </Link>
                        </Button>

                        <Button
                            asChild
                            size="lg"
                            variant="outline"
                            className="border-white/20 text-white hover:bg-white/10 px-10 py-7 text-lg font-medium rounded-xl"
                        >
                            <Link href="mailto:josejavier.re@gmail.com">
                                <span>Tengo preguntas</span>
                            </Link>
                        </Button>
                    </AnimatedGroup>

                    <p className="mt-8 text-neutral-500 text-xs font-mono uppercase tracking-widest">
                        50 lugares presencial / 200 remoto — Cupo limitado
                    </p>
                </div>
            </div>
        </section>
    )
}
