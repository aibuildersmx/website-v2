'use client'

import Link from 'next/link'
import { ArrowRight, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CTA_COPY, buildMailto } from './enterprise-data'

export function EnterpriseCTA() {
    return (
        <section className="relative py-16 sm:py-24 md:py-32 overflow-hidden bg-white text-black border-t border-black/5">
            {/* Blur orbs */}
            <div className="pointer-events-none absolute -top-24 left-1/4 size-72 rounded-full bg-black/[0.02] blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 right-1/4 size-80 rounded-full bg-black/[0.02] blur-3xl" />

            <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
                <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
                    {/* Left: pill + headline + service mailto list */}
                    <div className="flex flex-col items-start space-y-5 sm:space-y-6">
                        <div className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-black/[0.02] px-3 py-1.5">
                            <span className="relative flex size-1.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-black/40 opacity-75" />
                                <span className="relative inline-flex size-1.5 rounded-full bg-black" />
                            </span>
                            <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest font-bold text-black/60">
                                {CTA_COPY.eyebrow}
                            </span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-instrument font-medium leading-[1.1] text-balance">
                            {CTA_COPY.headline}
                        </h2>
                        <ul className="w-full space-y-2 sm:space-y-3 mt-2">
                            {CTA_COPY.services.map((service) => (
                                <li key={service.subject}>
                                    <Link
                                        href={buildMailto(service.subject)}
                                        className="group flex items-center justify-between border-b border-black/10 py-3 sm:py-4 hover:border-black/40 transition-colors"
                                    >
                                        <span className="text-lg sm:text-xl font-instrument font-medium text-black">
                                            {service.label.replace(' →', '')}
                                        </span>
                                        <ArrowRight className="size-4 sm:size-5 text-black/40 transition-all group-hover:translate-x-1 group-hover:text-black" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Right: dark inset contact card */}
                    <div className="relative">
                        <div className="bg-black text-white p-6 sm:p-8 md:p-12 rounded-2xl sm:rounded-3xl overflow-hidden relative">
                            <div
                                className="absolute inset-0 opacity-10 pointer-events-none"
                                style={{
                                    backgroundImage:
                                        'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                                    backgroundSize: '24px 24px',
                                }}
                            />
                            <div className="relative z-10">
                                <div className="size-10 sm:size-12 bg-white/10 rounded-xl sm:rounded-2xl flex items-center justify-center mb-6 sm:mb-8">
                                    <Mail className="size-5 sm:size-6 text-white" />
                                </div>
                                <p className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-white/60 mb-3">
                                    {CTA_COPY.contactEyebrow}
                                </p>
                                <h3 className="text-xl sm:text-2xl md:text-3xl font-instrument font-medium mb-3 sm:mb-4">
                                    {CTA_COPY.contactHeadline}
                                </h3>
                                {CTA_COPY.contactBody ? (
                                    <p className="text-white/60 mb-6 sm:mb-8 text-balance text-sm sm:text-base">
                                        {CTA_COPY.contactBody}
                                    </p>
                                ) : null}
                                <Button
                                    asChild
                                    className="mt-6 sm:mt-8 w-full bg-white text-black hover:bg-white/90 py-5 sm:py-6 text-sm sm:text-base font-bold rounded-lg sm:rounded-xl flex items-center justify-center gap-2 group"
                                >
                                    <Link
                                        href={buildMailto(CTA_COPY.contactCtaSubject)}
                                        className="flex items-center justify-center gap-2"
                                    >
                                        <span>{CTA_COPY.contactCtaLabel}</span>
                                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
