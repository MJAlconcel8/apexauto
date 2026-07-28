import type { Vehicle } from '../components'
import type { ReviewData } from '../services/reviewApi'

export function addReviewSummaries(vehicles: Vehicle[], reviews: ReviewData[]): Vehicle[] {
  const summaryByVehicle = new Map<number, { total: number; count: number }>()

  reviews.forEach((review) => {
    if (review.rating == null) return
    const current = summaryByVehicle.get(review.vehicleId) ?? { total: 0, count: 0 }
    current.total += review.rating
    current.count += 1
    summaryByVehicle.set(review.vehicleId, current)
  })

  return vehicles.map((vehicle) => {
    const summary = summaryByVehicle.get(Number(vehicle.id))
    if (!summary || summary.count === 0) return vehicle

    return {
      ...vehicle,
      rating: summary.total / summary.count,
      reviewCount: summary.count,
    }
  })
}
