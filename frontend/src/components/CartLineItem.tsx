import { Car, Trash2 } from 'lucide-react'
import { VEHICLE_IMAGES } from '../assets/vehicleImages'
import type { CartLineItemProps } from './types'

const fmtCAD = (n: number) =>
  '$' + n.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export function CartLineItem({ line, onRemove }: CartLineItemProps) {
  const img = VEHICLE_IMAGES[line.model]
  const unitPrice = line.financingSelected ? (line.lineTotalCost ?? line.price) : line.price
  const displayPrice = unitPrice * line.quantity

  return (
    <li className="flex flex-col rounded-xl border border-card-border bg-card overflow-hidden sm:flex-row sm:items-stretch">
      {/* Vehicle image */}
      <div className="relative h-44 shrink-0 overflow-hidden sm:h-auto sm:w-52">
        {img ? (
          <img
            src={img}
            alt={`${line.year} ${line.brand} ${line.model}`}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-sub-header">
            <Car size={40} className="text-card-border" strokeWidth={1.2} />
          </div>
        )}
        <div className="absolute inset-0 bg-[linear-gradient(to_top,#071428_2%,rgba(7,20,40,0.10)_50%,transparent_100%)] sm:hidden" />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <p className="font-heading text-lg font-semibold">
            {line.year} {line.brand} {line.model}
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Base price: {fmtCAD(line.price)}
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Quantity: {line.quantity}
          </p>

          {line.financingSelected && line.monthlyPayment != null && (
            <div className="mt-2 space-y-0.5 text-sm text-muted-foreground">
              <p>Financed · {line.termMonths} mo @ {line.annualRatePercent}% APR</p>
              <p>Monthly: <span className="font-medium text-foreground">{fmtCAD(line.monthlyPayment)}</span></p>
              <p>Total cost: <span className="font-medium text-foreground">{fmtCAD(line.lineTotalCost ?? 0)}</span></p>
              <p>Total interest: {fmtCAD(line.totalInterest ?? 0)}</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 sm:flex-col sm:items-end">
          <p className="font-heading text-xl font-bold text-[#0066ff]">
            {fmtCAD(displayPrice)}
          </p>
          <button
            type="button"
            onClick={() => onRemove(line.cartLineId)}
            className="inline-flex items-center gap-1.5 rounded-md border border-card-border px-3 py-1.5 text-xs text-muted-foreground transition hover:border-red-500 hover:text-red-400"
          >
            <Trash2 size={13} />
            Remove
          </button>
        </div>
      </div>
    </li>
  )
}
