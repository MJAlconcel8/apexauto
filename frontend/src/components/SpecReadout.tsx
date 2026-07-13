import type { SpecReadoutProps } from "./types";

export function SpecReadout({ label, value, unit, dark }: SpecReadoutProps) {
  return (
    <div>
      <div className={`font-mono text-[10px] tracking-[0.12em] uppercase ${dark ? "text-apex-muted-ink" : "text-apex-muted"}`}>
        {label}
      </div>
      <div className={`font-mono text-[15px] font-semibold mt-0.75 ${dark ? "text-white" : "text-apex-ink"}`}>
        {value}
        <span className={`font-normal ${dark ? "text-apex-muted-ink" : "text-apex-muted"}`}>
          {unit ? ` ${unit}` : ""}
        </span>
      </div>
    </div>
  );
}
