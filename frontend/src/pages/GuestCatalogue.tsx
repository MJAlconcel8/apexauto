import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, SlidersHorizontal, Car, RotateCcw, Loader2 } from 'lucide-react'
import { VehicleCard, Reveal, Footer } from '../components'
import type { Vehicle, VehicleBadge } from '../components'
import { VEHICLE_IMAGES } from '../assets/vehicleImages'

const fmtCAD = (n: number) => '$' + n.toLocaleString('en-CA')

/* ── Backend DTO ──────────────────────────────────────────────── */
interface VehicleApiResponse {
  vehicleId: number
  brand: string
  make: string
  model: string
  year: number
  color: string
  seats: number
  emissionScore: number
  fuelUsage: number
  mileage: number
  onSale: boolean
  inStock: boolean
  amountInStock: number
  price: number
}

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=75'

function mapVehicle(v: VehicleApiResponse): Vehicle {
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
    img: VEHICLE_IMAGES[v.model] ?? VEHICLE_IMAGES[modelName] ?? VEHICLE_IMAGES[v.make] ?? FALLBACK_IMG,
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

/* ── Filter rail ──────────────────────────────────────────────── */
const CATEGORIES = ['All', 'Sedan', 'Sports', 'SUV', 'Luxury'] as const

const SORTS = [
  { key: 'featured',      label: 'Featured' },
  { key: 'price-asc',     label: 'Price: Low to High' },
  { key: 'price-desc',    label: 'Price: High to Low' },
  { key: 'mileage-desc',  label: 'Mileage: High to Low' },
  { key: 'emission-asc',  label: 'Best Emission' },
] as const

type SortKey = (typeof SORTS)[number]['key']

const PRICE_MIN = 40000
const PRICE_MAX = 150000

const groupLabel = 'font-mono text-[11px] tracking-[0.16em] uppercase mb-3'
const groupLabelColor = { color: 'rgba(126,179,255,0.55)' }

function pillClass(active: boolean) {
  return `w-full text-left px-3 py-2 rounded font-body text-sm border-l-2 transition-colors ${
    active
      ? 'bg-[#0066ff]/15 text-[#7eb3ff] border-[#0066ff]'
      : 'text-[rgba(126,179,255,0.7)] border-transparent hover:text-white hover:bg-white/5'
  }`
}

interface FilterRailProps {
  cat: string
  setCat: (c: string) => void
  priceMax: number
  setPriceMax: (n: number) => void
  sort: SortKey
  setSort: (s: SortKey) => void
  onReset: () => void
}

function FilterRail({ cat, setCat, priceMax, setPriceMax, sort, setSort, onReset }: FilterRailProps) {
  return (
    <aside className="w-full lg:w-60 shrink-0 flex flex-col gap-8">
      <div>
        <div className={groupLabel} style={groupLabelColor}>Category</div>
        <div className="flex flex-col gap-1">
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCat(c)} className={`av-focus ${pillClass(cat === c)}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className={groupLabel} style={groupLabelColor}>Max Price</div>
        <input
          type="range"
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={5000}
          value={priceMax}
          onChange={(e) => setPriceMax(Number(e.target.value))}
          aria-label="Maximum price"
          className="av-focus w-full accent-[#0066ff] cursor-pointer"
        />
        <div className="flex items-center justify-between mt-2">
          <span className="font-mono text-[12px]" style={{ color: 'rgba(126,179,255,0.55)' }}>$40K</span>
          <span className="font-mono text-[13px] font-semibold" style={{ color: '#0066ff' }}>{fmtCAD(priceMax)}</span>
        </div>
      </div>

      <div>
        <div className={groupLabel} style={groupLabelColor}>Sort By</div>
        <div className="flex flex-col gap-1">
          {SORTS.map((s) => (
            <button key={s.key} onClick={() => setSort(s.key)} className={`av-focus ${pillClass(sort === s.key)}`}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onReset}
        className="av-focus inline-flex items-center gap-2 self-start font-mono text-[12px] tracking-widest uppercase transition-colors hover:text-white"
        style={{ color: 'rgba(126,179,255,0.6)', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <RotateCcw size={13} /> Reset Filters
      </button>
    </aside>
  )
}

/* ── Page ─────────────────────────────────────────────────────── */

export default function GuestCatalogue() {
  const navigate = useNavigate()

  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [cat, setCat] = useState<string>('All')
  const [priceMax, setPriceMax] = useState<number>(PRICE_MAX)
  const [sort, setSort] = useState<SortKey>('featured')
  const [query, setQuery] = useState('')
  const [showFilter, setShowFilter] = useState(true)

  useEffect(() => {
    fetch('http://localhost:8080/vehicles')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load vehicles.')
        return res.json() as Promise<VehicleApiResponse[]>
      })
      .then((data) => {
        setVehicles(data.map(mapVehicle))
        setLoading(false)
      })
      .catch(() => {
        setFetchError('Could not load vehicles. Please try again later.')
        setLoading(false)
      })
  }, [])

  const reset = () => {
    setCat('All')
    setPriceMax(PRICE_MAX)
    setSort('featured')
    setQuery('')
  }

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = vehicles.filter(
      (v) =>
        (cat === 'All' || v.category === cat) &&
        v.price <= priceMax &&
        (q === '' || `${v.marque} ${v.model}`.toLowerCase().includes(q)),
    )
    const sorted = [...list]
    switch (sort) {
      case 'price-asc':    sorted.sort((a, b) => a.price - b.price); break
      case 'price-desc':   sorted.sort((a, b) => b.price - a.price); break
      case 'mileage-desc': sorted.sort((a, b) => b.mileage - a.mileage); break
      case 'emission-asc': sorted.sort((a, b) => a.emissionScore - b.emissionScore); break
      default: break
    }
    return sorted
  }, [vehicles, cat, priceMax, sort, query])

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
        <p className="font-body text-[15px]" style={{ color: 'rgba(126,179,255,0.7)' }}>{fetchError}</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen flex flex-col" style={{ background: '#030c1a' }}>

      {/* ─── Sub-header band ─────────────────────────────────── */}
      <div style={{ background: '#040f20', borderBottom: '1px solid rgba(30,58,95,0.8)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-heading font-bold text-3xl text-white">Vehicle Catalogue</h1>
            <p className="font-mono text-[13px] mt-1" style={{ color: 'rgba(126,179,255,0.6)' }}>
              {results.length} vehicle{results.length !== 1 ? 's' : ''} found
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:flex-none">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'rgba(126,179,255,0.5)' }}
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search models…"
                aria-label="Search models"
                className="av-focus w-full md:w-64 pl-9 pr-3 py-2 rounded-lg font-body text-sm text-white transition-colors focus:border-[#0066ff] focus:outline-none placeholder:text-[rgba(126,179,255,0.4)]"
                style={{ background: 'rgba(7,20,40,0.6)', border: '1px solid rgba(30,58,95,0.6)' }}
              />
            </div>

            <button
              onClick={() => setShowFilter((s) => !s)}
              aria-pressed={showFilter}
              className="av-focus inline-flex items-center gap-2 px-4 py-2 rounded-lg font-body text-sm text-[#7eb3ff] transition-colors hover:text-white shrink-0"
              style={{ background: 'rgba(7,20,40,0.6)', border: '1px solid rgba(30,58,95,0.6)', cursor: 'pointer' }}
            >
              <SlidersHorizontal size={15} />
              <span className="hidden sm:inline">{showFilter ? 'Hide' : 'Show'} Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Body: filters + grid ────────────────────────────── */}
      <div className="max-w-7xl w-full mx-auto px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8 flex-1">
        {showFilter && (
          <FilterRail
            cat={cat} setCat={setCat}
            priceMax={priceMax} setPriceMax={setPriceMax}
            sort={sort} setSort={setSort}
            onReset={reset}
          />
        )}

        <div className="flex-1">
          {results.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((v, i) => (
                <Reveal key={v.id} delay={i * 60}>
                  <VehicleCard
                    v={v}
                    dark
                    hideFinance
                    cardNavigateState={{ hideNav: true }}
                    onView={(veh) => navigate(`/vehicle/${veh.id}`, { state: { hideNav: true } })}
                  />
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-24">
              <Car size={48} strokeWidth={1.5} style={{ color: 'rgba(126,179,255,0.3)' }} />
              <p className="mt-4 font-body text-[15px]" style={{ color: 'rgba(126,179,255,0.7)' }}>
                No vehicles match these filters.
              </p>
              <button
                onClick={reset}
                className="av-focus mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-lg font-body text-sm text-[#7eb3ff] transition-colors hover:text-white"
                style={{ background: 'rgba(7,20,40,0.6)', border: '1px solid rgba(30,58,95,0.6)', cursor: 'pointer' }}
              >
                <RotateCcw size={14} /> Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  )
}
