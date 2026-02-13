"use client";

import { motion } from "framer-motion";
import { MapPin, DollarSign, Clock, ArrowUpRight } from "lucide-react";
import type { JobData } from "../job-data";

export function MinimalDarkCard({ job }: { job: JobData }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.015, borderColor: "rgba(255,255,255,0.15)" }}
      transition={{ duration: 0.2 }}
      className="group relative w-full max-w-[420px] rounded-xl border border-white/[0.06] bg-[#111111] p-6 transition-shadow duration-300 hover:shadow-xl hover:shadow-black/40"
    >
      {/* Header */}
      <div className="mb-5 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <img
            src={job.companyLogo}
            alt={job.company}
            className="h-9 w-9 rounded-lg"
          />
          <div>
            <div className="text-sm font-medium text-white/90">{job.company}</div>
            <div className="text-xs text-white/30">{job.postedAt}</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className={`h-1.5 w-1.5 rounded-full ${
              job.status === "Urgent"
                ? "bg-orange-400"
                : job.status === "Last Call"
                  ? "bg-yellow-400"
                  : "bg-emerald-400"
            }`}
          />
          <span className="text-xs text-white/40">{job.status}</span>
        </div>
      </div>

      {/* Job title */}
      <h3 className="mb-4 text-lg font-semibold tracking-tight text-white">
        {job.title}
        <ArrowUpRight className="ml-1 inline h-4 w-4 text-white/20 transition-colors duration-200 group-hover:text-white/60" />
      </h3>

      {/* Metadata */}
      <div className="mb-5 space-y-2.5 text-sm text-white/40">
        <div className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 text-white/20" />
          <span>{job.location}</span>
          <span className="rounded-md bg-white/[0.04] px-2 py-0.5 text-xs text-white/50">
            {job.locationType}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="h-3.5 w-3.5 text-white/20" />
          <span className="text-white/60">{job.salary}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-white/20" />
          <span>{job.postedAt}</span>
        </div>
      </div>

      {/* Separator */}
      <div className="mb-4 h-px bg-white/[0.06]" />

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {job.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-white/[0.04] px-2.5 py-1 text-xs text-white/50 transition-colors duration-200 hover:bg-white/[0.08] hover:text-white/70"
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
