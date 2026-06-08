"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, DollarSign } from "lucide-react";
import type { JobData } from "../job-data";

export function HolographicCard({ job }: { job: JobData }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.3 }}
      className="group relative w-full max-w-[420px]"
    >
      {/* Animated holographic border */}
      <div className="absolute -inset-[2px] rounded-2xl opacity-60 blur-[1px] transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `conic-gradient(from var(--holo-angle, 0deg), #ff0080, #ff8c00, #40e0d0, #7b68ee, #ff0080)`,
          animation: "holoSpin 4s linear infinite",
        }}
      />

      {/* Card interior */}
      <div className="relative rounded-2xl border border-white/[0.08] bg-zinc-950/95 p-6 backdrop-blur-xl">
        {/* Company + status */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Image
              src={job.companyLogo}
              alt={job.company}
              width={40}
              height={40}
              unoptimized
              className="h-10 w-10 rounded-lg"
            />
            <div>
              <div className="text-sm font-semibold text-white/90">
                {job.company}
              </div>
              <div className="text-xs text-white/40">{job.postedAt}</div>
            </div>
          </div>
          <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/70 backdrop-blur-sm">
            {job.status}
          </span>
        </div>

        {/* Job title */}
        <h3 className="mb-4 text-xl font-bold text-white">{job.title}</h3>

        {/* Metadata */}
        <div className="mb-4 space-y-2 text-sm text-white/50">
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5" />
            <span>{job.location}</span>
            <span className="rounded-md bg-white/5 px-2 py-0.5 text-xs text-white/60">
              {job.locationType}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-3.5 w-3.5" />
            <span className="text-white/70">{job.salary}</span>
          </div>
        </div>

        {/* Tags with shimmer */}
        <div className="flex flex-wrap gap-2">
          {job.tags.map((tag) => (
            <span
              key={tag}
              className="relative overflow-hidden rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/70"
            >
              <span className="relative z-10">{tag}</span>
              <div
                className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-30"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                  animation: "shimmer 2s ease-in-out infinite",
                }}
              />
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
