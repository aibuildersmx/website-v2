'use client'
import {Users, Wrench, Target, Rocket} from 'lucide-react'
import {TextEffect} from "@/app/(site)/launch/components/motion-primitives/text-effect"
import {AnimatedGroup} from "@/app/(site)/launch/components/motion-primitives/animated-group"
import {transitionVariants} from "@/lib/motion"

const features = [
    {
        icon: Users,
        title: "Peer-to-peer",
        description: "Sin instructores. Aprendes construyendo junto a otros builders que estan en las mismas trincheras.",
    },
    {
        icon: Wrench,
        title: "Workshops semanales",
        description: "Sesiones practicas con mentores que ya lanzaron productos. Nada teorico, todo aplicable.",
    },
    {
        icon: Target,
        title: "Milestones semanales",
        description: "Objetivos claros cada semana. Sabes exactamente que tienes que entregar y cuando.",
    },
    {
        icon: Rocket,
        title: "Solo construye",
        description: "Nada de slides. Nada de teoria. Llegas, construyes tu producto y lo lanzas al mundo.",
    },
]

export default function WhatItIs() {
    return (
        <section id="programa" className="py-24 sm:py-32 px-6">
            <div className="mx-auto max-w-5xl">
                <TextEffect
                    triggerOnView
                    preset="fade-in-blur"
                    speedSegment={0.3}
                    as="h2"
                    className="text-3xl sm:text-4xl md:text-5xl font-medium text-white mb-4"
                >
                    Que es Launch
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
                    Un programa de 6 semanas donde builders construyen y lanzan productos reales, juntos.
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
                    {features.map((feature) => (
                        <div
                            key={feature.title}
                            className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 hover:bg-white/[0.05] transition-colors"
                        >
                            <feature.icon className="size-8 text-white mb-4" strokeWidth={1.5} />
                            <h3 className="text-xl font-medium text-white mb-2">
                                {feature.title}
                            </h3>
                            <p className="text-neutral-400 text-sm leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </AnimatedGroup>
            </div>
        </section>
    )
}
