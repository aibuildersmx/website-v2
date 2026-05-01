'use client'

import Link from 'next/link'
import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import Dither from '@/components/Dither'
import SplitText from '@/components/SplitText'
import { HeroHeader } from '@/components/header'
import { Button } from '@/components/ui/button'
import { HERO_COPY, HERO_LOGOS, buildMailto } from './enterprise-data'
import { PartnerLogoStrip } from './partner-logo-strip'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export function EnterpriseHero() {
    const gridRef = useRef<HTMLDivElement>(null)

    useGSAP(
        () => {
            if (!gridRef.current) return
            const images = gridRef.current.children
            gsap.fromTo(
                images,
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    stagger: 0.1,
                    ease: 'power3.out',
                    scrollTrigger: { trigger: gridRef.current, start: 'top 80%', once: true },
                },
            )
        },
        { scope: gridRef },
    )

    return (
        <div className="relative">
            <HeroHeader />
            <section className="fixed top-0 left-0 h-[100dvh] w-full flex flex-col pointer-events-none -z-10 bg-[#212121]">
                <div className="absolute inset-0 pointer-events-auto">
                    <Dither />
                </div>

                <div className="flex-1 flex items-center w-full pt-16 pb-2 sm:pt-20 sm:pb-4 md:pt-32 md:pb-8 relative z-10 overflow-hidden">
                    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 lg:gap-16">
                            {/* Left: copy */}
                            <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left">
                                <span className="mb-3 sm:mb-4 text-[10px] sm:text-xs font-mono uppercase tracking-widest text-white/60">
                                    {HERO_COPY.eyebrow}
                                </span>
                                <SplitText
                                    text={HERO_COPY.headline}
                                    className="text-balance text-3xl sm:text-4xl md:text-5xl font-medium text-white lg:text-6xl xl:text-7xl leading-[1.1] font-instrument text-center lg:text-left"
                                    delay={30}
                                    duration={0.8}
                                    ease="power3.out"
                                    splitType="chars"
                                    from={{ opacity: 0, y: 40 }}
                                    to={{ opacity: 1, y: 0 }}
                                    threshold={0.1}
                                    rootMargin="-50px"
                                    tag="h1"
                                    textAlign="inherit"
                                />
                                <p className="mt-3 sm:mt-6 md:mt-8 text-pretty text-sm sm:text-lg md:text-xl text-white/80 max-w-lg">
                                    {HERO_COPY.subhead}
                                </p>
                                <div className="mt-8 md:mt-10 hidden lg:flex items-center gap-3 pointer-events-auto">
                                    <Button
                                        asChild
                                        size="lg"
                                        className="bg-white text-black hover:bg-white/90 px-10 py-7 text-lg font-medium rounded-xl"
                                    >
                                        <Link href={buildMailto(HERO_COPY.primaryCtaSubject)}>
                                            <span className="text-nowrap">{HERO_COPY.primaryCtaLabel}</span>
                                        </Link>
                                    </Button>
                                    <Link
                                        href={HERO_COPY.secondaryCtaHref}
                                        className="px-6 py-4 rounded-xl border border-white/20 text-white/80 hover:text-white hover:border-white/40 hover:bg-white/5 text-sm font-mono uppercase tracking-widest transition-all"
                                    >
                                        {HERO_COPY.secondaryCtaLabel}
                                    </Link>
                                </div>
                            </div>

                            {/* Right: 2x2 image grid (reuse existing hero1-4) */}
                            <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-end pointer-events-auto">
                                <div
                                    ref={gridRef}
                                    className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 w-full max-w-[360px] sm:max-w-[400px] md:max-w-[500px] lg:max-w-none"
                                >
                                    {(['/hero1.avif', '/hero2.avif', '/hero3.avif', '/hero4.avif'] as const).map(
                                        (src, i) => (
                                            <div
                                                key={src}
                                                className="relative aspect-square w-full bg-[#212121]/80 rounded-xl sm:rounded-2xl border border-white/10 overflow-hidden"
                                            >
                                                <img
                                                    src={src}
                                                    alt={`AI Builders hero ${i + 1}`}
                                                    className="absolute inset-0 w-full h-full object-cover grayscale transition-transform duration-500 hover:scale-105"
                                                />
                                            </div>
                                        ),
                                    )}
                                </div>

                                {/* Mobile CTAs under grid */}
                                <div className="mt-3 sm:mt-6 flex lg:hidden w-full gap-2 sm:gap-3 pointer-events-auto shrink-0">
                                    <Button
                                        asChild
                                        size="lg"
                                        className="flex-1 bg-white text-black hover:bg-white/90 px-4 sm:px-10 py-4 sm:py-7 text-sm sm:text-lg font-medium rounded-xl"
                                    >
                                        <Link href={buildMailto(HERO_COPY.primaryCtaSubject)}>
                                            <span className="text-nowrap">{HERO_COPY.primaryCtaLabel}</span>
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Partner strip (desktop only) */}
                <div className="relative z-10 pb-3 sm:pb-6 md:pb-8 shrink-0 hidden md:block pointer-events-auto">
                    <PartnerLogoStrip
                        logos={HERO_LOGOS}
                        eyebrow={HERO_COPY.partnersEyebrow}
                        variant="dark"
                        size="sm"
                    />
                </div>
            </section>
        </div>
    )
}
