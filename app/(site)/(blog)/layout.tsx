'use client'

import React from "react"
import Link from 'next/link'
import { Linkedin, Sun, Moon } from 'lucide-react'
import { useSyncExternalStore, createContext, useContext } from 'react'
import { cn } from '@/lib/utils'
import { HeroHeader } from '@/components/header'

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

/* ── Floating theme toggle (replaces the in-header toggle) ── */

function BlogThemeToggle() {
    const { theme, toggle } = useBlogTheme()
    const isDark = theme === 'dark'

    return (
        <button
            onClick={toggle}
            aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            className={cn(
                "fixed bottom-6 right-6 z-[90] flex items-center justify-center size-11 sm:size-12 rounded-full border backdrop-blur-md shadow-lg transition-all duration-300",
                isDark
                    ? "bg-[#0a0a12]/80 border-white/10 text-white/70 hover:text-white hover:bg-[#0a0a12]"
                    : "bg-white/80 border-black/10 text-black/60 hover:text-black hover:bg-white"
            )}
        >
            {isDark ? <Sun className="size-4 sm:size-5" /> : <Moon className="size-4 sm:size-5" />}
        </button>
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
            <HeroHeader />
            <BlogThemeToggle />

            <main className="pt-24 sm:pt-28">
                {children}
            </main>

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
