import { API_BASE_URL } from '../config/api'
import { useState } from 'react'
import { ArrowRight, BadgeDollarSign, Heart, MapPin, ShoppingCart } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { VehicleCardProps } from './types'
import { useAuth } from '../auth/AuthContext'
import { useFavorites } from '../favorites/FavoritesContext'
import { Badge } from './Badge'
import { RangeGauge } from './RangeGauge'
import { SpecReadout } from './SpecReadout'
import { StarRating } from './StarRating'
import { Btn } from './Btn'

const fmtCAD = (n: number) => '$' + n.toLocaleString('en-CA')

function modelFontSize(model: string) {
  if (model.length <= 16) return 20
  if (model.length <= 22) return 18
  if (model.length <= 28) return 16
  if (model.length <= 36) return 14
  if (model.length <= 44) return 11
  return 9
}

export function VehicleCard({
  v,
  dark = false,
  hideFinance = false,
  hideAddToCart = false,
  onView,
  onFinance,
  cardNavigateState,
}: VehicleCardProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const { isFavorite, isPending, isLoading: favoritesLoading, toggleFavorite } = useFavorites()
  const [adding, setAdding] = useState(false)
  const [cartMsg, setCartMsg] = useState<string | null>(null)
  const [favoriteMsg, setFavoriteMsg] = useState<string | null>(null)
  const vehicleId = Number(v.id)
  const saved = isFavorite(vehicleId)
  const favoritePending = isPending(vehicleId) || (isAuthenticated && favoritesLoading)

  const handleFinance = () => {
    if (onFinance) onFinance(v)
    navigate('/finance', { state: { id: v.id, marque: v.marque, model: v.model, price: v.price, img: v.img } })
  }

  const handleFavorite = async () => {
    setFavoriteMsg(null)
    if (!isAuthenticated) {
      const returnTo = `${location.pathname}${location.search}${location.hash}`
      navigate('/login', { state: { returnTo } })
      return
    }

    try {
      await toggleFavorite(vehicleId)
    } catch {
      setFavoriteMsg('Could not update favorite.')
    }
  }

  const handleAddToCart = async () => {
    setAdding(true)
    setCartMsg(null)
    try {
      let cartRes = await fetch(`${API_BASE_URL}/users/me/carts/active`, { credentials: 'include' })
      if (cartRes.status === 401) { navigate('/login'); return }
      if (cartRes.status === 404) {
        const createRes = await fetch(`${API_BASE_URL}/users/me/carts`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        })
        if (createRes.status === 401) { navigate('/login'); return }
        if (!createRes.ok) throw new Error()
        cartRes = createRes
      } else if (!cartRes.ok) {
        throw new Error()
      }
      const cartData = await cartRes.json() as { cartId: number }
      const addRes = await fetch(`${API_BASE_URL}/carts/${cartData.cartId}/cart-lines`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleId, quantity: 1 }),
      })
      if (!addRes.ok) throw new Error()
      window.dispatchEvent(new Event('cart-updated'))
      setCartMsg('Added to cart!')
    } catch {
      setCartMsg('Failed to add.')
    } finally {
      setAdding(false)
    }
  }

  return (
    <article
      className={`group/card av-rise flex flex-col rounded-[14px] overflow-hidden border cursor-pointer hover:-translate-y-0.75 transition-all duration-220 ${
        dark
          ? 'bg-card border-card-border hover:border-[rgba(14,99,255,0.35)] shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_30px_rgba(14,99,255,0.15)]'
          : 'bg-white border-apex-line hover:border-[rgba(14,99,255,0.35)] shadow-[0_8px_24px_-14px_rgba(18,22,28,0.20)] hover:shadow-[0_14px_30px_-18px_rgba(18,22,28,0.35)]'
      }`}
      onClick={() => navigate(`/vehicle/${v.id}`, cardNavigateState ? { state: cardNavigateState } : undefined)}
    >
      <div className="relative h-47 overflow-hidden">
        <img
          src={v.img}
          alt={`${v.marque} ${v.model}`}
          loading="lazy"
          className="w-full h-full object-cover block group-hover/card:scale-[1.045] transition-transform duration-500"
        />
        <div className={`absolute inset-0 ${dark ? 'bg-[linear-gradient(to_top,#071428_2%,rgba(7,20,40,0.15)_45%,rgba(7,20,40,0.05)_100%)]' : 'bg-[linear-gradient(to_top,#12161C_2%,rgba(18,22,28,0.15)_45%,rgba(18,22,28,0.05)_100%)]'}`} />
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
          <Badge badge={v.badge} />
          <span className="shrink-0 whitespace-nowrap font-mono text-[9px] text-white tracking-[0.06em] bg-[rgba(18,22,28,0.55)] px-2 py-0.75 rounded-md backdrop-blur-xs">
            {v.marque.toUpperCase()} · {v.category?.toUpperCase() ?? v.year}
          </span>
        </div>
        <div className="absolute left-3.5 bottom-3 right-3.5 flex min-w-0 items-center gap-2">
          <h3
            className="min-w-0 flex-1 whitespace-nowrap font-display font-extrabold leading-none text-white tracking-[-0.02em] [text-shadow:0_1px_8px_rgba(0,0,0,0.4)]"
            style={{ fontSize: `${modelFontSize(v.model)}px` }}
          >
            {v.model}
          </h3>
          <button
            type="button"
            aria-label={saved ? `Remove ${v.marque} ${v.model} from favorites` : `Add ${v.marque} ${v.model} to favorites`}
            aria-pressed={saved}
            disabled={favoritePending}
            onClick={(event) => {
              event.stopPropagation()
              void handleFavorite()
            }}
            className="av-focus inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/35 bg-[rgba(3,12,26,0.72)] text-white backdrop-blur-sm transition hover:border-[#7eb3ff] hover:text-[#7eb3ff] disabled:cursor-wait disabled:opacity-60"
          >
            <Heart size={18} strokeWidth={1.8} className={saved ? 'fill-[#ff4d6d] text-[#ff4d6d]' : ''} />
          </button>
        </div>
      </div>

      <div className="flex flex-col p-4.5 gap-3.5 flex-1">
        <div className={`flex min-w-0 items-center gap-1 ${v.stock > 0 ? 'text-apex-green' : 'text-apex-red'}`}>
          <MapPin size={12} strokeWidth={2} className="shrink-0" />
          <span className="min-w-0 whitespace-nowrap font-mono text-[10px] tracking-[-0.02em]">
            {v.stock > 0 ? `${v.stock} in stock · ${v.history}` : `Out of Stock · ${v.history}`}
          </span>
        </div>

        <div className={`flex items-center gap-2.5 py-3 border-t border-b ${dark ? 'border-card-border' : 'border-apex-line'}`}>
          <div className="shrink-0">
            <RangeGauge value={v.mileage} size={74} dark={dark} />
          </div>
          <div
            className={`grid min-w-0 flex-1 grid-cols-3 divide-x overflow-hidden ${
              dark ? 'divide-card-border' : 'divide-apex-line'
            }`}
          >
            <SpecReadout label="Emission" value={v.emissionScore} unit="g/km" dark={dark} />
            <SpecReadout label="Fuel Use" value={v.fuelUsage.toFixed(1)} unit="L/100" dark={dark} />
            <SpecReadout label="Seats" value={v.seats} dark={dark} />
          </div>
        </div>

        {v.rating != null && (
          <div className="flex min-h-5 items-center gap-1.5">
            <StarRating value={Math.round(v.rating)} readOnly size={12} label={`${v.marque} ${v.model} rating`} />
            <span className={`whitespace-nowrap font-mono text-[10px] ${dark ? 'text-muted-foreground' : 'text-apex-muted'}`}>
              {v.rating.toFixed(1)} ({v.reviewCount?.toLocaleString('en-CA')})
            </span>
          </div>
        )}

        <div className="flex flex-col gap-3 mt-auto">
          <div className="flex min-w-0 items-baseline gap-2 whitespace-nowrap">
            {v.was && (
              <span className={`font-mono text-[11px] line-through ${dark ? 'text-muted-foreground' : 'text-apex-muted'}`}>
                {fmtCAD(v.was)}
              </span>
            )}
            <span className={`font-mono text-[20px] font-semibold leading-none ${dark ? 'text-foreground' : 'text-apex-ink'}`}>
              {fmtCAD(v.price)}
            </span>
          </div>

          <div className="min-h-4">
            {(favoriteMsg || cartMsg) && (
              <span
                className="block whitespace-nowrap font-mono text-[10px]"
                style={{ color: favoriteMsg || cartMsg?.startsWith('Failed') ? '#f87171' : '#22c55e' }}
              >
                {favoriteMsg ?? cartMsg}
              </span>
            )}
          </div>

          <div className="flex gap-2" onClick={(event) => event.stopPropagation()}>
            {!hideFinance && (
              <Btn variant="outline" size="sm" icon={BadgeDollarSign} onClick={handleFinance}>
                Finance
              </Btn>
            )}
            {onView ? (
              <div className="flex-1">
                <Btn variant="primary" size="sm" icon={ArrowRight} onClick={() => onView(v)} fullWidth>
                  View
                </Btn>
              </div>
            ) : !hideAddToCart ? (
              <div className="flex-1">
                <Btn variant="primary" size="sm" icon={ShoppingCart} onClick={handleAddToCart} fullWidth>
                  {adding ? 'Adding…' : 'Add to Cart'}
                </Btn>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  )
}
