'use client';

import { useMemo, useState } from 'react';

type DemoVideoProps = {
  mp4Src: string;
  movFallbackSrc?: string;
  title: string;
};

export default function DemoVideo({ mp4Src, movFallbackSrc, title }: DemoVideoProps) {
  const [useFallback, setUseFallback] = useState(false);
  const activeSrc = useFallback && movFallbackSrc ? movFallbackSrc : mp4Src;
  const activeType = useMemo(() => (activeSrc.endsWith('.mov') ? 'video/quicktime' : 'video/mp4'), [activeSrc]);

  return (
    <div className="relative h-full w-full bg-black">
      <video
        key={activeSrc}
        className="h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-label={title}
        onError={() => {
          if (!useFallback && movFallbackSrc) {
            setUseFallback(true);
          }
        }}
      >
        <source src={activeSrc} type={activeType} />
      </video>
    </div>
  );
}
