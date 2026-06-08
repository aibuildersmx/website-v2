import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import PostShell from '@/components/blog/post-shell'
import { getAuthor } from '@/lib/blog/authors'
import { formatPostDate, getAllPostSlugs, getPostBySlug } from '@/lib/blog/posts'

type PageProps = {
    params: Promise<{ slug: string }>
}

export const dynamicParams = false

export async function generateStaticParams() {
    return getAllPostSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params
    const post = getPostBySlug(slug)
    if (!post) return {}

    const { title, description, cover } = post.meta
    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: 'article',
            images: cover ? [{ url: cover }] : undefined,
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: cover ? [cover] : undefined,
        },
    }
}

export default async function BlogPostPage({ params }: PageProps) {
    const { slug } = await params
    const post = getPostBySlug(slug)
    if (!post) notFound()

    // Dynamic import — Next.js emits a chunk per MDX file at build time because
    // `content/blog/*.mdx` is statically reachable from the `@/` alias root.
    const { default: PostMDX } = await import(`@/content/blog/${slug}.mdx`)

    return (
        <PostShell
            title={post.meta.title}
            description={post.meta.description}
            date={formatPostDate(post.meta.date, 'es-MX')}
            readTime={post.meta.readTime}
            tocItems={post.meta.tocItems}
            author={getAuthor(post.meta.author)}
            cover={post.meta.cover}
            source={post.meta.source}
        >
            <PostMDX />
        </PostShell>
    )
}
