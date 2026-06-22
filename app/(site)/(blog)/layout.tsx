import React from "react"
import Link from 'next/link'
import { Linkedin } from 'lucide-react'
import { HeroHeader } from '@/components/header'

/* ── Layout ──
   The blog is intentionally light-only black/white, matching the rest of
   aibuilders.mx (homepage, admin). No theme toggle, no Catppuccin palette.
   Components render a single binary treatment from the design tokens. */

export default function BlogLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <div className="min-h-screen bg-white text-black">
            <HeroHeader />

            <main className="pt-24 sm:pt-28">
                {children}
            </main>

            <footer className="py-12 mt-24 bg-[#212121]">
                <div className="mx-auto max-w-6xl px-6 flex flex-col items-center gap-4">
                    <Link
                        href="https://www.linkedin.com/company/aibuildersmexico"
                        target="_blank"
                        className="flex items-center justify-center size-10 rounded-full text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors"
                        aria-label="LinkedIn"
                    >
                        <Linkedin className="size-5" />
                    </Link>
                    <p className="text-white/30 text-[10px] sm:text-xs font-mono tracking-widest uppercase text-center">
                        2026 – built in v0, hand crafted in cursor, made with ♥︎ by aibuilders.mx
                    </p>
                </div>
            </footer>
        </div>
    )
}
