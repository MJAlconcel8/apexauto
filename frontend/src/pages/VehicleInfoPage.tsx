import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  BadgeDollarSign,
  ShoppingCart,
  Loader2,
  Fuel,
  Gauge,
  Users,
  Wind,
  Calendar,
  Palette,
} from 'lucide-react'
import Nav from '../components/Nav'
import { Badge, RangeGauge, SpecReadout, Btn, Footer } from '../components'
import type { Vehicle, VehicleBadge } from '../components'
import { VEHICLE_IMAGES } from '../assets/vehicleImages'

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

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=75'

const fmtCAD = (n: number) => '$' + n.toLocaleString('en-CA')

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
    img:
      VEHICLE_IMAGES[v.model] ??
      VEHICLE_IMAGES[modelName] ??
      VEHICLE_IMAGES[v.make] ??
      FALLBACK_IMG,
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

/* ── Stat block ───────────────────────────────────────────────── */
interface StatBlockProps {
  icon: React.ReactNode
  label: string
  value: string
}
function StatBlock({ icon, label, value }: StatBlockProps) {
  return (
    <div
      className="flex flex-col gap-2 p-4 rounded-xl border"
      style={{ background: 'rgba(7,20,40,0.6)', borderColor: 'rgba(30,58,95,0.6)' }}
    >
      <div className="text-[#7eb3ff] opacity-70">{icon}</div>
      <span
        className="font-mono text-[10px] tracking-[0.14em] uppercase"
        style={{ color: 'rgba(126,179,255,0.5)' }}
      >
        {label}
      </span>
      <span className="font-mono text-[15px] font-semibold text-white">{value}</span>
    </div>
  )
}

