import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Loader2,
  Package,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import Nav from '../../components/Nav'
import { ConfirmModal, FormField } from '../../components'
import { FALLBACK_IMG, resolveVehicleImage } from '../../utils/vehicleUtils'
import {
  createVehicle,
  deleteVehicle,
  getAllVehicles,
  patchVehicle,
  VehicleApiError,
  type VehicleData,
  type VehiclePayload,
} from '../../services/vehicleApi'

const fmtCAD = (n: number) =>
  '$' + n.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

// Keeps the data URI a sane size to store in the DB and send over the wire.
const MAX_IMAGE_BYTES = 2 * 1024 * 1024

interface VehicleFormState {
  brand: string
  make: string
  model: string
  year: string
  color: string
  doors: string
  seats: string
  emissionScore: string
  fuelUsage: string
  mileage: string
  price: string
  amountInStock: string
  onSale: boolean
  imageUrl: string
}

const emptyForm = (): VehicleFormState => ({
  brand: '',
  make: '',
  model: '',
  year: String(new Date().getFullYear()),
  color: '',
  doors: '4',
  seats: '5',
  emissionScore: '',
  fuelUsage: '',
  mileage: '',
  price: '',
  amountInStock: '1',
  onSale: false,
  imageUrl: '',
})

const toFormState = (v: VehicleData): VehicleFormState => ({
  brand: v.brand,
  make: v.make,
  model: v.model,
  year: String(v.year),
  color: v.color,
  doors: String(v.doors),
  seats: String(v.seats),
  emissionScore: String(v.emissionScore),
  fuelUsage: String(v.fuelUsage),
  mileage: String(v.mileage),
  price: String(v.price),
  amountInStock: String(v.amountInStock),
  onSale: v.onSale,
  imageUrl: v.imageUrl ?? '',
})

const numOr0 = (raw: string) => {
  const n = Number(raw)
  return Number.isFinite(n) ? n : 0
}

function stockBadge(amountInStock: number) {
  if (amountInStock <= 0) {
    return { label: 'Out of Stock', className: 'border-red-500/30 bg-red-500/10 text-red-400' }
  }
  if (amountInStock <= 2) {
    return { label: `Low Stock · ${amountInStock}`, className: 'border-amber-500/30 bg-amber-500/10 text-amber-400' }
  }
  return { label: `In Stock · ${amountInStock}`, className: 'border-green-500/30 bg-green-500/10 text-green-400' }
}

