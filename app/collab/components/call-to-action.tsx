import {Button} from '@/app/collab/components/ui/button'
import Link from 'next/link'
import {TextEffect} from "@/app/collab/components/motion-primitives/text-effect"
import {AnimatedGroup} from "@/app/collab/components/motion-primitives/animated-group";
import {transitionVariants} from "@/lib/utils";

export default function CallToAction() {
    return (
        <section className="py-16 mx-2">
            <div className="mx-auto max-w-5xl rounded-3xl border px-6 py-12 md:py-20 lg:py-32">
                <div className="text-center">
                    <TextEffect
                        triggerOnView
                        preset="fade-in-blur"
                        speedSegment={0.3}
                        as="h2"
                        className="text-balance text-4xl font-semibold lg:text-5xl">
                        Let's build together.
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
                            size="lg">
                            <Link href="https://chat.whatsapp.com/EiadTAJlAyrJI5EI5bPF3t" target="_blank" rel="noopener noreferrer">
                                <span>Join community</span>
                            </Link>
                        </Button>

                        <Button
                            asChild
                            size="lg"
                            variant="outline">
                            <Link href="mailto:josejavier.re@gmail.com">
                                <span>Email</span>
                            </Link>
                        </Button>
                    </AnimatedGroup>
                </div>
            </div>
        </section>
    )
}
