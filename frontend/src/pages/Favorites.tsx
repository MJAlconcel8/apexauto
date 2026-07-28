import { API_BASE_URL } from '../config/api'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Heart, Loader2, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Nav from '../components/Nav'
import { Footer, Reveal, VehicleCard } from '../components'
import type { Vehicle } from '../components'
import { useFavorites } from '../favorites/FavoritesContext'
import { getAllReviews } from '../services/reviewApi'
import { mapVehicle } from '../utils/vehicleUtils'
import type { VehicleApiResponse } from '../utils/vehicleUtils'
import { addReviewSummaries } from '../utils/reviewUtils'

export default function Favorites() {
  const navigate = useNavigate()
  const { favoriteVehicleIds, isLoading: favoritesLoading, error: favoritesError, refreshFavorites } = useFavorites()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [vehiclesLoading, setVehiclesLoading] = useState(true)
  const [vehiclesError, setVehiclesError] = useState<string | null>(null)

  const loadVehicles = useCallback(async () => {
    setVehiclesLoading(true)
    setVehiclesError(null)
    try {
      const response = await fetch(`${API_BASE_URL}/vehicles`)
      if (!response.ok) throw new Error('Failed to load vehicles')
      const data = await response.json() as VehicleApiResponse[]
      const reviews = await getAllReviews().catch(() => [])
      setVehicles(addReviewSummaries(data.map(mapVehicle), reviews))
    } catch {
      setVehiclesError('Favorite vehicles could not be loaded. Please try again.')
    } finally {
      setVehiclesLoading(false)
    }
  }, [])

  useEffect(() => {
    const initialVehicleLoad = window.setTimeout(() => {
      void loadVehicles()
    }, 0)

    return () => window.clearTimeout(initialVehicleLoad)
  }, [loadVehicles])

  const favoriteVehicles = useMemo(() => {
    const byId = new Map(vehicles.map((vehicle) => [Number(vehicle.id), vehicle]))
    return favoriteVehicleIds
      .map((vehicleId) => byId.get(vehicleId))
      .filter((vehicle): vehicle is Vehicle => vehicle != null)
  }, [favoriteVehicleIds, vehicles])

  const loading = favoritesLoading || vehiclesLoading
  const error = favoritesError ?? vehiclesError

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <main className="min-h-screen pt-16 flex flex-col">
        <section className="border-b border-card-border bg-sub-header">
          <div className="mx-auto max-w-7xl px-6 py-7 lg:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[#7eb3ff]">
                  <Heart size={15} className="fill-[#ff4d6d] text-[#ff4d6d]" /> Saved vehicles
                </div>
                <h1 className="mt-2 font-heading text-3xl font-bold text-white">Your Favorites</h1>
                <p className="mt-1 font-mono text-[12px] text-muted-foreground">
                  {favoriteVehicles.length} saved vehicle{favoriteVehicles.length === 1 ? '' : 's'}
                </p>
              </div>
              {error && (
                <button
                  type="button"
                  onClick={() => {
                    void Promise.all([refreshFavorites(), loadVehicles()])
                  }}
                  className="av-focus inline-flex self-start items-center gap-2 whitespace-nowrap rounded-md border border-card-border px-3 py-2 text-sm text-[#7eb3ff] transition hover:border-[#0066ff] hover:text-white sm:self-auto"
                >
                  <RefreshCw size={14} /> Retry favorites
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl flex-1 px-6 py-8 lg:px-8">
          {error && (
            <p className="mb-6 rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}

          {loading ? (
            <div className="flex min-h-[45vh] items-center justify-center">
              <Loader2 size={34} className="animate-spin text-[#0066ff]" />
            </div>
          ) : favoriteVehicles.length === 0 ? (
            <div className="flex min-h-[45vh] flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-card-border bg-card">
                <Heart size={30} className="text-muted-foreground" />
              </div>
              <h2 className="mt-5 font-heading text-2xl font-semibold text-white">No favorite vehicles yet</h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Select the heart beside a vehicle name in the catalogue to save it here.
              </p>
              <button
                type="button"
                onClick={() => navigate('/catalogue')}
                className="av-focus mt-6 rounded-md bg-[#0066ff] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0055d9]"
              >
                Browse Catalogue
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {favoriteVehicles.map((vehicle, index) => (
                <Reveal key={vehicle.id} delay={index * 50}>
                  <VehicleCard v={vehicle} dark onFinance={() => {}} />
                </Reveal>
              ))}
            </div>
          )}
        </section>

        <Footer />
      </main>
    </div>
  )
}
