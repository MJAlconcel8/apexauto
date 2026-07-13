import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight, Eye, ChevronRight,
  Car, Zap, Truck, Crown, Minimize2,
  BatteryCharging, ShieldCheck, Route, RefreshCw,
} from 'lucide-react'
import Nav from '../components/Nav'
import { VehicleCard, Reveal, SectionHead, Btn, Footer } from '../components'
import type { Vehicle, GoFn, ViewParams } from '../components'

const fmtUSD = (n: number) => '$' + n.toLocaleString('en-US')

/* ── Data ─────────────────────────────────────────────────────── */

const TOP_PICKS: Vehicle[] = [
  {
    id: '1',
    marque: 'Apex',
    model: 'Nexus S',
    year: 2026,
    category: 'Sedan',
    img: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=75',
    price: 89900,
    mileage: 459,
    emissionScore: 85,
    seats: 5,
    fuelUsage: 6.2,
    stock: 3,
    history: 'New · 2026',
    ext: 'Pearl White',
    badge: { label: 'Best Seller', tone: 'voltage' },
    rating: 4.8,
    reviewCount: 2545,
  },
  {
    id: '2',
    marque: 'Apex',
    model: 'Vector GT',
    year: 2026,
    category: 'Sports',
    img: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=75',
    price: 134500,
    mileage: 340,
    emissionScore: 165,
    seats: 4,
    fuelUsage: 9.8,
    stock: 2,
    history: 'New · 2026',
    ext: 'Alpine White',
    badge: { label: 'New', tone: 'voltage' },
    rating: 4.9,
    reviewCount: 1307,
  },
  {
    id: '3',
    marque: 'Apex',
    model: 'Terrain X',
    year: 2026,
    category: 'SUV',
    img: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=800&q=75',
    price: 74900,
    mileage: 370,
    emissionScore: 130,
    seats: 7,
    fuelUsage: 8.4,
    stock: 5,
    history: 'New · 2026',
    ext: 'Shadow Black',
    badge: { label: 'Popular', tone: 'amber' },
    rating: 4.7,
    reviewCount: 3108,
  },
]

const HERO_VEHICLE = TOP_PICKS[0]

const STATS = [
  { value: '459km',   label: 'Max Mileage' },
  { value: '85g/km',  label: 'Best Emission' },
  { value: '6.2L',    label: 'Best Fuel Use' },
  { value: '6',       label: 'Models' },
]

const CATEGORIES = [
  { name: 'Sedan',   count: 1, Icon: Car,      color: '#0066ff', bg: 'rgba(0,102,255,0.12)',  border: 'rgba(0,102,255,0.2)'  },
  { name: 'Sports',  count: 3, Icon: Zap,      color: '#9b59b6', bg: 'rgba(155,89,182,0.12)', border: 'rgba(155,89,182,0.2)' },
  { name: 'SUV',     count: 1, Icon: Truck,    color: '#00c7b7', bg: 'rgba(0,199,183,0.12)',  border: 'rgba(0,199,183,0.2)'  },
  { name: 'Luxury',  count: 1, Icon: Crown,    color: '#f5a623', bg: 'rgba(245,166,35,0.12)', border: 'rgba(245,166,35,0.2)' },
  { name: 'Compact', count: 1, Icon: Minimize2,color: '#12a26a', bg: 'rgba(18,162,106,0.12)', border: 'rgba(18,162,106,0.2)' },
]

const WHY_ITEMS = [
  {
    Icon: BatteryCharging,
    title: 'Best-in-Class Mileage',
    body: 'Up to 459 km per tank — the highest mileage rating in class.',
    color: '#0066ff',
    bg: 'rgba(0,102,255,0.24)',
    border: 'rgba(0,102,255,0.19)',
  },
  {
    Icon: ShieldCheck,
    title: '8-Year Warranty',
    body: 'Battery and drivetrain covered for 8 years or 150,000 miles.',
    color: '#12a26a',
    bg: 'rgba(18,162,106,0.24)',
    border: 'rgba(18,162,106,0.19)',
  },
  {
    Icon: Route,
    title: 'Low Emission Score',
    body: 'All models achieve an emission score under 90g/km — best in segment.',
    color: '#9b59b6',
    bg: 'rgba(155,89,182,0.24)',
    border: 'rgba(155,89,182,0.19)',
  },
  {
    Icon: RefreshCw,
    title: 'OTA Updates',
    body: 'Your vehicle gets smarter over time with lifetime software updates.',
    color: '#00c7b7',
    bg: 'rgba(0,199,183,0.24)',
    border: 'rgba(0,199,183,0.19)',
  },
]


