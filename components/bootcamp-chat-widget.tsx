'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Bell, X } from 'lucide-react'
import { useState } from 'react'

const internationalCommunityHref = 'https://aibuilders.lat'

export function BootcampChatWidget() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="fixed right-4 bottom-4 z-[120] hidden items-end sm:flex sm:right-6 sm:bottom-6">
            <div
                className={[
                    "absolute right-0 bottom-20 w-[280px] rounded-2xl border border-white/10 bg-[#212121]/95 p-4 text-white shadow-2xl shadow-black/40 backdrop-blur-xl transition-all duration-300 sm:w-[340px] sm:p-5",
                    isOpen
                        ? "pointer-events-auto translate-y-0 opacity-100"
                        : "pointer-events-none translate-y-2 opacity-0",
                ].join(" ")}
                aria-hidden={!isOpen}
            >
                <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="absolute right-3 top-3 flex size-7 items-center justify-center rounded-full text-white/45 transition-colors duration-300 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                    aria-label="Cerrar mensaje de AI Builders LAT"
                >
                    <X className="size-3.5" />
                </button>

                <div className="flex items-start gap-3">
                    <div className="relative mt-0.5 size-10 shrink-0 overflow-hidden rounded-full border border-white/15 bg-white/10">
                        <Image
                            src="/casual-ben.jpeg"
                            alt="Ben, cofundador de AIBM"
                            fill
                            sizes="40px"
                            className="object-cover"
                        />
                    </div>
                    <div className="space-y-2">
                        <p className="pr-7 font-sans text-sm leading-relaxed text-white/80 sm:text-[15px]">
                            ¡Hey! Soy Ben, cofundador de AIBM. Si quieres participar
                            desde fuera de México, estamos reuniendo a la comunidad
                            internacional en AI Builders LAT.
                        </p>
                    </div>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                    <Link
                        href={internationalCommunityHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#b8d9a9] transition-colors duration-300 hover:text-white sm:text-[11px]"
                    >
                        aibuilders.lat
                    </Link>
                    <Link
                        href={internationalCommunityHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-sans text-xs font-medium text-white underline-offset-4 transition-colors duration-300 hover:text-white/80 hover:underline"
                    >
                        Ver más
                    </Link>
                </div>
                <div className="absolute right-6 -bottom-2 h-4 w-4 rotate-45 border-r border-b border-white/10 bg-[#212121]/95" />
            </div>

            <button
                type="button"
                onClick={() => setIsOpen((current) => !current)}
                className="group relative h-10 w-10 transition-transform duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 sm:h-12 sm:w-12"
                aria-label={isOpen ? "Ocultar chat de AI Builders LAT" : "Abrir chat de AI Builders LAT"}
                aria-expanded={isOpen}
            >
                <span className="absolute inset-[-5px] rounded-full border border-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative h-full w-full overflow-hidden rounded-full border border-white/15 bg-[#1f1f1f] shadow-[0_18px_40px_rgba(0,0,0,0.45)] ring-1 ring-black/30">
                    <Image
                        src="/casual-ben.jpeg"
                        alt="Ben, cofundador de AIBM"
                        fill
                        sizes="48px"
                        className="object-cover"
                    />
                </div>
                <span className="absolute -left-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full border border-black/50 bg-red-500 text-white shadow-lg shadow-black/20">
                    <Bell className="size-3" fill="currentColor" strokeWidth={2.5} />
                </span>
                <span className="absolute right-0 bottom-0 h-2.5 w-2.5 translate-x-1/4 translate-y-1/4 rounded-full border border-black/60 bg-[#86efac] shadow-[0_0_10px_rgba(134,239,172,0.55)] sm:h-3 sm:w-3" />
            </button>
        </div>
    )
}
