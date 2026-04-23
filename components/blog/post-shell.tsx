'use client'

import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { useBlogTheme } from '@/app/(blog)/layout'
import { StickyTOC, MobileTOC } from '@/components/blog/shared'
import type { BlogAuthor } from '@/lib/blog/authors'
import type { BlogPostSource } from '@/lib/blog/posts'
import { cn } from '@/lib/utils'

/* ── Types ── */

export type PostShellTocItem = [id: string, label: string]

export type PostShellProps = {
    /** Post title (renders as H1 in Instrument Serif) */
    title: string
    /** Optional lede under the title */
    description?: string
    /** Human-readable date string, already formatted (e.g. "20 Feb 2026") */
    date: string
    /** Approximate reading time (e.g. "10 min") */
    readTime: string
    /** Table of contents pairs `[id, label]`. When empty, the TOC is hidden. */
    tocItems?: PostShellTocItem[]
    /**
     * Author profile resolved from [lib/blog/authors.ts](/lib/blog/authors.ts).
     * Renders a 24px circle avatar + name in the header meta row. Omit to
     * hide the byline.
     */
    author?: BlogAuthor | null
    /**
     * Path under `/public` (e.g. "/images/blog/la-zona-tibia/cover.jpg").
     * When provided, renders as a full-width banner below the header and
     * is picked up by `generateMetadata` for OG/Twitter previews.
     */
    cover?: string
    /**
     * Optional attribution pill shown above the meta row — links back to
     * the original publication the post was derived from (tweet, article…).
     */
    source?: BlogPostSource
    /** Where the top-left back link points. Defaults to `/blog`. */
    backHref?: string
    /** Label for the back link. Defaults to `Blog`. */
    backLabel?: string
    /** Rendered MDX body */
    children: ReactNode
}

/* ── Component ── */

/**
 * Universal layout wrapper for blog posts.
 *
 * Renders: back link → centered header (date · readTime, H1, lede) →
 * MobileTOC → two-column (StickyTOC + article).
 *
 * The `<article>` element exposes `className="post-content"` and emits a
 * `<style>` block that themes every markdown-generated element
 * (p, strong, code, a, ul/ol/li, blockquote, hr, h3/h4, table) via the
 * blog's Catppuccin palette. Custom components (Callout, CodeBlock,
 * Terminal, SectionTitle, SubSection) provide their own containers and
 * are not affected.
 */
