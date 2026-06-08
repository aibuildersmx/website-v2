'use client'

import { useBlogTheme } from '@/app/(site)/(blog)/layout'
import { AlertTriangle, Info, Zap, Shield } from 'lucide-react'
import { useState, useEffect, type ReactNode } from 'react'

/* ── Catppuccin references for prose/callout ── */
const ctp = {
    mocha: {
        text:     '#cdd6f4',
        subtext0: '#a6adc8',
        subtext1: '#bac2de',
        overlay0: '#6c7086',
        surface0: '#313244',
        base:     '#12121b',
        green:    '#a6e3a1',
        red:      '#f38ba8',
        yellow:   '#f9e2af',
        blue:     '#89b4fa',
        mauve:    '#cba6f7',
    },
    latte: {
        text:     '#4c4f69',
        subtext0: '#6c6f85',
        subtext1: '#5c5f77',
        overlay0: '#9ca0b0',
        surface0: '#ccd0da',
        base:     '#eff1f5',
        green:    '#40a02b',
        red:      '#d20f39',
        yellow:   '#df8e1d',
        blue:     '#1e66f5',
        mauve:    '#8839ef',
    },
}

/* ── Callout ── */
export function Callout({ type = 'info', children }: { type?: 'info' | 'warning' | 'tip' | 'security'; children: ReactNode }) {
    const { theme } = useBlogTheme()
    const isDark = theme === 'dark'
    const p = isDark ? ctp.mocha : ctp.latte

    const configs = {
        info:     { color: p.blue,   icon: Info },
        warning:  { color: p.yellow, icon: AlertTriangle },
        tip:      { color: p.green,  icon: Zap },
        security: { color: p.red,    icon: Shield },
    }
    const c = configs[type]
    const Icon = c.icon

    return (
        <div
            className="rounded-xl border p-4 sm:p-5 flex gap-3 my-6"
            style={{
                borderColor: c.color + '30',
                backgroundColor: c.color + '08',
            }}
        >
            <Icon className="w-4 h-4 shrink-0 mt-0.5" style={{ color: c.color }} />
            <div
                className="text-sm leading-relaxed [&>p]:mb-2 [&>p:last-child]:mb-0 [&>p>code]:text-xs [&>p>code]:px-1.5 [&>p>code]:py-0.5 [&>p>code]:rounded [&>p>code]:font-mono"
                style={{
                    color: isDark ? ctp.mocha.subtext1 : '#374151',
                    // inline style can't handle nested selectors, so we use classes below
                }}
            >
                <style>{`
                    [data-blog-theme="dark"] .callout-body strong { color: ${ctp.mocha.text}; }
                    [data-blog-theme="light"] .callout-body strong { color: #111827; }
                    [data-blog-theme="dark"] .callout-body code { background: rgba(255,255,255,0.06); color: ${ctp.mocha.text}; }
                    [data-blog-theme="light"] .callout-body code { background: rgba(0,0,0,0.05); color: #111827; }
                `}</style>
                <div className="callout-body">{children}</div>
            </div>
        </div>
    )
}

/* ── Section Title (h2 with id for TOC) ── */
export function SectionTitle({ id, children }: { id: string; children: ReactNode }) {
    const { theme } = useBlogTheme()
    return (
        <h2
            id={id}
            className="text-2xl sm:text-3xl font-instrument font-medium mt-16 sm:mt-20 mb-6 scroll-mt-28"
            style={{ color: theme === 'dark' ? ctp.mocha.text : '#000' }}
        >
            {children}
        </h2>
    )
}

/* ── SubSection (h3) ── */
export function SubSection({ title, children }: { title: string; children: ReactNode }) {
    const { theme } = useBlogTheme()
    return (
        <div className="mt-10 mb-8">
            <h3
                className="text-lg sm:text-2xl font-medium mb-4"
                style={{ color: theme === 'dark' ? ctp.mocha.text : '#000' }}
            >
                {title}
            </h3>
            {children}
        </div>
    )
}

