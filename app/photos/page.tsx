"use client";

import PhotoMarquee from "@/components/gallery/PhotoMarquee";
import { useIsMobile } from "@/hooks/use-mobile";

// Event photos configuration
const photos = [
  { src: "/images/event-photos/v0/DSC00048.jpg", alt: "v0 Prompt to Production Event" },
  { src: "/images/event-photos/v0/DSC00049.jpg", alt: "v0 Prompt to Production Event" },
  { src: "/images/event-photos/v0/DSC00050.jpg", alt: "v0 Prompt to Production Event" },
  { src: "/images/event-photos/v0/DSC00052.jpg", alt: "v0 Prompt to Production Event" },
  { src: "/images/event-photos/v0/DSC00053.jpg", alt: "v0 Prompt to Production Event" },
  { src: "/images/event-photos/v0/DSC00054.jpg", alt: "v0 Prompt to Production Event" },
  { src: "/images/event-photos/v0/DSC00059.jpg", alt: "v0 Prompt to Production Event" },
  { src: "/images/event-photos/v0/DSC00061.jpg", alt: "v0 Prompt to Production Event" },
  { src: "/images/event-photos/v0/DSC00063.jpg", alt: "v0 Prompt to Production Event" },
  { src: "/images/event-photos/v0/DSC00065.jpg", alt: "v0 Prompt to Production Event" },
  { src: "/images/event-photos/v0/DSC00067.jpg", alt: "v0 Prompt to Production Event" },
  { src: "/images/event-photos/v0/DSC00072.jpg", alt: "v0 Prompt to Production Event" },
  { src: "/images/event-photos/v0/DSC00073.jpg", alt: "v0 Prompt to Production Event" },
  { src: "/images/event-photos/v0/DSC00074.jpg", alt: "v0 Prompt to Production Event" },
  { src: "/images/event-photos/v0/DSC00080.jpg", alt: "v0 Prompt to Production Event" },
  { src: "/images/event-photos/v0/DSC00083.jpg", alt: "v0 Prompt to Production Event" },
  { src: "/images/event-photos/v0/DSC00084.jpg", alt: "v0 Prompt to Production Event" },
  { src: "/images/event-photos/v0/DSC00086.jpg", alt: "v0 Prompt to Production Event" },
  { src: "/images/event-photos/v0/DSC00087.jpg", alt: "v0 Prompt to Production Event" },
  { src: "/images/event-photos/v0/DSC00090.jpg", alt: "v0 Prompt to Production Event" },
  { src: "/images/event-photos/v0/DSC00099.jpg", alt: "v0 Prompt to Production Event" },
  { src: "/images/event-photos/v0/DSC00100.jpg", alt: "v0 Prompt to Production Event" },
  { src: "/images/event-photos/v0/DSC00101.jpg", alt: "v0 Prompt to Production Event" },
  { src: "/images/event-photos/v0/DSC00103.jpg", alt: "v0 Prompt to Production Event" },
  { src: "/images/event-photos/v0/DSC00104.jpg", alt: "v0 Prompt to Production Event" },
  { src: "/images/event-photos/v0/DSC00108.jpg", alt: "v0 Prompt to Production Event" },
  { src: "/images/event-photos/v0/DSC00111.jpg", alt: "v0 Prompt to Production Event" },
];

export default function PhotosPage() {
  const isMobile = useIsMobile();

  return (
    <main className="h-screen overflow-hidden">
      {/* Gallery Section - positioned below the header */}
      <div className={`fixed left-0 right-0 bottom-0 ${isMobile ? "top-[60px]" : "top-[72px]"}`} id="gallery-container">
        <PhotoMarquee
          images={photos}
          rowCount={4}
          speed={isMobile ? 12 : 18}
          gap={isMobile ? 12 : 16}
          imageHeight={isMobile ? "140px" : "180px"}
          imageBorderRadius={isMobile ? "12px" : "16px"}
        />
      </div>
    </main>
  );
}
