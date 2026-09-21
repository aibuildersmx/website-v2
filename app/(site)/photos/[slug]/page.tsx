import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PhotoGrid } from "@/components/gallery/photo-grid";
import { getGallery, getGallerySlugs } from "@/lib/gallery";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getGallerySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const gallery = await getGallery((await params).slug);
  if (!gallery) return {};

  const title = `${gallery.title} — Fotos | AI Builders MX`;
  const description = `${gallery.photos.length} fotos de ${gallery.title}, ${gallery.dateLabel}.`;
  const images = [{ url: gallery.cover.src, width: gallery.cover.width, height: gallery.cover.height }];

  return {
    title,
    description,
    openGraph: { title, description, images },
    twitter: { card: "summary_large_image", title, description, images },
  };
}

export default async function GalleryPage({ params }: Props) {
  const gallery = await getGallery((await params).slug);
  if (!gallery) notFound();

  const external = gallery.link?.startsWith("http");

  return (
    <main className="bg-white pt-28 pb-16 text-[#212121] sm:pt-36 sm:pb-24 md:pb-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Link
          href="/photos"
          className="font-mono text-xs uppercase tracking-widest text-black/40 transition-colors hover:text-[#212121]"
        >
          ← Todas las galerías
        </Link>

        <div className="mt-6 flex flex-col gap-6 border-b border-black/5 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-black/40">
              {gallery.dateLabel} · {gallery.location} · {gallery.photos.length} fotos
            </p>
            <h1 className="mt-3 font-instrument text-5xl font-medium md:text-6xl">{gallery.title}</h1>
          </div>
          {gallery.link && (
            <Link
              href={gallery.link}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              className="shrink-0 self-start rounded-full bg-[#212121] px-5 py-3 font-mono text-xs uppercase tracking-widest text-white transition-colors hover:bg-black/80 md:self-auto"
            >
              Ver evento →
            </Link>
          )}
        </div>

        <div className="mt-8">
          <PhotoGrid photos={gallery.photos} title={gallery.title} />
        </div>
      </div>
    </main>
  );
}
