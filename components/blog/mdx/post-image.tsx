'use client'

import Image from 'next/image'
import { useBlogTheme } from '@/app/(blog)/layout'
import { cn } from '@/lib/utils'

/**
 * Themed screenshot / figure for blog posts. Wraps `next/image` with a
 * rounded container, theme-aware border, and an optional caption.
 *
 * Use this instead of raw markdown `![alt](src)` when you have a screenshot
 * to show. `width` and `height` are required (used by next/image for layout
 * stability and are not clipped — the image scales to the article width).
 *
 * Example:
 * ```mdx
 * <PostImage
 *   src="/images/blog/second-brain/step-2.png"
 *   alt="Estructura de proyecto en Cursor"
 *   width={800}
 *   height={500}
 *   caption="Optional caption below the image"
 * />
 * ```
 */
export function PostImage({
    src,
    alt,
    width,
    height,
    caption,
}: {
    src: string
    alt: string
    width: number
    height: number
    caption?: string
}) {
    const { theme } = useBlogTheme()
    const isDark = theme === 'dark'

    return (
        <figure className="my-8">
            <Image
                src={src}
                alt={alt}
                width={width}
                height={height}
                className={cn(
                    'rounded-xl border w-full h-auto',
                    isDark ? 'border-white/10' : 'border-black/10',
                )}
            />
            {caption ? (
                <figcaption
                    className={cn(
                        'mt-3 text-center text-sm italic',
                        isDark ? 'text-[#6c7086]' : 'text-black/40',
                    )}
                >
                    {caption}
                </figcaption>
            ) : null}
        </figure>
    )
}
