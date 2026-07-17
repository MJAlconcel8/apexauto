import { useEffect, useState } from 'react'
import {
  GitCompareArrows,
  Loader2,
  CheckCircle2,
  Circle,
  Trophy,
  Car,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  ShoppingCart,
  BadgeDollarSign,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Nav from '../components/Nav'
import { Footer } from '../components'
import { fmtCAD, FALLBACK_IMG } from '../utils/vehicleUtils'
import { VEHICLE_IMAGES } from '../assets/vehicleImages'

const API = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080').replace(/\/$/, '')

/* ── Types ────────────────────────────────────────────────────── */

interface VehicleDTO {
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
}

interface CompareResponse {
  vehicles: VehicleDTO[]
  recommendedVehicleId: number
  recommendationReason: string
}

/* ── Spec row definitions ─────────────────────────────────────── */

interface SpecRow {
  key: string
  label: string
  getValue: (v: VehicleDTO) => number
  format: (n: number) => string
  bestIsLowest: boolean
}

const SPEC_ROWS: SpecRow[] = [
  {
    key: 'price',
    label: 'PRICE',
    getValue: (v) => Number(v.price),
    format: (n) => fmtCAD(n),
    bestIsLowest: true,
  },
  {
    key: 'mileage',
    label: 'MILEAGE',
    getValue: (v) => v.mileage,
    format: (n) => `${n.toLocaleString()} km`,
    bestIsLowest: false,
  },
  {
    key: 'emission',
    label: 'EMISSION',
    getValue: (v) => v.emissionScore,
    format: (n) => `${n} g/km`,
    bestIsLowest: true,
  },
  {
    key: 'fuel',
    label: 'FUEL USAGE',
    getValue: (v) => v.fuelUsage,
    format: (n) => `${n} L/100km`,
    bestIsLowest: true,
  },
  {
    key: 'stock',
    label: 'IN STOCK',
    getValue: (v) => v.amountInStock,
    format: (n) => String(n),
    bestIsLowest: false,
  },
]

const getImg = (v: VehicleDTO) =>
  VEHICLE_IMAGES[v.model] ?? VEHICLE_IMAGES[v.make] ?? FALLBACK_IMG

/* ── Empty state ──────────────────────────────────────────────── */

function EmptyState({ onBrowse }: { onBrowse: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-32 px-6">
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
        style={{ background: 'rgba(0,102,255,0.1)', border: '1px solid rgba(0,102,255,0.2)' }}
      >
        <GitCompareArrows size={36} style={{ color: '#0066ff' }} strokeWidth={1.5} />
      </div>
      <h2 className="font-heading font-bold text-3xl text-white mb-3">
        Pick up to 3 vehicles to compare
      </h2>
      <p
        className="font-body text-[15px] max-w-md mb-8"
        style={{ color: 'rgba(126,179,255,0.65)' }}
      >
        Select 2 or 3 vehicles from our catalogue and we'll recommend the best
        purchase based on price, range, efficiency, and availability.
      </p>
      <button
        onClick={onBrowse}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-body text-sm font-semibold text-white transition-all hover:opacity-90"
        style={{ background: '#0066ff' }}
      >
        Browse Catalogue
        <ArrowRight size={16} />
      </button>
    </div>
  )
}

/* ── Selection card ───────────────────────────────────────────── */

function SelectionCard({
  v,
  selected,
  disabled,
  onToggle,
}: {
  v: VehicleDTO
  selected: boolean
  disabled: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled && !selected}
      className="relative text-left rounded-xl overflow-hidden border transition-all duration-200 w-full"
      style={{
        background: selected ? 'rgba(0,102,255,0.12)' : 'rgba(7,20,40,0.6)',
        border: selected
          ? '1px solid rgba(0,102,255,0.55)'
          : '1px solid rgba(30,58,95,0.6)',
        opacity: disabled && !selected ? 0.4 : 1,
        cursor: disabled && !selected ? 'not-allowed' : 'pointer',
        boxShadow: selected ? '0 0 0 2px rgba(0,102,255,0.25)' : 'none',
      }}
    >
      {/* Image */}
      <div className="relative h-36 overflow-hidden">
        <img
          src={getImg(v)}
          alt={`${v.brand} ${v.model}`}
          loading="lazy"
          className="w-full h-full object-cover"
          style={{ filter: disabled && !selected ? 'grayscale(60%)' : 'none' }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,#030c1a_0%,transparent_60%)]" />
        {/* Selection indicator */}
        <div className="absolute top-2.5 right-2.5">
          {selected ? (
            <CheckCircle2 size={22} style={{ color: '#0066ff' }} fill="rgba(0,102,255,0.15)" />
          ) : (
            <Circle size={22} style={{ color: 'rgba(126,179,255,0.4)' }} />
          )}
        </div>
      </div>

      {/* Info */}
      <div className="px-3.5 py-3">
        <p
          className="font-mono text-[10px] tracking-widest uppercase mb-0.5"
          style={{ color: 'rgba(126,179,255,0.55)' }}
        >
          {v.brand} · {v.year}
        </p>
        <p className="font-heading font-bold text-[15px] text-white leading-tight">{v.model}</p>
        <p
          className="font-mono text-[12px] mt-1.5"
          style={{ color: selected ? '#7eb3ff' : 'rgba(126,179,255,0.7)' }}
        >
          {fmtCAD(Number(v.price))}
        </p>
      </div>
    </button>
  )
}

/* ── Selection phase ──────────────────────────────────────────── */

function SelectionPhase({
  vehicles,
  selected,
  onToggle,
  onCompare,
  comparing,
}: {
  vehicles: VehicleDTO[]
  selected: number[]
  onToggle: (id: number) => void
  onCompare: () => void
  comparing: boolean
}) {
  const canCompare = selected.length >= 2
  const atMax = selected.length >= 3

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
      {/* Instruction bar */}
      <div
        className="flex items-center justify-between flex-wrap gap-4 mb-8 px-5 py-4 rounded-xl"
        style={{ background: 'rgba(7,20,40,0.7)', border: '1px solid rgba(30,58,95,0.6)' }}
      >
        <div className="flex items-center gap-3">
          <GitCompareArrows size={20} style={{ color: '#0066ff' }} />
          <div>
            <p className="font-body text-sm text-white font-medium">
              {selected.length === 0
                ? 'Select 2 or 3 vehicles to compare'
                : selected.length === 1
                ? 'Select 1 or 2 more vehicles'
                : selected.length === 2
                ? 'Ready to compare — or add 1 more'
                : 'Maximum 3 vehicles selected'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Selection bubbles */}
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all"
                style={{
                  background:
                    i < selected.length ? '#0066ff' : 'rgba(30,58,95,0.5)',
                  color: i < selected.length ? '#fff' : 'rgba(126,179,255,0.4)',
                  border:
                    i < selected.length
                      ? '1px solid rgba(0,102,255,0.6)'
                      : '1px solid rgba(30,58,95,0.4)',
                }}
              >
                {i < selected.length ? i + 1 : '—'}
              </div>
            ))}
          </div>

          <button
            onClick={onCompare}
            disabled={!canCompare || comparing}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg font-body text-sm font-semibold transition-all"
            style={{
              background: canCompare ? '#0066ff' : 'rgba(30,58,95,0.4)',
              color: canCompare ? '#fff' : 'rgba(126,179,255,0.4)',
              cursor: canCompare && !comparing ? 'pointer' : 'not-allowed',
              opacity: canCompare ? 1 : 0.7,
            }}
          >
            {comparing ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <GitCompareArrows size={15} />
            )}
            Compare {selected.length >= 2 ? `${selected.length} Vehicles` : ''}
          </button>
        </div>
      </div>

      {/* Vehicle grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {vehicles.map((v) => (
          <SelectionCard
            key={v.vehicleId}
            v={v}
            selected={selected.includes(v.vehicleId)}
            disabled={atMax}
            onToggle={() => onToggle(v.vehicleId)}
          />
        ))}
      </div>
    </div>
  )
}

/* ── Comparison table ─────────────────────────────────────────── */

function ComparisonTable({
  result,
  onReset,
}: {
  result: CompareResponse
  onReset: () => void
}) {
  const navigate = useNavigate()
  const { vehicles, recommendedVehicleId, recommendationReason } = result
  const [adding, setAdding] = useState(false)
  const [cartMsg, setCartMsg] = useState<string | null>(null)

  const handleAddToCart = async (rec: VehicleDTO) => {
    setAdding(true)
    setCartMsg(null)
    try {
      let cartRes = await fetch(`${API}/users/me/carts/active`, { credentials: 'include' })
      if (cartRes.status === 401) { navigate('/login'); return }
      if (cartRes.status === 404) {
        const createRes = await fetch(`${API}/users/me/carts`, {
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
      const cartData = (await cartRes.json()) as { cartId: number }
      const addRes = await fetch(`${API}/carts/${cartData.cartId}/cart-lines`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleId: rec.vehicleId, quantity: 1 }),
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

  const handleFinance = (rec: VehicleDTO) => {
    navigate('/finance', {
      state: {
        id: rec.vehicleId,
        marque: rec.brand,
        model: rec.model,
        price: Number(rec.price),
        img: getImg(rec),
      },
    })
  }

  // Find the best vehicleId for each spec row
  const bestIds: Record<string, number[]> = {}
  for (const row of SPEC_ROWS) {
    const values = vehicles.map((v) => row.getValue(v))
    const best = row.bestIsLowest ? Math.min(...values) : Math.max(...values)
    bestIds[row.key] = vehicles
      .filter((v) => row.getValue(v) === best)
      .map((v) => v.vehicleId)
  }

  const isBest = (row: SpecRow, v: VehicleDTO) => bestIds[row.key].includes(v.vehicleId)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header row */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading font-bold text-2xl text-white">Side-by-Side Comparison</h1>
          <p className="font-mono text-[12px] mt-1" style={{ color: 'rgba(126,179,255,0.5)' }}>
            Best value in each row is marked. No guesswork.
          </p>
        </div>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-body text-sm transition-colors hover:text-white"
          style={{
            background: 'rgba(7,20,40,0.6)',
            border: '1px solid rgba(30,58,95,0.6)',
            color: 'rgba(126,179,255,0.7)',
            cursor: 'pointer',
          }}
        >
          <RotateCcw size={14} />
          New Comparison
        </button>
      </div>

      {/* Recommendation banner */}
      {(() => {
        const rec = vehicles.find((v) => v.vehicleId === recommendedVehicleId)
        if (!rec) return null
        return (
          <div
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4 px-5 py-4 rounded-xl mb-8"
            style={{
              background: 'linear-gradient(135deg, rgba(0,102,255,0.12) 0%, rgba(0,62,154,0.08) 100%)',
              border: '1px solid rgba(0,102,255,0.3)',
            }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'rgba(0,102,255,0.18)', border: '1px solid rgba(0,102,255,0.4)' }}
            >
              <Trophy size={18} style={{ color: '#0066ff' }} />
            </div>
            <div className="flex-1">
              <p className="font-mono text-[10px] tracking-widest uppercase mb-0.5" style={{ color: 'rgba(126,179,255,0.55)' }}>
                Our Recommendation
              </p>
              <p className="font-heading font-bold text-white text-[17px]">
                {rec.brand} {rec.model}{' '}
                <span className="font-mono text-[13px] font-normal" style={{ color: '#7eb3ff' }}>
                  · {rec.year}
                </span>
              </p>
              <p className="font-body text-[13px] mt-0.5" style={{ color: 'rgba(126,179,255,0.75)' }}>
                {recommendationReason}
              </p>
            </div>
            <div className="shrink-0 flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAddToCart(rec)}
                  disabled={adding || !rec.inStock}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-body text-sm font-semibold transition-all"
                  style={{
                    background: rec.inStock ? '#0066ff' : 'rgba(30,58,95,0.5)',
                    color: rec.inStock ? '#fff' : 'rgba(126,179,255,0.4)',
                    cursor: rec.inStock && !adding ? 'pointer' : 'not-allowed',
                    opacity: adding ? 0.7 : 1,
                  }}
                >
                  {adding ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <ShoppingCart size={14} />
                  )}
                  {rec.inStock ? 'Add to Cart' : 'Out of Stock'}
                </button>

                <button
                  onClick={() => handleFinance(rec)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-body text-sm font-semibold transition-all hover:border-[rgba(0,102,255,0.5)] hover:text-white"
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(30,58,95,0.7)',
                    color: 'rgba(126,179,255,0.85)',
                    cursor: 'pointer',
                  }}
                >
                  <BadgeDollarSign size={14} />
                  Finance
                </button>
              </div>

              {cartMsg && (
                <p
                  className="font-mono text-[11px] tracking-wide"
                  style={{
                    color: cartMsg === 'Added to cart!' ? '#4ade80' : '#f87171',
                  }}
                >
                  {cartMsg}
                </p>
              )}
            </div>
          </div>
        )
      })()}

      {/* Table */}
      <div
        className="rounded-2xl overflow-hidden overflow-x-auto"
        style={{ border: '1px solid rgba(30,58,95,0.7)' }}
      >
        <table className="w-full min-w-135 border-collapse">
          <thead>
            <tr style={{ background: 'rgba(4,15,32,0.9)' }}>
              {/* Spec column header */}
              <th
                className="text-left px-5 py-5 font-mono text-[11px] tracking-[0.16em] uppercase"
                style={{
                  color: 'rgba(126,179,255,0.45)',
                  borderBottom: '1px solid rgba(30,58,95,0.6)',
                  width: '160px',
                  minWidth: '140px',
                }}
              >
                SPEC
              </th>

              {/* Vehicle column headers */}
              {vehicles.map((v) => {
                const isRec = v.vehicleId === recommendedVehicleId
                return (
                  <th
                    key={v.vehicleId}
                    className="px-4 py-5 text-center"
                    style={{
                      borderBottom: '1px solid rgba(30,58,95,0.6)',
                      background: isRec ? 'rgba(0,102,255,0.06)' : 'transparent',
                      minWidth: '180px',
                    }}
                  >
                    <div className="flex flex-col items-center gap-2">
                      {/* Vehicle image */}
                      <div className="relative w-24 h-16 rounded-lg overflow-hidden">
                        <img
                          src={getImg(v)}
                          alt={`${v.brand} ${v.model}`}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                        {isRec && (
                          <div
                            className="absolute top-1 right-1 rounded-full p-0.5"
                            style={{ background: '#0066ff' }}
                          >
                            <Trophy size={9} className="text-white" />
                          </div>
                        )}
                      </div>
                      {/* Brand · year */}
                      <span
                        className="font-mono text-[10px] tracking-widest uppercase"
                        style={{ color: 'rgba(126,179,255,0.5)' }}
                      >
                        {v.brand} · {v.year}
                      </span>
                      {/* Model */}
                      <span
                        className="font-heading font-bold text-[14px] leading-tight text-center"
                        style={{ color: isRec ? '#fff' : 'rgba(255,255,255,0.85)' }}
                      >
                        {v.model}
                      </span>
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>

          <tbody>
            {SPEC_ROWS.map((row, ri) => (
              <tr
                key={row.key}
                style={{
                  background:
                    ri % 2 === 0
                      ? 'rgba(4,15,32,0.75)'
                      : 'rgba(7,20,40,0.5)',
                  borderBottom: '1px solid rgba(30,58,95,0.35)',
                }}
              >
                {/* Spec label */}
                <td
                  className="px-5 py-4 font-mono text-[11px] tracking-[0.14em] uppercase"
                  style={{ color: 'rgba(126,179,255,0.5)' }}
                >
                  {row.label}
                </td>

                {/* Values */}
                {vehicles.map((v) => {
                  const best = isBest(row, v)
                  const isRec = v.vehicleId === recommendedVehicleId
                  return (
                    <td
                      key={v.vehicleId}
                      className="px-4 py-4 text-center"
                      style={{
                        background: isRec ? 'rgba(0,102,255,0.04)' : 'transparent',
                      }}
                    >
                      <div className="inline-flex items-center gap-1.5">
                        {best && (
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ background: '#0066ff' }}
                          />
                        )}
                        <span
                          className="font-mono text-[13px] font-semibold"
                          style={{ color: best ? '#7eb3ff' : 'rgba(200,220,255,0.7)' }}
                        >
                          {row.format(row.getValue(v))}
                        </span>
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ── Page ─────────────────────────────────────────────────────── */

export default function Compare() {
  const navigate = useNavigate()
  const [vehicles, setVehicles] = useState<VehicleDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [selected, setSelected] = useState<number[]>([])
  const [compareLoading, setCompareLoading] = useState(false)
  const [compareError, setCompareError] = useState<string | null>(null)
  const [compareResult, setCompareResult] = useState<CompareResponse | null>(null)

  useEffect(() => {
    fetch(`${API}/vehicles`)
      .then((res) => {
        if (!res.ok) throw new Error()
        return res.json() as Promise<VehicleDTO[]>
      })
      .then((data) => {
        setVehicles(data)
        setLoading(false)
      })
      .catch(() => {
        setFetchError('Could not load vehicles. Please try again later.')
        setLoading(false)
      })
  }, [])

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= 3) return prev
      return [...prev, id]
    })
  }

  const handleCompare = async () => {
    if (selected.length < 2) return
    setCompareLoading(true)
    setCompareError(null)
    try {
      const res = await fetch(`${API}/vehicles/compare`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleIds: selected }),
      })
      if (!res.ok) {
        const msg = await res.text().catch(() => '')
        throw new Error(msg || 'Failed to compare vehicles.')
      }
      const data = (await res.json()) as CompareResponse
      setCompareResult(data)
    } catch (err) {
      setCompareError(err instanceof Error ? err.message : 'Failed to compare vehicles.')
    } finally {
      setCompareLoading(false)
    }
  }

  const handleReset = () => {
    setCompareResult(null)
    setSelected([])
    setCompareError(null)
  }

  /* ── Loading / error screens ── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#030c1a' }}>
        <Loader2 size={36} className="animate-spin" style={{ color: '#0066ff' }} />
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#030c1a' }}>
        <p className="font-body text-[15px]" style={{ color: 'rgba(126,179,255,0.7)' }}>
          {fetchError}
        </p>
      </div>
    )
  }

  return (
    <>
      <Nav />
      <main className="min-h-screen pt-16 pb-16" style={{ background: '#030c1a' }}>
        {/* ── Sub-header ──────────────────────────────────── */}
        <div style={{ background: '#040f20', borderBottom: '1px solid rgba(30,58,95,0.8)' }}>
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="av-focus inline-flex items-center gap-1.5 font-mono text-[12px] tracking-widest uppercase transition-colors hover:text-white"
              style={{ color: 'rgba(126,179,255,0.6)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <ArrowLeft size={13} /> Back
            </button>
            <span style={{ color: 'rgba(30,58,95,0.8)' }}>/</span>
            <span className="font-mono text-[12px]" style={{ color: 'rgba(126,179,255,0.5)' }}>
              Compare Vehicles
            </span>
          </div>
        </div>

        {/* ── Content ─────────────────────────────────────── */}
        {compareResult ? (
          <ComparisonTable result={compareResult} onReset={handleReset} />
        ) : vehicles.length === 0 ? (
          <EmptyState onBrowse={() => navigate('/catalogue')} />
        ) : (
          <>
            {compareError && (
              <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-6">
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-lg font-body text-sm"
                  style={{
                    background: 'rgba(220,38,38,0.1)',
                    border: '1px solid rgba(220,38,38,0.3)',
                    color: '#f87171',
                  }}
                >
                  <Car size={16} />
                  {compareError}
                </div>
              </div>
            )}
            <SelectionPhase
              vehicles={vehicles}
              selected={selected}
              onToggle={toggleSelect}
              onCompare={handleCompare}
              comparing={compareLoading}
            />
          </>
        )}
      </main>
      <Footer />
    </>
  )
}
