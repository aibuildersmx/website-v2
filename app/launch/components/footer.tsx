import Image from 'next/image'
import Link from 'next/link'
import React from "react";

export default function FooterSection() {
    return (
        <footer className="py-16 sm:py-24 md:py-32 border-t border-white/10 bg-black">
            <div className="mx-auto max-w-5xl px-6">
                <Link
                    href="/"
                    aria-label="go home"
                    className="mx-auto block size-fit">
                    <Image src="/AIBM-logo-dark.svg" alt="AI Builders Mexico" width={393} height={95} unoptimized className="h-6 sm:h-8 w-auto" />
                </Link>

                <div className="mt-8 text-center">
                    <span className="text-white/30 text-[10px] sm:text-xs font-mono tracking-widest uppercase">
                        AI Builders somos:{' '}
                        <Link
                            href="https://javierivero.com/"
                            className="text-white/50 hover:text-white transition-colors underline">
                            Javier
                        </Link>
                        ,{' '}
                        <Link
                            href="https://x.com/benkimbuilds"
                            className="text-white/50 hover:text-white transition-colors underline">
                            Ben
                        </Link>
                        {' '}y{' '}
                        <Link
                            href="https://x.com/ricgarcas"
                            className="text-white/50 hover:text-white transition-colors underline">
                            Ricardo
                        </Link>
                    </span>
                </div>

                <div className="mt-6 text-center">
                    <span className="text-white/20 text-[10px] sm:text-xs font-mono tracking-widest uppercase">
                        2026 – built in v0, hand crafted in cursor, made with ♥︎ by aibuilders.mx
                    </span>
                </div>
            </div>
        </footer>
    )
}
