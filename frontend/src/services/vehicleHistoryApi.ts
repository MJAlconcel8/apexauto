const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '')

export interface VehicleHistoryData {
  vehicleHistoryId: number
  userId: number
  vehicleId: number
  vehicleHistoryComments: string
  createdAt: string
}

// GET /vehicle-history/vehicles/{vehicleId} — public, newest first
export async function getVehicleHistory(vehicleId: number): Promise<VehicleHistoryData[]> {
  const res = await fetch(`${API_BASE}/vehicle-history/vehicles/${vehicleId}`)
  if (res.status === 404) return []
  if (!res.ok) throw new Error('Failed to load vehicle history')
  return res.json() as Promise<VehicleHistoryData[]>
}

// POST /users/{userId}/vehicle-history — admin only, create history for a vehicle
export async function createVehicleHistory(
  userId: number,
  vehicleId: number,
  vehicleHistoryComments: string,
): Promise<VehicleHistoryData> {
  const res = await fetch(`${API_BASE}/users/${userId}/vehicle-history`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vehicleId, vehicleHistoryComments }),
  })
  if (!res.ok) throw new Error('Failed to create vehicle history')
  return res.json() as Promise<VehicleHistoryData>
}

// DELETE /vehicle-history/vehicles/{vehicleId} — admin only, wipes vehicle history for a vehicle
export async function deleteVehicleHistory(vehicleId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/vehicle-history/vehicles/${vehicleId}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to delete vehicle history')
}

// DELETE /vehicle-history — admin only, wipes all vehicle history entries
export async function deleteAllVehicleHistory(): Promise<void> {
  const res = await fetch(`${API_BASE}/vehicle-history`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to delete all vehicle history')
}
