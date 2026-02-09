"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { MapPin, DollarSign, Clock } from "lucide-react";
import type { JobData } from "../job-data";

export function PerspectiveCard({ job }: { job: JobData }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(y, [0, 1], [8, -8]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(x, [0, 1], [-8, 8]), {
    stiffness: 300,
    damping: 30,
  });

  function handleMouse(e: React.MouseEvent) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width);
    y.set((e.clientY - rect.top) / rect.height);
  }

  function handleMouseLeave() {
    x.set(0.5);
    y.set(0.5);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-[420px]"
      style={{ perspective: 1000 }}
    >
      <motion.div
        ref={ref}
        onMouseMove={handleMouse}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY }}
        className="group relative rounded-2xl border border-gray-200 bg-white p-6 shadow-lg transition-shadow duration-300 hover:shadow-2xl"
      >
        {/* Floating company logo (parallax layer) */}
        <motion.div
          style={{
            x: useTransform(x, [0, 1], [-5, 5]),
            y: useTransform(y, [0, 1], [-5, 5]),
          }}
          className="mb-4 flex items-start justify-between"
        >
          <div className="flex items-center gap-3">
            <img
              src={job.companyLogo}
              alt={job.company}
              className="h-11 w-11 rounded-xl shadow-md"
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
                ? "bg-red-50 text-red-500"
                : job.status === "Closing Soon"
                  ? "bg-amber-50 text-amber-500"
                  : "bg-emerald-50 text-emerald-500"
            }`}
          >
            {job.status}
          </span>
        </motion.div>

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

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {job.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Dynamic shadow */}
        <motion.div
          style={{
            x: useTransform(x, [0, 1], [-10, 10]),
            y: useTransform(y, [0, 1], [-5, 15]),
          }}
          className="pointer-events-none absolute -bottom-4 left-4 right-4 -z-10 h-12 rounded-2xl bg-black/5 blur-xl"
        />
      </motion.div>
    </motion.div>
  );
}
