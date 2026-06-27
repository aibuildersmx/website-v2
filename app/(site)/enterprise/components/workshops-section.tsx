import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WORKSHOPS_COPY, buildMailto } from './enterprise-data'

export function WorkshopsSection() {
    return (
        <section
            id={WORKSHOPS_COPY.id}
            className="relative py-16 sm:py-24 md:py-32 bg-white text-black border-t border-black/5 scroll-mt-20 sm:scroll-mt-24"
        >
            <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-12 sm:space-y-16">
                <div className="grid md:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-start">
                    <div>
                        <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-black/40">
                            {WORKSHOPS_COPY.eyebrow}
                        </span>
                        <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-medium font-instrument leading-[1.1] text-balance">
                            {WORKSHOPS_COPY.headline}
                        </h2>

                        <div className="mt-6 sm:mt-8 space-y-4 font-sans text-black/60 text-base sm:text-lg leading-relaxed">
                            {WORKSHOPS_COPY.body.map((p, i) => (
                                <p key={i}>{p}</p>
                            ))}
                        </div>

                        <Button
                            asChild
                            size="lg"
                            className="mt-6 sm:mt-8 h-auto bg-black text-white hover:bg-black/90 rounded-xl px-6 py-3.5 sm:px-8 sm:py-4 font-sans text-base group"
                        >
                            <Link href={buildMailto(WORKSHOPS_COPY.ctaSubject)} className="flex items-center gap-2">
                                <span>{WORKSHOPS_COPY.ctaLabel}</span>
                                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </Button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
                        <div className="rounded-xl sm:rounded-2xl border border-black/10 bg-white p-5 sm:p-6">
                            <p className="mb-5 text-[10px] sm:text-xs font-mono uppercase tracking-widest text-black/40">
                                Herramientas
                            </p>
                            <ul className="space-y-4 font-sans text-sm text-black/60 leading-relaxed">
                                {WORKSHOPS_COPY.tools.map((item) => (
                                    <li key={item.title}>
                                        <span className="font-medium text-black">{item.title}</span>
                                        <span> — {item.description}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="rounded-xl sm:rounded-2xl border border-black/10 bg-white p-5 sm:p-6">
                            <p className="mb-5 text-[10px] sm:text-xs font-mono uppercase tracking-widest text-black/40">
                                Resultados
                            </p>
                            <ul className="space-y-4 font-sans text-sm text-black/60 leading-relaxed">
                                {WORKSHOPS_COPY.outcomes.map((item) => (
                                    <li key={item.title}>
                                        <span className="font-medium text-black">{item.title}</span>
                                        <span> — {item.description}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
