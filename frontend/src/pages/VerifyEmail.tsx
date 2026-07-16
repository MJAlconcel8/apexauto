import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Btn, AuthShell, AuthHeader, AuthCard, FormField, ConfirmationCard } from '../components'
import type { GoFn, ViewParams } from '../components/types'

interface VerifyEmailProps { onNavigate?: GoFn }

export default function VerifyEmail({ onNavigate }: VerifyEmailProps) {
  const [step, setStep] = useState<'verify' | 'done'>('verify')
  const [token, setToken] = useState('')
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage('')

    try {
      const response = await fetch(
        `http://localhost:8080/auth/verify-email?token=${encodeURIComponent(token)}`
      )

      if (response.ok) {
        setStep('done')
      } else {
        setMessage('Invalid or expired token. Please check your email and try again.')
      }
    } catch {
      setMessage('An error occurred. Please try again later.')
    }
  }

  return (
    <AuthShell toast={toast}>
      <AuthHeader
        title={step === 'done' ? 'Email Verified' : 'Verify Your Email'}
        subtitle={step === 'verify' ? 'Check your inbox and paste the verification token below' : 'Your email address has been confirmed'}
      />

      <AuthCard>
        {step === 'done' ? (
          <ConfirmationCard
            icon="check"
            title="All done!"
            description="You can now sign in to your account."
            buttonLabel="Sign In"
            onAction={() => go('/login')}
          />
        ) : (
          <form onSubmit={handleSubmit}>
            <FormField
              label="Verification Token"
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste token from your email"
              required
              wrapperClassName="mb-5"
            />
            {message && <p className="text-sm text-center mb-4 text-red-400">{message}</p>}
            <Btn type="submit" fullWidth size="lg">Verify Email</Btn>
          </form>
        )}
      </AuthCard>

      {step !== 'done' && (
        <p className="text-center text-sm text-muted-foreground mt-5">
          Already verified?{' '}
          <button type="button" onClick={() => go('/login')} className="text-blue-400 font-bold hover:underline">Sign in</button>
        </p>
      )}
    </AuthShell>
  )
}
