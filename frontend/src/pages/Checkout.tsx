import { useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'
import { ArrowLeft, ArrowRight, Check, CreditCard, Truck } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import Nav from '../components/Nav'
import { ConfirmModal, FormField } from '../components'
import type { CartLine } from '../components'
import { resolveVehicleImage } from '../utils/vehicleUtils'

interface CartData {
  cartId: number
  userId: number
  cartStatusId: number
  cartStatusName: string
  totalItemsInCart: number
  cartLines: CartLine[]
}

interface PersonalInfo {
  fullName: string
  email: string
  phone: string
  address: string
  city: string
  region: string
  postalCode: string
}

interface PaymentInfo {
  cardholderName: string
  cardNumber: string
  expiry: string
  cvv: string
}

const TAX_RATE = 0.13
const DELIVERY_FEE = 1250

const STEPS = [
  { number: 1, label: 'Personal Info' },
  { number: 2, label: 'Payment' },
  { number: 3, label: 'Review & Confirm' },
] as const

const fmtCAD = (n: number) =>
  '$' + n.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function detectCardBrand(cardNumber: string): string {
  const digits = cardNumber.replace(/\D/g, '')
  if (digits.startsWith('4')) return 'Visa'
  if (/^5[1-5]/.test(digits)) return 'Mastercard'
  if (/^3[47]/.test(digits)) return 'Amex'
  return 'Card'
}

export default function Checkout() {
  const navigate = useNavigate()
  const location = useLocation() as { state?: { cart?: CartData } }
  const cart = location.state?.cart

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    region: '',
    postalCode: '',
  })
  const [payment, setPayment] = useState<PaymentInfo>({
    cardholderName: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  })
  const [confirmingOrder, setConfirmingOrder] = useState(false)
  const [placingOrder, setPlacingOrder] = useState(false)
  const [placeOrderError, setPlaceOrderError] = useState<string | null>(null)

  useEffect(() => {
    if (!cart) navigate('/cart', { replace: true })
  }, [cart, navigate])

  if (!cart) return null

  const updatePersonalInfo = (field: keyof PersonalInfo) => (e: ChangeEvent<HTMLInputElement>) =>
    setPersonalInfo((prev) => ({ ...prev, [field]: e.target.value }))

  const updatePayment = (field: keyof PaymentInfo) => (e: ChangeEvent<HTMLInputElement>) =>
    setPayment((prev) => ({ ...prev, [field]: e.target.value }))

  const isStep1Valid =
    personalInfo.fullName.trim() !== '' &&
    personalInfo.email.trim() !== '' &&
    personalInfo.phone.trim() !== '' &&
    personalInfo.address.trim() !== '' &&
    personalInfo.city.trim() !== ''

  const isStep2Valid =
    payment.cardholderName.trim() !== '' &&
    payment.cardNumber.replace(/\s/g, '').length >= 12 &&
    payment.expiry.trim() !== '' &&
    payment.cvv.trim() !== ''

  const subtotal = cart.cartLines.reduce((sum, line) => {
    const unitTotal = line.financingSelected ? (line.lineTotalCost ?? line.price) : line.price
    return sum + unitTotal * line.quantity
  }, 0)
  const tax = subtotal * TAX_RATE
  const total = subtotal + tax + DELIVERY_FEE
  const last4 = payment.cardNumber.replace(/\D/g, '').slice(-4).padStart(4, '*')

  const handleBack = () => {
    if (step === 1) navigate('/cart')
    else setStep((s) => (s === 3 ? 2 : 1))
  }

  const handleContinue = () => setStep((s) => (s === 1 ? 2 : 3))

  const handlePlaceOrder = async () => {
    if (placingOrder) return

    setPlaceOrderError(null)
    setPlacingOrder(true)

    try {
      const res = await fetch(`http://localhost:8080/carts/${cart.cartId}/checkout`, {
        method: 'POST',
        credentials: 'include',
      })

      if (res.status === 401) {
        navigate('/login')
        return
      }

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.message ?? 'Could not complete checkout. Please try again.')
      }

      const order = await res.json()
      window.dispatchEvent(new CustomEvent('cart-updated'))
      setConfirmingOrder(false)
      navigate('/order-confirmation', { state: { order, personalInfo, payment } })
    } catch (err) {
      setPlaceOrderError(err instanceof Error ? err.message : 'Could not complete checkout. Please try again.')
    } finally {
      setPlacingOrder(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />

      <main className="min-h-screen pt-16">
        <section className="border-b border-card-border bg-sub-header">
          <div className="mx-auto max-w-5xl px-6 py-6">
            <h1 className="font-heading text-3xl font-bold">Checkout</h1>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-8">
          {/* Stepper */}
          <div className="mx-auto mb-10 flex max-w-xl items-start">
            {STEPS.map((s, idx) => {
              const state = s.number < step ? 'done' : s.number === step ? 'active' : 'upcoming'
              return (
                <div
                  key={s.number}
                  className="flex items-center"
                  style={idx < STEPS.length - 1 ? { flex: '1 1 auto' } : { flex: '0 0 auto' }}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
                        state === 'done'
                          ? 'bg-green-500 text-white'
                          : state === 'active'
                            ? 'bg-[#0066ff] text-white'
                            : 'bg-secondary text-muted-foreground'
                      }`}
                    >
                      {state === 'done' ? <Check size={16} /> : s.number}
                    </div>
                    <span
                      className={`whitespace-nowrap text-xs font-medium ${
                        state === 'upcoming' ? 'text-muted-foreground' : 'text-foreground'
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div
                      className={`mx-3 h-px flex-1 self-start mt-4.5 ${
                        state === 'done' ? 'bg-green-500' : 'bg-card-border'
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            {/* Main content */}
            <div className="rounded-xl border border-card-border bg-card p-6">
              {step === 1 && (
                <div>
                  <h2 className="mb-4 font-heading text-lg font-semibold">Personal Info</h2>
                  <FormField
                    label="Full Name"
                    placeholder=""
                    value={personalInfo.fullName}
                    onChange={updatePersonalInfo('fullName')}
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      label="Email"
                      type="email"
                      placeholder=""
                      value={personalInfo.email}
                      onChange={updatePersonalInfo('email')}
                    />
                    <FormField
                      label="Phone"
                      placeholder=""
                      value={personalInfo.phone}
                      onChange={updatePersonalInfo('phone')}
                    />
                  </div>
                  <FormField
                    label="Address"
                    placeholder=""
                    value={personalInfo.address}
                    onChange={updatePersonalInfo('address')}
                  />
                  <div className="grid gap-4 sm:grid-cols-3">
                    <FormField
                      label="City"
                      placeholder=""
                      value={personalInfo.city}
                      onChange={updatePersonalInfo('city')}
                    />
                    <FormField
                      label="State / Province"
                      placeholder=""
                      value={personalInfo.region}
                      onChange={updatePersonalInfo('region')}
                    />
                    <FormField
                      label="Postal Code"
                      placeholder=""
                      value={personalInfo.postalCode}
                      onChange={updatePersonalInfo('postalCode')}
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h2 className="mb-4 font-heading text-lg font-semibold">Payment</h2>
                  <div className="mb-5 rounded-lg border border-[#0066ff]/40 bg-[#0066ff]/5 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-[#0066ff]">
                        <span className="h-2 w-2 rounded-full bg-[#0066ff]" />
                      </span>
                      SSL-secured payment via Apex Pay
                    </div>
                    <div className="mt-3 flex flex-wrap gap-6 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Check size={14} className="text-green-400" /> 256-bit encryption
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Check size={14} className="text-green-400" /> PCI DSS compliant
                      </span>
                    </div>
                  </div>

                  <FormField
                    label="Cardholder Name"
                    placeholder="Jordan Lee"
                    value={payment.cardholderName}
                    onChange={updatePayment('cardholderName')}
                  />
                  <FormField
                    label="Card Number"
                    placeholder="4242 4242 4242 4242"
                    value={payment.cardNumber}
                    onChange={updatePayment('cardNumber')}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      label="Expiry (MM/YY)"
                      placeholder="12/28"
                      value={payment.expiry}
                      onChange={updatePayment('expiry')}
                    />
                    <FormField
                      label="CVV"
                      placeholder="•••"
                      value={payment.cvv}
                      onChange={updatePayment('cvv')}
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h2 className="mb-4 font-heading text-lg font-semibold">Review & Confirm</h2>

                  <div className="mb-4 rounded-lg border border-card-border bg-secondary/40 p-4">
                    <p className="text-sm font-semibold text-foreground">Delivery Address</p>
                    <p className="mt-2 text-sm text-muted-foreground">{personalInfo.fullName}</p>
                    <p className="text-sm text-muted-foreground">
                      {personalInfo.address}, {personalInfo.city}, {personalInfo.region} {personalInfo.postalCode}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {personalInfo.email} · {personalInfo.phone}
                    </p>
                  </div>

                  <div className="mb-4 rounded-lg border border-card-border bg-secondary/40 p-4">
                    <p className="text-sm font-semibold text-foreground">Payment Method</p>
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <CreditCard size={16} />
                      **** **** **** {last4} · {detectCardBrand(payment.cardNumber)}
                    </div>
                  </div>

                  <div className="flex items-start gap-2 rounded-lg border border-[#0066ff]/30 bg-[#0066ff]/5 p-4 text-sm text-[#7eb3ff]">
                    <Truck size={16} className="mt-0.5 shrink-0" />
                    <p>
                      Estimated delivery: <span className="font-semibold">6-8 weeks</span> from order
                      confirmation. You will receive tracking updates via email.
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-between">
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-2 rounded-md border border-card-border px-5 py-3 text-sm font-semibold text-foreground transition hover:border-[#0066ff]"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={handleContinue}
                    disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
                    className="inline-flex items-center gap-2 rounded-md bg-[#0066ff] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0055d9] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Continue
                    <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmingOrder(true)}
                    className="inline-flex items-center gap-2 rounded-md bg-[#0066ff] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0055d9]"
                  >
                    Place Order
                    <Check size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Order summary */}
            <aside className="h-fit rounded-xl border border-card-border bg-card p-6">
              <p className="font-heading text-base font-semibold">Order Summary</p>
              <ul className="mt-4 space-y-3">
                {cart.cartLines.map((line) => {
                  const img = resolveVehicleImage(line.imageUrl, line.make, line.model)
                  const unitPrice = line.financingSelected ? (line.lineTotalCost ?? line.price) : line.price
                  return (
                    <li key={line.cartLineId} className="flex items-center gap-3">
                      <div className="h-10 w-14 shrink-0 overflow-hidden rounded-md bg-sub-header">
                        <img
                          src={img}
                          alt={`${line.year} ${line.brand} ${line.model}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {line.year} {line.brand} {line.model}
                        </p>
                        <p className="text-xs text-muted-foreground">Qty: {line.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-[#0066ff]">
                        {fmtCAD(unitPrice * line.quantity)}
                      </p>
                    </li>
                  )
                })}
              </ul>

              <div className="mt-5 space-y-2 border-t border-card-border pt-4 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{fmtCAD(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Est. Tax ({(TAX_RATE * 100).toFixed(1)}%)</span>
                  <span>{fmtCAD(tax)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery</span>
                  <span>{fmtCAD(DELIVERY_FEE)}</span>
                </div>
                <div className="flex justify-between border-t border-card-border pt-3 text-base font-semibold text-foreground">
                  <span>Total</span>
                  <span className="text-[#0066ff]">{fmtCAD(total)}</span>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <ConfirmModal
        open={confirmingOrder}
        title="Confirm your purchase"
        message={`You're about to place an order for ${fmtCAD(total)} (including tax and delivery), charged to the card ending in ${last4}. This action cannot be undone.`}
        confirmLabel="Confirm Purchase"
        loading={placingOrder}
        error={placeOrderError}
        onConfirm={() => void handlePlaceOrder()}
        onCancel={() => {
          setConfirmingOrder(false)
          setPlaceOrderError(null)
        }}
      />
    </div>
  )
}
