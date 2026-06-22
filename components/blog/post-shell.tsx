'use client'

import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { StickyTOC, MobileTOC } from '@/components/blog/shared'
import type { BlogAuthor } from '@/lib/blog/authors'
import type { BlogPostCredit, BlogPostSource } from '@/lib/blog/posts'
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
     * Renders a 20px circle avatar + name in the header meta row. Omit to
     * hide the byline.
     */
    author?: BlogAuthor | null
    /**
     * Path under `/public` (e.g. "/images/blog/la-zona-tibia/cover.jpg").
     * When provided, renders as a full-width banner below the header and
     * is picked up by `generateMetadata` for OG/Twitter previews.
     */
    cover?: string
    /** Optional credit for the cover image, shown small directly under it. */
    coverCredit?: BlogPostCredit
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
 * Universal layout wrapper for blog posts. Binary black/white, light-only —
 * the same visual language as the rest of aibuilders.mx.
 *
 * Renders: back link → centered header (date · readTime · byline, H1, lede) →
 * MobileTOC → two-column (StickyTOC + article).
 *
 * The `<article>` element exposes `className="post-content"` and emits a
 * `<style>` block that themes every markdown-generated element (p, strong,
 * code, a, ul/ol/li, blockquote, hr, h3/h4, table). Reading size is ~19px
 * for comfortable long-form. Custom components (Callout, CodeBlock, Terminal,
 * SectionTitle, SubSection) provide their own containers and are unaffected.
 */
