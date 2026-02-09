"use client";

import { motion } from "framer-motion";
import { MapPin, DollarSign, Clock } from "lucide-react";
import type { JobData } from "../job-data";

export function BrutalistCard({ job }: { job: JobData }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.2 }}
      className="group w-full max-w-[420px] border-[3px] border-black bg-white p-6"
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="font-mono text-xs uppercase tracking-widest text-gray-500">
          {job.company}
        </div>
        <div
          className={`border-2 border-black px-3 py-1 font-mono text-[10px] font-bold uppercase ${
            job.status === "Urgent"
              ? "bg-red-500 text-white"
              : job.status === "Closing Soon"
                ? "bg-yellow-400 text-black"
                : "bg-black text-white"
          }`}
        >
          {job.status}
        </div>
      </div>

      {/* Job title - oversized */}
      <h3 className="mb-4 text-2xl font-black uppercase leading-tight tracking-tight text-black">
        {job.title}
      </h3>

      {/* Divider */}
      <div className="mb-4 h-[3px] w-12 bg-black" />

      {/* Metadata */}
      <div className="mb-4 space-y-2 font-mono text-xs text-gray-700">
        <div className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5" />
          <span className="uppercase">{job.location}</span>
          <span className="border border-black px-1.5 py-0.5 text-[10px] font-bold">
            {job.locationType.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="h-3.5 w-3.5" />
          <span className="font-bold text-black">{job.salary}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5" />
          <span>{job.postedAt}</span>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {job.tags.map((tag) => (
          <span
            key={tag}
            className="border-2 border-black bg-white px-2 py-0.5 font-mono text-[11px] font-bold uppercase text-black transition-colors duration-150 hover:bg-black hover:text-white"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Bottom */}
      <div className="mt-4 border-t-[3px] border-black pt-3 font-mono text-[10px] uppercase tracking-widest text-gray-400">
        REF: {job.id}
      </div>
    </motion.div>
  );
}
