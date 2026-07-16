import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Btn, AuthShell, AuthHeader, AuthCard, FormField, ConfirmationCard } from '../components'
import type { GoFn, ViewParams } from '../components/types'

interface ResetPasswordProps { onNavigate?: GoFn }

export default function ResetPassword({ onNavigate }: ResetPasswordProps) {
  const [step, setStep] = useState<'reset' | 'done'>('reset')
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
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

    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match.')
      return
    }

    try {
      const response = await fetch('http://localhost:8080/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      })

      if (response.ok) {
        setStep('done')
      } else {
        setMessage('Invalid or expired token. Please request a new password reset.')
      }
    } catch {
      setMessage('An error occurred. Please try again later.')
    }
  }

  return (
    <AuthShell toast={toast}>
      <AuthHeader
        title={step === 'done' ? 'Password Reset' : 'Reset Password'}
        subtitle={step === 'reset' ? 'Enter the token from your email and choose a new password' : 'Your password has been updated'}
      />

      <AuthCard>
        {step === 'done' ? (
          <ConfirmationCard
            icon="check"
            title="All done!"
            description="You can now sign in with your new password."
            buttonLabel="Sign In"
            onAction={() => go('/login')}
          />
        ) : (
          <form onSubmit={handleSubmit}>
            <FormField
              label="Reset Token"
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste token from your email"
              required
            />
            <FormField
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <FormField
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              wrapperClassName="mb-5"
            />
            {message && <p className="text-sm text-center mb-4 text-red-400">{message}</p>}
            <Btn type="submit" fullWidth size="lg">Reset Password</Btn>
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