/* ── Page ─────────────────────────────────────────────────────── */
export default function VehicleInfoPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [addingToCart, setAddingToCart] = useState(false)
  const [cartMsg, setCartMsg] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    fetch(`http://localhost:8080/vehicles/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Vehicle not found.')
        return res.json() as Promise<VehicleApiResponse>
      })
      .then((data) => {
        setVehicle(mapVehicle(data))
        setLoading(false)
      })
      .catch(() => {
        setFetchError('Could not load vehicle details. Please try again later.')
        setLoading(false)
      })
  }, [id])

  const handleFinance = () => {
    if (!vehicle) return
    navigate('/finance', {
      state: {
        id: vehicle.id,
        marque: vehicle.marque,
        model: vehicle.model,
        price: vehicle.price,
        img: vehicle.img,
      },
    })
  }

  const handleAddToCart = async () => {
    if (!vehicle) return
    setAddingToCart(true)
    try {
      let cartRes = await fetch('http://localhost:8080/users/me/carts/active', {
        credentials: 'include',
      })
      if (cartRes.status === 401) {
        navigate('/login')
        return
      }
      if (cartRes.status === 404) {
        const createRes = await fetch('http://localhost:8080/users/me/carts', {
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
      const addRes = await fetch(`http://localhost:8080/carts/${cartData.cartId}/cart-lines`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleId: Number(vehicle.id), quantity: 1 }),
      })
      if (!addRes.ok) throw new Error()
      setCartMsg('Added to cart!')
      window.dispatchEvent(new Event('cart-updated'))
    } catch {
      setCartMsg('Failed to add to cart.')
    } finally {
      setAddingToCart(false)
    }
  }

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#030c1a' }}
      >
        <Loader2 size={36} className="animate-spin" style={{ color: '#0066ff' }} />
      </div>
    )
  }

  if (fetchError || !vehicle) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: '#030c1a' }}
      >
        <p className="font-body text-[15px]" style={{ color: 'rgba(126,179,255,0.7)' }}>
          {fetchError ?? 'Vehicle not found.'}
        </p>
        <Btn variant="outline" size="sm" icon={ArrowLeft} onClick={() => navigate(-1)}>
          Go Back
        </Btn>
      </div>
    )
  }

  return (
    <>
      <Nav />
      <main className="min-h-screen pt-16 flex flex-col" style={{ background: '#030c1a' }}>

        {/* ─── Sub-header band ─────────────────────────────────── */}
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
              {vehicle.marque} {vehicle.model}
            </span>
          </div>
        </div>

        {/* ─── Content ─────────────────────────────────────────── */}
        <div className="max-w-7xl w-full mx-auto px-6 lg:px-8 py-10 flex flex-col lg:flex-row gap-10">

          {/* Left: image */}
          <div className="lg:w-[55%] shrink-0">
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{ border: '1px solid rgba(30,58,95,0.6)' }}
            >
              <img
                src={vehicle.img}
                alt={`${vehicle.marque} ${vehicle.model}`}
                className="w-full h-72 sm:h-96 object-cover block"
              />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,#030c1a_1%,transparent_50%)]" />
              <div className="absolute top-4 left-4">
                <Badge badge={vehicle.badge} />
              </div>
            </div>

            {/* Mileage + specs row */}
            <div
              className="mt-4 flex items-center gap-6 rounded-xl p-4 border"
              style={{ background: 'rgba(7,20,40,0.6)', borderColor: 'rgba(30,58,95,0.6)' }}
            >
              <div className="shrink-0">
                <RangeGauge value={vehicle.mileage} size={88} dark />
              </div>
              <div className="grid grid-cols-3 gap-4 flex-1">
                <SpecReadout label="Emission" value={vehicle.emissionScore} unit="g/km" dark />
                <SpecReadout label="Fuel Use" value={vehicle.fuelUsage.toFixed(1)} unit="L/100" dark />
                <SpecReadout label="Seats" value={vehicle.seats} dark />
              </div>
            </div>
          </div>

          {/* Right: details */}
          <div className="flex flex-col gap-6 flex-1">

            {/* Title + price */}
            <div>
              <p
                className="font-mono text-[11px] tracking-[0.18em] uppercase mb-1"
                style={{ color: 'rgba(126,179,255,0.5)' }}
              >
                {vehicle.marque}
              </p>
              <h1 className="font-heading font-bold text-4xl text-white leading-tight">
                {vehicle.model}
              </h1>
              <p className="font-mono text-[13px] mt-1" style={{ color: 'rgba(126,179,255,0.55)' }}>
                {vehicle.history}
              </p>
              <div className="mt-4">
                <span className="font-mono text-[32px] font-semibold text-white">
                  {fmtCAD(vehicle.price)}
                </span>
                <span
                  className="ml-2 font-mono text-[12px]"
                  style={{ color: 'rgba(126,179,255,0.45)' }}
                >
                  CAD
                </span>
              </div>
            </div>

            {/* Stat grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <StatBlock
                icon={<Calendar size={18} />}
                label="Year"
                value={String(vehicle.year)}
              />
              <StatBlock
                icon={<Palette size={18} />}
                label="Colour"
                value={vehicle.ext}
              />
              <StatBlock
                icon={<Users size={18} />}
                label="Seats"
                value={String(vehicle.seats)}
              />
              <StatBlock
                icon={<Gauge size={18} />}
                label="Mileage"
                value={`${vehicle.mileage.toLocaleString()} km`}
              />
              <StatBlock
                icon={<Fuel size={18} />}
                label="Fuel Use"
                value={`${vehicle.fuelUsage.toFixed(1)} L/100`}
              />
              <StatBlock
                icon={<Wind size={18} />}
                label="Emission"
                value={`${vehicle.emissionScore} g/km`}
              />
            </div>

            {/* Stock note */}
            <p className="font-mono text-[12px]" style={{ color: 'rgba(126,179,255,0.55)' }}>
              {vehicle.stock > 0
                ? `${vehicle.stock} unit${vehicle.stock !== 1 ? 's' : ''} in stock`
                : 'Out of stock'}
            </p>

            {/* Cart feedback */}
            {cartMsg && (
              <p
                className="font-mono text-[12px]"
                style={{ color: cartMsg.startsWith('Added') ? '#22c55e' : '#f87171' }}
              >
                {cartMsg}
              </p>
            )}

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 mt-auto">
              <Btn
                variant="primary"
                size="md"
                icon={ShoppingCart}
                onClick={handleAddToCart}
                ariaLabel="Add to cart"
              >
                {addingToCart ? 'Adding…' : 'Add to Cart'}
              </Btn>
              <Btn
                variant="outline"
                size="md"
                icon={BadgeDollarSign}
                onClick={handleFinance}
                ariaLabel="Finance this vehicle"
              >
                Finance
              </Btn>
            </div>
          </div>
        </div>

        <Footer />
      </main>
    </>
  )
}
