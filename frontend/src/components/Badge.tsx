import type { BadgeProps } from "./types";

const toneClass = {
  voltage: "bg-apex-voltage-soft text-apex-voltage-ink border border-[rgba(14,99,255,0.25)]",
  amber:   "bg-[rgba(245,166,35,0.14)] text-[#9A6400] border border-[rgba(245,166,35,0.35)]",
  hot:     "bg-[rgba(226,59,59,0.10)] text-apex-red border border-[rgba(226,59,59,0.30)]",
} as const;

export function Badge({ badge }: BadgeProps) {
  return (
    <span className={`font-mono text-[10px] tracking-widest uppercase font-semibold px-[9px] py-[4px] rounded-full ${toneClass[badge.tone]}`}>
      {badge.label}
    </span>
  );
}
