'use client'
import {TextEffect} from "@/app/(site)/launch/components/motion-primitives/text-effect"
import {AnimatedGroup} from "@/app/(site)/launch/components/motion-primitives/animated-group"
import {transitionVariants} from "@/lib/motion"

const steps = [
    {
        number: "01",
        title: "Construye",
        description: "De idea a prototipo en la primera semana. Sin overthinking, sin perfeccion.",
    },
    {
        number: "02",
        title: "Lanza",
        description: "Pon tu producto frente a usuarios reales. Feedback real desde el dia uno.",
    },
    {
        number: "03",
        title: "Prueba",
        description: "Valida con datos, no con opiniones. Metricas que importan.",
    },
    {
        number: "04",
        title: "Itera",
        description: "Mejora cada semana basandote en feedback real de tus usuarios.",
    },
    {
        number: "05",
        title: "Vende",
        description: "Demo Day: presenta tu producto al mundo. Inversores, mentores y la comunidad.",
    },
]

export default function HowItWorks() {
    return (
        <section className="py-24 sm:py-32 px-6">
            <div className="mx-auto max-w-5xl">
                <TextEffect
                    triggerOnView
                    preset="fade-in-blur"
                    speedSegment={0.3}
                    as="h2"
                    className="text-3xl sm:text-4xl md:text-5xl font-medium text-white mb-16"
                >
                    Como funciona
                </TextEffect>

                <AnimatedGroup
                    triggerOnView
                    variants={{
                        container: {
                            visible: {
                                transition: {
                                    staggerChildren: 0.12,
                                    delayChildren: 0.2,
                                },
                            },
                        },
                        ...transitionVariants,
                    }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6"
                >
                    {steps.map((step) => (
                        <div
                            key={step.number}
                            className="relative"
                        >
                            <span className="text-5xl sm:text-6xl font-bold text-white/[0.06] font-mono block mb-4">
                                {step.number}
                            </span>
                            <h3 className="text-xl font-medium text-white mb-2">
                                {step.title}
                            </h3>
                            <p className="text-neutral-400 text-sm leading-relaxed">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </AnimatedGroup>
            </div>
        </section>
    )
}
