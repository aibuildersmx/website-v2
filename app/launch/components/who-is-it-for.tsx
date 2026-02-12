'use client'
import {Lightbulb, Code, Palette, Hammer} from 'lucide-react'
import {TextEffect} from "@/app/launch/components/motion-primitives/text-effect"
import {AnimatedGroup} from "@/app/launch/components/motion-primitives/animated-group"
import {transitionVariants} from "@/lib/utils"

const personas = [
    {
        icon: Lightbulb,
        title: "Founders",
        description: "Tienes una idea y necesitas lanzarla. No mas planeacion, es hora de construir.",
    },
    {
        icon: Code,
        title: "Engineers",
        description: "Sabes programar pero nunca has lanzado tu propio producto. Este es tu momento.",
    },
    {
        icon: Palette,
        title: "Designers",
        description: "Quieres ir mas alla del prototipo en Figma. Construye algo que la gente use.",
    },
    {
        icon: Hammer,
        title: "Builders",
        description: "No necesitas un titulo. Si construyes cosas, este programa es para ti.",
    },
]

export default function WhoIsItFor() {
    return (
        <section className="py-24 sm:py-32 px-6">
            <div className="mx-auto max-w-5xl">
                <TextEffect
                    triggerOnView
                    preset="fade-in-blur"
                    speedSegment={0.3}
                    as="h2"
                    className="text-3xl sm:text-4xl md:text-5xl font-medium text-white mb-4"
                >
                    Para quien es Launch
                </TextEffect>
                <TextEffect
                    triggerOnView
                    per="line"
                    preset="fade-in-blur"
                    speedSegment={0.3}
                    delay={0.2}
                    as="p"
                    className="text-neutral-400 text-lg max-w-2xl mb-16"
                >
                    Si tienes una idea y quieres lanzarla, esto es para ti. No importa tu background.
                </TextEffect>

                <AnimatedGroup
                    triggerOnView
                    variants={{
                        container: {
                            visible: {
                                transition: {
                                    staggerChildren: 0.1,
                                    delayChildren: 0.3,
                                },
                            },
                        },
                        ...transitionVariants,
                    }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                >
                    {personas.map((persona) => (
                        <div
                            key={persona.title}
                            className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 hover:bg-white/[0.05] transition-colors"
                        >
                            <persona.icon className="size-8 text-white mb-4" strokeWidth={1.5} />
                            <h3 className="text-xl font-medium text-white mb-2">
                                {persona.title}
                            </h3>
                            <p className="text-neutral-400 text-sm leading-relaxed">
                                {persona.description}
                            </p>
                        </div>
                    ))}
                </AnimatedGroup>
            </div>
        </section>
    )
}
