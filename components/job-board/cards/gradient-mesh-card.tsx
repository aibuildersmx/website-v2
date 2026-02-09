"use client";

import { motion } from "framer-motion";
import { MapPin, DollarSign, Clock } from "lucide-react";
import type { JobData } from "../job-data";

export function GradientMeshCard({ job }: { job: JobData }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -6 }}
      transition={{ duration: 0.3 }}
      className="group relative w-full max-w-[420px] overflow-hidden rounded-2xl"
    >
      {/* Gradient mesh background */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(at 0% 0%, rgba(251,113,133,0.25) 0%, transparent 50%),
            radial-gradient(at 100% 0%, rgba(96,165,250,0.25) 0%, transparent 50%),
            radial-gradient(at 100% 100%, rgba(167,139,250,0.25) 0%, transparent 50%),
            radial-gradient(at 0% 100%, rgba(52,211,153,0.2) 0%, transparent 50%),
            white
          `,
        }}
      />

      {/* Card content */}
      <div className="relative rounded-2xl border border-gray-200/60 bg-white/70 p-6 backdrop-blur-sm">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <img
              src={job.companyLogo}
              alt={job.company}
              className="h-10 w-10 rounded-xl"
            />
            <div>
              <div className="text-sm font-semibold text-gray-800">
                {job.company}
              </div>
              <div className="text-xs text-gray-400">{job.postedAt}</div>
            </div>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider ${
              job.status === "Urgent"
                ? "bg-rose-100 text-rose-600"
                : job.status === "Closing Soon"
                  ? "bg-amber-100 text-amber-600"
                  : "bg-emerald-100 text-emerald-600"
            }`}
          >
            {job.status}
          </span>
        </div>

        {/* Job title */}
        <h3 className="mb-4 text-xl font-bold text-gray-900">{job.title}</h3>

        {/* Metadata */}
        <div className="mb-5 space-y-2 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-gray-400" />
            <span>{job.location}</span>
            <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
              {job.locationType}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-3.5 w-3.5 text-gray-400" />
            <span className="font-medium text-gray-700">{job.salary}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-gray-400" />
            <span>{job.postedAt}</span>
          </div>
        </div>

        {/* Tags as soft-colored pills */}
        <div className="flex flex-wrap gap-2">
          {job.tags.map((tag, i) => {
            const colors = [
              "bg-rose-50 text-rose-600 border-rose-200/60",
              "bg-blue-50 text-blue-600 border-blue-200/60",
              "bg-violet-50 text-violet-600 border-violet-200/60",
              "bg-emerald-50 text-emerald-600 border-emerald-200/60",
              "bg-amber-50 text-amber-600 border-amber-200/60",
            ];
            return (
              <span
                key={tag}
                className={`rounded-full border px-2.5 py-1 text-xs font-medium ${colors[i % colors.length]}`}
              >
                {tag}
              </span>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
