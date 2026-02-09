"use client";

import { motion } from "framer-motion";
import { MapPin, DollarSign, Clock } from "lucide-react";
import type { JobData } from "../job-data";

export function NeonGlowCard({ job }: { job: JobData }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.3 }}
      className="group relative w-full max-w-[420px] rounded-xl border border-cyan-500/20 bg-zinc-950 p-6"
      style={{
        boxShadow: `0 0 20px rgba(0, 200, 255, 0.1), 0 0 40px rgba(0, 200, 255, 0.05), inset 0 0 60px rgba(0, 200, 255, 0.03)`,
      }}
    >
      {/* Animated glow on hover */}
      <div
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          boxShadow: `0 0 30px rgba(0, 200, 255, 0.25), 0 0 60px rgba(0, 200, 255, 0.1), 0 0 100px rgba(0, 200, 255, 0.05)`,
        }}
      />

      {/* Status + posted */}
      <div className="relative mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{
              boxShadow: [
                "0 0 4px rgba(0,255,255,0.4)",
                "0 0 12px rgba(0,255,255,0.8)",
                "0 0 4px rgba(0,255,255,0.4)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="h-2 w-2 rounded-full bg-cyan-400"
          />
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
            {job.status}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-cyan-600/60">
          <Clock className="h-3 w-3" />
          {job.postedAt}
        </div>
      </div>

      {/* Company */}
      <div className="relative mb-1 text-sm font-medium text-cyan-300/60">
        {job.company}
      </div>

      {/* Job title */}
      <h3
        className="relative mb-4 text-xl font-bold text-white"
        style={{ textShadow: "0 0 20px rgba(0,200,255,0.3)" }}
      >
        {job.title}
      </h3>

      {/* Metadata */}
      <div className="relative mb-4 space-y-2 text-sm text-cyan-200/50">
        <div className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 text-cyan-500/50" />
          <span>{job.location}</span>
          <span className="rounded border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-xs text-cyan-300/80">
            {job.locationType}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="h-3.5 w-3.5 text-cyan-500/50" />
          <span className="text-cyan-100">{job.salary}</span>
        </div>
      </div>

      {/* Tags with neon underline */}
      <div className="relative flex flex-wrap gap-2">
        {job.tags.map((tag) => (
          <span
            key={tag}
            className="border-b border-cyan-500/30 px-1 pb-0.5 text-xs text-cyan-300/70 transition-colors duration-300 hover:border-cyan-400 hover:text-cyan-200"
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