export default function PostShell({
    title,
    description,
    date,
    readTime,
    tocItems = [],
    author,
    cover,
    coverCredit,
    source,
    backHref = '/blog',
    backLabel = 'Blog',
    children,
}: PostShellProps) {
    const hasToc = tocItems.length > 0

    return (
        <div className="mx-auto max-w-6xl px-6">
            {/* Back link */}
            <Link
                href={backHref}
                className="inline-flex items-center gap-2 text-black/40 hover:text-black transition-colors text-sm font-mono mb-8 sm:mb-12"
            >
                <ArrowLeft className="w-4 h-4" /> {backLabel}
            </Link>

            {/* Header */}
            <header className={cn('text-center', cover ? 'mb-10' : 'mb-16')}>
                {source && <SourcePill source={source} />}
                <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 mb-6">
                    <span className="font-mono text-xs text-black/40">{date}</span>
                    <span className="text-black/20">·</span>
                    <span className="font-mono text-xs text-black/40">{readTime}</span>
                    {author && (
                        <>
                            <span className="text-black/20">·</span>
                            <AuthorByline author={author} />
                        </>
                    )}
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-instrument font-medium tracking-tight mb-6 leading-[1.1] text-black text-balance">
                    {title}
                </h1>
                {description && (
                    <p className="text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed text-black/50 text-pretty">
                        {description}
                    </p>
                )}
            </header>

            {cover && (
                <figure className="mb-16">
                    <div className="overflow-hidden rounded-xl sm:rounded-2xl border border-black/10">
                        <Image
                            src={cover}
                            alt={`Portada — ${title}`}
                            width={1200}
                            height={480}
                            priority
                            className="w-full h-auto object-cover"
                        />
                    </div>
                    {coverCredit && (
                        <figcaption className="mt-2 text-right font-mono text-[11px] text-black/40">
                            {coverCredit.url ? (
                                <a
                                    href={coverCredit.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="transition-colors hover:text-black"
                                >
                                    Foto: {coverCredit.label}
                                </a>
                            ) : (
                                <>Foto: {coverCredit.label}</>
                            )}
                        </figcaption>
                    )}
                </figure>
            )}

            {hasToc && <MobileTOC items={tocItems} />}

            {/* Layout: sidebar + content.
                When the post has a TOC we keep the two-column grid (sidebar
                left, article right). Without a TOC the sidebar disappears
                and we center the article inside the 6xl shell so it lines
                up with the centered header above instead of hugging the
                left edge. */}
            <div className="flex md:gap-16 md:px-8">
                {hasToc && <StickyTOC items={tocItems} />}

                <article className="post-content min-w-0 flex-1">
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
 * Uses a 20px grayscale circle to match the team card treatment on the
 * homepage; `next/image` is configured with a small size so the same avif
 * asset serves both surfaces without extra payload.
 */
function AuthorByline({ author }: { author: BlogAuthor }) {
    const content = (
        <span className="inline-flex items-center gap-1.5 group">
            <Image
                src={author.avatar}
                alt=""
                width={48}
                height={48}
                className="size-5 rounded-full object-cover grayscale group-hover:grayscale-0 transition duration-300"
            />
            <span className="font-mono text-xs text-black/40 transition-colors group-hover:text-black">
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
function SourcePill({ source }: { source: BlogPostSource }) {
    return (
        <div className="mb-5 flex justify-center">
            <Link
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-black/50 transition-colors hover:border-black/20 hover:text-black"
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
 * stylesheet. Keep selectors scoped to `.post-content` so we never leak into
 * callouts, code blocks, or the rest of the site.
 *
 * Binary black/white only. Body reads at ~19px for comfortable long-form.
 * When extending, stick to the black opacity ramp — no hex, no accent hues.
 */
const POST_CONTENT_CSS = `
/* ── Base body text ── */
.post-content {
    font-size: 1.0625rem;
    line-height: 1.55;
    color: rgba(0, 0, 0, 0.7);
}

/* ── Paragraphs ── */
.post-content p {
    margin-top: 0;
    margin-bottom: 1.25rem;
}
.post-content p:last-child { margin-bottom: 0; }

/* ── Strong / em ── */
.post-content strong { font-weight: 600; color: #000; }
.post-content em { font-style: italic; }

/* ── Inline code ── */
.post-content code {
    font-family: var(--font-geist-mono), ui-monospace, monospace;
    font-size: 0.875em;
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    color: #000;
    background: rgba(0, 0, 0, 0.05);
}

/* ── Links ──
   Scoped with :not(.no-underline) so custom MDX components (ResourceLinks,
   DownloadButton, etc.) can opt out by setting className="...no-underline".
*/
.post-content a:not(.no-underline) {
    color: #000;
    text-decoration: underline;
    text-decoration-color: rgba(0, 0, 0, 0.3);
    text-underline-offset: 4px;
    transition: text-decoration-color 150ms ease;
}
.post-content a:not(.no-underline):hover { text-decoration-color: #000; }

/* ── Lists ── */
.post-content ul,
.post-content ol {
    padding-left: 1.5rem;
    margin-top: 0;
    margin-bottom: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}
.post-content ul { list-style-type: disc; }
.post-content ol { list-style-type: decimal; }
.post-content li { line-height: 1.65; padding-left: 0.25rem; }
.post-content li::marker { color: rgba(0, 0, 0, 0.4); }
.post-content li > ul,
.post-content li > ol { margin-top: 0.5rem; }

/* ── Blockquote ──
   Full hairline card with a subtle tint — no side-stripe accent. */
.post-content blockquote {
    margin: 1.75rem 0;
    padding: 1rem 1.25rem;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 0.75rem;
    background: rgba(0, 0, 0, 0.02);
    font-style: italic;
    color: rgba(0, 0, 0, 0.6);
}
.post-content blockquote p:last-child { margin-bottom: 0; }

/* ── Horizontal rule ── */
.post-content hr {
    border: 0;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    margin: 2.5rem 0;
}

/* ── Raw markdown h3 / h4 (prefer <SubSection> for semantic headings) ── */
.post-content h3 {
    font-family: var(--font-instrument-serif), serif;
    font-size: 1.625rem;
    font-weight: 500;
    color: #000;
    margin-top: 2.75rem;
    margin-bottom: 1rem;
    line-height: 1.2;
}
.post-content h4 {
    font-family: var(--font-instrument-serif), serif;
    font-size: 1.25rem;
    font-weight: 500;
    color: #000;
    margin-top: 2rem;
    margin-bottom: 0.75rem;
    line-height: 1.3;
}

/* ── GFM tables ── */
.post-content table {
    width: 100%;
    border-collapse: collapse;
    margin: 1.5rem 0;
    font-size: 0.9375rem;
    line-height: 1.5;
}
.post-content th,
.post-content td {
    padding: 0.625rem 0.75rem;
    text-align: left;
    vertical-align: top;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}
.post-content th { font-weight: 600; color: #000; border-color: rgba(0, 0, 0, 0.14); }

/* ── Task lists (GFM checkboxes) ── */
.post-content li input[type="checkbox"] {
    margin-right: 0.5rem;
    accent-color: #000;
}
`
