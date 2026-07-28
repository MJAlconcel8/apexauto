import type { SpecReadoutProps } from "./types";

export function SpecReadout({ label, value, unit, dark }: SpecReadoutProps) {
  return (
    <div className="min-w-0">
      <div className={`whitespace-nowrap font-mono text-[9px] tracking-[0.06em] uppercase ${dark ? "text-apex-muted-ink" : "text-apex-muted"}`}>
        {label}
      </div>
      <div className={`whitespace-nowrap font-mono text-[13px] font-semibold mt-0.75 ${dark ? "text-white" : "text-apex-ink"}`}>
        {value}
        <span className={`font-normal ${dark ? "text-apex-muted-ink" : "text-apex-muted"}`}>
          {unit ? ` ${unit}` : ""}
        </span>
      </div>
    </div>
  );
}
