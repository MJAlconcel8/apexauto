import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import { Btn } from '../components'
import type { GoFn, ViewParams } from '../components/types'

interface ForgotPasswordProps { onNavigate?: GoFn }

export default function ForgotPassword({ onNavigate }: ForgotPasswordProps) {
  const [step, setStep] = useState<'email' | 'done'>('email')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<number | undefined>(undefined)
  const navigate = useNavigate()

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

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage('')

    try {
      const response = await fetch('http://localhost:8080/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setStep('done')
      } else {
        setMessage('No account found with that email address.')
      }
    } catch {
      setMessage('An error occurred. Please try again later.')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4">
      <div className="w-full max-w-sm">
        {/* Logo + Header */}
        <div className="flex flex-col items-center mb-8">
          <Logo />
          <h1 className="text-3xl font-bold text-foreground mt-4 mb-1">
            {step === 'done' ? 'Check Your Email' : 'Forgot Password'}
          </h1>
          <p className="text-sm text-muted-foreground text-center">
            {step === 'email' && 'Enter your email to get started'}
            {step === 'done' && `A reset token has been sent to ${email}`}
          </p>
        </div>

        {/* Card */}
        <div className="bg-card border border-card-border rounded-2xl p-6">
          {step === 'done' ? (
            <div className="flex flex-col items-center py-4 gap-3">
              <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-foreground font-semibold text-center">Email sent!</p>
              <p className="text-sm text-muted-foreground text-center">Copy the token from your email, then reset your password below.</p>
              <button
                type="button"
                onClick={() => go('/reset-password')}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 font-semibold font-body cursor-pointer whitespace-nowrap rounded-[10px] transition-all duration-150 py-3.5 px-6.5 text-[15px] bg-apex-voltage hover:bg-apex-voltage-ink text-white border border-transparent"
              >
                Go to Reset Password
              </button>
            </div>
          ) : (
            <form onSubmit={handleEmailSubmit}>
              <div className="mb-5">
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-secondary text-foreground placeholder-muted-foreground px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              {message && <p className="text-sm text-center mb-4 text-red-400">{message}</p>}
              <Btn type="submit" fullWidth size="lg">Continue</Btn>
            </form>
          )}
        </div>

        {/* Back to login */}
        {step !== 'done' && (
          <p className="text-center text-sm text-muted-foreground mt-5">
            Remember your password?{' '}
            <button type="button" onClick={() => go('/login')} className="text-blue-400 font-bold hover:underline">Sign in</button>
          </p>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-foreground text-background text-sm px-4 py-2 rounded-lg shadow-lg z-50 pointer-events-none">
          {toast}
        </div>
      )}
    </div>
  )
}
