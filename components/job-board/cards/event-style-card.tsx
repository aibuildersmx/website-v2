"use client";

import { motion } from "framer-motion";
import { MapPin, DollarSign, Users } from "lucide-react";
import type { JobData } from "../job-data";

export function EventStyleCard({ job }: { job: JobData }) {
  // Parse a fake posting date from the job for the date block
  const month = "FEB";
  const day = "14";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -6 }}
      transition={{ duration: 0.3 }}
      className="group w-full max-w-[420px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg"
    >
      {/* Top header: date block + status */}
      <div className="flex items-center justify-between px-6 py-5">
        <div className="flex items-center">
          {/* Date block */}
          <div className="flex flex-col items-center pr-5">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
              {month}
            </span>
            <span className="text-3xl font-light text-gray-800">{day}</span>
          </div>
          {/* Vertical divider */}
          <div className="h-12 w-px bg-gray-200" />
        </div>

        {/* Status pill */}
        <div className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-1.5">
          <div
            className={`h-2 w-2 rounded-full ${
              job.status === "Urgent"
                ? "bg-orange-400"
                : job.status === "Closing Soon"
                  ? "bg-amber-400"
                  : "bg-emerald-400"
            }`}
          />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">
            {job.status === "New"
              ? "Open"
              : job.status === "Urgent"
                ? "Urgent"
                : "Closing"}
          </span>
        </div>
      </div>

      {/* Thin divider */}
      <div className="mx-6 h-px bg-gray-100" />

      {/* Main content */}
      <div className="px-6 pb-7 pt-6">
        {/* Company logo */}
        <img
          src={job.companyLogo}
          alt={job.company}
          className="mb-4 h-12 w-12 rounded-xl"
        />

        {/* Job title -- large, elegant, light weight */}
        <h3 className="mb-8 text-[1.65rem] font-normal leading-tight tracking-tight text-gray-800">
          {job.title}
        </h3>

        {/* Metadata -- uppercase, tracked, with icons */}
        <div className="mb-8 space-y-3">
          <div className="flex items-center gap-3 text-gray-400">
            <MapPin className="h-4 w-4" strokeWidth={1.5} />
            <span className="text-xs font-medium uppercase tracking-[0.15em]">
              {job.location}
            </span>
          </div>
          <div className="flex items-center gap-3 text-gray-400">
            <DollarSign className="h-4 w-4" strokeWidth={1.5} />
            <span className="text-xs font-medium uppercase tracking-[0.15em]">
              {job.salary}
            </span>
          </div>
          <div className="flex items-center gap-3 text-gray-400">
            <Users className="h-4 w-4" strokeWidth={1.5} />
            <span className="text-xs font-medium uppercase tracking-[0.15em]">
              {job.locationType}
            </span>
          </div>
        </div>

        {/* Thin divider */}
        <div className="mb-6 h-px bg-gray-100" />

        {/* CTA button -- dark, rounded pill */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="rounded-full bg-gray-900 px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition-colors duration-200 hover:bg-black"
        >
          Apply Now
        </motion.button>
      </div>
    </motion.div>
  );
}
