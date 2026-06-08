"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, DollarSign, Clock } from "lucide-react";
import type { JobData } from "../job-data";

export function GlassmorphismCard({ job }: { job: JobData }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -6 }}
      transition={{ duration: 0.3 }}
      className="group relative w-full max-w-[420px]"
    >
      {/* Colorful gradient background */}
      <div className="absolute -inset-4 rounded-3xl opacity-60 blur-2xl">
        <div
          className="h-full w-full rounded-3xl"
          style={{
            background:
              "linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)",
          }}
        />
      </div>

      {/* Frosted glass card */}
      <div className="relative rounded-2xl border border-white/30 bg-white/20 p-6 shadow-xl shadow-purple-500/10 backdrop-blur-xl">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Image
              src={job.companyLogo}
              alt={job.company}
              width={40}
              height={40}
              unoptimized
              className="h-10 w-10 rounded-xl shadow-sm"
            />
            <div>
              <div className="text-sm font-semibold text-gray-800">
                {job.company}
              </div>
              <div className="text-xs text-gray-500">{job.postedAt}</div>
            </div>
          </div>
          <span className="rounded-full border border-white/40 bg-white/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-700 backdrop-blur-sm">
            {job.status}
          </span>
        </div>

        {/* Job title */}
        <h3 className="mb-4 text-xl font-bold text-gray-900">{job.title}</h3>

        {/* Metadata */}
        <div className="mb-4 space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-gray-400" />
            <span>{job.location}</span>
            <span className="rounded-md bg-white/50 px-2 py-0.5 text-xs text-gray-600 backdrop-blur-sm">
              {job.locationType}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-3.5 w-3.5 text-gray-400" />
            <span className="font-medium text-gray-800">{job.salary}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-gray-400" />
            <span>{job.postedAt}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {job.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-lg border border-white/40 bg-white/30 px-2.5 py-1 text-xs font-medium text-gray-700 backdrop-blur-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
