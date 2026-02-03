import React from 'react'
import Link from 'next/link'
import {Button} from '@/app/collab/components/ui/button'
import {InfiniteSlider} from '@/app/collab/components/ui/infinite-slider'
import {ProgressiveBlur} from '@/app/collab/components/ui/progressive-blur'
import {TextEffect} from "@/app/collab/components/motion-primitives/text-effect";
import {AnimatedGroup} from "@/app/collab/components/motion-primitives/animated-group";
import V0Icon from "@/app/collab/components/icons/v0-icon";
import Image from 'next/image';
import DecryptedText from "@/app/collab/components/DecryptedText";
import {transitionVariants} from "@/lib/utils";

export default function HeroSection() {
    return (
        <main className="overflow-x-hidden">
            {/* Force dark styling for this section since dither is always dark */}
            <section className='min-h-screen max-h-screen flex flex-col items-center justify-center pointer-events-none dark'>
                {/* Text Content */}
                <div className="py-12 pointer-events-auto flex-1 flex items-center">
                    <div className="relative mx-auto flex max-w-xl flex-col px-6 lg:block">
                        <div className="mx-auto max-w-2xl text-left lg:ml-0">
                            <div>
                                <DecryptedText
                                    text="La primer y más grande comunidad de AI en México"
                                    animateOn="view"
                                    revealDirection="start"
                                    sequential
                                    useOriginalCharsOnly={false}
                                    speed={70}
                                    className='font-mono text-neutral-400 bg-black rounded-md uppercase'
                                />
                            </div>
                            <TextEffect
                                preset="fade-in-blur"
                                speedSegment={0.3}
                                as="h1"
                                className="max-w-2xl text-balance text-6xl font-medium md:text-7xl xl:text-8xl text-white">
                                AI Builders
                            </TextEffect>
                            <TextEffect
                                preset="fade-in-blur"
                                speedSegment={0.3}
                                as="h1"
                                className="max-w-2xl text-balance text-6xl font-medium md:text-7xl xl:text-8xl text-white">
                                México
                            </TextEffect>
                            <TextEffect
                                per="line"
                                preset="fade-in-blur"
                                speedSegment={0.3}
                                delay={0.5}
                                as="p"
                                className="mt-8 max-w-2xl text-pretty text-lg text-neutral-400 bg-black p-1 rounded-md">
                                Somos una comunidad de builders que transformamos ideas en productos digitales reales usando IA como nuestro superpoder.
                            </TextEffect>
                        </div>
                    </div>
                </div>

                {/* Infinite Slider - Partners (full width like features section) */}
                <div className="w-full pointer-events-auto pb-8">
                    <AnimatedGroup
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
                        className="group relative mx-auto max-w-5xl px-6"
                    >
                        <div className="flex flex-col items-center md:flex-row">
                            <div className="md:max-w-44 md:border-r md:border-neutral-700 md:pr-6">
                                <p className="text-end text-sm font-mono uppercase text-neutral-400">Hemos colaborado con</p>
                            </div>
                            <div className="relative py-6 md:w-[calc(100%-11rem)]">
                                <InfiniteSlider
                                    speedOnHover={20}
                                    speed={40}
                                    gap={112}>
                                    <div className="flex items-center">
                                        <V0Icon size={35} aria-label="v0 Logo" className='text-white mx-auto'/>
                                    </div>
                                    <div className="flex items-center">
                                        <Image src="/stripe.png" alt="Stripe Logo" width={80} height={35} className='mx-auto object-contain'/>
                                    </div>
                                    <div className="flex items-center">
                                        <Image src="/cursor-logo-dark.svg" alt="Cursor Logo" width={100} height={35} className='mx-auto object-contain'/>
                                    </div>
                                    <div className="flex items-center">
                                        <Image src="/rbr.svg" alt="RBR Logo" width={80} height={35} className='mx-auto object-contain'/>
                                    </div>
                                    <div className="flex items-center">
                                        <Image src="/google.png" alt="Google Logo" width={80} height={35} className='mx-auto object-contain'/>
                                    </div>
                                </InfiniteSlider>
                                <ProgressiveBlur
                                    className="pointer-events-none absolute left-0 top-0 h-full w-20"
                                    direction="left"
                                    blurIntensity={1}
                                />
                                <ProgressiveBlur
                                    className="pointer-events-none absolute right-0 top-0 h-full w-20"
                                    direction="right"
                                    blurIntensity={1}
                                />
                            </div>
                        </div>
                    </AnimatedGroup>
                </div>
            </section>
        </main>
    )
}
