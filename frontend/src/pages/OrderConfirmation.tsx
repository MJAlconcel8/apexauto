import { useEffect } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import Nav from '../components/Nav'

interface OrderData {
  orderId: number
  userId: number
  orderStatusId: number
  orderStatusName: string
  totalAmount: number
  deliveryDate: string | null
}

const fmtDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

const fmtDateWithYear = (d: Date) =>
  d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

const toTitleCase = (value: string) =>
  value
    .toLowerCase()
    .split(/[\s_-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

export default function OrderConfirmation() {
  const navigate = useNavigate()
  const location = useLocation() as { state?: { order?: OrderData } }
  const order = location.state?.order

  useEffect(() => {
    if (!order) navigate('/home', { replace: true })
  }, [order, navigate])

  if (!order) return null

  const orderCode = `APX-${order.orderId.toString().padStart(4, '0')}`
  const statusLabel = toTitleCase(order.orderStatusName)

  const now = new Date()
  const deliveryStart = new Date(now)
  deliveryStart.setDate(now.getDate() + 42)
  const deliveryEnd = new Date(now)
  deliveryEnd.setDate(now.getDate() + 56)
  const deliveryRange = `${fmtDate(deliveryStart)} - ${fmtDateWithYear(deliveryEnd)}`

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />

      <main className="flex min-h-screen items-center justify-center px-6 pt-16">
        <div className="flex w-full max-w-md flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-green-500/30 bg-green-500/10">
            <CheckCircle2 className="text-green-400" size={32} />
          </div>

          <h1 className="mt-6 font-heading text-3xl font-bold">Order Confirmed!</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Thank you for your Apex Auto order. Your vehicle is now in production and will be delivered
            to you in 6-8 weeks.
          </p>

          <div className="mt-8 w-full rounded-xl border border-card-border bg-card p-6 text-left">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Order ID</p>
                <p className="mt-1 font-mono text-sm font-semibold text-[#0066ff]">{orderCode}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Status</p>
                <p className="mt-1 text-sm font-semibold text-[#0066ff]">{statusLabel}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Estimated Delivery
                </p>
                <p className="mt-1 text-sm font-semibold text-[#0066ff]">{deliveryRange}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Support</p>
                <p className="mt-1 text-sm font-semibold text-[#0066ff]">support@apexauto.com</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex w-full gap-3">
            <button
              type="button"
              onClick={() => navigate('/home')}
              className="flex-1 rounded-md border border-card-border px-5 py-3 text-sm font-semibold text-foreground transition hover:border-[#0066ff]"
            >
              Back to Home
            </button>
            <button
              type="button"
              onClick={() => navigate('/catalogue')}
              className="flex-1 rounded-md bg-[#0066ff] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0055d9]"
            >
              Browse More
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