/* ── Prose wrapper ── */
export function Prose({ children }: { children: ReactNode }) {
    const { theme } = useBlogTheme()
    const isDark = theme === 'dark'
    const p = isDark ? ctp.mocha : ctp.latte

    return (
        <>
            <style>{`
                [data-blog-theme="dark"] .blog-prose strong { color: ${p.text}; }
                [data-blog-theme="light"] .blog-prose strong { color: #000; }
                [data-blog-theme="dark"] .blog-prose code { color: ${p.green}; background: rgba(255,255,255,0.06); }
                [data-blog-theme="light"] .blog-prose code { color: #16a34a; background: rgba(0,0,0,0.05); }
                [data-blog-theme="dark"] .blog-prose a { color: ${p.blue}; }
                [data-blog-theme="light"] .blog-prose a { color: #000; }
                [data-blog-theme="dark"] .blog-prose a:hover { color: ${p.subtext1}; }
                [data-blog-theme="light"] .blog-prose a:hover { color: rgba(0,0,0,0.6); }
            `}</style>
            <div
                className="blog-prose text-base leading-relaxed space-y-4 [&>p>code]:text-[13px] [&>p>code]:px-1.5 [&>p>code]:py-0.5 [&>p>code]:rounded [&>p>code]:font-mono [&>p>a]:underline [&>p>a]:underline-offset-4"
                style={{ color: isDark ? p.subtext0 : 'rgba(0,0,0,0.6)' }}
            >
                {children}
            </div>
        </>
    )
}

/* ── Sticky TOC ── */
export function StickyTOC({ items }: { items: [string, string][] }) {
    const { theme } = useBlogTheme()
    const isDark = theme === 'dark'
    const [activeId, setActiveId] = useState('')

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries.filter(e => e.isIntersecting)
                if (visible.length > 0) setActiveId(visible[0].target.id)
            },
            { rootMargin: '-20% 0px -70% 0px' }
        )

        items.forEach(([id]) => {
            const el = document.getElementById(id)
            if (el) observer.observe(el)
        })

        return () => observer.disconnect()
    }, [items])

    return (
        <nav className="hidden xl:block sticky top-28 self-start w-56 shrink-0">
            <p className={`font-mono text-[10px] mb-4 uppercase tracking-wider ${isDark ? 'text-[#6c7086]' : 'text-black/30'}`}>
                Contenido
            </p>
            <ol className={`space-y-1.5 border-l ${isDark ? 'border-white/10' : 'border-black/10'}`}>
                {items.map(([id, label]) => (
                    <li key={id}>
                        <a
                            href={`#${id}`}
                            className={`block pl-4 py-1 text-[13px] leading-snug transition-colors border-l-2 -ml-px ${
                                activeId === id
                                    ? isDark
                                        ? 'border-[#cdd6f4] text-[#cdd6f4] font-medium'
                                        : 'border-black text-black font-medium'
                                    : isDark
                                        ? 'border-transparent text-[#6c7086] hover:text-[#a6adc8]'
                                        : 'border-transparent text-black/40 hover:text-black/70'
                            }`}
                        >
                            {label}
                        </a>
                    </li>
                ))}
            </ol>
        </nav>
    )
}

/* ── Mobile TOC ── */
export function MobileTOC({ items }: { items: [string, string][] }) {
    const { theme } = useBlogTheme()
    const isDark = theme === 'dark'

    return (
        <nav className={`xl:hidden rounded-xl border p-5 sm:p-6 mb-12 ${
            isDark ? 'border-white/10 bg-white/[0.02]' : 'border-black/10 bg-black/[0.02]'
        }`}>
            <p className={`font-mono text-[10px] mb-4 uppercase tracking-wider ${isDark ? 'text-[#6c7086]' : 'text-black/30'}`}>
                Contenido
            </p>
            <ol className="space-y-2 text-sm">
                {items.map(([id, label]) => (
                    <li key={id}>
                        <a href={`#${id}`} className={`transition-colors ${isDark ? 'text-[#6c7086] hover:text-[#cdd6f4]' : 'text-black/50 hover:text-black'}`}>
                            {label}
                        </a>
                    </li>
                ))}
            </ol>
        </nav>
    )
}
