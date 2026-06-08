"use client";

import { motion } from "framer-motion";
import { MapPin, DollarSign, Clock } from "lucide-react";
import type { JobData } from "../job-data";

export function TerminalCard({ job }: { job: JobData }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.3 }}
      className="relative w-full max-w-[420px] rounded-lg border border-green-900/40 bg-[#0d0d0d] p-6 font-mono shadow-lg shadow-green-950/20"
    >
      {/* Terminal header bar */}
      <div className="mb-4 flex items-center gap-2">
        <div className="h-3 w-3 rounded-full bg-red-500/80" />
        <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
        <div className="h-3 w-3 rounded-full bg-green-500/80" />
        <span className="ml-2 text-xs text-green-700/60">
          ~/jobs/{job.id.toLowerCase()}
        </span>
      </div>

      {/* Command prompt */}
      <div className="mb-1 text-xs text-green-600/60">
        <span className="text-green-500">$</span> cat job.json
      </div>

      {/* Job title */}
      <div className="mb-3 text-lg font-bold text-green-400">
        <span className="text-green-600">&gt; </span>
        {job.title}
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
          className="ml-1 inline-block w-2.5 bg-green-400 text-transparent"
        >
          _
        </motion.span>
      </div>

      {/* Company */}
      <div className="mb-4 text-sm text-green-500/70">
        <span className="text-green-700">company: </span>
        &quot;{job.company}&quot;
      </div>

      {/* Metadata */}
      <div className="mb-4 space-y-1.5 text-xs text-green-500/60">
        <div className="flex items-center gap-2">
          <MapPin className="h-3 w-3" />
          <span>
            {job.location}{" "}
            <span className="rounded bg-green-900/30 px-1.5 py-0.5 text-green-400/80">
              {job.locationType}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="h-3 w-3" />
          <span className="text-green-300">{job.salary}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-3 w-3" />
          <span>{job.postedAt}</span>
        </div>
      </div>

      {/* Tags */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        {job.tags.map((tag) => (
          <span
            key={tag}
            className="rounded border border-green-800/40 bg-green-950/40 px-2 py-0.5 text-xs text-green-400"
          >
            [{tag}]
          </span>
        ))}
      </div>

      {/* Status line */}
      <div className="border-t border-green-900/30 pt-3 text-xs text-green-600/50">
        <span className="text-green-500">status:</span>{" "}
        <span className="text-green-300">{job.status}</span>
        <span className="ml-2 text-green-700">{`// ${job.id}`}</span>
      </div>
    </motion.div>
  );
}
