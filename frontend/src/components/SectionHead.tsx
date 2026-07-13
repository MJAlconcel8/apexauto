import type { SectionHeadProps } from "./types";
import { Eyebrow } from "./Eyebrow";

export function SectionHead({ eyebrow, title, sub, dark, align = "left" }: SectionHeadProps) {
  return (
    <div className={align === "center" ? "text-center max-w-[640px] mx-auto" : "text-left"}>
      {eyebrow && <Eyebrow dark={dark}>{eyebrow}</Eyebrow>}
      <h2 className={`font-display font-extrabold tracking-[-0.02em] leading-[1.05] text-[clamp(26px,4vw,34px)] mt-2.5 ${dark ? "text-white" : "text-apex-ink"}`}>
        {title}
      </h2>
      {sub && (
        <p className={`font-body text-[15px] mt-3 leading-[1.55] ${dark ? "text-apex-muted-ink" : "text-apex-muted"}`}>
          {sub}
        </p>
      )}
    </div>
  );
}
