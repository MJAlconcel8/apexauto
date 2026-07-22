import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  Banknote,
  Loader2,
  Package,
  ShieldCheck,
  ShoppingBag,
  Users,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Nav from '../../components/Nav'

interface OrderData {
  orderId: number
  userId: number
  userFullName: string
  orderStatusId: number
  orderStatusName: string
  totalAmount: number
  deliveryDate: string | null
}

interface VehicleData {
  vehicleId: number
  brand: string
  make: string
  model: string
  year: number
  onSale: boolean
  inStock: boolean
  amountInStock: number
  price: number
}

interface PaymentData {
  paymentId: number
  orderId: number
  userId: number
  paymentStatusId: number
  paymentStatusName: string
  paymentMethod: string
  paymentDate: string | null
}

interface OrderStatusOption {
  orderStatusId: number
  orderStatusName: string
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

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string
  hint?: string
}

function StatCard({ icon, label, value, hint }: StatCardProps) {
  return (
    <div className="rounded-xl border border-card-border bg-card p-5">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-3 font-heading text-2xl font-bold text-foreground">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<OrderData[]>([])
  const [vehicles, setVehicles] = useState<VehicleData[]>([])
  const [payments, setPayments] = useState<PaymentData[]>([])
  const [statuses, setStatuses] = useState<OrderStatusOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null)
  const [updateError, setUpdateError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadDashboard() {
      try {
        const [ordersRes, vehiclesRes, paymentsRes, statusesRes] = await Promise.all([
          fetch('http://localhost:8080/orders', { credentials: 'include' }),
          fetch('http://localhost:8080/vehicles', { credentials: 'include' }),
          fetch('http://localhost:8080/payments', { credentials: 'include' }),
          fetch('http://localhost:8080/order-statuses', { credentials: 'include' }),
        ])

        if ([ordersRes, vehiclesRes, paymentsRes, statusesRes].some((res) => res.status === 401)) {
          navigate('/login')
          return
        }
        if ([ordersRes, vehiclesRes, paymentsRes, statusesRes].some((res) => res.status === 403)) {
          navigate('/forbidden')
          return
        }
        if (!ordersRes.ok || !vehiclesRes.ok || !paymentsRes.ok || !statusesRes.ok) {
          throw new Error('Failed to load dashboard data.')
        }

        const [ordersData, vehiclesData, paymentsData, statusesData] = await Promise.all([
          ordersRes.json() as Promise<OrderData[]>,
          vehiclesRes.json() as Promise<VehicleData[]>,
          paymentsRes.json() as Promise<PaymentData[]>,
          statusesRes.json() as Promise<OrderStatusOption[]>,
        ])

        if (cancelled) return
        setOrders(ordersData)
        setVehicles(vehiclesData)
        setPayments(paymentsData)
        setStatuses(statusesData)
      } catch {
        if (!cancelled) setError('Could not load dashboard data. Please try again.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadDashboard()
    return () => {
      cancelled = true
    }
  }, [navigate])

  const metrics = useMemo(() => {
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0)
    const uniqueCustomers = new Set(orders.map((order) => order.userId)).size
    const vehiclesInStock = vehicles.filter((v) => v.inStock).length
    const lowStockVehicles = vehicles
      .filter((v) => v.inStock && v.amountInStock <= 2)
      .sort((a, b) => a.amountInStock - b.amountInStock)
      .slice(0, 5)

    const ordersByStatus = statuses.map((status) => ({
      ...status,
      count: orders.filter((order) => order.orderStatusId === status.orderStatusId).length,
    }))
    const maxStatusCount = Math.max(1, ...ordersByStatus.map((s) => s.count))

    const paymentStatusCounts = new Map<string, number>()
    payments.forEach((payment) => {
      paymentStatusCounts.set(
        payment.paymentStatusName,
        (paymentStatusCounts.get(payment.paymentStatusName) ?? 0) + 1
      )
    })
    const paymentsByStatus = Array.from(paymentStatusCounts.entries()).map(([name, count]) => ({ name, count }))
    const maxPaymentCount = Math.max(1, ...paymentsByStatus.map((s) => s.count))

    const recentOrders = [...orders].sort((a, b) => b.orderId - a.orderId).slice(0, 8)

    return {
      totalRevenue,
      totalOrders: orders.length,
      uniqueCustomers,
      totalVehicles: vehicles.length,
      vehiclesInStock,
      lowStockVehicles,
      ordersByStatus,
      maxStatusCount,
      paymentsByStatus,
      maxPaymentCount,
      recentOrders,
    }
  }, [orders, vehicles, payments, statuses])

  const handleStatusChange = async (orderId: number, orderStatusId: number) => {
    setUpdatingOrderId(orderId)
    setUpdateError(null)

    try {
      const res = await fetch(`http://localhost:8080/orders/${orderId}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatusId }),
      })

      if (res.status === 401) {
        navigate('/login')
        return
      }
      if (res.status === 403) {
        navigate('/forbidden')
        return
      }
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.message ?? 'Failed to update delivery status.')
      }

      const updated = (await res.json()) as OrderData
      setOrders((prev) =>
        prev.map((order) =>
          order.orderId === orderId
            ? { ...order, orderStatusId: updated.orderStatusId, orderStatusName: updated.orderStatusName }
            : order
        )
      )
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : 'Failed to update delivery status.')
    } finally {
      setUpdatingOrderId(null)
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />

      <main className="min-h-screen pt-16">
        <section className="border-b border-card-border bg-sub-header">
          <div className="mx-auto max-w-6xl px-6 py-6">
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-[#7eb3ff]">
              <ShieldCheck size={16} /> Admin only
            </div>
            <h1 className="mt-2 font-heading text-3xl font-bold">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Company insights and delivery status management.
            </p>
          </div>
        </section>

        {(error || updateError) && (
          <div className="mx-auto max-w-6xl px-6 pt-6">
            {error && <p className="text-sm text-red-400">{error}</p>}
            {updateError && <p className="text-sm text-red-400">{updateError}</p>}
          </div>
        )}

        <section className="mx-auto max-w-6xl px-6 py-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={<Banknote size={16} />}
              label="Total Revenue"
              value={fmtCAD(metrics.totalRevenue)}
              hint={`Across ${metrics.totalOrders} ${metrics.totalOrders === 1 ? 'order' : 'orders'}`}
            />
            <StatCard
              icon={<ShoppingBag size={16} />}
              label="Total Orders"
              value={metrics.totalOrders.toString()}
            />
            <StatCard
              icon={<Package size={16} />}
              label="Vehicles In Stock"
              value={`${metrics.vehiclesInStock} / ${metrics.totalVehicles}`}
              hint={metrics.lowStockVehicles.length > 0 ? `${metrics.lowStockVehicles.length} running low` : 'Stock levels healthy'}
            />
            <StatCard
              icon={<Users size={16} />}
              label="Customers"
              value={metrics.uniqueCustomers.toString()}
              hint="Unique buyers with an order"
            />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-card-border bg-card p-5">
              <h2 className="font-heading text-lg font-semibold">Orders by Status</h2>
              <div className="mt-4 space-y-3">
                {metrics.ordersByStatus.length === 0 && (
                  <p className="text-sm text-muted-foreground">No order statuses configured yet.</p>
                )}
                {metrics.ordersByStatus.map((status) => (
                  <div key={status.orderStatusId}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-foreground">{toTitleCase(status.orderStatusName)}</span>
                      <span className="text-muted-foreground">{status.count}</span>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-[#0066ff]"
                        style={{ width: `${(status.count / metrics.maxStatusCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-card-border bg-card p-5">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-400" />
                <h2 className="font-heading text-lg font-semibold">Low Stock Vehicles</h2>
              </div>
              <div className="mt-4 space-y-2">
                {metrics.lowStockVehicles.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No vehicles are running low on stock.</p>
                ) : (
                  metrics.lowStockVehicles.map((vehicle) => (
                    <div
                      key={vehicle.vehicleId}
                      className="flex items-center justify-between rounded-lg border border-card-border px-3 py-2 text-sm"
                    >
                      <span className="text-foreground">
                        {vehicle.year} {vehicle.brand} {vehicle.model}
                      </span>
                      <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-400">
                        {vehicle.amountInStock} left
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-xl border border-card-border bg-card p-5">
            <h2 className="font-heading text-lg font-semibold">Recent Orders</h2>
            <p className="mt-1 text-xs text-muted-foreground">Update the delivery status for any order below.</p>

            {metrics.recentOrders.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">No orders have been placed yet.</p>
            ) : (
              <div className="mt-4 overflow-x-auto rounded-lg border border-card-border">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-card-border text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="px-4 py-3">Order</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Total</th>
                      <th className="px-4 py-3">Delivery Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.recentOrders.map((order) => (
                      <tr key={order.orderId} className="border-b border-card-border last:border-b-0">
                        <td className="px-4 py-3 font-medium text-foreground">
                          #{order.orderId.toString().padStart(4, '0')}
                        </td>
                        <td className="px-4 py-3 text-foreground">{order.userFullName}</td>
                        <td className="px-4 py-3 font-semibold text-[#0066ff]">{fmtCAD(order.totalAmount)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <select
                              value={order.orderStatusId}
                              disabled={updatingOrderId === order.orderId || statuses.length === 0}
                              onChange={(e) => void handleStatusChange(order.orderId, Number(e.target.value))}
                              className={`rounded-full border bg-transparent px-3 py-1 text-xs font-semibold uppercase tracking-wide outline-none disabled:opacity-50 ${statusToneClass(order.orderStatusName)}`}
                            >
                              {statuses.map((status) => (
                                <option key={status.orderStatusId} value={status.orderStatusId} className="bg-card text-foreground">
                                  {toTitleCase(status.orderStatusName)}
                                </option>
                              ))}
                            </select>
                            {updatingOrderId === order.orderId && (
                              <Loader2 size={14} className="animate-spin text-muted-foreground" />
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
