import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RECRUITING_COPY, buildMailto } from './enterprise-data'

export function RecruitingSection() {
    return (
        <section
            id={RECRUITING_COPY.id}
            className="relative py-16 sm:py-24 md:py-32 bg-white text-black border-t border-black/5 scroll-mt-20 sm:scroll-mt-24"
        >
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <header className="flex flex-col items-center text-center space-y-3 sm:space-y-4 max-w-3xl mx-auto">
                    <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-black/40">
                        {RECRUITING_COPY.eyebrow}
                    </span>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-instrument font-medium leading-tight text-balance">
                        {RECRUITING_COPY.headline}
                    </h2>
                    <p className="text-base sm:text-lg text-black/60 leading-relaxed max-w-2xl">
                        {RECRUITING_COPY.subhead}
                    </p>
                </header>

                <ul className="mt-12 sm:mt-16 md:mt-20 grid gap-4 sm:gap-6 md:gap-8 md:grid-cols-3">
                    {RECRUITING_COPY.cards.map((card) => (
                        <li
                            key={card.title}
                            className="group relative border border-black/10 rounded-xl sm:rounded-2xl bg-white hover:border-black/20 hover:shadow-lg hover:shadow-black/5 transition-all duration-500 p-6 sm:p-8"
                        >
                            <h3 className="text-xl sm:text-2xl font-instrument font-medium">{card.title}</h3>
                            <p className="mt-3 text-sm sm:text-base text-black/60 leading-relaxed">
                                {card.description}
                            </p>
                        </li>
                    ))}
                </ul>

                <div className="mt-12 sm:mt-16 flex justify-center">
                    <Button
                        asChild
                        size="lg"
                        className="bg-black text-white hover:bg-black/90 rounded-xl group"
                    >
                        <Link href={buildMailto(RECRUITING_COPY.ctaSubject)} className="flex items-center gap-2">
                            <span>{RECRUITING_COPY.ctaLabel}</span>
                            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    )
}
