import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TALKS_COPY, buildMailto } from './enterprise-data'

export function TalksSection() {
    return (
        <section
            id={TALKS_COPY.id}
            className="relative py-16 sm:py-24 md:py-32 bg-white text-black border-t border-black/5 scroll-mt-20 sm:scroll-mt-24"
        >
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <div className="grid md:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-start">
                    <div>
                        <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-black/40">
                            {TALKS_COPY.eyebrow}
                        </span>
                        <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-medium font-instrument leading-[1.1] text-balance">
                            {TALKS_COPY.headline}
                        </h2>
                        <div className="mt-6 sm:mt-8 space-y-4 text-black/60 text-base sm:text-lg leading-relaxed">
                            {TALKS_COPY.body.map((p, i) => (
                                <p key={i}>{p}</p>
                            ))}
                        </div>
                        <Button
                            asChild
                            size="lg"
                            className="mt-6 sm:mt-8 bg-black text-white hover:bg-black/90 rounded-xl group"
                        >
                            <Link href={buildMailto(TALKS_COPY.ctaSubject)} className="flex items-center gap-2">
                                <span>{TALKS_COPY.ctaLabel}</span>
                                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </Button>
                    </div>

                    <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-6 sm:p-8">
                        <p className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-black/40">
                            TEMAS QUE NOS PIDEN
                        </p>
                        <ul className="mt-4 space-y-3">
                            {TALKS_COPY.topics.map((topic) => (
                                <li
                                    key={topic}
                                    className="text-lg sm:text-xl font-instrument font-medium text-black border-b border-black/5 pb-3 last:border-b-0"
                                >
                                    {topic}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    )
}
