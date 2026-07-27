import { API_BASE_URL } from '../config/api'
import { useState, useMemo, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, ShoppingCart, ChevronLeft, Calculator, Car, Loader2 } from 'lucide-react'
import Nav from '../components/Nav'
import { resolveVehicleImage } from '../utils/vehicleUtils'
import type { VehicleApiResponse } from '../utils/vehicleUtils'


const fmtCAD = (n: number) =>
  '$' + n.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

interface FinanceState {
  id: string
  model: string
  marque: string
  price: number
  img?: string
}

export default function LoanCalc() {
  const navigate = useNavigate()
  const location = useLocation()
  const [vehicle, setVehicle] = useState<FinanceState | null>(location.state as FinanceState | null)

  const [vehicles, setVehicles] = useState<VehicleApiResponse[]>([])
  const [loadingVehicles, setLoadingVehicles] = useState(true)
  const [vehiclesError, setVehiclesError] = useState<string | null>(null)

  useEffect(() => {
    if (vehicle) return
    fetch(`${API_BASE_URL}/vehicles`)
      .then((res) => {
        if (!res.ok) throw new Error()
        return res.json() as Promise<VehicleApiResponse[]>
      })
      .then((data) => {
        setVehicles(data)
        setLoadingVehicles(false)
      })
      .catch(() => {
        setVehiclesError('Could not load vehicles. Please try again later.')
        setLoadingVehicles(false)
      })
  }, [vehicle])

  const handleSelectVehicle = (v: VehicleApiResponse) => {
    setVehicle({
      id: String(v.vehicleId),
      model: v.model,
      marque: v.brand,
      price: v.price,
      img: resolveVehicleImage(v.imageUrl, v.make, v.model),
    })
    setDownPayment(Math.round(v.price * 0.2))
  }

  const vehiclePrice = vehicle?.price ?? 0

  const [downPayment, setDownPayment] = useState<number>(
    Math.round(vehiclePrice * 0.2)
  )
  const [termMonths, setTermMonths] = useState<number>(60)
  const [apr, setApr] = useState<number>(6.9)
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [addSuccess, setAddSuccess] = useState(false)

  const { monthlyPayment, totalCost, totalInterest } = useMemo(() => {
    const principal = Math.max(0, vehiclePrice - downPayment)
    if (principal === 0 || termMonths === 0) {
      return { monthlyPayment: 0, totalCost: downPayment, totalInterest: 0 }
    }
    const monthlyRate = apr / 100 / 12
    const monthly =
      monthlyRate === 0
        ? principal / termMonths
        : (principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths))) /
          (Math.pow(1 + monthlyRate, termMonths) - 1)
    const total = monthly * termMonths + downPayment
    return {
      monthlyPayment: monthly,
      totalCost: total,
      totalInterest: total - vehiclePrice,
    }
  }, [vehiclePrice, downPayment, termMonths, apr])

  const handleAddToCart = async () => {
    if (!vehicle) return
    setAdding(true)
    setAddError(null)

    try {
      // Fetch the user's active cart; auto-create one if it doesn't exist yet
      let cartRes = await fetch(`${API_BASE_URL}/users/me/carts/active`, {
        credentials: 'include',
      })
      if (cartRes.status === 401) {
        navigate('/login')
        return
      }
      if (cartRes.status === 404) {
        const createRes = await fetch(`${API_BASE_URL}/users/me/carts`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        })
        if (createRes.status === 401) { navigate('/login'); return }
        if (!createRes.ok) throw new Error('Could not create a cart.')
        cartRes = createRes
      } else if (!cartRes.ok) {
        throw new Error('Could not fetch your active cart.')
      }
      const cart = await cartRes.json()

      // POST the financed vehicle to the cart
      const addRes = await fetch(`${API_BASE_URL}/carts/${cart.cartId}/cart-lines`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vehicleId: Number(vehicle.id),
          quantity: 1,
          financingSelected: true,
          downPayment: downPayment,
          annualRate: apr,
          termMonths: termMonths,
        }),
      })
      if (addRes.status === 401) {
        navigate('/login')
        return
      }
      if (!addRes.ok) {
        const err = await addRes.json().catch(() => null)
        throw new Error(err?.message ?? 'Could not add vehicle to cart.')
      }

      window.dispatchEvent(new Event('cart-updated'))
      setAddSuccess(true)
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setAdding(false)
    }
  }

  /* ── No vehicle chosen yet: show a picker instead of the calculator ── */
  if (!vehicle) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Nav />

        <main className="min-h-screen pt-16">
          <section className="border-b border-card-border bg-sub-header">
            <div className="mx-auto max-w-6xl px-6 py-6">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft size={16} />
                Back
              </button>
              <div className="flex items-center gap-3">
                <Calculator size={22} className="text-[#0066ff]" strokeWidth={1.75} />
                <h1 className="font-heading text-3xl font-bold">Finance Your Vehicle</h1>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Pick a vehicle below to estimate your monthly payment.
              </p>
            </div>
          </section>

          <section className="mx-auto max-w-6xl px-6 py-10">
            {loadingVehicles ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 size={32} className="animate-spin text-[#0066ff]" />
              </div>
            ) : vehiclesError ? (
              <p className="text-center text-sm text-muted-foreground py-12">{vehiclesError}</p>
            ) : vehicles.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-24 text-muted-foreground">
                <Car size={40} strokeWidth={1.5} className="mb-4 opacity-50" />
                <p className="text-sm">No vehicles available to finance right now.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {vehicles.map((v) => (
                  <button
                    key={v.vehicleId}
                    type="button"
                    onClick={() => handleSelectVehicle(v)}
                    className="text-left rounded-xl overflow-hidden border border-card-border bg-card transition hover:border-[#0066ff]/50 hover:-translate-y-0.5"
                  >
                    <div className="h-40 overflow-hidden">
                      <img
                        src={resolveVehicleImage(v.imageUrl, v.make, v.model)}
                        alt={`${v.brand} ${v.model}`}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <p className="font-mono text-xs text-muted-foreground tracking-widest uppercase">
                        {v.brand} · {v.year}
                      </p>
                      <h2 className="font-heading text-lg font-bold mt-0.5">{v.model}</h2>
                      <p className="font-mono text-[18px] font-semibold mt-2 text-[#0066ff]">
                        {fmtCAD(v.price)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />

      <main className="min-h-screen pt-16">
        {/* Page heading */}
        <section className="border-b border-card-border bg-sub-header">
          <div className="mx-auto max-w-5xl px-6 py-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft size={16} />
              Back
            </button>
            <div className="flex items-center gap-3">
              <Calculator size={22} className="text-[#0066ff]" strokeWidth={1.75} />
              <h1 className="font-heading text-3xl font-bold">Finance Your Vehicle</h1>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {vehicle.marque} {vehicle.model} · {fmtCAD(vehicle.price)}
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

            {/* ── Left: Vehicle summary + inputs ── */}
            <div className="flex flex-col gap-8">
              {/* Vehicle card summary */}
              <div className="rounded-xl overflow-hidden border border-card-border bg-card">
                {vehicle.img && (
                  <div className="h-44 overflow-hidden">
                    <img
                      src={vehicle.img}
                      alt={`${vehicle.marque} ${vehicle.model}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <p className="font-mono text-xs text-muted-foreground tracking-widest uppercase">
                    {vehicle.marque}
                  </p>
                  <h2 className="font-heading text-xl font-bold mt-0.5">{vehicle.model}</h2>
                  <p className="font-mono text-[22px] font-semibold mt-2 text-[#0066ff]">
                    {fmtCAD(vehicle.price)}
                  </p>
                </div>
              </div>

              {/* Inputs */}
              <div className="flex flex-col gap-5">
                <h3 className="font-heading font-semibold text-base">Loan Details</h3>

                {/* Down payment */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium" htmlFor="down-payment">
                      Down Payment
                    </label>
                    <span className="font-mono text-sm text-[#0066ff]">{fmtCAD(downPayment)}</span>
                  </div>
                  <input
                    id="down-payment"
                    type="range"
                    min={0}
                    max={vehiclePrice}
                    step={500}
                    value={downPayment}
                    onChange={(e) => setDownPayment(Number(e.target.value))}
                    className="w-full accent-[#0066ff]"
                  />
                  <div className="flex justify-between font-mono text-[11px] text-muted-foreground">
                    <span>$0</span>
                    <span>{fmtCAD(vehiclePrice)}</span>
                  </div>
                </div>

                {/* Loan term */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium" htmlFor="loan-term">
                      Loan Term
                    </label>
                    <span className="font-mono text-sm text-[#0066ff]">{termMonths} months</span>
                  </div>
                  <input
                    id="loan-term"
                    type="range"
                    min={12}
                    max={84}
                    step={12}
                    value={termMonths}
                    onChange={(e) => setTermMonths(Number(e.target.value))}
                    className="w-full accent-[#0066ff]"
                  />
                  <div className="flex justify-between font-mono text-[11px] text-muted-foreground">
                    <span>12 mo</span>
                    <span>84 mo</span>
                  </div>
                </div>

                {/* APR */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium" htmlFor="apr">
                      Annual Interest Rate (APR)
                    </label>
                    <span className="font-mono text-sm text-[#0066ff]">{apr.toFixed(1)}%</span>
                  </div>
                  <input
                    id="apr"
                    type="range"
                    min={0}
                    max={20}
                    step={0.1}
                    value={apr}
                    onChange={(e) => setApr(Number(e.target.value))}
                    className="w-full accent-[#0066ff]"
                  />
                  <div className="flex justify-between font-mono text-[11px] text-muted-foreground">
                    <span>0%</span>
                    <span>20%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right: Results ── */}
            <div className="flex flex-col gap-6">
              <div
                className="rounded-xl border border-[rgba(0,102,255,0.3)] bg-card p-7 flex flex-col gap-6"
                style={{ background: 'rgba(0,102,255,0.04)' }}
              >
                <h3 className="font-heading font-semibold text-base">Payment Summary</h3>

                {/* Monthly payment — hero figure */}
                <div className="flex flex-col items-center justify-center py-6 border-b border-card-border">
                  <span className="font-mono text-xs text-muted-foreground tracking-widest uppercase mb-2">
                    Est. Monthly Payment
                  </span>
                  <span
                    className="font-mono text-[48px] font-bold leading-none"
                    style={{ color: '#0066ff' }}
                  >
                    {fmtCAD(monthlyPayment)}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground mt-1">/ month</span>
                </div>

                {/* Breakdown rows */}
                <div className="flex flex-col gap-3">
                  {[
                    { label: 'Vehicle Price', value: fmtCAD(vehiclePrice) },
                    { label: 'Down Payment', value: `-${fmtCAD(downPayment)}` },
                    { label: 'Amount Financed', value: fmtCAD(Math.max(0, vehiclePrice - downPayment)) },
                    { label: 'Loan Term', value: `${termMonths} months` },
                    { label: 'APR', value: `${apr.toFixed(1)}%` },
                    { label: 'Total Interest', value: fmtCAD(totalInterest) },
                    { label: 'Total Cost', value: fmtCAD(totalCost), bold: true },
                  ].map(({ label, value, bold }) => (
                    <div key={label} className="flex justify-between items-center text-sm">
                      <span className={bold ? 'font-semibold' : 'text-muted-foreground'}>{label}</span>
                      <span className={`font-mono ${bold ? 'font-bold text-base' : ''}`}>{value}</span>
                    </div>
                  ))}
                </div>

                <p className="text-[11px] text-muted-foreground leading-normal">
                  * Estimated figures only. Final rates and terms are subject to credit approval and may vary.
                </p>
              </div>

              {/* CTA */}
              {addError && (
                <p className="text-sm text-red-500 text-center">{addError}</p>
              )}
              {addSuccess && (
                <p className="text-sm text-center" style={{ color: '#22c55e' }}>Added to cart!</p>
              )}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!vehicle || adding}
                className="inline-flex items-center justify-center gap-2 w-full rounded-lg bg-[#0066ff] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#0055d9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0066ff] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {adding ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <ShoppingCart size={16} />
                )}
                {adding ? 'Adding…' : 'Add to Cart'}
                {!adding && <ArrowRight size={16} />}
              </button>

              <button
                type="button"
                onClick={() => setVehicle(null)}
                className="inline-flex items-center justify-center gap-2 w-full rounded-lg border border-card-border bg-transparent px-6 py-3 text-sm font-medium text-muted-foreground transition hover:text-foreground hover:border-foreground/30"
              >
                Choose a Different Vehicle
              </button>
            </div>

          </div>
        </section>
      </main>
    </div>
  )
}
