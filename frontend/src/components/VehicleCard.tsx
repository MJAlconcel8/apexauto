import { ArrowRight, MapPin } from "lucide-react";
import type { VehicleCardProps } from "./types";
import { Badge } from "./Badge";
import { RangeGauge } from "./RangeGauge";
import { SpecReadout } from "./SpecReadout";
import { Btn } from "./Btn";

const fmtUSD = (n: number) => "$" + n.toLocaleString("en-US");

export function VehicleCard({ v, onView, onCart }: VehicleCardProps) {

  return (
    <article className="group/card av-rise flex flex-col bg-white rounded-[14px] overflow-hidden border border-apex-line hover:border-[rgba(14,99,255,0.35)] shadow-[0_8px_24px_-14px_rgba(18,22,28,0.20)] hover:shadow-[0_14px_30px_-18px_rgba(18,22,28,0.35)] hover:-translate-y-0.75 transition-all duration-220">
      {/* Image */}
      <div className="relative h-47 overflow-hidden">
        <img
          src={v.img}
          alt={`${v.marque} ${v.model}`}
          loading="lazy"
          className="w-full h-full object-cover block group-hover/card:scale-[1.045] transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,#12161C_2%,rgba(18,22,28,0.15)_45%,rgba(18,22,28,0.05)_100%)]" />
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          <Badge badge={v.badge} />
          <span className="font-mono text-[10px] text-white tracking-[0.08em] bg-[rgba(18,22,28,0.55)] px-2 py-0.75 rounded-md backdrop-blur-xs">
            {v.marque.toUpperCase()} · {v.year}
          </span>
        </div>
        <div className="absolute left-3.5 bottom-3 right-3.5">
          <h3 className="font-display font-extrabold text-[20px] text-white tracking-[-0.01em] [text-shadow:0_1px_8px_rgba(0,0,0,0.4)]">
            {v.model}
          </h3>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col p-4.5 gap-3.5 flex-1">
        <div className="flex items-center gap-1 text-apex-green">
          <MapPin size={12} strokeWidth={2} />
          <span className="font-mono text-[11px]">
            {v.stock} in stock · {v.history}
          </span>
        </div>

        <div className="flex items-center gap-3.5 py-3 border-t border-apex-line border-b">
          <div className="shrink-0">
            <RangeGauge value={v.range} size={78} />
          </div>
          <div className="grid grid-cols-3 gap-2.5 flex-1">
            <SpecReadout label="Battery" value={v.battery} unit="kWh" />
            <SpecReadout label="0–100" value={v.zero.toFixed(1)} unit="s" />
            <SpecReadout label="Seats" value={v.seats} />
          </div>
        </div>

        <div className="flex items-end justify-between mt-auto">
          <div>
            {v.was && (
              <span className="font-mono text-[12px] text-apex-muted line-through mr-1.5">
                {fmtUSD(v.was)}
              </span>
            )}
            <div className="font-mono text-[21px] font-semibold text-apex-ink leading-none">
              {fmtUSD(v.price)}
            </div>
          </div>
          <div className="flex gap-2">
            {onView && (
              <Btn variant="primary" size="sm" icon={ArrowRight} onClick={() => onView(v)}>
                View
              </Btn>
            )}
            {onCart && (
              <Btn variant="outline" size="sm" onClick={() => onCart(v)}>
                Add
              </Btn>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
