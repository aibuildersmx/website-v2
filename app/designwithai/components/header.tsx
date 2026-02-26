'use client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

const menuItems = [
    { name: 'Programa', href: '#programa' },
    { name: 'Testimonios', href: '#testimonios' },
]

export const HeroHeader = () => {
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        let ticking = false
        const handleScroll = () => {
            if (ticking) return
            ticking = true
            requestAnimationFrame(() => {
                const next = window.scrollY > 20
                setScrolled(prev => (prev === next ? prev : next))
                ticking = false
            })
        }
        window.addEventListener('scroll', handleScroll, { passive: true })
        handleScroll()
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <header className="fixed top-4 sm:top-6 inset-x-0 z-[100] flex justify-center pointer-events-none px-3 sm:px-6">
            <nav className={cn(
                "pointer-events-auto flex items-center justify-between p-1.5 sm:p-2 rounded-full border transition-all duration-500 ease-in-out w-full lg:w-[75vw]",
                scrolled 
                    ? "bg-white/80 backdrop-blur-xl border-black/10 shadow-xl shadow-black/5" 
                    : "bg-white/50 backdrop-blur-md border-black/5 shadow-md"
            )}>
                <Link
                    href="/designwithai"
                    aria-label="home"
                    className="flex items-center justify-center h-9 sm:h-10 px-2 rounded-full hover:bg-black/5 transition-colors"
                >
                    <img
                        src="/aibm-logo.svg"
                        alt="AI Builders Mexico"
                        className="h-4 sm:h-5 w-auto invert"
                    />
                </Link>

                <ul className="hidden sm:flex items-center gap-1">
                    {menuItems.map((item, index) => (
                        <li key={index}>
                            <Link
                                href={item.href}
                                className="px-5 py-2.5 text-xs font-mono uppercase tracking-widest text-black/60 hover:text-black transition-colors rounded-full hover:bg-black/5"
                            >
                                {item.name}
                            </Link>
                        </li>
                    ))}
                </ul>

                <div className="flex items-center gap-1.5 sm:gap-2">
                    <Button
                        asChild
                        size="sm"
                        className="rounded-full bg-black text-white hover:bg-black/80 px-4 sm:px-6 font-mono text-[10px] sm:text-xs uppercase tracking-widest h-9 sm:h-10"
                    >
                        <Link
                            href="https://buy.stripe.com/cNi3cp2bn1Iz5D9gsZgnK03"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Inscribirme
                        </Link>
                    </Button>
                </div>
            </nav>
        </header>
    )
}
