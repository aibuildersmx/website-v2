"use client";

import { motion } from "framer-motion";

interface AiModeToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

export function AiModeToggle({ enabled, onToggle }: AiModeToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      className="group relative flex items-center gap-3 rounded-full border px-4 py-2 transition-all duration-500 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
      style={{
        borderColor: enabled ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)",
        backgroundColor: enabled ? "rgba(20,20,20,1)" : "rgba(255,255,255,1)",
      }}
    >
      {/* Label */}
      <span
        className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] transition-colors duration-500 select-none"
        style={{
          color: enabled ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)",
        }}
      >
        {enabled ? "ai mode" : "default"}
      </span>

      {/* Track */}
      <div
        className="relative h-6 w-11 rounded-full transition-colors duration-500"
        style={{
          backgroundColor: enabled
            ? "rgba(255,255,255,0.12)"
            : "rgba(0,0,0,0.08)",
        }}
      >
        {/* Thumb */}
        <motion.div
          layout
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 35,
          }}
          className="absolute top-0.5 h-5 w-5 rounded-full shadow-sm"
          style={{
            left: enabled ? "calc(100% - 22px)" : "2px",
            backgroundColor: enabled ? "#fff" : "#1a1a1a",
          }}
        >
          {/* Inner glow when AI mode */}
          {enabled && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-[3px] rounded-full bg-[#141414]"
            />
          )}
        </motion.div>
      </div>

      {/* Subtle pulse indicator when AI mode on */}
      {enabled && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-green-400"
        />
      )}
    </button>
  );
}
