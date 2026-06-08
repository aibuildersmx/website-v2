'use client';

type DemoVideoProps = {
  mp4Src: string;
  movFallbackSrc?: string;
  title: string;
  active?: boolean;
};

export default function DemoVideo({ mp4Src, title }: DemoVideoProps) {
  return (
    <div className="relative w-full h-full">
      <video
        className="block w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        aria-label={title}
      >
        <source src={mp4Src} type="video/mp4" />
      </video>
    </div>
  );
}
