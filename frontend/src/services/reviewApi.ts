const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '')

export interface ReviewData {
  reviewId: number
  userId: number
  vehicleId: number
  reviewComments: string
  userFirstName: string
  userLastName: string
}

// GET /reviews/vehicles/{vehicleId} — public, newest first
export async function getVehicleReviews(vehicleId: number): Promise<ReviewData[]> {
  const res = await fetch(`${API_BASE}/reviews/vehicles/${vehicleId}`)
  if (!res.ok) throw new Error('Failed to load reviews')
  return res.json() as Promise<ReviewData[]>
}

// POST /users/{userId}/reviews — authenticated, create review for a vehicle
export async function createReview(
  userId: number,
  vehicleId: number,
  reviewComments: string,
): Promise<ReviewData> {
  const res = await fetch(`${API_BASE}/users/${userId}/reviews`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vehicleId, reviewComments }),
  })
  if (!res.ok) throw new Error('Failed to create review')
  return res.json() as Promise<ReviewData>
}

// PATCH /users/{userId}/reviews/{reviewId} — authenticated, update comment
export async function updateReview(
  userId: number,
  reviewId: number,
  reviewComments: string,
): Promise<ReviewData> {
  const res = await fetch(`${API_BASE}/users/${userId}/reviews/${reviewId}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reviewComments }),
  })
  if (!res.ok) throw new Error('Failed to update review')
  return res.json() as Promise<ReviewData>
}

// DELETE /users/{userId}/reviews/{reviewId} — authenticated owner or admin
export async function deleteReview(userId: number, reviewId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/users/${userId}/reviews/${reviewId}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to delete review')
}

// DELETE /reviews — admin only, wipes all reviews
export async function deleteAllReviews(): Promise<void> {
  const res = await fetch(`${API_BASE}/reviews`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to delete all reviews')
}

// DELETE /reviews/vehicles/{vehicleId} — admin only, wipes all reviews for a vehicle
export async function deleteVehicleReviews(vehicleId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/reviews/vehicles/${vehicleId}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to delete vehicle reviews')
}
