import "server-only";

import { readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { pastEvents, type PastEvent } from "@/components/events-data";

export type GalleryPhoto = {
  src: string;
  width: number;
  height: number;
};

export type Gallery = {
  slug: string;
  title: string;
  dateLabel: string;
  location: string;
  link?: string;
  cover: GalleryPhoto;
  photos: GalleryPhoto[];
};

const PHOTOS_DIR = path.join(process.cwd(), "public/images/event-photos");
const IMAGE_EXT = /\.(jpe?g|png|webp|avif)$/i;

type GalleryEvent = PastEvent & { gallery: NonNullable<PastEvent["gallery"]> };

// Solo los eventos pasados con `gallery`, en el mismo orden (más reciente primero).
const galleryEvents = pastEvents.filter((e): e is GalleryEvent => Boolean(e.gallery));

export function getGallerySlugs(): string[] {
  return galleryEvents.map((e) => e.gallery.slug);
}

async function readPhotos(slug: string): Promise<GalleryPhoto[]> {
  const files = (await readdir(path.join(PHOTOS_DIR, slug)))
    .filter((f) => IMAGE_EXT.test(f))
    .sort();

  return Promise.all(
    files.map(async (file) => {
      const { width = 0, height = 0, orientation } = await sharp(
        path.join(PHOTOS_DIR, slug, file),
      ).metadata();
      // EXIF 5–8 = rotada 90°, el navegador la muestra con los lados invertidos.
      const rotated = orientation !== undefined && orientation >= 5;
      return {
        src: `/images/event-photos/${slug}/${file}`,
        width: rotated ? height : width,
        height: rotated ? width : height,
      };
    }),
  );
}

async function toGallery(event: GalleryEvent): Promise<Gallery> {
  const { slug, year, cover } = event.gallery;
  const photos = await readPhotos(slug);
  const coverPhoto =
    photos.find((p) => cover && p.src.endsWith(`/${cover}`)) ?? photos[0];

  // La portada abre la galería.
  const ordered = [coverPhoto, ...photos.filter((p) => p !== coverPhoto)];

  return {
    slug,
    title: event.title,
    dateLabel: `${event.day} ${event.month} ${year}`,
    location: event.location,
    link: event.link,
    cover: coverPhoto,
    photos: ordered,
  };
}

export async function getGalleries(): Promise<Gallery[]> {
  return Promise.all(galleryEvents.map(toGallery));
}

export async function getGallery(slug: string): Promise<Gallery | null> {
  const event = galleryEvents.find((e) => e.gallery.slug === slug);
  return event ? toGallery(event) : null;
}
