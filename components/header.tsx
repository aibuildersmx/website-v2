'use client'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Linkedin } from 'lucide-react'

const menuItems = [
    { name: 'Home', href: '/' },
    { name: 'Enterprise', href: '/enterprise' },
    { name: 'Bootcamp', href: '/designwithai' },
    { name: 'Residencia', href: '/residencia' },
]

export const HeroHeader = () => {
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <header className="fixed top-4 sm:top-6 inset-x-0 z-[100] flex justify-center pointer-events-none px-3 sm:px-6">
            <nav className={cn(
                "pointer-events-auto flex items-center justify-between p-1.5 sm:p-2 rounded-full border transition-all duration-500 ease-in-out w-full max-w-6xl",
                scrolled
                    ? "bg-black/80 backdrop-blur-xl border-white/10 shadow-2xl shadow-black/20"
                    : "bg-black/50 backdrop-blur-md border-white/5 shadow-lg"
            )}>
                <Link
                    href="/"
                    aria-label="home"
                    className="flex h-10 items-center justify-center rounded-full px-2 transition-colors hover:bg-white/10 sm:h-10"
                >
                    <Image
                        src="/AIBM-logo-dark.svg"
                        alt="AI Builders Mexico"
                        width={393}
                        height={95}
                        unoptimized
                        className="h-4 sm:h-5 w-auto"
                    />
                </Link>

                <ul className="hidden sm:flex items-center gap-1">
                    {menuItems.map((item, index) => (
                        <li key={index}>
                            <Link
                                href={item.href}
                                className="rounded-full px-5 py-2.5 text-xs font-mono uppercase tracking-widest text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                            >
                                {item.name}
                            </Link>
                        </li>
                    ))}
                </ul>

                <div className="flex items-center gap-1.5 sm:gap-2">
                    <Link
                        href="https://www.linkedin.com/company/aibuildersmexico"
                        target="_blank"
                        className="flex size-10 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                        aria-label="LinkedIn"
                    >
                        <Linkedin className="size-3.5 sm:size-4" />
                    </Link>
                    <Button
                        asChild
                        size="sm"
                        className="h-10 rounded-full bg-white px-4 font-mono text-[10px] uppercase tracking-widest text-black hover:bg-white/90 sm:px-6 sm:text-xs"
                    >
                        <Link href="https://chat.whatsapp.com/E7oCGyITLkX1aqFexJbbHm" target="_blank">
                            Únete
                        </Link>
                    </Button>
                </div>
            </nav>
        </header>
    )
}
