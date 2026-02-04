import Link from 'next/link'
import React from "react";

export default function FooterSection() {
    return (
        <footer className="py-16 sm:py-24 md:py-32 border-t border-black/10 dark:border-white/10 bg-background">
            <div className="mx-auto max-w-5xl px-6">
                <Link
                    href="/"
                    aria-label="go home"
                    className="mx-auto block size-fit">
                    <img src="/AIBM-logo-dark.svg" alt="AI Builders Mexico" className="h-6 sm:h-8 w-auto dark:invert-0 invert" />
                </Link>

                <div className="mt-8 text-center">
                    <span className="text-foreground/30 text-[10px] sm:text-xs font-mono tracking-widest uppercase">
                        AI Builders somos:{' '}
                        <Link
                            href="https://javierivero.com/"
                            className="text-foreground/50 hover:text-foreground transition-colors underline">
                            Javier
                        </Link>
                        ,{' '}
                        <Link
                            href="https://x.com/benkimbuilds"
                            className="text-foreground/50 hover:text-foreground transition-colors underline">
                            Ben
                        </Link>
                        {' '}y{' '}
                        <Link
                            href="https://x.com/ricgarcas"
                            className="text-foreground/50 hover:text-foreground transition-colors underline">
                            Ricardo
                        </Link>
                    </span>
                </div>
                
                <div className="mt-6 text-center">
                    <span className="text-foreground/20 text-[10px] sm:text-xs font-mono tracking-widest uppercase">
                        2026 – built in v0, hand crafted in cursor, made with ♥︎ by aibuilders.mx
                    </span>
                </div>
            </div>
        </footer>
    )
}
