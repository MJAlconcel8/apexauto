import { useEffect, useState } from 'react'
import { Car, Loader2, PackageSearch, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Nav from '../components/Nav'
import { ConfirmModal } from '../components'
import { useAuth } from '../auth/AuthContext'
import { VEHICLE_IMAGES } from '../assets/vehicleImages'

interface OrderLine {
  orderLineId: number
  orderId: number
  vehicleId: number
  brand: string
  make: string
  model: string
  year: number
  price: number
  quantity: number
  financingSelected: boolean
  lineTotalCost: number | null
}

interface OrderData {
  orderId: number
  userId: number
  orderStatusId: number
  orderStatusName: string
  totalAmount: number
  deliveryDate: string | null
  orderLines: OrderLine[]
}

const fmtCAD = (n: number) =>
  '$' + n.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const toTitleCase = (value: string) =>
  value
    .toLowerCase()
    .split(/[\s_-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

function statusToneClass(statusName: string) {
  const name = statusName.toLowerCase()
  if (name.includes('cancel')) return 'border-red-500/30 bg-red-500/10 text-red-400'
  if (name.includes('deliver') || name.includes('complete')) return 'border-green-500/30 bg-green-500/10 text-green-400'
  if (name.includes('ship') || name.includes('transit') || name.includes('production')) {
    return 'border-[#0066ff]/30 bg-[#0066ff]/10 text-[#7eb3ff]'
  }
  if (name.includes('confirm') || name.includes('process') || name.includes('paid')) {
    return 'border-amber-500/30 bg-amber-500/10 text-amber-400'
  }
  return 'border-card-border bg-secondary text-muted-foreground'
}

export default function Orders() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [orders, setOrders] = useState<OrderData[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [orderToDelete, setOrderToDelete] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    fetch(`http://localhost:8080/users/${user.userId}/orders`, {
      credentials: 'include',
    })
      .then((res) => {
        if (res.status === 401) {
          navigate('/login')
          return null
        }
        if (!res.ok) throw new Error('Failed to load orders.')
        return res.json() as Promise<OrderData[]>
      })
      .then((data) => {
        if (data) setOrders(data)
        setLoading(false)
      })
      .catch(() => {
        setError('Could not load your orders. Please try again.')
        setLoading(false)
      })
  }, [user, navigate])

  const handleDeleteOrder = async () => {
    if (!user || orderToDelete == null) return

    setDeleting(true)
    setDeleteError(null)

    try {
      const res = await fetch(`http://localhost:8080/users/${user.userId}/orders/${orderToDelete}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (res.status === 401) {
        navigate('/login')
        return
      }

      if (!res.ok && res.status !== 204) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.message ?? 'Failed to delete order.')
      }

      setOrders((prev) => (prev ? prev.filter((o) => o.orderId !== orderToDelete) : prev))
      setOrderToDelete(null)
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete order.')
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

  const list = orders ?? []

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />

      <main className="min-h-screen pt-16">
        <section className="border-b border-card-border bg-sub-header">
          <div className="mx-auto max-w-5xl px-6 py-6">
            <h1 className="font-heading text-3xl font-bold">My Orders</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {list.length} {list.length === 1 ? 'order' : 'orders'}
            </p>
          </div>
        </section>

        {(error || deleteError) && (
          <div className="mx-auto max-w-5xl px-6 pt-6">
            {error && <p className="text-sm text-red-400">{error}</p>}
            {deleteError && <p className="text-sm text-red-400">{deleteError}</p>}
          </div>
        )}

        {list.length === 0 ? (
          <section className="mx-auto flex min-h-[calc(100vh-9rem)] max-w-5xl items-start justify-center px-6 pt-28">
            <div className="flex flex-col items-center text-center">
              <PackageSearch aria-hidden="true" className="text-card-border" size={48} strokeWidth={1.4} />
              <p className="mt-5 text-sm text-muted-foreground">You have not placed any orders yet.</p>
              <button
                type="button"
                onClick={() => navigate('/catalogue')}
                className="mt-5 inline-flex items-center gap-2 rounded-md bg-[#0066ff] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0055d9]"
              >
                Browse Vehicles
              </button>
            </div>
          </section>
        ) : (
          <section className="mx-auto max-w-5xl px-6 py-8">
            <ul className="space-y-4">
              {list.map((order) => (
                <li key={order.orderId} className="rounded-xl border border-card-border bg-card p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-card-border pb-4">
                    <div>
                      <p className="font-heading text-lg font-semibold">
                        Order #{order.orderId.toString().padStart(4, '0')}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {order.deliveryDate
                          ? `Delivery: ${new Date(order.deliveryDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}`
                          : 'Delivery date pending confirmation'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusToneClass(order.orderStatusName)}`}
                      >
                        {toTitleCase(order.orderStatusName)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setOrderToDelete(order.orderId)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-card-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:border-red-500/50 hover:text-red-400"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                  <ul className="mt-4 space-y-3">
                    {order.orderLines.map((line) => {
                      const img = VEHICLE_IMAGES[line.model]
                      const unitPrice = line.financingSelected ? (line.lineTotalCost ?? line.price) : line.price
                      return (
                        <li key={line.orderLineId} className="flex items-center gap-3">
                          <div className="h-12 w-16 shrink-0 overflow-hidden rounded-md bg-sub-header">
                            {img ? (
                              <img
                                src={img}
                                alt={`${line.year} ${line.brand} ${line.model}`}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Car size={18} className="text-card-border" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">
                              {line.year} {line.brand} {line.model}
                            </p>
                            <p className="text-xs text-muted-foreground">Qty: {line.quantity}</p>
                          </div>
                          <p className="text-sm font-semibold text-foreground">
                            {fmtCAD(unitPrice * line.quantity)}
                          </p>
                        </li>
                      )
                    })}
                  </ul>

                  <div className="mt-4 flex justify-end border-t border-card-border pt-4 text-sm">
                    <span className="text-muted-foreground">Total&nbsp;</span>
                    <span className="font-semibold text-[#0066ff]">{fmtCAD(order.totalAmount)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>

      <ConfirmModal
        open={orderToDelete != null}
        title="Delete this order?"
        message="This will permanently delete the order and restore any reserved vehicle stock. This action cannot be undone."
        confirmLabel="Delete Order"
        danger
        loading={deleting}
        onConfirm={() => void handleDeleteOrder()}
        onCancel={() => setOrderToDelete(null)}
      />
    </div>
  )
}
