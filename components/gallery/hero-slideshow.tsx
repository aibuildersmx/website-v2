"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { GalleryPhoto } from "@/lib/gallery";

type HeroSlideshowProps = {
  photos: GalleryPhoto[];
  alt: string;
  interval?: number;
};

export function HeroSlideshow({ photos, alt, interval = 5000 }: HeroSlideshowProps) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (photos.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = setInterval(() => {
      // Siguiente al azar, nunca la misma que ya está.
      setActive((current) => {
        const next = Math.floor(Math.random() * (photos.length - 1));
        return next >= current ? next + 1 : next;
      });
    }, interval);
    return () => clearInterval(id);
  }, [photos.length, interval]);

  return (
    <>
      {photos.map((photo, i) => (
        <Image
          key={photo.src}
          src={photo.src}
          alt={i === active ? alt : ""}
          fill
          priority={i === 0}
          sizes="100vw"
          className={cn(
            "object-cover transition-opacity duration-1000 ease-in-out",
            i === active ? "opacity-100" : "opacity-0",
          )}
        />
      ))}
    </>
  );
}
