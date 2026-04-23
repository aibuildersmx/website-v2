'use client'

import React from "react"
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Linkedin, Sun, Moon } from 'lucide-react'
import { useState, useEffect, useSyncExternalStore, createContext, useContext } from 'react'
import { cn } from '@/lib/utils'

/* ── Blog theme context (scoped, not global next-themes) ── */

type BlogTheme = 'light' | 'dark'
const BlogThemeContext = createContext<{ theme: BlogTheme; toggle: () => void }>({
    theme: 'light',
    toggle: () => {},
})

export function useBlogTheme() {
    return useContext(BlogThemeContext)
}

// External store for theme — avoids setState-in-effect lint issues
let themeListeners: Array<() => void> = []
let currentTheme: BlogTheme = 'light'

function getThemeSnapshot(): BlogTheme {
    return currentTheme
}

function getThemeServerSnapshot(): BlogTheme {
    return 'light'
}

function subscribeTheme(listener: () => void) {
    themeListeners.push(listener)
    // Initialize from localStorage on first subscribe (client only)
    if (themeListeners.length === 1 && typeof window !== 'undefined') {
        const stored = localStorage.getItem('blog-theme') as BlogTheme | null
        if (stored === 'dark' || stored === 'light') {
            currentTheme = stored
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            currentTheme = 'dark'
        }
        listener()
    }
    return () => {
        themeListeners = themeListeners.filter(l => l !== listener)
    }
}

function setExternalTheme(next: BlogTheme) {
    currentTheme = next
    localStorage.setItem('blog-theme', next)
    themeListeners.forEach(l => l())
}

function BlogThemeProvider({ children }: { children: React.ReactNode }) {
    const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getThemeServerSnapshot)

    const toggle = () => {
        setExternalTheme(theme === 'light' ? 'dark' : 'light')
    }

    return (
        <BlogThemeContext.Provider value={{ theme, toggle }}>
            <div data-blog-theme={theme}>
                {children}
            </div>
        </BlogThemeContext.Provider>
    )
}

/* ── Header ── */

const menuItems = [
    { name: 'Events', href: '/#events' },
    { name: 'Blog', href: '/blog' },
    { name: 'Bootcamp', href: '/designwithai', isNew: true },
    { name: 'Residencia', href: '/residencia', isNew: true },
]

function BlogHeader() {
    const [scrolled, setScrolled] = useState(false)
    const { theme, toggle } = useBlogTheme()
    const isDark = theme === 'dark'

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <header className="fixed top-4 sm:top-6 inset-x-0 z-[100] flex justify-center pointer-events-none px-3 sm:px-6">
            <nav className={cn(
                "pointer-events-auto flex items-center justify-between p-1.5 sm:p-2 rounded-full border transition-all duration-500 ease-in-out w-full max-w-6xl",
                isDark
                    ? scrolled
                        ? "bg-[#0a0a12]/80 backdrop-blur-xl border-white/10 shadow-2xl shadow-black/30"
                        : "bg-[#0a0a12]/50 backdrop-blur-md border-white/5 shadow-lg"
                    : scrolled
                        ? "bg-white/80 backdrop-blur-xl border-black/10 shadow-2xl shadow-black/5"
                        : "bg-white/50 backdrop-blur-md border-black/5 shadow-lg"
            )}>
                <Link
                    href="/"
                    aria-label="home"
                    className={cn(
                        "flex items-center justify-center h-9 sm:h-10 px-2 rounded-full transition-colors",
                        isDark ? "hover:bg-white/5" : "hover:bg-black/5"
                    )}
                >
                    <Image
                        src={isDark ? "/AIBM-logo-dark.svg" : "/AIBM-logo-light-bg.svg"}
                        alt="AI Builders Mexico"
                        width={120}
                        height={20}
                        className="h-4 sm:h-5 w-auto"
                    />
                </Link>

                <ul className="hidden sm:flex items-center gap-1">
                    {menuItems.map((item, index) => (
                        <li key={index}>
                            <Link
                                href={item.href}
                                className={cn(
                                    "relative rounded-full px-5 py-2.5 text-xs font-mono uppercase tracking-widest transition-colors",
                                    isDark
                                        ? "text-white/50 hover:text-white hover:bg-white/5"
                                        : "text-black/50 hover:text-black hover:bg-black/5",
                                    item.isNew && "pr-8"
                                )}
                            >
                                {item.name}
                                {item.isNew && (
                                    <span
                                        className={cn(
                                            "pointer-events-none absolute right-2 bottom-1.5 text-[8px] font-medium lowercase tracking-[0.18em]",
                                            isDark ? "text-[#b8d9a9]" : "text-[#5a8a48]"
                                        )}
                                    >
                                        new
                                    </span>
                                )}
                            </Link>
                        </li>
                    ))}
                </ul>

                <div className="flex items-center gap-1 sm:gap-1.5">
                    {/* Theme toggle */}
                    <button
                        onClick={toggle}
                        className={cn(
                            "flex items-center justify-center size-9 sm:size-10 rounded-full transition-colors",
                            isDark
                                ? "text-white/50 hover:text-white hover:bg-white/5"
                                : "text-black/50 hover:text-black hover:bg-black/5"
                        )}
                        aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                    >
                        {isDark ? <Sun className="size-3.5 sm:size-4" /> : <Moon className="size-3.5 sm:size-4" />}
                    </button>

                    <Link
                        href="https://www.linkedin.com/company/aibuildersmexico"
                        target="_blank"
                        className={cn(
                            "flex items-center justify-center size-9 sm:size-10 rounded-full transition-colors",
                            isDark
                                ? "text-white/50 hover:text-white hover:bg-white/5"
                                : "text-black/50 hover:text-black hover:bg-black/5"
                        )}
                        aria-label="LinkedIn"
                    >
                        <Linkedin className="size-3.5 sm:size-4" />
                    </Link>
                    <Button
                        asChild
                        size="sm"
                        className={cn(
                            "rounded-full px-4 sm:px-6 font-mono text-[10px] sm:text-xs uppercase tracking-widest h-9 sm:h-10",
                            isDark
                                ? "bg-white text-[#12121b] hover:bg-white/90"
                                : "bg-black text-white hover:bg-black/90"
                        )}
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

/* ── Layout ── */

function BlogShell({ children }: { children: React.ReactNode }) {
    const { theme } = useBlogTheme()
    const isDark = theme === 'dark'

    return (
        <div className={cn(
            "min-h-screen transition-colors duration-300",
            isDark ? "bg-[#12121b] text-[#cdd6f4]" : "bg-white text-black"
        )}>
            <BlogHeader />

            <main className="pt-24 sm:pt-28">
                {children}
            </main>

            {/* Footer */}
            <footer className={cn(
                "py-12 mt-24 transition-colors duration-300",
                isDark ? "bg-[#0a0a12]" : "bg-[#212121]"
            )}>
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

export default function BlogLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <BlogThemeProvider>
            <BlogShell>{children}</BlogShell>
        </BlogThemeProvider>
    )
}
