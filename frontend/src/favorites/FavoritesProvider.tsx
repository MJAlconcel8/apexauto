import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { addFavorite, getFavorites, removeFavorite } from '../services/favoritesApi'
import { FavoritesContext } from './FavoritesContext'
import type { FavoritesContextValue } from './FavoritesContext'

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [favoriteVehicleIds, setFavoriteVehicleIds] = useState<number[]>([])
  const [pendingVehicleIds, setPendingVehicleIds] = useState<Set<number>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const favoriteIdsRef = useRef<number[]>([])
  const pendingIdsRef = useRef<Set<number>>(new Set())
  const refreshRequestIdRef = useRef(0)

  const updateFavoriteIds = useCallback((nextIds: number[]) => {
    favoriteIdsRef.current = nextIds
    setFavoriteVehicleIds(nextIds)
  }, [])

  const updatePendingIds = useCallback((nextIds: Set<number>) => {
    pendingIdsRef.current = nextIds
    setPendingVehicleIds(nextIds)
  }, [])

  const refreshFavorites = useCallback(async () => {
    const requestId = ++refreshRequestIdRef.current

    if (!user) {
      updateFavoriteIds([])
      updatePendingIds(new Set())
      setError(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const favorites = await getFavorites(user.userId)
      if (requestId === refreshRequestIdRef.current) {
        updateFavoriteIds([...new Set(favorites.map((favorite) => favorite.vehicleId))])
      }
    } catch {
      if (requestId === refreshRequestIdRef.current) {
        setError('Favorites could not be loaded. Please refresh and try again.')
      }
    } finally {
      if (requestId === refreshRequestIdRef.current) setIsLoading(false)
    }
  }, [user, updateFavoriteIds, updatePendingIds])

  useEffect(() => {
    const initialFavoritesLoad = window.setTimeout(() => {
      void refreshFavorites()
    }, 0)

    return () => window.clearTimeout(initialFavoritesLoad)
  }, [refreshFavorites])

  const favoriteIdSet = useMemo(() => new Set(favoriteVehicleIds), [favoriteVehicleIds])

  const toggleFavorite = useCallback(async (vehicleId: number) => {
    if (!user) throw new Error('Authentication required')
    if (pendingIdsRef.current.has(vehicleId)) return favoriteIdsRef.current.includes(vehicleId)

    const previousIds = favoriteIdsRef.current
    const wasFavorite = previousIds.includes(vehicleId)
    const nextIds = wasFavorite
      ? previousIds.filter((id) => id !== vehicleId)
      : [vehicleId, ...previousIds]

    updateFavoriteIds(nextIds)
    updatePendingIds(new Set(pendingIdsRef.current).add(vehicleId))
    setError(null)

    try {
      if (wasFavorite) {
        await removeFavorite(user.userId, vehicleId)
      } else {
        await addFavorite(user.userId, vehicleId)
      }
      return !wasFavorite
    } catch (requestError) {
      const currentIds = favoriteIdsRef.current
      const rolledBackIds = wasFavorite
        ? (currentIds.includes(vehicleId) ? currentIds : [vehicleId, ...currentIds])
        : currentIds.filter((id) => id !== vehicleId)
      updateFavoriteIds(rolledBackIds)
      setError('That favorite could not be updated. Please try again.')
      throw requestError
    } finally {
      const nextPending = new Set(pendingIdsRef.current)
      nextPending.delete(vehicleId)
      updatePendingIds(nextPending)
    }
  }, [updateFavoriteIds, updatePendingIds, user])

  const value = useMemo<FavoritesContextValue>(() => ({
    favoriteVehicleIds,
    isLoading,
    error,
    isFavorite: (vehicleId) => favoriteIdSet.has(vehicleId),
    isPending: (vehicleId) => pendingVehicleIds.has(vehicleId),
    toggleFavorite,
    refreshFavorites,
  }), [error, favoriteIdSet, favoriteVehicleIds, isLoading, pendingVehicleIds, refreshFavorites, toggleFavorite])

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}
