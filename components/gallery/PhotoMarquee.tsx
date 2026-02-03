"use client";

import { cn } from "@/lib/utils";
import { useMotionValue, animate, motion } from "motion/react";
import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import useMeasure from "react-use-measure";

interface ImageItem {
  src: string;
  alt?: string;
}

interface PhotoMarqueeProps {
  images: ImageItem[];
  rowCount?: number;
  speed?: number;
  gap?: number;
  imageHeight?: string;
  imageBorderRadius?: string;
}

interface MarqueeRowProps {
  images: ImageItem[];
  reverse?: boolean;
  speed?: number;
  gap?: number;
  imageHeight: string;
  imageBorderRadius: string;
  onImageClick: (image: ImageItem) => void;
}

function MarqueeRow({
  images,
  reverse = false,
  speed = 30,
  gap = 16,
  imageHeight,
  imageBorderRadius,
  onImageClick,
}: MarqueeRowProps) {
  const [currentSpeed, setCurrentSpeed] = useState(speed);
  const [ref, { width }] = useMeasure();
  const translation = useMotionValue(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    let controls;
    const contentSize = width + gap;
    const from = reverse ? -contentSize / 2 : 0;
    const to = reverse ? 0 : -contentSize / 2;

    const distanceToTravel = Math.abs(to - from);
    const duration = distanceToTravel / currentSpeed;

    if (isTransitioning) {
      const remainingDistance = Math.abs(translation.get() - to);
      const transitionDuration = remainingDistance / currentSpeed;

      controls = animate(translation, [translation.get(), to], {
        ease: "linear",
        duration: transitionDuration,
        onComplete: () => {
          setIsTransitioning(false);
          setKey((prevKey) => prevKey + 1);
        },
      });
    } else {
      controls = animate(translation, [from, to], {
        ease: "linear",
        duration: duration,
        repeat: Infinity,
        repeatType: "loop",
        repeatDelay: 0,
        onRepeat: () => {
          translation.set(from);
        },
      });
    }

    return controls?.stop;
  }, [key, translation, currentSpeed, width, gap, isTransitioning, reverse]);

  return (
    <div className="overflow-hidden">
      <motion.div
        className="flex w-max"
        style={{
          x: translation,
          gap: `${gap}px`,
        }}
        ref={ref}
        onHoverStart={() => {
          setIsTransitioning(true);
          setCurrentSpeed(speed * 0.3);
        }}
        onHoverEnd={() => {
          setIsTransitioning(true);
          setCurrentSpeed(speed);
        }}
      >
        {/* Duplicate images 3x for seamless loop and to fill viewport */}
        {[...images, ...images, ...images, ...images].map((image, index) => (
          <motion.div
            key={`${image.src}-${index}`}
            className="relative flex-shrink-0 cursor-pointer overflow-hidden"
            style={{
              height: imageHeight,
              borderRadius: imageBorderRadius,
            }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            onClick={() => onImageClick(image)}
          >
            <img
              src={image.src}
              alt={image.alt || "Event photo"}
              className="h-full w-auto object-cover"
              style={{ borderRadius: imageBorderRadius }}
              draggable={false}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

export default function PhotoMarquee({
  images,
  rowCount = 4,
  speed = 30,
  gap = 16,
  imageHeight = "200px",
  imageBorderRadius = "12px",
}: PhotoMarqueeProps) {
  const [enlargedImage, setEnlargedImage] = useState<ImageItem | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Split images into rows
  const rows = Array.from({ length: rowCount }, (_, rowIndex) => {
    const imagesPerRow = Math.ceil(images.length / rowCount);
    const start = rowIndex * imagesPerRow;
    const end = start + imagesPerRow;
    return images.slice(start, end);
  }).filter((row) => row.length > 0);

  // Handle image click
  const handleImageClick = useCallback((image: ImageItem) => {
    setEnlargedImage(image);
  }, []);

  // Handle close
  const handleClose = useCallback(() => {
    setEnlargedImage(null);
  }, []);

  // Handle download
  const handleDownload = useCallback(async (src: string) => {
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = src.split("/").pop() || "photo.jpg";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
      window.open(src, "_blank");
    }
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && enlargedImage) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enlargedImage, handleClose]);

  useEffect(() => {
    if (!enlargedImage || typeof document === "undefined") {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const previousActiveElement = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleFocusTrap = (event: KeyboardEvent) => {
      if (event.key !== "Tab") {
        return;
      }

      const overlay = overlayRef.current;
      if (!overlay) {
        return;
      }

      const focusableElements = overlay.querySelectorAll<HTMLElement>(
        [
          "a[href]",
          "button:not([disabled])",
          "textarea:not([disabled])",
          "input:not([disabled])",
          "select:not([disabled])",
          "[tabindex]:not([tabindex='-1'])",
        ].join(",")
      );

      if (focusableElements.length === 0) {
        event.preventDefault();
        overlay.focus();
        return;
      }

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      const current = document.activeElement as HTMLElement | null;

      if (event.shiftKey && current === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && current === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleFocusTrap);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleFocusTrap);
      previousActiveElement?.focus();
    };
  }, [enlargedImage]);

  return (
    <div className="relative flex h-full w-full flex-col justify-center overflow-hidden">
      {/* Edge fades */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24 bg-gradient-to-b from-background to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-t from-background to-transparent" />

      {/* Marquee rows */}
      <div className="flex flex-col" style={{ gap: `${gap}px` }}>
        {rows.map((rowImages, rowIndex) => (
          <MarqueeRow
            key={rowIndex}
            images={rowImages}
            reverse={rowIndex % 2 === 1}
            speed={speed + (rowIndex % 2 === 0 ? 0 : 5)} // Slight speed variation
            gap={gap}
            imageHeight={imageHeight}
            imageBorderRadius={imageBorderRadius}
            onImageClick={handleImageClick}
          />
        ))}
      </div>

      {/* Enlarged image overlay (rendered via portal to escape stacking context) */}
      {enlargedImage &&
        typeof document !== "undefined" &&
        createPortal(
          <motion.div
            ref={overlayRef}
            className="fixed inset-0 z-[100] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleClose}
            role="dialog"
            aria-modal="true"
            aria-label={enlargedImage.alt || "Expanded photo"}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

            {/* Image container */}
            <motion.div
              className="relative z-10 max-h-[85vh] max-w-[90vw] overflow-hidden rounded-2xl shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={enlargedImage.src}
                alt={enlargedImage.alt || "Event photo"}
                className="max-h-[85vh] w-auto object-contain"
              />

              {/* Close button */}
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close photo"
                ref={closeButtonRef}
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 transition-colors hover:bg-black/80"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              {/* Download button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(enlargedImage.src);
                }}
                aria-label="Download photo"
                className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 transition-colors hover:bg-black/80"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </button>
            </motion.div>
          </motion.div>,
          document.body
        )}
    </div>
  );
}
