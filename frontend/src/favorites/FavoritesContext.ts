import { createContext, useContext } from 'react'

export interface FavoritesContextValue {
  favoriteVehicleIds: number[]
  isLoading: boolean
  error: string | null
  isFavorite: (vehicleId: number) => boolean
  isPending: (vehicleId: number) => boolean
  toggleFavorite: (vehicleId: number) => Promise<boolean>
  refreshFavorites: () => Promise<void>
}

export const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined)

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (!context) throw new Error('useFavorites must be used inside FavoritesProvider')
  return context
}
