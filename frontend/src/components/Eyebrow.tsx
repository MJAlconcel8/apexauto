import type { EyebrowProps } from "./types";

export function Eyebrow({ children, dark }: EyebrowProps) {
  return (
    <span className={`inline-block font-mono text-[11px] tracking-[0.16em] uppercase font-medium ${dark ? "text-apex-muted-ink" : "text-apex-muted"}`}>
      {children}
    </span>
  );
}
