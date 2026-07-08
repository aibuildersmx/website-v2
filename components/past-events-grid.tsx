import { ArrowUpRight, MapPin } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { pastEvents } from "./events-data";

export function PastEventsGrid() {
  return (
    <div className="grid auto-rows-fr grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
      {pastEvents.map((event, index) => (
        <div key={`${event.title}-${event.month}-${event.day}-${index}`} className="h-full">
          {event.link ? (
            <Link
              href={event.link}
              target={event.link.startsWith("http") ? "_blank" : undefined}
              rel={event.link.startsWith("http") ? "noopener noreferrer" : undefined}
              className="group flex h-full cursor-pointer items-center gap-3 rounded-lg border border-black/10 bg-white p-3 transition-all duration-300 hover:border-black/20 hover:bg-black/[0.01] sm:gap-4 sm:rounded-xl sm:p-4"
            >
              <PastEventContent event={event} showArrow />
            </Link>
          ) : (
            <div className="group flex h-full cursor-default items-center gap-3 rounded-lg border border-black/10 bg-white p-3 transition-all duration-300 hover:border-black/20 hover:bg-black/[0.01] sm:gap-4 sm:rounded-xl sm:p-4">
              <PastEventContent event={event} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function PastEventContent({
  event,
  showArrow = false,
}: {
  event: (typeof pastEvents)[number];
  showArrow?: boolean;
}) {
  return (
    <>
      <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-md border border-black/5 bg-black/[0.03] sm:h-12 sm:w-12 sm:rounded-lg">
        <span className="mb-0.5 text-[7px] font-mono font-bold leading-none text-black/40 sm:text-[8px]">
          {event.month}
        </span>
        <span className="text-base font-sans font-semibold leading-none sm:text-lg">
          {event.day}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="overflow-hidden break-words text-sm font-sans font-medium leading-tight transition-colors [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3] group-hover:text-black/80 sm:text-base">
          {event.title}
        </h4>
        <div className="mt-1 flex items-center gap-1 text-[9px] font-mono uppercase tracking-tight text-black/40 sm:gap-1.5 sm:text-[10px]">
          <MapPin className="size-2 shrink-0 sm:size-2.5" />
          <span className="truncate">{event.location}</span>
        </div>
      </div>
      {showArrow && (
        <ArrowUpRight className={cn("size-4 shrink-0 text-black/40 transition-colors group-hover:text-black")} />
      )}
    </>
  );
}
