import type { SpecReadoutProps } from './types'

export function SpecReadout({ label, value, unit, dark }: SpecReadoutProps) {
  return (
    <div className="min-w-0 px-2 text-center first:pl-0 last:pr-0">
      <div
        className={`whitespace-nowrap font-mono text-[8px] leading-none tracking-[0.04em] uppercase ${
          dark ? 'text-apex-muted-ink' : 'text-apex-muted'
        }`}
      >
        {label}
      </div>
      <div className="mt-1.5 flex min-w-0 items-baseline justify-center gap-0.5 whitespace-nowrap">
        <span
          className={`font-mono text-[12px] font-semibold leading-none ${
            dark ? 'text-white' : 'text-apex-ink'
          }`}
        >
          {value}
        </span>
        {unit && (
          <span
            className={`font-mono text-[8px] leading-none ${
              dark ? 'text-apex-muted-ink' : 'text-apex-muted'
            }`}
          >
            {unit}
          </span>
        )}
      </div>
    </div>
  )
}