export default function AdminListings() {
  const [vehicles, setVehicles] = useState<VehicleData[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<VehicleFormState>(emptyForm())
  const [formError, setFormError] = useState<string | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [deleteTarget, setDeleteTarget] = useState<VehicleData | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    getAllVehicles()
      .then((data) => {
        if (!cancelled) setVehicles(data)
      })
      .catch(() => {
        if (!cancelled) setError('Could not load vehicles. Please try again.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const stats = useMemo(() => {
    const list = vehicles ?? []
    const inStock = list.filter((v) => v.amountInStock > 0).length
    const outOfStock = list.length - inStock
    const totalUnits = list.reduce((sum, v) => sum + v.amountInStock, 0)
    return { total: list.length, inStock, outOfStock, totalUnits }
  }, [vehicles])

  const openAddModal = () => {
    setModalMode('add')
    setEditingId(null)
    setForm(emptyForm())
    setFormError(null)
    setImageError(null)
    setModalOpen(true)
  }

  const openEditModal = (vehicle: VehicleData) => {
    setModalMode('edit')
    setEditingId(vehicle.vehicleId)
    setForm(toFormState(vehicle))
    setFormError(null)
    setImageError(null)
    setModalOpen(true)
  }

  const closeModal = () => {
    if (submitting) return
    setModalOpen(false)
  }

  const handleImageFile = (file: File | null) => {
    setImageError(null)
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setImageError('Please choose an image file.')
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError('Image is too large. Please choose a file under 2 MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setForm((prev) => ({ ...prev, imageUrl: String(reader.result ?? '') }))
    }
    reader.onerror = () => setImageError('Could not read that image file.')
    reader.readAsDataURL(file)
  }

  const clearImage = () => {
    setForm((prev) => ({ ...prev, imageUrl: '' }))
    setImageError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!form.brand.trim() || !form.make.trim() || !form.model.trim() || !form.color.trim()) {
      setFormError('Brand, make, model, and color are required.')
      return
    }
    const year = parseInt(form.year, 10)
    if (!Number.isFinite(year) || year <= 0) {
      setFormError('Please enter a valid year.')
      return
    }
    const price = numOr0(form.price)
    if (price < 0) {
      setFormError('Price must not be negative.')
      return
    }
    const amountInStock = Math.max(0, Math.trunc(numOr0(form.amountInStock)))

    const payload: VehiclePayload = {
      brand: form.brand.trim(),
      make: form.make.trim(),
      model: form.model.trim(),
      year,
      color: form.color.trim(),
      doors: Math.trunc(numOr0(form.doors)),
      seats: Math.trunc(numOr0(form.seats)),
      emissionScore: numOr0(form.emissionScore),
      fuelUsage: numOr0(form.fuelUsage),
      mileage: numOr0(form.mileage),
      isOnSale: form.onSale,
      isInStock: amountInStock > 0,
      amountInStock,
      price,
      imageUrl: form.imageUrl.trim() || null,
    }

    setSubmitting(true)
    try {
      if (modalMode === 'add') {
        const created = await createVehicle(payload)
        setVehicles((prev) => (prev ? [...prev, created] : [created]))
      } else if (editingId != null) {
        const updated = await patchVehicle(editingId, payload)
        setVehicles((prev) => (prev ? prev.map((v) => (v.vehicleId === updated.vehicleId ? updated : v)) : prev))
      }
      setModalOpen(false)
    } catch (err) {
      if (err instanceof VehicleApiError && (err.status === 401 || err.status === 403)) {
        setFormError('Your session no longer has permission to manage vehicles.')
      } else {
        setFormError(err instanceof Error ? err.message : 'Failed to save vehicle.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    setDeleteError(null)

    try {
      await deleteVehicle(deleteTarget.vehicleId)
      setVehicles((prev) => (prev ? prev.filter((v) => v.vehicleId !== deleteTarget.vehicleId) : prev))
      setDeleteTarget(null)
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete vehicle.')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Nav />
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="animate-spin text-[#0066ff]" size={32} />
        </div>
      </div>
    )
  }

  const list = vehicles ?? []

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />

      <main className="min-h-screen pt-16">
        <section className="border-b border-card-border bg-sub-header">
          <div className="mx-auto max-w-6xl px-6 py-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-[#7eb3ff]">
                <ShieldCheck size={16} /> Admin only
              </div>
              <h1 className="mt-2 font-heading text-3xl font-bold">Car Inventory</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {stats.total} {stats.total === 1 ? 'vehicle' : 'vehicles'} · {stats.inStock} in stock · {stats.outOfStock} out of stock · {stats.totalUnits} units on hand
              </p>
            </div>
            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center gap-2 self-start rounded-md bg-[#0066ff] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0055d9] md:self-auto"
            >
              <Plus size={16} /> Add Vehicle
            </button>
          </div>
        </section>

        {error && (
          <div className="mx-auto max-w-6xl px-6 pt-6">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {list.length === 0 ? (
          <section className="mx-auto flex min-h-[calc(100vh-9rem)] max-w-6xl items-start justify-center px-6 pt-28">
            <div className="flex flex-col items-center text-center">
              <Package aria-hidden="true" className="text-card-border" size={48} strokeWidth={1.4} />
              <p className="mt-5 text-sm text-muted-foreground">No vehicles in inventory yet.</p>
              <button
                type="button"
                onClick={openAddModal}
                className="mt-5 inline-flex items-center gap-2 rounded-md bg-[#0066ff] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0055d9]"
              >
                <Plus size={16} /> Add your first vehicle
              </button>
            </div>
          </section>
        ) : (
          <section className="mx-auto max-w-6xl px-6 py-8">
            <div className="overflow-x-auto rounded-xl border border-card-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-card-border text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-5 py-3">Vehicle</th>
                    <th className="px-5 py-3">Year</th>
                    <th className="px-5 py-3">Color</th>
                    <th className="px-5 py-3">Price</th>
                    <th className="px-5 py-3">Stock</th>
                    <th className="px-5 py-3">Sale</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {list
                    .slice()
                    .sort((a, b) => a.vehicleId - b.vehicleId)
                    .map((vehicle) => {
                      const badge = stockBadge(vehicle.amountInStock)
                      return (
                        <tr key={vehicle.vehicleId} className="border-b border-card-border last:border-b-0">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={resolveVehicleImage(vehicle.imageUrl, vehicle.make, vehicle.model)}
                                alt={`${vehicle.brand} ${vehicle.model}`}
                                className="h-12 w-16 shrink-0 rounded-md object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = FALLBACK_IMG
                                }}
                              />
                              <div>
                                <p className="font-medium text-foreground">
                                  {vehicle.brand} {vehicle.model}
                                </p>
                                <p className="text-xs text-muted-foreground">{vehicle.make}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-muted-foreground">{vehicle.year}</td>
                          <td className="px-5 py-4 text-muted-foreground">{vehicle.color}</td>
                          <td className="px-5 py-4 font-semibold text-[#0066ff]">{fmtCAD(vehicle.price)}</td>
                          <td className="px-5 py-4">
                            <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${badge.className}`}>
                              {badge.label}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-muted-foreground">
                            {vehicle.onSale ? (
                              <span className="rounded-full border border-[#0066ff]/30 bg-[#0066ff]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#7eb3ff]">
                                On Sale
                              </span>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => openEditModal(vehicle)}
                                aria-label={`Edit ${vehicle.brand} ${vehicle.model}`}
                                className="rounded-md border border-card-border p-2 text-muted-foreground transition hover:border-[#0066ff] hover:text-[#7eb3ff]"
                              >
                                <Pencil size={15} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(vehicle)}
                                aria-label={`Delete ${vehicle.brand} ${vehicle.model}`}
                                className="rounded-md border border-card-border p-2 text-muted-foreground transition hover:border-red-500 hover:text-red-400"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      {modalOpen && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 px-4 py-8"
          role="dialog"
          aria-modal="true"
          aria-labelledby="vehicle-modal-title"
        >
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-card-border bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 id="vehicle-modal-title" className="font-heading text-lg font-semibold text-foreground">
                {modalMode === 'add' ? 'Add Vehicle' : 'Edit Vehicle'}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close"
                className="rounded-md p-1.5 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5">
              <div className="grid gap-6 md:grid-cols-[200px_1fr]">
                {/* Image */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Photo
                  </label>
                  <div className="relative flex h-36 w-full items-center justify-center overflow-hidden rounded-lg border border-card-border bg-secondary">
                    <img
                      src={resolveVehicleImage(form.imageUrl, form.make, form.model)}
                      alt="Vehicle preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageFile(e.target.files?.[0] ?? null)}
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-card-border px-2 py-1.5 text-xs font-semibold text-foreground transition hover:border-[#0066ff]"
                    >
                      <Upload size={13} /> Upload
                    </button>
                    {form.imageUrl.trim() && (
                      <button
                        type="button"
                        onClick={clearImage}
                        className="rounded-md border border-card-border px-2 py-1.5 text-xs font-semibold text-muted-foreground transition hover:border-red-500 hover:text-red-400"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    type="url"
                    value={form.imageUrl.startsWith('data:') ? '' : form.imageUrl}
                    onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="or paste an image URL"
                    className="mt-2 w-full rounded-lg bg-secondary px-2.5 py-2 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  {imageError && <p className="mt-1.5 text-xs text-red-400">{imageError}</p>}
                  {!form.imageUrl.trim() && !imageError && (
                    <p className="mt-1.5 text-[11px] text-muted-foreground">
                      Using catalogue default. Upload or paste a URL to customize.
                    </p>
                  )}
                </div>

                {/* Fields */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3">
                  <FormField
                    label="Brand"
                    value={form.brand}
                    onChange={(e) => setForm((prev) => ({ ...prev, brand: e.target.value }))}
                    required
                  />
                  <FormField
                    label="Make"
                    value={form.make}
                    onChange={(e) => setForm((prev) => ({ ...prev, make: e.target.value }))}
                    required
                  />
                  <FormField
                    label="Model"
                    value={form.model}
                    onChange={(e) => setForm((prev) => ({ ...prev, model: e.target.value }))}
                    required
                  />
                  <FormField
                    label="Year"
                    type="number"
                    value={form.year}
                    onChange={(e) => setForm((prev) => ({ ...prev, year: e.target.value }))}
                    required
                  />
                  <FormField
                    label="Color"
                    value={form.color}
                    onChange={(e) => setForm((prev) => ({ ...prev, color: e.target.value }))}
                    required
                  />
                  <FormField
                    label="Doors"
                    type="number"
                    value={form.doors}
                    onChange={(e) => setForm((prev) => ({ ...prev, doors: e.target.value }))}
                  />
                  <FormField
                    label="Seats"
                    type="number"
                    value={form.seats}
                    onChange={(e) => setForm((prev) => ({ ...prev, seats: e.target.value }))}
                  />
                  <FormField
                    label="Emission Score"
                    type="number"
                    step="0.1"
                    value={form.emissionScore}
                    onChange={(e) => setForm((prev) => ({ ...prev, emissionScore: e.target.value }))}
                  />
                  <FormField
                    label="Fuel Usage"
                    type="number"
                    step="0.1"
                    value={form.fuelUsage}
                    onChange={(e) => setForm((prev) => ({ ...prev, fuelUsage: e.target.value }))}
                  />
                  <FormField
                    label="Mileage"
                    type="number"
                    step="0.1"
                    value={form.mileage}
                    onChange={(e) => setForm((prev) => ({ ...prev, mileage: e.target.value }))}
                  />
                  <FormField
                    label="Price (CAD)"
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                    required
                  />
                  <FormField
                    label="Units in Stock"
                    type="number"
                    value={form.amountInStock}
                    onChange={(e) => setForm((prev) => ({ ...prev, amountInStock: e.target.value }))}
                    required
                  />
                  <div className="mb-4 flex items-end pb-2.5">
                    <label className="flex items-center gap-2 text-sm text-foreground">
                      <input
                        type="checkbox"
                        checked={form.onSale}
                        onChange={(e) => setForm((prev) => ({ ...prev, onSale: e.target.checked }))}
                        className="h-4 w-4 rounded accent-[#0066ff]"
                      />
                      On Sale
                    </label>
                  </div>
                </div>
              </div>

              {formError && <p className="mt-2 text-sm text-red-400">{formError}</p>}

              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="rounded-md border border-card-border px-4 py-2 text-sm font-semibold text-foreground transition hover:border-[#0066ff] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-md bg-[#0066ff] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0055d9] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  {modalMode === 'add' ? 'Add Vehicle' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Vehicle"
        message={
          deleteTarget
            ? `Remove ${deleteTarget.brand} ${deleteTarget.model} (${deleteTarget.year}) from inventory? This cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        danger
        loading={deleting}
        error={deleteError}
        onConfirm={() => void handleDelete()}
        onCancel={() => {
          setDeleteTarget(null)
          setDeleteError(null)
        }}
      />
    </div>
  )
}
