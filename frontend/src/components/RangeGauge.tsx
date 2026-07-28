import type { RangeGaugeProps } from "./types";

export function RangeGauge({ value, max = 560, size = 132, dark }: RangeGaugeProps) {
  const stroke = 9;
  const r = (size - stroke) / 2 - 2;
  const cx = size / 2;
  const cy = size / 2;
  const startAngle = 135;
  const sweep = 270;
  const pct = Math.max(0, Math.min(1, value / max));
  const compact = size <= 80;
  const valueLength = String(Math.round(value)).length;
  const valueFontSize = compact
    ? valueLength >= 5
      ? 13
      : valueLength >= 4
        ? 16
        : 20
    : valueLength >= 5
      ? 19
      : valueLength >= 4
        ? 22
        : 26;
  const valueY = compact ? cy - 3 : cy - 2;
  const labelFontSize = compact ? 7 : 10;
  const labelY = compact ? cy + 13 : cy + 18;

  const polar = (deg: number): [number, number] => {
    const a = (deg - 90) * (Math.PI / 180);
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };

  const arc = (fromDeg: number, toDeg: number) => {
    const [x1, y1] = polar(fromDeg);
    const [x2, y2] = polar(toDeg);
    const large = toDeg - fromDeg > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`Estimated mileage ${value} kilometres`}
    >
      <path
        d={arc(startAngle, startAngle + sweep)}
        fill="none"
        strokeWidth={stroke}
        strokeLinecap="round"
        className={dark ? "stroke-[rgba(255,255,255,0.12)]" : "stroke-apex-line"}
      />
      <path
        d={arc(startAngle, startAngle + sweep * pct)}
        fill="none"
        strokeWidth={stroke}
        strokeLinecap="round"
        className="stroke-apex-voltage"
      />
      <text
        x={cx}
        y={valueY}
        textAnchor="middle"
        fontSize={valueFontSize}
        className={`font-mono font-semibold ${dark ? "fill-white" : "fill-apex-ink"}`}
      >
        {value}
      </text>
      <text
        x={cx}
        y={labelY}
        textAnchor="middle"
        fontSize={labelFontSize}
        className={`font-mono tracking-[0.1em] ${dark ? "fill-apex-muted-ink" : "fill-apex-muted"}`}
      >
        MILEAGE
      </text>
    </svg>
  );
}

