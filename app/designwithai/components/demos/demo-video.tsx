'use client';

import { useRef, useEffect, useState } from 'react';

type DemoVideoProps = {
  mp4Src: string;
  movFallbackSrc?: string;
  title: string;
  active?: boolean;
};

export default function DemoVideo({ mp4Src, title, active = false }: DemoVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState(false);

  // Only set the src when the slide becomes active (lazy load)
  useEffect(() => {
    if (active && !loaded) {
      setLoaded(true);
    }
  }, [active, loaded]);

  // Play/pause based on visibility
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (active) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [active]);

  return (
    <div className="relative h-full w-full bg-black">
      {loaded && (
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          loop
          muted
          playsInline
          preload="metadata"
          aria-label={title}
        >
          <source src={mp4Src} type="video/mp4" />
        </video>
      )}
    </div>
  );
}
