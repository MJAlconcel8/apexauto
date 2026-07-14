import { ArrowRight, ShoppingCart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Nav from '../components/Nav'

export default function Cart() {
  const navigate = useNavigate()

  const handleBrowseVehicles = () => {
    navigate('/home')
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />

      <main className="min-h-screen pt-16">
        {/* Page heading */}
        <section className="border-b border-card-border bg-sub-header">
          <div className="mx-auto max-w-5xl px-6 py-6">
            <h1 className="font-heading text-3xl font-bold">
              Your Cart
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              0 items
            </p>
          </div>
        </section>

        {/* Empty-cart placeholder */}
        <section className="mx-auto flex min-h-[calc(100vh-9rem)] max-w-5xl items-start justify-center px-6 pt-28">
          <div className="flex flex-col items-center text-center">
            <ShoppingCart
              aria-hidden="true"
              className="text-card-border"
              size={48}
              strokeWidth={1.4}
            />

            <p className="mt-5 text-sm text-muted-foreground">
              Your cart is empty.
            </p>

            <button
              type="button"
              onClick={handleBrowseVehicles}
              className="mt-5 inline-flex items-center gap-2 rounded-md bg-[#0066ff] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0055d9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0066ff]"
            >
              Browse Vehicles
              <ArrowRight size={16} />
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}