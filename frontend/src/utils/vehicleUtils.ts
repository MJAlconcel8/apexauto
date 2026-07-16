import type { Vehicle, VehicleBadge } from '../components'
import { VEHICLE_IMAGES } from '../assets/vehicleImages'

export const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=75'

export const fmtCAD = (n: number) => '$' + n.toLocaleString('en-CA')

/**
 * Body-shape/category per model. The backend Vehicle has no category column,
 * so the catalogue's Category filter is driven by this map. Add a model here
 * whenever a new vehicle is introduced (same pattern as VEHICLE_IMAGES).
 * Unmapped models are left uncategorised and only appear under "All".
 */
export const VEHICLE_CATEGORIES: Record<string, string> = {
  'Nexus S': 'Sedan',
  'Vector GT': 'Sports',
  'Terrain X': 'SUV',
  'Kestrel EV Sport': 'Sports',
  'Volen Lumen': 'Luxury',
  'Meridian Bolt': 'Sedan',
}

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
    category: VEHICLE_CATEGORIES[v.model] ?? VEHICLE_CATEGORIES[modelName],
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
