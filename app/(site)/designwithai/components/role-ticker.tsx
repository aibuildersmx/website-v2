import { Sparkles } from "lucide-react";

const ROLES = [
  "Founders",
  "Diseñadores",
  "Product Managers",
  "Educadores",
  "Creadores",
  "Visionarios",
];

export default function RoleTicker() {
  return (
    <div className="inline-flex items-center gap-2.5 pl-3 pr-4 py-2 rounded-full border border-white/15 bg-white/10 backdrop-blur-sm">
      <Sparkles className="size-3.5 text-white/50 shrink-0" />
      <span className="text-sm text-white/50 font-medium whitespace-nowrap">
        El bootcamp de IA para
      </span>
      <div
        className="relative overflow-hidden h-5 shrink-0"
        style={{ 
          animation: "role-width 15s cubic-bezier(0.85, 0, 0.15, 1) infinite",
          willChange: "width"
        }}
      >
        <div 
          style={{ 
            animation: "role-scroll 15s cubic-bezier(0.85, 0, 0.15, 1) infinite",
            willChange: "transform"
          }} 
        >
          {[...ROLES, ROLES[0]].map((role, i) => (
            <span
              key={i}
              className="flex items-center justify-center h-5 text-sm font-bold text-white whitespace-nowrap"
            >
              {role}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
