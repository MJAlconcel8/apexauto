import { useState } from 'react'
import { Star } from 'lucide-react'

interface StarRatingProps {
  value: number | null
  onChange?: (rating: number) => void
  readOnly?: boolean
  size?: number
  label?: string
}

export function StarRating({
  value,
  onChange,
  readOnly = false,
  size = 18,
  label = 'Star rating',
}: StarRatingProps) {
  const [hoveredValue, setHoveredValue] = useState<number | null>(null)
  const displayedValue = hoveredValue ?? value ?? 0

  return (
    <div
      className="inline-flex items-center gap-1"
      role={readOnly ? 'img' : 'radiogroup'}
      aria-label={readOnly ? `${label}: ${value ?? 'unrated'}` : label}
      onMouseLeave={() => setHoveredValue(null)}
    >
      {Array.from({ length: 5 }, (_, index) => index + 1).map((rating) => {
        const selected = rating <= displayedValue
        const star = (
          <Star
            size={size}
            strokeWidth={1.7}
            className={selected ? 'fill-apex-amber text-apex-amber' : 'fill-transparent text-[#4a6080]'}
          />
        )

        if (readOnly) {
          return <span key={rating} aria-hidden="true">{star}</span>
        }

        return (
          <button
            key={rating}
            type="button"
            role="radio"
            aria-checked={value === rating}
            aria-label={`Rate ${rating} out of 5`}
            onMouseEnter={() => setHoveredValue(rating)}
            onFocus={() => setHoveredValue(rating)}
            onBlur={() => setHoveredValue(null)}
            onClick={() => onChange?.(rating)}
            className="av-focus rounded-sm p-0.5 transition-transform hover:scale-110 focus:scale-110"
          >
            {star}
          </button>
        )
      })}
    </div>
  )
}
