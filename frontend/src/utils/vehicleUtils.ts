import type { Vehicle, VehicleBadge } from '../components'
import { VEHICLE_IMAGES } from '../assets/vehicleImages'

export const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=75'

export const fmtCAD = (n: number) => '$' + n.toLocaleString('en-CA')

export interface VehicleApiResponse {
  vehicleId: number
  brand: string
  make: string
  model: string
  year: number
  color: string
  doors?: number
  seats: number
  emissionScore: number
  fuelUsage: number
  mileage: number
  onSale: boolean
  inStock: boolean
  amountInStock: number
  price: number
}

export function mapVehicle(v: VehicleApiResponse): Vehicle {
  const modelName = [v.make, v.model].filter(Boolean).join(' ')
  let badge: VehicleBadge
  if (v.onSale) {
    badge = { label: 'On Sale', tone: 'hot' }
  } else if (v.amountInStock <= 2 && v.amountInStock > 0) {
    badge = { label: `${v.amountInStock} left`, tone: 'amber' }
  } else {
    badge = { label: 'In Stock', tone: 'voltage' }
  }
  return {
    id: String(v.vehicleId),
    marque: v.brand,
    model: v.model,
    year: v.year,
    img:
      VEHICLE_IMAGES[v.model] ??
      VEHICLE_IMAGES[modelName] ??
      VEHICLE_IMAGES[v.make] ??
      FALLBACK_IMG,
    price: v.price,
    mileage: v.mileage,
    emissionScore: v.emissionScore,
    seats: v.seats,
    fuelUsage: v.fuelUsage,
    stock: v.amountInStock,
    history: `New · ${v.year}`,
    ext: v.color,
    badge,
  }
}
