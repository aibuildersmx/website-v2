import type { Metadata } from 'next'

import BlogIndex, { type BlogIndexPost } from '@/components/blog/blog-index'
import { formatPostDate, getAllPosts } from '@/lib/blog/posts'

export const metadata: Metadata = {
    title: 'Blog — AI Builders Mexico',
    description:
        'Notas, guías y reflexiones de la comunidad AI Builders Mexico: cómo construimos con IA, qué aprendemos y cómo llevamos ideas a producción.',
    openGraph: {
        title: 'Blog — AI Builders Mexico',
        description:
            'Notas, guías y reflexiones de la comunidad AI Builders Mexico: cómo construimos con IA, qué aprendemos y cómo llevamos ideas a producción.',
        type: 'website',
    },
}

export default function BlogIndexPage() {
    const posts: BlogIndexPost[] = getAllPosts().map((post) => ({
        ...post,
        formattedDate: formatPostDate(post.date, 'es-MX'),
    }))

    return <BlogIndex posts={posts} />
}
