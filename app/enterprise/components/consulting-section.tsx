import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CheckList } from '@/components/ui/check-list'
import { CONSULTING_COPY, buildMailto } from './enterprise-data'

export function ConsultingSection() {
    return (
        <section
            id={CONSULTING_COPY.id}
            className="relative py-16 sm:py-24 md:py-32 bg-white text-black border-t border-black/5"
        >
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <div className="grid md:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-start">
                    <div>
                        <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-black/40">
                            {CONSULTING_COPY.eyebrow}
                        </span>
                        <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-medium font-instrument leading-[1.1] text-balance">
                            {CONSULTING_COPY.headline}
                        </h2>

                        {/* Pricing pill */}
                        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/[0.02] px-4 py-2">
                            <span className="size-1.5 rounded-full bg-black animate-pulse" />
                            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest font-bold text-black/70">
                                {CONSULTING_COPY.pricing}
                            </span>
                        </div>

                        <div className="mt-6 sm:mt-8 space-y-4 text-black/60 text-base sm:text-lg leading-relaxed">
                            {CONSULTING_COPY.body.map((p, i) => (
                                <p key={i}>{p}</p>
                            ))}
                        </div>

                        <Button
                            asChild
                            size="lg"
                            className="mt-6 sm:mt-8 bg-black text-white hover:bg-black/90 rounded-xl group"
                        >
                            <Link href={buildMailto(CONSULTING_COPY.ctaSubject)} className="flex items-center gap-2">
                                <span>{CONSULTING_COPY.ctaLabel}</span>
                                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </Button>
                    </div>

                    <div>
                        <p className="mb-4 text-[10px] sm:text-xs font-mono uppercase tracking-widest text-black/40">
                            QUÉ INCLUYE
                        </p>
                        <CheckList items={CONSULTING_COPY.deliverables} variant="light" />
                    </div>
                </div>
            </div>
        </section>
    )
}
