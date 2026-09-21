import Image from "next/image";
import Link from "next/link";
import { HeroSlideshow } from "@/components/gallery/hero-slideshow";
import { getGalleries, type Gallery } from "@/lib/gallery";

// Portada + 4 más para el hero. Horizontales primero: las verticales se
// recortan feo a todo lo ancho.
function heroPhotos({ cover, photos }: Gallery) {
  const rest = photos.filter((p) => p !== cover);
  const landscape = rest.filter((p) => p.width > p.height);
  const portrait = rest.filter((p) => p.width <= p.height);
  return [cover, ...landscape, ...portrait].slice(0, 5);
}

export default async function PhotosPage() {
  const [featured, ...rest] = await getGalleries();

  return (
    <main className="bg-white text-[#212121]">
      {featured && (
        <Link
          href={`/photos/${featured.slug}`}
          className="group relative block h-[80svh] min-h-[520px] w-full overflow-hidden bg-[#212121]"
        >
          <div className="absolute inset-0 transition duration-700 group-hover:scale-[1.02]">
            <HeroSlideshow photos={heroPhotos(featured)} alt={featured.title} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#212121] via-[#212121]/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0">
            <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-10 sm:px-6 md:flex-row md:items-end md:justify-between md:pb-16">
              <div>
                <p className="flex items-center gap-2 font-mono text-xs uppercase text-white/70">
                  <span className="size-1.5 rounded-full bg-green-500" />
                  Nuevo · {featured.dateLabel}
                </p>
                <h1 className="mt-3 font-instrument text-5xl font-medium text-white md:text-8xl">
                  {featured.title}
                </h1>
              </div>
              <span className="shrink-0 self-start rounded-full bg-white px-5 py-3 font-mono text-xs uppercase tracking-widest text-[#212121] transition-colors group-hover:bg-white/90 md:self-auto">
                Ver las {featured.photos.length} fotos →
              </span>
            </div>
          </div>
        </Link>
      )}

      {rest.length > 0 && (
        <section className="border-t border-black/5 py-16 sm:py-24 md:py-32">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <span className="text-[10px] font-mono uppercase tracking-widest text-black/40 sm:text-xs">
              Galería
            </span>
            <h2 className="mt-3 font-instrument text-4xl font-medium md:text-6xl">
              Así se ve construir juntos.
            </h2>
            <p className="mt-4 max-w-xl font-inter leading-relaxed text-black/60">
              Fotos de cada evento de AI Builders México.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((gallery) => (
                <Link
                  key={gallery.slug}
                  href={`/photos/${gallery.slug}`}
                  className="group rounded-2xl border border-black/10 p-2 transition-colors hover:border-black/20"
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-black/5">
                    <Image
                      src={gallery.cover.src}
                      alt={gallery.title}
                      fill
                      sizes="(min-width: 1024px) 368px, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest">
                      {gallery.photos.length} fotos
                    </span>
                  </div>
                  <div className="px-2 pb-2 pt-4">
                    <p className="font-mono text-[11px] uppercase tracking-widest text-black/40">
                      {gallery.dateLabel}
                    </p>
                    <h3 className="mt-1.5 font-instrument text-2xl font-medium">{gallery.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
