import {Button} from '@/app/collab/components/ui/button'
import Link from 'next/link'
import {TextEffect} from "@/app/collab/components/motion-primitives/text-effect"
import {AnimatedGroup} from "@/app/collab/components/motion-primitives/animated-group";
import {transitionVariants} from "@/lib/utils";

export default function CallToAction() {
    return (
        <section className="py-16 sm:py-24 md:py-32 mx-2 bg-background">
            <div className="mx-auto max-w-5xl rounded-3xl border border-black/10 dark:border-white/10 px-6 py-12 md:py-20 lg:py-32">
                <div className="text-center">
                    <TextEffect
                        triggerOnView
                        preset="fade-in-blur"
                        speedSegment={0.3}
                        as="h2"
                        className="text-balance text-3xl sm:text-4xl md:text-5xl font-medium lg:text-5xl font-instrument text-foreground">
                        Construyamos juntos.
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
                            className="bg-foreground text-background hover:bg-foreground/90 px-10 py-7 text-lg font-medium rounded-xl">
                            <Link href="https://chat.whatsapp.com/EiadTAJlAyrJI5EI5bPF3t" target="_blank" rel="noopener noreferrer">
                                <span>Únete a la comunidad</span>
                            </Link>
                        </Button>

                        <Button
                            asChild
                            size="lg"
                            variant="outline"
                            className="border-black/20 dark:border-white/20 text-foreground hover:bg-foreground/10 px-10 py-7 text-lg font-medium rounded-xl">
                            <Link href="mailto:josejavier.re@gmail.com">
                                <span>Contáctanos</span>
                            </Link>
                        </Button>
                    </AnimatedGroup>
                </div>
            </div>
        </section>
    )
}
