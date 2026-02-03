"use client";

import { useState } from "react";
import PhotoMarquee from "@/components/gallery/PhotoMarquee";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";

// Event data configuration
const events = [
  {
    id: "v0",
    name: "v0 From Prompt to Production",
    date: "Enero 2026",
    photos: [
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
    ],
  },
];

export default function PhotosPage() {
  const [selectedEventId, setSelectedEventId] = useState(events[0].id);
  const selectedEvent = events.find((e) => e.id === selectedEventId) || events[0];
  const isMobile = useIsMobile();

  return (
    <main className="h-screen overflow-hidden pt-16">
      {/* Header Section */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-background/80 backdrop-blur-sm border-b">
        <div className="container flex items-center justify-between py-3 md:py-4 gap-2">
          <div className="min-w-0 flex-shrink">
            <h1 className="text-xl md:text-2xl font-light tracking-tight font-serif truncate">
            Fotos de Eventos
            </h1>
            {!isMobile && (
              <p className="text-sm text-muted-foreground">
                Explora las fotos de nuestros eventos
              </p>
            )}
          </div>
          <div className="flex items-center flex-shrink-0">
            <Select value={selectedEventId} onValueChange={setSelectedEventId}>
              <SelectTrigger className="w-[200px] h-8 md:h-10 text-xs md:text-sm">
                <SelectValue placeholder="Evento" />
              </SelectTrigger>
              <SelectContent>
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {isMobile ? event.name : `${event.name} - ${event.date}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div className={`fixed left-0 right-0 bottom-0 ${isMobile ? "top-[100px]" : "top-[140px]"}`} id="gallery-container">
        <PhotoMarquee
          images={selectedEvent.photos}
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
