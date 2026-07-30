import type { Vehicle, VehicleBadge } from '../components'
import { VEHICLE_IMAGES } from '../assets/vehicleImages'

export const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=75'

export const fmtCAD = (n: number) => '$' + n.toLocaleString('en-CA')

export function resolveVehicleImage(
  imageUrl: string | null | undefined,
  make: string,
  model: string,
): string {
  const modelName = [make, model].filter(Boolean).join(' ')
  return (
    imageUrl?.trim() ||
    VEHICLE_IMAGES[model] ||
    VEHICLE_IMAGES[modelName] ||
    VEHICLE_IMAGES[make] ||
    FALLBACK_IMG
  )
}

// Body-shape/category options offered when adding or editing a vehicle.
export const VEHICLE_CATEGORIES = ['Sedan', 'Sports', 'SUV', 'Luxury'] as const

export interface VehicleApiResponse {
  vehicleId: number
  brand: string
  make: string
  model: string
  year: number
  color: string
  category?: string
  doors?: number
  seats: number
  emissionScore: number
  fuelUsage: number
  mileage: number
  onSale: boolean
  inStock: boolean
  amountInStock: number
  price: number
  imageUrl?: string | null
}

export function mapVehicle(v: VehicleApiResponse): Vehicle {
  let badge: VehicleBadge
  if (v.amountInStock <= 0) {
    badge = { label: 'Out of Stock', tone: 'hot' }
  } else if (v.onSale) {
    badge = { label: 'On Sale', tone: 'hot' }
  } else if (v.amountInStock <= 2) {
    badge = { label: `${v.amountInStock} left`, tone: 'amber' }
  } else {
    badge = { label: 'In Stock', tone: 'voltage' }
  }
  return {
    id: String(v.vehicleId),
    marque: v.brand,
    model: v.model,
    year: v.year,
    category: v.category,
    img: resolveVehicleImage(v.imageUrl, v.make, v.model),
    price: v.price,
    onSale: v.onSale,
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
