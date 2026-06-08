'use client'
import {Button} from '@/app/(site)/launch/components/ui/button'
import {TextEffect} from "@/app/(site)/launch/components/motion-primitives/text-effect"
import {AnimatedGroup} from "@/app/(site)/launch/components/motion-primitives/animated-group"
import DecryptedText from "@/app/(site)/launch/components/DecryptedText"
import {transitionVariants} from "@/lib/motion"

export default function HeroSection() {
    const scrollTo = (id: string) => (e: React.MouseEvent) => {
        e.preventDefault()
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }

    return (
        <section className="min-h-screen flex flex-col items-center justify-center px-6">
            <div className="max-w-4xl mx-auto text-center">
                <div className="mb-6">
                    <DecryptedText
                        text="PROGRAMA DE 6 SEMANAS"
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
                    className="text-7xl sm:text-[10rem] md:text-[12rem] font-bold tracking-tighter text-white leading-none"
                >
                    LAUNCH
                </TextEffect>

                <div className="mt-8 sm:mt-12 space-y-2">
                    <TextEffect
                        per="line"
                        preset="fade-in-blur"
                        speedSegment={0.3}
                        delay={0.3}
                        as="p"
                        className="text-lg sm:text-xl md:text-2xl text-neutral-400 font-mono"
                    >
                        No es un bootcamp.
                    </TextEffect>
                    <TextEffect
                        per="line"
                        preset="fade-in-blur"
                        speedSegment={0.3}
                        delay={0.5}
                        as="p"
                        className="text-lg sm:text-xl md:text-2xl text-neutral-400 font-mono"
                    >
                        No es una escuela.
                    </TextEffect>
                    <TextEffect
                        per="line"
                        preset="fade-in-blur"
                        speedSegment={0.3}
                        delay={0.7}
                        as="p"
                        className="text-lg sm:text-xl md:text-2xl text-neutral-400 font-mono"
                    >
                        No es una aceleradora.
                    </TextEffect>
                </div>

                <TextEffect
                    per="word"
                    preset="fade-in-blur"
                    speedSegment={0.3}
                    delay={1.0}
                    as="p"
                    className="mt-8 text-xl sm:text-2xl md:text-3xl text-white font-medium"
                >
                    Solo construye y lanza tu producto.
                </TextEffect>

                <AnimatedGroup
                    triggerOnView
                    variants={{
                        container: {
                            visible: {
                                transition: {
                                    staggerChildren: 0.05,
                                    delayChildren: 1.3,
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
                        <a href="#aplica" onClick={scrollTo('aplica')}>
                            Aplica ahora
                        </a>
                    </Button>
                    <Button
                        asChild
                        size="lg"
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10 px-10 py-7 text-lg font-medium rounded-xl"
                    >
                        <a href="#programa" onClick={scrollTo('programa')}>
                            Conoce mas
                        </a>
                    </Button>
                </AnimatedGroup>
            </div>
        </section>
    )
}
