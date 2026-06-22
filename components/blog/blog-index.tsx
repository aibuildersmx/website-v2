import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
// Note: the cover image is intentionally NOT shown on the blog index cards —
// we keep the grid typographic and only surface the hero image once the
// reader opens the full article in `PostShell`.
import { getAuthor, type BlogAuthor } from '@/lib/blog/authors'
import type { BlogPostMeta } from '@/lib/blog/posts'

export type BlogIndexPost = BlogPostMeta & {
    /** ISO date already formatted for display, e.g. "20 Feb 2026" */
    formattedDate: string
}

/**
 * Blog index (`/blog`) — design-system card grid of all published posts.
 *
 * Binary black/white, matching the rest of the site. The parent server page
 * pre-computes `formattedDate` so the fs-backed data layer stays off the
 * browser bundle.
 */
export default function BlogIndex({ posts }: { posts: BlogIndexPost[] }) {
    return (
        <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
            <div className="mb-12 sm:mb-16">
                <span className="inline-block font-mono text-xs uppercase tracking-widest mb-4 text-black/40">
                    Blog
                </span>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-instrument font-medium tracking-tight mb-4 leading-[1.1] text-black text-balance">
                    Notas y guías
                </h1>
                <p className="text-lg sm:text-xl max-w-2xl leading-relaxed text-black/60">
                    Escritura de la comunidad: cómo construimos con IA, qué aprendemos y cómo llevamos ideas a producción.
                </p>
            </div>

            {posts.length === 0 ? (
                <EmptyState />
            ) : (
                <div className="grid gap-4 sm:gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {posts.map((post) => (
                        <PostCard key={post.slug} post={post} />
                    ))}
                </div>
            )}
        </section>
    )
}

/* ── Card ── */

function PostCard({ post }: { post: BlogIndexPost }) {
    const author = getAuthor(post.author)
    return (
        <Link href={`/blog/${post.slug}`} className="block group h-full">
            <article className="h-full overflow-hidden rounded-xl sm:rounded-2xl border border-black/10 hover:border-black/20 hover:shadow-lg hover:shadow-black/5 bg-white transition-all duration-500 flex flex-col">
                <div className="flex flex-1 flex-col p-6 sm:p-7">
                    <div className="mb-4 space-y-2">
                        <div className="flex items-center gap-x-3 font-mono text-xs text-black/40">
                            <span>{post.formattedDate}</span>
                            <span className="text-black/20">·</span>
                            <span>{post.readTime}</span>
                        </div>
                        {author && <CardAuthor author={author} />}
                    </div>

                    <h2 className="font-instrument font-medium text-2xl sm:text-3xl mb-3 leading-[1.15] text-black text-balance">
                        {post.title}
                    </h2>

                    <p className="text-base leading-relaxed mb-6 flex-grow text-black/60">
                        {post.description}
                    </p>

                    <div className="flex items-center justify-between">
                        {post.tags && post.tags.length > 0 ? (
                            <div className="flex gap-2 flex-wrap">
                                {post.tags.slice(0, 2).map((tag) => (
                                    <span
                                        key={tag}
                                        className="inline-block font-mono text-[10px] uppercase tracking-widest px-2 py-1 rounded-full border border-black/10 text-black/40"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <span />
                        )}
                        <span className="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-widest transition-colors text-black/40 group-hover:text-black">
                            Leer
                            <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                        </span>
                    </div>
                </div>
            </article>
        </Link>
    )
}

/**
 * Compact author chip for the index cards. Matches the byline treatment in
 * [PostShell](/components/blog/post-shell.tsx) so the visual language stays
 * identical between the index and detail views.
 */
function CardAuthor({ author }: { author: BlogAuthor }) {
    return (
        <span className="inline-flex items-center gap-1.5">
            <Image
                src={author.avatar}
                alt=""
                width={48}
                height={48}
                className="size-5 rounded-full object-cover grayscale"
            />
            <span className="font-mono text-xs text-black/40">{author.name}</span>
        </span>
    )
}

/* ── Empty state ── */

function EmptyState() {
    return (
        <div className="rounded-xl border border-black/10 bg-black/[0.02] p-12 text-center">
            <p className="font-mono text-sm text-black/40">Aún no hay posts publicados.</p>
        </div>
    )
}
