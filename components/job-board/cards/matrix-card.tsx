"use client";

import { motion } from "framer-motion";
import { MapPin, DollarSign, Clock } from "lucide-react";
import { useMounted } from "@/hooks/use-mounted";
import type { JobData } from "../job-data";

function MatrixRain() {
  const mounted = useMounted();

  if (!mounted) return null;

  const columns = Array.from({ length: 18 }, (_, i) => {
    const seed1 = ((i * 7 + 3) % 17) / 17;
    const seed2 = ((i * 13 + 5) % 19) / 19;
    return {
      id: i,
      chars: "アイウエオカキクケコサシスセソタチツテト",
      delay: seed1 * 4,
      duration: 3 + seed2 * 4,
      left: `${(i / 18) * 100}%`,
    };
  });

  return (
    <>
      {columns.map((col) => (
        <div
          key={col.id}
          className="absolute top-0 font-mono text-[10px] leading-3 text-green-500 whitespace-pre"
          style={{
            left: col.left,
            animationName: "matrixRain",
            animationDuration: `${col.duration}s`,
            animationTimingFunction: "linear",
            animationDelay: `${col.delay}s`,
            animationIterationCount: "infinite",
            writingMode: "vertical-rl",
          }}
        >
          {col.chars.split("").slice(0, 12).join("\n")}
        </div>
      ))}
    </>
  );
}

export function MatrixCard({ job }: { job: JobData }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.3 }}
      className="group relative w-full max-w-[420px] overflow-hidden rounded-xl border border-green-900/20 bg-black"
    >
      {/* Matrix rain background */}
      <div className="absolute inset-0 overflow-hidden opacity-20 group-hover:opacity-30 transition-opacity duration-500">
        <MatrixRain />
      </div>

      {/* Content overlay */}
      <div className="relative bg-black/70 p-6 backdrop-blur-sm">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div className="text-xs font-semibold uppercase tracking-widest text-green-500/60">
            {job.company}
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-green-400" />
            <span className="font-mono text-[10px] text-green-400">
              {job.status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Job title */}
        <h3
          className="mb-4 text-xl font-bold text-green-300"
          style={{ textShadow: "0 0 10px rgba(34,197,94,0.3)" }}
        >
          {job.title}
        </h3>

        {/* Metadata */}
        <div className="mb-4 space-y-2 font-mono text-xs text-green-500/60">
          <div className="flex items-center gap-2">
            <MapPin className="h-3 w-3" />
            <span>{job.location}</span>
            <span className="text-green-400/40">[{job.locationType}]</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-3 w-3" />
            <span className="text-green-300/80">{job.salary}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3" />
            <span>{job.postedAt}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {job.tags.map((tag) => (
            <span
              key={tag}
              className="rounded border border-green-500/20 bg-green-500/5 px-2 py-0.5 font-mono text-[11px] text-green-400/80"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Bottom line */}
        <div className="mt-4 border-t border-green-900/30 pt-3 font-mono text-[10px] text-green-700/40">
          {`> ACCESS_GRANTED // ${job.id}`}
        </div>
      </div>
    </motion.div>
  );
}