interface HomeProps { onNavigate?: GoFn }

export default function Home({ onNavigate }: HomeProps) {
  const navigate = useNavigate()
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<number | undefined>(undefined)

  const flash = (msg: string) => {
    setToast(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 2200)
  }

  const go: GoFn = (view: string, params?: ViewParams) => {
    if (typeof onNavigate === 'function') return onNavigate(view, params)
    navigate(view)
    flash(`→ ${view}${params ? ' ' + JSON.stringify(params) : ''}`)
  }

  return (
    <>
      <Nav />
      <main style={{ background: '#030c1a' }}>

        {/* ─── HERO ──────────────────────────────────────────────── */}
        <section
          className="relative min-h-screen flex items-center pt-16 overflow-hidden"
          style={{
            background: `
              radial-gradient(ellipse 40% 60% at 15% 8%, rgba(0,102,255,0.08) 0%, transparent 60%),
              radial-gradient(ellipse 70% 55% at 60% 50%, #0a2060 0%, #030c1a 100%)
            `,
          }}
        >
          <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left: content */}
            <div className="flex flex-col gap-8">
              <div>
                <span
                  className="inline-flex items-center font-mono text-[11px] tracking-[0.16em] uppercase font-semibold px-3 py-1.5 rounded-full"
                  style={{
                    background: 'rgba(0,199,183,0.10)',
                    border: '1px solid rgba(0,199,183,0.30)',
                    color: '#00c7b7',
                  }}
                >
                  2026 Lineup Now Available
                </span>
              </div>

              <h1
                className="font-heading font-bold text-6xl uppercase leading-none tracking-[-0.01em] text-white"
              >
                The future of<br />
                <span style={{ color: '#0066ff', textShadow: '0 0 40px rgba(0,102,255,0.4)' }}>
                  Driving
                </span>{' '}is<br />
                Electric
              </h1>

              <p
                className="text-[16px] leading-[1.6] max-w-105"
                style={{ color: 'rgba(126,179,255,0.8)' }}
              >
                Six precision-engineered electric vehicles. Zero compromise.
                Apex Auto — where performance meets sustainability.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Btn variant="primary" size="lg" icon={ArrowRight} onClick={() => go('/catalogue')}>
                  Browse Vehicles
                </Btn>
                <Btn variant="ghostDark" size="lg" icon={Eye} onClick={() => go('/vehicle/1')}>
                  View Nexus S
                </Btn>
              </div>
            </div>

            {/* Right: featured vehicle card */}
            <div
              className="relative cursor-pointer group"
              role="button"
              tabIndex={0}
              aria-label={`View ${HERO_VEHICLE.model} details`}
              onClick={() => go('/vehicle/1')}
              onKeyDown={(e) => e.key === 'Enter' && go('/vehicle/1')}
            >
              <div
                className="relative rounded-2xl overflow-hidden transition-all duration-300 group-hover:shadow-[0_0_80px_rgba(0,102,255,0.28)]"
                style={{
                  border: '1px solid rgba(0,102,255,0.20)',
                  boxShadow: '0 0 60px rgba(0,102,255,0.15)',
                }}
              >
                <img
                  src={HERO_VEHICLE.img}
                  alt={`${HERO_VEHICLE.marque} ${HERO_VEHICLE.model}`}
                  className="w-full object-cover block"
                  style={{ height: 360 }}
                />
                <div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(to top, rgba(3,12,26,0.88) 0%, rgba(3,12,26,0.10) 55%, transparent 100%)' }}
                />
                <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between">
                  <span className="font-heading font-bold text-xl text-white">
                    {HERO_VEHICLE.model}
                  </span>
                  <span className="font-mono font-semibold text-[15px]" style={{ color: '#0066ff' }}>
                    {fmtUSD(HERO_VEHICLE.price)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── STATS BAR ─────────────────────────────────────────── */}
        <div style={{ borderTop: '1px solid rgba(30,58,95,0.8)', background: 'rgba(7,20,40,0.30)' }}>
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map(({ value, label }) => (
              <div key={label} className="flex flex-col gap-1">
                <span
                  className="font-mono text-xl font-semibold"
                  style={{ color: '#0066ff' }}
                >
                  {value}
                </span>
                <span
                  className="font-body text-[13px]"
                  style={{ color: 'rgba(126,179,255,0.7)' }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── CATEGORY GRID ─────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span
                className="font-mono text-[11px] tracking-[0.16em] uppercase font-medium"
                style={{ color: 'rgba(126,179,255,0.6)' }}
              >
                Browse By Type
              </span>
              <h2 className="font-heading font-bold text-[28px] mt-1 text-white">
                Find Your Category
              </h2>
            </div>
            <button
              onClick={() => go('/catalogue')}
              className="inline-flex items-center gap-1 font-mono text-[12px] tracking-widest uppercase font-medium transition-colors duration-150 hover:text-white"
              style={{ color: 'rgba(126,179,255,0.7)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              View All <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {CATEGORIES.map(({ name, count, Icon, color, bg, border }) => (
              <Reveal key={name}>
                <button
                  onClick={() => go('/catalogue')}
                  className="av-cat group w-full flex flex-col items-center gap-3 p-5 rounded-xl text-center"
                  style={{
                    background: 'rgba(7,20,40,0.60)',
                    border: '1px solid rgba(30,58,95,0.60)',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    className="w-12 h-12 flex items-center justify-center rounded-full group-hover:scale-110 transition-transform duration-200"
                    style={{ background: bg, border: `1px solid ${border}` }}
                  >
                    <Icon size={22} style={{ color }} strokeWidth={1.75} />
                  </div>
                  <div>
                    <div className="font-heading font-semibold text-[15px] text-white">{name}</div>
                    <div
                      className="font-mono text-[11px] mt-0.5"
                      style={{ color: 'rgba(126,179,255,0.55)' }}
                    >
                      {count} model{count !== 1 ? 's' : ''}
                    </div>
                  </div>
                </button>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ─── TOP PICKS ─────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <SectionHead eyebrow="Hand-Picked" title="Top Picks" dark />
            <button
              onClick={() => go('/catalogue')}
              className="inline-flex items-center gap-1 font-mono text-[12px] tracking-widest uppercase font-medium transition-colors duration-150 hover:text-white"
              style={{ color: 'rgba(126,179,255,0.7)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              View All <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TOP_PICKS.map((v, i) => (
              <Reveal key={v.id} delay={i * 80}>
                <VehicleCard
                  v={v}
                  dark
                  onView={(vehicle) => go(`/vehicle/${vehicle.id}`)}
                  onCart={() => {}}
                />
              </Reveal>
            ))}
          </div>
        </section>

        {/* ─── WHY APEX ──────────────────────────────────────────── */}
        <section
          className="py-20"
          style={{ borderTop: '1px solid rgba(30,58,95,0.50)' }}
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="font-heading font-bold text-[36px] text-white">
                Why Choose{' '}
                <span style={{ color: '#0066ff' }}>Apex</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {WHY_ITEMS.map(({ Icon, title, body, color, bg, border }, i) => (
                <Reveal key={title} delay={i * 80}>
                  <div className="flex flex-col items-center text-center gap-4">
                    <div
                      className="w-14 h-14 flex items-center justify-center rounded-xl"
                      style={{ background: bg, border: `1px solid ${border}` }}
                    >
                      <Icon size={24} style={{ color }} strokeWidth={1.75} />
                    </div>
                    <div>
                      <div className="font-heading font-semibold text-[15px] text-white mb-2">
                        {title}
                      </div>
                      <p
                        className="font-body text-[13px] leading-[1.6]"
                        style={{ color: 'rgba(126,179,255,0.65)' }}
                      >
                        {body}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <Footer />

      </main>

      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-foreground text-background text-sm px-4 py-2 rounded-lg shadow-lg z-50 pointer-events-none">
          {toast}
        </div>
      )}
    </>
  )
}
