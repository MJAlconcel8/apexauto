import { useEffect, useState } from 'react'
import { ArrowRight, ShoppingCart, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Nav from '../components/Nav'
import { CartLineItem } from '../components'
import type { CartLine } from '../components'

interface CartData {
  cartId: number
  userId: number
  cartStatusId: number
  cartStatusName: string
  totalItemsInCart: number
  cartLines: CartLine[]
}

const fmtCAD = (n: number) =>
  '$' + n.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default function Cart() {
  const navigate = useNavigate()
  const [cart, setCart] = useState<CartData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userId = localStorage.getItem('userId')

    if (!token || !userId) {
      navigate('/login')
      return
    }

    fetch(`http://localhost:8080/users/${userId}/carts/active`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 401) {
          localStorage.removeItem('token')
          localStorage.removeItem('userId')
          navigate('/login')
          return null
        }
        if (res.status === 404) return null
        if (!res.ok) throw new Error('Failed to load cart.')
        return res.json() as Promise<CartData>
      })
      .then((data) => {
        setCart(data)
        setLoading(false)
      })
      .catch(() => {
        setError('Could not load your cart. Please try again.')
        setLoading(false)
      })
  }, [navigate])

  const handleRemove = async (vehicleId: number) => {
    const token = localStorage.getItem('token')
    if (!cart || !token) return

    const res = await fetch(
      `http://localhost:8080/carts/${cart.cartId}/cart-lines/${vehicleId}`,
      { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } },
    )

    if (res.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('userId')
      navigate('/login')
      return
    }

    if (res.ok) {
      setCart((prev) => {
        if (!prev) return prev
        const updated = prev.cartLines.filter((l) => l.vehicleId !== vehicleId)
        return { ...prev, cartLines: updated, totalItemsInCart: updated.length }
      })
    }
  }

  const handleCheckout = () => navigate('/checkout')

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

  const lines = cart?.cartLines ?? []
  const grandTotal = lines.reduce(
    (sum, l) => sum + (l.financingSelected ? (l.lineTotalCost ?? 0) : l.price),
    0,
  )

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />

      <main className="min-h-screen pt-16">
        {/* Page heading */}
        <section className="border-b border-card-border bg-sub-header">
          <div className="mx-auto max-w-5xl px-6 py-6">
            <h1 className="font-heading text-3xl font-bold">Your Cart</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {lines.length} {lines.length === 1 ? 'item' : 'items'}
            </p>
          </div>
        </section>

        {error && (
          <div className="mx-auto max-w-5xl px-6 pt-6">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {lines.length === 0 ? (
          /* Empty state */
          <section className="mx-auto flex min-h-[calc(100vh-9rem)] max-w-5xl items-start justify-center px-6 pt-28">
            <div className="flex flex-col items-center text-center">
              <ShoppingCart
                aria-hidden="true"
                className="text-card-border"
                size={48}
                strokeWidth={1.4}
              />
              <p className="mt-5 text-sm text-muted-foreground">Your cart is empty.</p>
              <button
                type="button"
                onClick={() => navigate('/home')}
                className="mt-5 inline-flex items-center gap-2 rounded-md bg-[#0066ff] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0055d9]"
              >
                Browse Vehicles
                <ArrowRight size={16} />
              </button>
            </div>
          </section>
        ) : (
          /* Cart items */
          <section className="mx-auto max-w-5xl px-6 py-8">
            <ul className="space-y-4">
              {lines.map((line) => (
                <CartLineItem
                  key={line.vehicleId}
                  line={line}
                  onRemove={handleRemove}
                />
              ))}
            </ul>

            {/* Summary */}
            <div className="mt-8 rounded-xl border border-card-border bg-card p-6">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Subtotal ({lines.length} {lines.length === 1 ? 'item' : 'items'})</span>
                <span className="font-medium text-foreground">{fmtCAD(grandTotal)}</span>
              </div>
              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={handleCheckout}
                  className="inline-flex items-center gap-2 rounded-md bg-[#0066ff] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0055d9]"
                >
                  Proceed to Checkout
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}