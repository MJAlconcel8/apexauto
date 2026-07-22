const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '')

export class VehicleApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

// Shape returned by GET /vehicles, GET /vehicles/{id}, POST /vehicles, PUT/PATCH /vehicles/{id}.
export interface VehicleData {
  vehicleId: number
  brand: string
  make: string
  model: string
  year: number
  color: string
  doors: number
  seats: number
  emissionScore: number
  fuelUsage: number
  mileage: number
  onSale: boolean
  inStock: boolean
  amountInStock: number
  price: number
  imageUrl: string | null
}

// Shape sent to POST /vehicles and PUT /vehicles/{id} (full create/replace payload).
export interface VehiclePayload {
  brand: string
  make: string
  model: string
  year: number
  color: string
  doors: number
  seats: number
  emissionScore: number
  fuelUsage: number
  mileage: number
  isOnSale: boolean
  isInStock: boolean
  amountInStock: number
  price: number
  imageUrl: string | null
}

// Shape sent to PATCH /vehicles/{id} — every field is optional.
export type VehiclePatchPayload = Partial<VehiclePayload>

async function throwApiError(res: Response, fallback: string): Promise<never> {
  const body = await res.json().catch(() => null) as { message?: string } | null
  throw new VehicleApiError(body?.message ?? fallback, res.status)
}

// GET /vehicles — public, returns every vehicle
export async function getAllVehicles(): Promise<VehicleData[]> {
  const res = await fetch(`${API_BASE}/vehicles`)
  if (!res.ok) throw new VehicleApiError('Failed to load vehicles.', res.status)
  return res.json() as Promise<VehicleData[]>
}

// POST /vehicles — admin only, create a new vehicle
export async function createVehicle(payload: VehiclePayload): Promise<VehicleData> {
  const res = await fetch(`${API_BASE}/vehicles`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) return throwApiError(res, 'Failed to create vehicle.')
  return res.json() as Promise<VehicleData>
}

// PATCH /vehicles/{vehicleId} — admin only, partially update an existing vehicle
export async function patchVehicle(vehicleId: number, payload: VehiclePatchPayload): Promise<VehicleData> {
  const res = await fetch(`${API_BASE}/vehicles/${vehicleId}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) return throwApiError(res, 'Failed to update vehicle.')
  return res.json() as Promise<VehicleData>
}

// DELETE /vehicles/{vehicleId} — admin only, delete a vehicle
export async function deleteVehicle(vehicleId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/vehicles/${vehicleId}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!res.ok && res.status !== 204) return throwApiError(res, 'Failed to delete vehicle.')
}

