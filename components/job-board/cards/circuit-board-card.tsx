"use client";

import { motion } from "framer-motion";
import { MapPin, DollarSign, Clock } from "lucide-react";
import type { JobData } from "../job-data";

function CircuitPattern() {
  return (
    <svg
      className="absolute inset-0 h-full w-full opacity-[0.12]"
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Horizontal traces */}
      <line x1="0" y1="40" x2="400" y2="40" stroke="#22c55e" strokeWidth="0.5" />
      <line x1="0" y1="100" x2="400" y2="100" stroke="#22c55e" strokeWidth="0.5" />
      <line x1="0" y1="180" x2="400" y2="180" stroke="#22c55e" strokeWidth="0.5" />
      <line x1="0" y1="250" x2="400" y2="250" stroke="#22c55e" strokeWidth="0.5" />
      {/* Vertical traces */}
      <line x1="60" y1="0" x2="60" y2="300" stroke="#22c55e" strokeWidth="0.5" />
      <line x1="200" y1="0" x2="200" y2="300" stroke="#22c55e" strokeWidth="0.5" />
      <line x1="340" y1="0" x2="340" y2="300" stroke="#22c55e" strokeWidth="0.5" />
      {/* Diagonal traces */}
      <line x1="60" y1="40" x2="120" y2="100" stroke="#22c55e" strokeWidth="0.5" />
      <line x1="200" y1="100" x2="280" y2="180" stroke="#22c55e" strokeWidth="0.5" />
      <line x1="340" y1="40" x2="280" y2="100" stroke="#22c55e" strokeWidth="0.5" />
      {/* Nodes (circles at intersections) */}
      <circle cx="60" cy="40" r="3" fill="#22c55e" opacity="0.6" />
      <circle cx="200" cy="100" r="3" fill="#22c55e" opacity="0.6" />
      <circle cx="340" cy="40" r="3" fill="#22c55e" opacity="0.6" />
      <circle cx="120" cy="100" r="2" fill="#d97706" opacity="0.6" />
      <circle cx="280" cy="180" r="2" fill="#d97706" opacity="0.6" />
      <circle cx="60" cy="180" r="3" fill="#22c55e" opacity="0.6" />
      <circle cx="340" cy="250" r="3" fill="#22c55e" opacity="0.6" />
      <circle cx="200" cy="250" r="2" fill="#d97706" opacity="0.6" />
      {/* Small square pads */}
      <rect x="56" y="96" width="8" height="8" fill="#d97706" opacity="0.4" />
      <rect x="196" y="176" width="8" height="8" fill="#d97706" opacity="0.4" />
      <rect x="336" y="176" width="8" height="8" fill="#d97706" opacity="0.4" />
    </svg>
  );
}

export function CircuitBoardCard({ job }: { job: JobData }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.3 }}
      className="group relative w-full max-w-[420px] overflow-hidden rounded-xl border border-green-900/30 bg-[#0a1a0a] p-6"
    >
      <CircuitPattern />

      {/* Header */}
      <div className="relative mb-4 flex items-start justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-amber-600/80">
            {job.company}
          </div>
          <div className="mt-0.5 font-mono text-[10px] text-green-700/50">
            NODE:{job.id}
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-sm border border-green-700/30 bg-green-950/50 px-2.5 py-1">
          <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-green-400">
            {job.status}
          </span>
        </div>
      </div>

      {/* Job title */}
      <h3 className="relative mb-4 text-lg font-bold text-green-100">
        {job.title}
      </h3>

      {/* Metadata styled as circuit nodes */}
      <div className="relative mb-4 space-y-2 text-sm">
        <div className="flex items-center gap-2 text-green-400/60">
          <div className="flex h-5 w-5 items-center justify-center rounded-sm border border-green-700/30 bg-green-950/60">
            <MapPin className="h-3 w-3" />
          </div>
          <span>{job.location}</span>
          <span className="rounded-sm border border-amber-700/30 bg-amber-950/40 px-1.5 py-0.5 text-[10px] text-amber-400">
            {job.locationType}
          </span>
        </div>
        <div className="flex items-center gap-2 text-green-400/60">
          <div className="flex h-5 w-5 items-center justify-center rounded-sm border border-green-700/30 bg-green-950/60">
            <DollarSign className="h-3 w-3" />
          </div>
          <span className="text-green-200">{job.salary}</span>
        </div>
        <div className="flex items-center gap-2 text-green-400/60">
          <div className="flex h-5 w-5 items-center justify-center rounded-sm border border-green-700/30 bg-green-950/60">
            <Clock className="h-3 w-3" />
          </div>
          <span>{job.postedAt}</span>
        </div>
      </div>

      {/* Tags */}
      <div className="relative flex flex-wrap gap-1.5">
        {job.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-sm border border-green-800/40 bg-green-950/50 px-2 py-0.5 font-mono text-[11px] text-green-400/80"
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
