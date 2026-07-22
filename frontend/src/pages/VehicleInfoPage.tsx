import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
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
  Lock,
  History as HistoryIcon,
} from 'lucide-react'
import Nav from '../components/Nav'
import { Badge, RangeGauge, SpecReadout, Btn, Footer } from '../components'
import type { Vehicle } from '../components'
import { fmtCAD, mapVehicle } from '../utils/vehicleUtils'
import type { VehicleApiResponse } from '../utils/vehicleUtils'
import { useAuth } from '../auth/AuthContext'
import {
  type ReviewData,
  getVehicleReviews,
  createReview,
  updateReview,
  deleteReview,
  deleteVehicleReviews,
} from '../services/reviewApi'
import {
  type VehicleHistoryData,
  getVehicleHistory,
  createVehicleHistory,
  deleteVehicleHistory,
} from '../services/vehicleHistoryApi'

/* ── Review Card ─────────────────────────────────────────────────────── */
interface ReviewCardProps {
  review: ReviewData
  canEdit: boolean
  canDelete: boolean
  onDelete: () => void
  onSave: (newText: string) => Promise<void>
}

function ReviewCard({ review, canEdit, canDelete, onDelete, onSave }: ReviewCardProps) {
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(review.reviewComments)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const handleSave = async () => {
    if (!editText.trim()) return
    setSaving(true)
    setSaveError(null)
    try {
      await onSave(editText.trim())
      setEditing(false)
    } catch {
      setSaveError('Failed to save changes.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="p-5 rounded-xl border"
      style={{ background: 'rgba(7,20,40,0.4)', borderColor: 'rgba(30,58,95,0.6)' }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="font-mono text-[12px] font-semibold text-white mb-2">
            {review.userFirstName} {review.userLastName}
          </p>
          {editing ? (
            <>
              <textarea
                value={editText}
                onChange={e => setEditText(e.target.value)}
                rows={3}
                className="w-full bg-transparent border rounded-lg px-3 py-2 font-body text-[13px] text-white resize-none focus:outline-none focus:border-[#0066ff]"
                style={{ borderColor: 'rgba(30,58,95,0.8)' }}
              />
              {saveError && (
                <p className="font-mono text-[11px] mt-1" style={{ color: '#f87171' }}>{saveError}</p>
              )}
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleSave}
                  disabled={saving || !editText.trim()}
                  className="font-mono text-[11px] tracking-widest uppercase px-3 py-1.5 rounded border bg-[#0066ff] text-white border-[#0066ff] hover:bg-[#0052cc] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button
                  onClick={() => { setEditing(false); setEditText(review.reviewComments) }}
                  className="font-mono text-[11px] tracking-widest uppercase px-3 py-1.5 rounded border transition-colors hover:bg-[rgba(30,58,95,0.3)]"
                  style={{ color: 'rgba(126,179,255,0.6)', borderColor: 'rgba(30,58,95,0.8)' }}
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <p className="font-body text-[14px] leading-relaxed" style={{ color: 'rgba(126,179,255,0.8)' }}>
              {review.reviewComments}
            </p>
          )}
        </div>
        {!editing && (canEdit || canDelete) && (
          <div className="flex gap-2 shrink-0">
            {canEdit && (
              <button
                onClick={() => setEditing(true)}
                className="font-mono text-[11px] tracking-widest uppercase px-3 py-1.5 rounded border transition-colors hover:bg-[rgba(0,102,255,0.1)]"
                style={{ color: 'rgba(126,179,255,0.6)', borderColor: 'rgba(30,58,95,0.8)' }}
              >
                Edit
              </button>
            )}
            {canDelete && (
              <button
                onClick={onDelete}
                className="font-mono text-[11px] tracking-widest uppercase px-3 py-1.5 rounded border transition-colors hover:bg-[rgba(248,113,113,0.1)]"
                style={{ color: 'rgba(248,113,113,0.7)', borderColor: 'rgba(248,113,113,0.3)' }}
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Vehicle history card ────────────────────────────────────────────── */
interface VehicleHistoryCardProps {
  entry: VehicleHistoryData
}

function VehicleHistoryCard({ entry }: VehicleHistoryCardProps) {
  const postedDate = entry.createdAt
    ? new Date(entry.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null

  return (
    <div
      className="p-5 rounded-xl border"
      style={{ background: 'rgba(7,20,40,0.4)', borderColor: 'rgba(30,58,95,0.6)' }}
    >
      <div className="flex items-start gap-3">
        <div
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border"
          style={{ background: 'rgba(0,102,255,0.08)', borderColor: 'rgba(0,102,255,0.24)', color: '#7eb3ff' }}
        >
          <HistoryIcon size={17} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3 mb-2">
            <p
              className="font-mono text-[11px] tracking-[0.14em] uppercase"
              style={{ color: 'rgba(126,179,255,0.5)' }}
            >
              History Entry #{entry.vehicleHistoryId}
            </p>
            {postedDate && (
              <p
                className="font-mono text-[11px] tracking-[0.06em] shrink-0"
                style={{ color: 'rgba(126,179,255,0.4)' }}
              >
                {postedDate}
              </p>
            )}
          </div>
          <p className="font-body text-[14px] leading-relaxed" style={{ color: 'rgba(126,179,255,0.8)' }}>
            {entry.vehicleHistoryComments}
          </p>
        </div>
      </div>
    </div>
  )
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
  const location = useLocation()
  const { isAuthenticated, user, isAdmin } = useAuth()
  const hideNav = (location.state as { hideNav?: boolean } | null)?.hideNav ?? false
  const stateVehicle = (location.state as { vehicle?: Vehicle } | null)?.vehicle ?? null

  const [vehicle, setVehicle] = useState<Vehicle | null>(stateVehicle)
  const [loading, setLoading] = useState(!stateVehicle)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [addingToCart, setAddingToCart] = useState(false)
  const [cartMsg, setCartMsg] = useState<string | null>(null)

  const [reviews, setReviews] = useState<ReviewData[]>([])
  const [newReviewText, setNewReviewText] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewError, setReviewError] = useState<string | null>(null)

  const [activeInfoTab, setActiveInfoTab] = useState<'reviews' | 'history'>('reviews')
  const [vehicleHistory, setVehicleHistory] = useState<VehicleHistoryData[]>([])
  const [vehicleHistoryLoading, setVehicleHistoryLoading] = useState(false)
  const [newVehicleHistoryText, setNewVehicleHistoryText] = useState('')
  const [submittingVehicleHistory, setSubmittingVehicleHistory] = useState(false)
  const [vehicleHistoryError, setVehicleHistoryError] = useState<string | null>(null)

  useEffect(() => {
    if (stateVehicle) return
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
  }, [id, stateVehicle])

  useEffect(() => {
    if (!vehicle) return
    let active = true
    getVehicleReviews(Number(vehicle.id))
      .then(data => { if (active) setReviews(data) })
      .catch(() => {})
    return () => { active = false }
  }, [vehicle])

  useEffect(() => {
    if (!vehicle) return
    let active = true
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVehicleHistoryLoading(true)
    setVehicleHistoryError(null)
    getVehicleHistory(Number(vehicle.id))
      .then(data => { if (active) setVehicleHistory(data) })
      .catch(() => { if (active) setVehicleHistoryError('Could not load vehicle history.') })
      .finally(() => { if (active) setVehicleHistoryLoading(false) })
    return () => { active = false }
  }, [vehicle])

  const handleSubmitReview = async () => {
    if (!user || !vehicle || !newReviewText.trim()) return
    setSubmittingReview(true)
    setReviewError(null)
    try {
      const created = await createReview(user.userId, Number(vehicle.id), newReviewText.trim())
      setReviews(prev => [created, ...prev])
      setNewReviewText('')
    } catch {
      setReviewError('Failed to submit review. Please try again.')
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleDeleteReview = async (reviewId: number, reviewUserId: number) => {
    try {
      await deleteReview(reviewUserId, reviewId)
      setReviews(prev => prev.filter(r => r.reviewId !== reviewId))
    } catch {
      // silently retain the list on failure
    }
  }

  const handleUpdateReview = async (reviewId: number, reviewUserId: number, newText: string) => {
    const updated = await updateReview(reviewUserId, reviewId, newText)
    setReviews(prev => prev.map(r => r.reviewId === reviewId ? updated : r))
  }

  const handleDeleteVehicleReviews = async () => {
    if (!vehicle) return
    try {
      await deleteVehicleReviews(Number(vehicle.id))
      setReviews([])
    } catch {
      // silently fail
    }
  }

  const handleSubmitVehicleHistory = async () => {
    if (!user || !vehicle || !newVehicleHistoryText.trim()) return
    setSubmittingVehicleHistory(true)
    setVehicleHistoryError(null)
    try {
      const created = await createVehicleHistory(user.userId, Number(vehicle.id), newVehicleHistoryText.trim())
      setVehicleHistory(prev => [created, ...prev])
      setNewVehicleHistoryText('')
    } catch {
      setVehicleHistoryError('Failed to create vehicle history. Please try again.')
    } finally {
      setSubmittingVehicleHistory(false)
    }
  }

  const handleDeleteVehicleHistory = async () => {
    if (!vehicle) return
    try {
      await deleteVehicleHistory(Number(vehicle.id))
      setVehicleHistory([])
    } catch {
      setVehicleHistoryError('Failed to clear vehicle history.')
    }
  }

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
      {(!hideNav || isAuthenticated) && <Nav />}
      <main className={`min-h-screen flex flex-col${hideNav && !isAuthenticated ? '' : ' pt-16'}`} style={{ background: '#030c1a' }}>

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
            <p
              className="font-mono text-[12px]"
              style={{ color: vehicle.stock > 0 ? 'rgba(126,179,255,0.55)' : '#f87171' }}
            >
              {vehicle.stock > 0
                ? `${vehicle.stock} unit${vehicle.stock !== 1 ? 's' : ''} in stock`
                : 'Out of Stock'}
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
            {hideNav ? (
              <div
                className="flex flex-col gap-4 mt-auto p-5 rounded-xl border"
                style={{ background: 'rgba(0,102,255,0.06)', borderColor: 'rgba(0,102,255,0.25)' }}
              >
                <div className="flex items-start gap-2.5">
                  <Lock size={15} strokeWidth={2} className="shrink-0 mt-0.5" style={{ color: '#0066ff' }} />
                  <p className="font-body text-[13px] leading-normal" style={{ color: 'rgba(126,179,255,0.85)' }}>
                    Create Free Account or Log In to finance or purchase this vehicle.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Btn
                    variant="primary"
                    size="md"
                    onClick={() => navigate('/register', { state: { returnTo: `/vehicle/${id}`, vehicle: stateVehicle, hideNav: true } })}
                  >
                    Create Free Account
                  </Btn>
                  <Btn
                    variant="outline"
                    size="md"
                    onClick={() => navigate('/login', { state: { returnTo: `/vehicle/${id}`, vehicle: stateVehicle, hideNav: true } })}
                  >
                    Log In
                  </Btn>
                </div>
              </div>
            ) : (
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
            )}
          </div>
        </div>

        {/* ─── Info Tabs ─────────────────────────────────────────── */}
        <div className="border-t" style={{ borderColor: 'rgba(30,58,95,0.6)' }}>
          <div className="max-w-7xl w-full mx-auto px-6 lg:px-8 py-10">
            <div className="mb-8 flex flex-wrap gap-2 border-b" style={{ borderColor: 'rgba(30,58,95,0.6)' }}>
              <button
                type="button"
                onClick={() => setActiveInfoTab('reviews')}
                className="av-focus px-4 py-3 font-mono text-[12px] tracking-widest uppercase transition-colors"
                style={{
                  color: activeInfoTab === 'reviews' ? '#ffffff' : 'rgba(126,179,255,0.55)',
                  borderBottom: activeInfoTab === 'reviews' ? '2px solid #0066ff' : '2px solid transparent',
                  background: 'transparent',
                }}
              >
                Reviews
                {reviews.length > 0 && <span className="ml-2">({reviews.length})</span>}
              </button>
              <button
                type="button"
                onClick={() => setActiveInfoTab('history')}
                className="av-focus px-4 py-3 font-mono text-[12px] tracking-widest uppercase transition-colors"
                style={{
                  color: activeInfoTab === 'history' ? '#ffffff' : 'rgba(126,179,255,0.55)',
                  borderBottom: activeInfoTab === 'history' ? '2px solid #0066ff' : '2px solid transparent',
                  background: 'transparent',
                }}
              >
                Vehicle History
                {vehicleHistory.length > 0 && <span className="ml-2">({vehicleHistory.length})</span>}
              </button>
            </div>

            {activeInfoTab === 'reviews' ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-heading font-bold text-2xl text-white">Reviews</h2>
                  {isAdmin && reviews.length > 0 && (
                    <Btn variant="outline" size="sm" onClick={handleDeleteVehicleReviews}>
                      Clear Vehicle Reviews
                    </Btn>
                  )}
                </div>

                {isAuthenticated && !hideNav && (
                  <div
                    className="mb-8 p-5 rounded-xl border"
                    style={{ background: 'rgba(7,20,40,0.6)', borderColor: 'rgba(30,58,95,0.6)' }}
                  >
                    <p
                      className="font-mono text-[11px] tracking-[0.14em] uppercase mb-3"
                      style={{ color: 'rgba(126,179,255,0.5)' }}
                    >
                      Write a Review
                    </p>
                    <textarea
                      value={newReviewText}
                      onChange={e => setNewReviewText(e.target.value)}
                      placeholder="Share your experience with this vehicle…"
                      rows={3}
                      className="w-full bg-transparent border rounded-lg px-4 py-3 font-body text-[14px] text-white placeholder:text-[rgba(126,179,255,0.3)] resize-none focus:outline-none focus:border-[#0066ff]"
                      style={{ borderColor: 'rgba(30,58,95,0.8)' }}
                    />
                    {reviewError && (
                      <p className="font-mono text-[12px] mt-2" style={{ color: '#f87171' }}>
                        {reviewError}
                      </p>
                    )}
                    <div className="mt-3 flex justify-end">
                      <Btn
                        variant="primary"
                        size="sm"
                        onClick={handleSubmitReview}
                        disabled={submittingReview || !newReviewText.trim()}
                      >
                        {submittingReview ? 'Submitting…' : 'Submit Review'}
                      </Btn>
                    </div>
                  </div>
                )}

                {reviews.length === 0 ? (
                  <p
                    className="font-mono text-[13px] text-center py-8"
                    style={{ color: 'rgba(126,179,255,0.35)' }}
                  >
                    No reviews yet.{isAuthenticated && !hideNav ? ' Be the first to share your experience!' : ''}
                  </p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {reviews.map(review => (
                      <ReviewCard
                        key={review.reviewId}
                        review={review}
                        canEdit={user?.userId === review.userId}
                        canDelete={user?.userId === review.userId || isAdmin}
                        onDelete={() => handleDeleteReview(review.reviewId, review.userId)}
                        onSave={(newText) => handleUpdateReview(review.reviewId, review.userId, newText)}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                  <h2 className="font-heading font-bold text-2xl text-white">Vehicle History</h2>
                  {isAdmin && vehicleHistory.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      <Btn variant="outline" size="sm" onClick={handleDeleteVehicleHistory}>
                        Clear Vehicle History
                      </Btn>
                    </div>
                  )}
                </div>

                {isAdmin && !hideNav && (
                  <div
                    className="mb-8 p-5 rounded-xl border"
                    style={{ background: 'rgba(7,20,40,0.6)', borderColor: 'rgba(30,58,95,0.6)' }}
                  >
                    <p
                      className="font-mono text-[11px] tracking-[0.14em] uppercase mb-3"
                      style={{ color: 'rgba(126,179,255,0.5)' }}
                    >
                      Add Vehicle History
                    </p>
                    <textarea
                      value={newVehicleHistoryText}
                      onChange={e => setNewVehicleHistoryText(e.target.value)}
                      placeholder="Add maintenance, accident, ownership, or service notes…"
                      rows={3}
                      className="w-full bg-transparent border rounded-lg px-4 py-3 font-body text-[14px] text-white placeholder:text-[rgba(126,179,255,0.3)] resize-none focus:outline-none focus:border-[#0066ff]"
                      style={{ borderColor: 'rgba(30,58,95,0.8)' }}
                    />
                    <div className="mt-3 flex justify-end">
                      <Btn
                        variant="primary"
                        size="sm"
                        onClick={handleSubmitVehicleHistory}
                        disabled={submittingVehicleHistory || !newVehicleHistoryText.trim()}
                      >
                        {submittingVehicleHistory ? 'Adding…' : 'Add History'}
                      </Btn>
                    </div>
                  </div>
                )}

                {vehicleHistoryError && (
                  <p className="font-mono text-[12px] mb-4" style={{ color: '#f87171' }}>
                    {vehicleHistoryError}
                  </p>
                )}

                {vehicleHistoryLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 size={24} className="animate-spin" style={{ color: '#0066ff' }} />
                  </div>
                ) : vehicleHistory.length === 0 ? (
                  <p
                    className="font-mono text-[13px] text-center py-8"
                    style={{ color: 'rgba(126,179,255,0.35)' }}
                  >
                    No vehicle history has been added yet.
                  </p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {vehicleHistory.map(entry => (
                      <VehicleHistoryCard key={entry.vehicleHistoryId} entry={entry} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <Footer />
      </main>
    </>
  )
}
