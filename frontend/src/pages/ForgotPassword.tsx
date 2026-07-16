import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Btn, AuthShell, AuthHeader, AuthCard, FormField, ConfirmationCard } from '../components'
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
    <AuthShell toast={toast}>
      <AuthHeader
        title={step === 'done' ? 'Check Your Email' : 'Forgot Password'}
        subtitle={step === 'email' ? 'Enter your email to get started' : `A reset token has been sent to ${email}`}
      />

      <AuthCard>
        {step === 'done' ? (
          <ConfirmationCard
            icon="email"
            title="Email sent!"
            description="Copy the token from your email, then reset your password below."
            buttonLabel="Go to Reset Password"
            onAction={() => go('/reset-password')}
          />
        ) : (
          <form onSubmit={handleEmailSubmit}>
            <FormField
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              wrapperClassName="mb-5"
            />
            {message && <p className="text-sm text-center mb-4 text-red-400">{message}</p>}
            <Btn type="submit" fullWidth size="lg">Continue</Btn>
          </form>
        )}
      </AuthCard>

      {step !== 'done' && (
        <p className="text-center text-sm text-muted-foreground mt-5">
          Remember your password?{' '}
          <button type="button" onClick={() => go('/login')} className="text-blue-400 font-bold hover:underline">Sign in</button>
        </p>
      )}
    </AuthShell>
  )
}