export default function PostShell({
    title,
    description,
    date,
    readTime,
    tocItems = [],
    author,
    cover,
    source,
    backHref = '/blog',
    backLabel = 'Blog',
    children,
}: PostShellProps) {
    const { theme } = useBlogTheme()
    const isDark = theme === 'dark'

    const textPrimary = isDark ? 'text-[#cdd6f4]' : 'text-black'
    const textDimmed = isDark ? 'text-[#6c7086]' : 'text-black/40'

    const hasToc = tocItems.length > 0

    return (
        <div className="mx-auto max-w-6xl px-6">
            {/* Back link */}
            <Link
                href={backHref}
                className={`inline-flex items-center gap-2 ${textDimmed} hover:${textPrimary} transition-colors text-sm font-mono mb-8 sm:mb-12`}
            >
                <ArrowLeft className="w-4 h-4" /> {backLabel}
            </Link>

            {/* Header */}
            <header className={cn('text-center', cover ? 'mb-10' : 'mb-16')}>
                {source && <SourcePill source={source} isDark={isDark} />}
                <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 mb-6">
                    <span className={`font-mono text-xs ${textDimmed}`}>{date}</span>
                    <span className={isDark ? 'text-white/20' : 'text-black/20'}>·</span>
                    <span className={`font-mono text-xs ${textDimmed}`}>{readTime}</span>
                    {author && (
                        <>
                            <span className={isDark ? 'text-white/20' : 'text-black/20'}>·</span>
                            <AuthorByline author={author} isDark={isDark} />
                        </>
                    )}
                </div>
                <h1
                    className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-instrument font-medium tracking-tight mb-6 leading-[1.1] ${textPrimary}`}
                >
                    {title}
                </h1>
                {description && (
                    <p
                        className={`text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed ${
                            isDark ? 'text-[#a6adc8]' : 'text-black/50'
                        }`}
                    >
                        {description}
                    </p>
                )}
            </header>

            {cover && (
                <figure
                    className={cn(
                        'mb-16 overflow-hidden rounded-xl sm:rounded-2xl border',
                        isDark ? 'border-white/10' : 'border-black/10',
                    )}
                >
                    <Image
                        src={cover}
                        alt={`Portada — ${title}`}
                        width={1200}
                        height={480}
                        priority
                        className="w-full h-auto object-cover"
                    />
                </figure>
            )}

            {hasToc && <MobileTOC items={tocItems} />}

            {/* Layout: sidebar + content.
                When the post has a TOC we keep the two-column grid (sidebar
                left, article right). Without a TOC the sidebar disappears
                and we center the article inside the 6xl shell so it lines
                up with the centered header above instead of hugging the
                left edge. */}
            <div className="flex gap-16">
                {hasToc && <StickyTOC items={tocItems} />}

                <article
                    className={cn(
                        'post-content min-w-0 flex-1 max-w-3xl',
                        !hasToc && 'mx-auto',
                    )}
                >
                    {/* Theme-aware CSS for markdown-generated elements.
                        Custom components (Callout/CodeBlock/Terminal) own their
                        own styling and are unaffected. */}
                    <style>{POST_CONTENT_CSS}</style>
                    {children}
                </article>
            </div>
        </div>
    )
}

/* ── Author byline (avatar + name) ── */

/**
 * Compact author pill rendered inside the header's meta row.
 * Uses a 24px grayscale circle to match the team card treatment on the
 * homepage; `next/image` is configured with a small size so the same avif
 * asset serves both surfaces without extra payload.
 */
function AuthorByline({ author, isDark }: { author: BlogAuthor; isDark: boolean }) {
    const textDimmed = isDark ? 'text-[#6c7086]' : 'text-black/40'
    const textPrimary = isDark ? 'text-[#cdd6f4]' : 'text-black'

    const content = (
        <span className="inline-flex items-center gap-1.5 group">
            <Image
                src={author.avatar}
                alt=""
                width={48}
                height={48}
                className="size-5 rounded-full object-cover grayscale group-hover:grayscale-0 transition duration-300"
            />
            <span className={cn('font-mono text-xs transition-colors', textDimmed, `group-hover:${textPrimary}`)}>
                {author.name}
            </span>
        </span>
    )

    if (!author.href) return content
    return (
        <Link
            href={author.href}
            target={author.href.startsWith('http') ? '_blank' : undefined}
            rel={author.href.startsWith('http') ? 'noopener noreferrer' : undefined}
            aria-label={`Perfil de ${author.name}`}
        >
            {content}
        </Link>
    )
}

/* ── Source pill (e.g. "Extraído de X") ── */

/**
 * Small attribution pill that links to the post's source. Kept tiny and
 * visually secondary so it never competes with the H1.
 */
function SourcePill({ source, isDark }: { source: BlogPostSource; isDark: boolean }) {
    return (
        <div className="mb-5 flex justify-center">
            <Link
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                    'group inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-widest transition-colors',
                    isDark
                        ? 'border-white/10 text-[#6c7086] hover:border-white/20 hover:text-[#cdd6f4]'
                        : 'border-black/10 text-black/50 hover:border-black/20 hover:text-black',
                )}
            >
                <span>{source.label}</span>
                <ArrowUpRight className="size-3 transition-transform group-hover:-translate-y-[1px] group-hover:translate-x-[1px]" />
            </Link>
        </div>
    )
}

/* ── Inline CSS for markdown elements ── */

/**
 * Every markdown-generated element inside an MDX post flows through this
 * stylesheet. Keep selectors scoped to `.post-content` so we never leak
 * into callouts, code blocks, or the rest of the site.
 *
 * When extending: mirror the dark/light structure and reference the
 * Catppuccin palette documented in `components/blog/shared.tsx`.
 */
const POST_CONTENT_CSS = `
/* ── Base body text ── */
.post-content {
    font-size: 1rem;
    line-height: 1.7;
}
[data-blog-theme="dark"] .post-content { color: #a6adc8; }
[data-blog-theme="light"] .post-content { color: rgba(0, 0, 0, 0.65); }

/* ── Paragraphs ── */
.post-content p {
    margin-top: 0;
    margin-bottom: 1rem;
}
.post-content p:last-child { margin-bottom: 0; }

/* ── Strong / em ── */
.post-content strong { font-weight: 600; }
[data-blog-theme="dark"] .post-content strong { color: #cdd6f4; }
[data-blog-theme="light"] .post-content strong { color: #000; }
.post-content em { font-style: italic; }

/* ── Inline code ── */
.post-content code {
    font-family: var(--font-geist-mono), ui-monospace, monospace;
    font-size: 0.8125rem;
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
}
[data-blog-theme="dark"] .post-content code { color: #a6e3a1; background: rgba(255, 255, 255, 0.06); }
[data-blog-theme="light"] .post-content code { color: #16a34a; background: rgba(0, 0, 0, 0.05); }

/* ── Links ──
   Scoped with :not(.no-underline) so custom MDX components (ResourceLinks,
   DownloadButton, etc.) can opt out by setting className="...no-underline".
*/
.post-content a:not(.no-underline) {
    text-decoration: underline;
    text-underline-offset: 4px;
    transition: color 150ms ease;
}
[data-blog-theme="dark"] .post-content a:not(.no-underline) { color: #89b4fa; }
[data-blog-theme="light"] .post-content a:not(.no-underline) { color: #000; }
[data-blog-theme="dark"] .post-content a:not(.no-underline):hover { color: #bac2de; }
[data-blog-theme="light"] .post-content a:not(.no-underline):hover { color: rgba(0, 0, 0, 0.6); }

/* ── Lists ── */
.post-content ul,
.post-content ol {
    padding-left: 1.5rem;
    margin-top: 0;
    margin-bottom: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}
.post-content ul { list-style-type: disc; }
.post-content ol { list-style-type: decimal; }
.post-content li { line-height: 1.7; padding-left: 0.25rem; }
.post-content li > ul,
.post-content li > ol { margin-top: 0.5rem; }

/* ── Blockquote ── */
.post-content blockquote {
    padding-left: 1rem;
    margin: 1.5rem 0;
    font-style: italic;
    border-left: 4px solid;
}
[data-blog-theme="dark"] .post-content blockquote { border-color: #89b4fa; color: #a6adc8; }
[data-blog-theme="light"] .post-content blockquote { border-color: #000; color: rgba(0, 0, 0, 0.6); }

/* ── Horizontal rule ── */
.post-content hr {
    border: 0;
    border-top: 1px solid;
    margin: 2.5rem 0;
}
[data-blog-theme="dark"] .post-content hr { border-color: rgba(255, 255, 255, 0.1); }
[data-blog-theme="light"] .post-content hr { border-color: rgba(0, 0, 0, 0.1); }

/* ── Raw markdown h3 / h4 (prefer <SubSection> for semantic headings) ── */
.post-content h3 {
    font-family: var(--font-instrument-serif), serif;
    font-size: 1.375rem;
    font-weight: 500;
    margin-top: 2.5rem;
    margin-bottom: 1rem;
    line-height: 1.2;
}
.post-content h4 {
    font-family: var(--font-instrument-serif), serif;
    font-size: 1.125rem;
    font-weight: 500;
    margin-top: 2rem;
    margin-bottom: 0.75rem;
    line-height: 1.3;
}
[data-blog-theme="dark"] .post-content h3,
[data-blog-theme="dark"] .post-content h4 { color: #cdd6f4; }
[data-blog-theme="light"] .post-content h3,
[data-blog-theme="light"] .post-content h4 { color: #000; }

/* ── GFM tables ── */
.post-content table {
    width: 100%;
    border-collapse: collapse;
    margin: 1.5rem 0;
    font-size: 0.875rem;
    line-height: 1.5;
}
.post-content th,
.post-content td {
    padding: 0.625rem 0.75rem;
    text-align: left;
    vertical-align: top;
    border-bottom: 1px solid;
}
.post-content th { font-weight: 600; }
[data-blog-theme="dark"] .post-content th { color: #cdd6f4; border-color: rgba(255, 255, 255, 0.14); }
[data-blog-theme="light"] .post-content th { color: #000; border-color: rgba(0, 0, 0, 0.14); }
[data-blog-theme="dark"] .post-content td { border-color: rgba(255, 255, 255, 0.08); }
[data-blog-theme="light"] .post-content td { border-color: rgba(0, 0, 0, 0.08); }

/* ── Task lists (GFM checkboxes) ── */
.post-content li input[type="checkbox"] {
    margin-right: 0.5rem;
    accent-color: currentColor;
}
`
