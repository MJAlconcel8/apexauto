import { useEffect, useState } from 'react'
import { Loader2, PackageSearch, ShieldCheck, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Nav from '../../components/Nav'
import { ConfirmModal } from '../../components'

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
  userFullName: string
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

export default function AdminOrders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<OrderData[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [orderToDelete, setOrderToDelete] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    fetch('http://localhost:8080/orders', { credentials: 'include' })
      .then((res) => {
        if (res.status === 401) {
          navigate('/login')
          return null
        }
        if (res.status === 403) {
          navigate('/forbidden')
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
        setError('Could not load orders. Please try again.')
        setLoading(false)
      })
  }, [navigate])

  const handleDeleteOrder = async () => {
    if (orderToDelete == null) return

    setDeleting(true)
    setDeleteError(null)

    try {
      const res = await fetch(`http://localhost:8080/orders/${orderToDelete}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (res.status === 401) {
        navigate('/login')
        return
      }
      if (res.status === 403) {
        navigate('/forbidden')
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
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-[#7eb3ff]">
              <ShieldCheck size={16} /> Admin only
            </div>
            <h1 className="mt-2 font-heading text-3xl font-bold">Order Management</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {list.length} {list.length === 1 ? 'order' : 'orders'} across all users
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
              <p className="mt-5 text-sm text-muted-foreground">No orders have been placed yet.</p>
            </div>
          </section>
        ) : (
          <section className="mx-auto max-w-5xl px-6 py-8">
            <div className="overflow-x-auto rounded-xl border border-card-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-card-border text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-5 py-3">Order</th>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Items</th>
                    <th className="px-5 py-3">Total</th>
                    <th className="px-5 py-3">Delivery</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {list.map((order) => (
                    <tr key={order.orderId} className="border-b border-card-border last:border-b-0">
                      <td className="px-5 py-4 font-medium text-foreground">
                        #{order.orderId.toString().padStart(4, '0')}
                      </td>
                      <td className="px-5 py-4 text-foreground">{order.userFullName}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusToneClass(order.orderStatusName)}`}
                        >
                          {toTitleCase(order.orderStatusName)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">{order.orderLines.length}</td>
                      <td className="px-5 py-4 font-semibold text-[#0066ff]">{fmtCAD(order.totalAmount)}</td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {order.deliveryDate
                          ? new Date(order.deliveryDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'Pending'}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setOrderToDelete(order.orderId)}
                          className="inline-flex items-center gap-1.5 rounded-md border border-card-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:border-red-500/50 hover:text-red-400"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
