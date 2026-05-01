import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WORKSHOPS_COPY, WORKSHOPS_LOGOS, buildMailto } from './enterprise-data'
import { PartnerLogoStrip } from './partner-logo-strip'

export function WorkshopsSection() {
    return (
        <section
            id={WORKSHOPS_COPY.id}
            className="relative py-16 sm:py-24 md:py-32 bg-white text-black border-t border-black/5"
        >
            <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-12 sm:space-y-16">
                <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-start">
                    <div>
                        <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-black/40">
                            {WORKSHOPS_COPY.eyebrow}
                        </span>
                        <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-medium font-instrument leading-[1.1] text-balance">
                            {WORKSHOPS_COPY.headline}
                        </h2>
                    </div>
                    <div className="space-y-4 text-black/60 text-base sm:text-lg leading-relaxed">
                        {WORKSHOPS_COPY.body.map((p, i) => (
                            <p key={i}>{p}</p>
                        ))}
                        <Button
                            asChild
                            size="lg"
                            className="mt-2 bg-black text-white hover:bg-black/90 rounded-xl group"
                        >
                            <Link href={buildMailto(WORKSHOPS_COPY.ctaSubject)} className="flex items-center gap-2">
                                <span>{WORKSHOPS_COPY.ctaLabel}</span>
                                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Media panel */}
                <div className="relative rounded-2xl sm:rounded-3xl border border-black/10 overflow-hidden h-64 sm:h-80 md:h-[32rem]">
                    <img
                        src={WORKSHOPS_COPY.mediaSrc}
                        alt={WORKSHOPS_COPY.mediaAlt}
                        className="absolute inset-0 w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                </div>

                {/* Logo strip */}
                <PartnerLogoStrip logos={WORKSHOPS_LOGOS} variant="light" size="md" />
            </div>
        </section>
    )
}
