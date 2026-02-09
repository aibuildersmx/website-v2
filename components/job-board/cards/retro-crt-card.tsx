"use client";

import { motion } from "framer-motion";
import { MapPin, DollarSign, Clock } from "lucide-react";
import type { JobData } from "../job-data";

export function RetroCrtCard({ job }: { job: JobData }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.3 }}
      className="group relative w-full max-w-[420px] overflow-hidden rounded-2xl border-2 border-green-900/30 bg-[#0a0f0a] p-1"
      style={{
        perspective: "800px",
      }}
    >
      {/* CRT screen with slight curvature */}
      <div
        className="relative overflow-hidden rounded-xl p-6"
        style={{
          transform: "perspective(800px) rotateX(1deg)",
          background: "radial-gradient(ellipse at center, #0d1a0d 0%, #050a05 100%)",
        }}
      >
        {/* Scanline overlay */}
        <div
          className="pointer-events-none absolute inset-0 z-10 opacity-[0.04]"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(0, 255, 0, 0.15) 2px,
              rgba(0, 255, 0, 0.15) 4px
            )`,
          }}
        />

        {/* Screen flicker */}
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            animation: "crtFlicker 0.15s infinite",
            background: "rgba(0,255,0,0.01)",
          }}
        />

        {/* Phosphor glow vignette */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)",
          }}
        />

        {/* Content */}
        <div className="relative z-20">
          {/* Header line */}
          <div className="mb-4 flex items-center justify-between font-mono text-xs">
            <span
              className="text-green-400/70"
              style={{ textShadow: "0 0 6px rgba(0,255,0,0.5)" }}
            >
              ■ {job.company.toUpperCase()}
            </span>
            <span
              className="text-green-500/50"
              style={{ textShadow: "0 0 6px rgba(0,255,0,0.3)" }}
            >
              {job.id}
            </span>
          </div>

          {/* Job title */}
          <h3
            className="mb-4 font-mono text-lg font-bold text-green-400"
            style={{ textShadow: "0 0 8px rgba(0,255,0,0.6)" }}
          >
            {job.title}
          </h3>

          {/* Status */}
          <div className="mb-4 font-mono">
            <span
              className="text-xs text-green-300"
              style={{ textShadow: "0 0 6px rgba(0,255,0,0.5)" }}
            >
              STATUS: {job.status.toUpperCase()}
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              >
                _
              </motion.span>
            </span>
          </div>

          {/* Metadata */}
          <div className="mb-4 space-y-1.5 font-mono text-xs">
            <div className="flex items-center gap-2 text-green-500/60" style={{ textShadow: "0 0 4px rgba(0,255,0,0.3)" }}>
              <MapPin className="h-3 w-3" />
              <span>{job.location}</span>
              <span className="text-green-400/40">({job.locationType})</span>
            </div>
            <div className="flex items-center gap-2 text-green-500/60" style={{ textShadow: "0 0 4px rgba(0,255,0,0.3)" }}>
              <DollarSign className="h-3 w-3" />
              <span className="text-green-300/80">{job.salary}</span>
            </div>
            <div className="flex items-center gap-2 text-green-500/60" style={{ textShadow: "0 0 4px rgba(0,255,0,0.3)" }}>
              <Clock className="h-3 w-3" />
              <span>{job.postedAt}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
            {job.tags.map((tag) => (
              <span
                key={tag}
                className="text-green-400/70"
                style={{ textShadow: "0 0 4px rgba(0,255,0,0.4)" }}
              >
                [{tag}]
              </span>
            ))}
          </div>

          {/* Bottom prompt */}
          <div
            className="mt-4 border-t border-green-900/20 pt-3 font-mono text-[10px] text-green-700/40"
            style={{ textShadow: "0 0 3px rgba(0,255,0,0.2)" }}
          >
            READY. PRESS ANY KEY TO APPLY...
          </div>
        </div>
      </div>
    </motion.div>
  );
}
