'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useSyncExternalStore } from 'react'

const bootcampHref = '/residencia'
const widgetCutoff = '2026-05-02T00:00:00-06:00'
const emptySubscribe = () => () => {}

export function BootcampChatWidget() {
    // `false` on the server / first render, then the real clock check on the
    // client — no effect, no setState, no hydration mismatch.
    const isVisible = useSyncExternalStore(
        emptySubscribe,
        () => Date.now() < new Date(widgetCutoff).getTime(),
        () => false
    )

    if (!isVisible) {
        return null
    }

    return (
        <Link
            href={bootcampHref}
            className="group fixed right-4 bottom-4 z-[120] hidden items-end sm:flex sm:right-6 sm:bottom-6"
            aria-label="Abrir información de la Residencia AIBM"
        >
            <div className="pointer-events-none absolute right-0 bottom-20 w-[280px] translate-y-2 rounded-3xl border border-white/10 bg-black/92 p-4 text-white opacity-0 shadow-2xl shadow-black/40 backdrop-blur-xl transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 sm:w-[340px] sm:p-5">
                <div className="space-y-2">
                    <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#b8d9a9] sm:text-[11px]">
                        Nuevo programa
                    </p>
                    <p className="text-sm leading-relaxed text-white/85 sm:text-[15px]">
                        ¡Hey! Soy Ben, cofundador de AIBM. Nos emociona lanzar
                        la Residencia AIBM: 6 semanas de coworking gratis en
                        Condesa con tiempo protegido para acelerar tu proyecto.
                        Haz clic aquí para saber más.
                    </p>
                </div>
                <div className="absolute right-6 -bottom-2 h-4 w-4 rotate-45 border-r border-b border-white/10 bg-black/92" />
            </div>

            <div className="relative h-10 w-10 transition-transform duration-300 group-hover:scale-105 sm:h-12 sm:w-12">
                <div className="relative h-full w-full overflow-hidden rounded-full border border-white/15 bg-[#1f1f1f] shadow-[0_18px_40px_rgba(0,0,0,0.45)] ring-1 ring-black/30">
                    <Image
                        src="/casual-ben.jpeg"
                        alt="Ben, cofundador de AIBM"
                        fill
                        sizes="48px"
                        className="object-cover"
                    />
                </div>
                <span className="absolute right-0 bottom-0 h-2.5 w-2.5 translate-x-1/4 translate-y-1/4 rounded-full border border-black/60 bg-[#86efac] shadow-[0_0_10px_rgba(134,239,172,0.55)] sm:h-3 sm:w-3" />
            </div>
        </Link>
    )
}
