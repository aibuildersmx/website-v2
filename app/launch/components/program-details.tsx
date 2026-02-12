'use client'
import {TextEffect} from "@/app/launch/components/motion-primitives/text-effect"
import {AnimatedGroup} from "@/app/launch/components/motion-primitives/animated-group"
import {transitionVariants} from "@/lib/utils"

const stats = [
    { value: "6", label: "semanas" },
    { value: "50", label: "presencial en CDMX" },
    { value: "200", label: "remoto" },
    { value: "0%", label: "equity" },
    { value: "1", label: "Demo Day" },
]

export default function ProgramDetails() {
    return (
        <section id="detalles" className="py-24 sm:py-32 px-6">
            <div className="mx-auto max-w-5xl">
                <TextEffect
                    triggerOnView
                    preset="fade-in-blur"
                    speedSegment={0.3}
                    as="h2"
                    className="text-3xl sm:text-4xl md:text-5xl font-medium text-white mb-16"
                >
                    Detalles del programa
                </TextEffect>

                <AnimatedGroup
                    triggerOnView
                    variants={{
                        container: {
                            visible: {
                                transition: {
                                    staggerChildren: 0.08,
                                    delayChildren: 0.2,
                                },
                            },
                        },
                        ...transitionVariants,
                    }}
                    className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8"
                >
                    {stats.map((stat) => (
                        <div key={stat.label} className="text-center sm:text-left">
                            <span className="text-5xl sm:text-6xl md:text-7xl font-bold text-white font-mono tracking-tighter block">
                                {stat.value}
                            </span>
                            <span className="text-neutral-400 text-sm font-mono uppercase tracking-widest mt-2 block">
                                {stat.label}
                            </span>
                        </div>
                    ))}
                </AnimatedGroup>

                <TextEffect
                    triggerOnView
                    per="line"
                    preset="fade-in-blur"
                    speedSegment={0.3}
                    delay={0.5}
                    as="p"
                    className="mt-16 text-neutral-400 text-lg max-w-3xl leading-relaxed"
                >
                    Construye por las noches y fines de semana. Usa AI como tu superpoder. Mentores disponibles, pero la responsabilidad es tuya. Sin excusas, solo resultados.
                </TextEffect>
            </div>
        </section>
    )
}
