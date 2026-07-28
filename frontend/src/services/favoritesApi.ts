import { API_BASE_URL } from '../config/api'

export interface FavoriteData {
  favouriteId: number
  userId: number
  vehicleId: number
}

export async function getFavorites(userId: number): Promise<FavoriteData[]> {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/favourites`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) throw new Error('Failed to load favorites')
  return response.json() as Promise<FavoriteData[]>
}

export async function addFavorite(userId: number, vehicleId: number): Promise<FavoriteData> {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/favourites`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, vehicleId }),
  })

  if (!response.ok) throw new Error('Failed to add favorite')
  return response.json() as Promise<FavoriteData>
}

export async function removeFavorite(userId: number, vehicleId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/favourites/${vehicleId}`, {
    method: 'DELETE',
    credentials: 'include',
  })

  if (!response.ok) throw new Error('Failed to remove favorite')
}
