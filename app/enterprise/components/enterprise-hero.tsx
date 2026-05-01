import Link from 'next/link'

import { HeroHeader } from '@/components/header'
import { Button } from '@/components/ui/button'
import { HERO_COPY, HERO_LOGOS, buildMailto } from './enterprise-data'
import { PartnerLogoStrip } from './partner-logo-strip'

export function EnterpriseHero() {
    return (
        <div className="relative bg-white text-black">
            <HeroHeader />
            <section className="relative pt-32 sm:pt-40 md:pt-48 pb-12 sm:pb-16 md:pb-20">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center space-y-5 sm:space-y-6">
                    <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-black/40">
                        {HERO_COPY.eyebrow}
                    </span>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-instrument font-medium leading-[1.1] text-balance">
                        {HERO_COPY.headline}
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl text-black/60 leading-relaxed max-w-2xl mx-auto">
                        {HERO_COPY.subhead}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                        <Button
                            asChild
                            size="lg"
                            className="bg-black text-white hover:bg-black/90 px-8 py-6 text-base rounded-xl"
                        >
                            <Link href={buildMailto(HERO_COPY.primaryCtaSubject)}>
                                {HERO_COPY.primaryCtaLabel}
                            </Link>
                        </Button>
                        <Link
                            href={HERO_COPY.secondaryCtaHref}
                            className="px-6 py-4 rounded-xl border border-black/10 text-black/70 hover:text-black hover:border-black/20 hover:bg-black/[0.02] text-xs sm:text-sm font-mono uppercase tracking-widest transition-all"
                        >
                            {HERO_COPY.secondaryCtaLabel}
                        </Link>
                    </div>
                </div>
            </section>

            <div className="pb-12 sm:pb-16 md:pb-20">
                <PartnerLogoStrip
                    logos={HERO_LOGOS}
                    eyebrow={HERO_COPY.partnersEyebrow}
                    variant="light"
                    size="md"
                />
            </div>
        </div>
    )
}
