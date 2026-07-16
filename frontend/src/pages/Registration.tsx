import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Btn, AuthShell, AuthHeader, AuthCard, FormField, ConfirmationCard } from '../components'
import type { GoFn, ViewParams } from '../components/types'

interface RegistrationProps { onNavigate?: GoFn }

export default function Registration({ onNavigate }: RegistrationProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
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

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match.')
      return
    }

    try {
      const response = await fetch('http://localhost:8080/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSuccess(true)
      } else {
        setMessage(data.error || 'Registration failed. Please try again.')
      }
    } catch {
      setMessage('An error occurred. Please try again later.')
    }
  }


  return (
    <AuthShell toast={toast}>
      {isSuccess ? (
        <>
          <AuthHeader title="Check Your Email" subtitle="A verification token has been sent to your inbox" />
          <AuthCard>
            <ConfirmationCard
              icon="email"
              title="Account created!"
              description="Copy the token from your email and paste it into the verification page."
              buttonLabel="Verify Email"
              onAction={() => go('/verify-email')}
            />
          </AuthCard>
        </>
      ) : (
        <>
          <AuthHeader title="Create Account" subtitle="Join the Apex community" />

          <AuthCard>
            <form onSubmit={handleSubmit}>
              {/* First Name + Last Name */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <FormField
                  label="First Name"
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleFormChange}
                  wrapperClassName=""
                />
                <FormField
                  label="Last Name"
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleFormChange}
                  wrapperClassName=""
                />
              </div>

              <FormField
                label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleFormChange}
              />

              <FormField
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleFormChange}
              />

              <FormField
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleFormChange}
                wrapperClassName="mb-5"
              />

              {message && (
                <p className="text-sm text-center mb-4 text-red-400">{message}</p>
              )}

              <div className="flex items-start gap-2 mb-5 text-sm text-muted-foreground">
                <input type="checkbox" className="mt-0.5 accent-blue-500" />
                <span>
                  I agree to ApexAuto's{' '}
                  <a href="/terms" className="text-blue-400 font-semibold hover:underline">Terms of Service</a>
                  {' '}and{' '}
                  <a href="/privacy" className="text-blue-400 font-semibold hover:underline">Privacy Policy</a>
                </span>
              </div>

              <Btn type="submit" fullWidth size="lg">Create Account</Btn>
            </form>
          </AuthCard>

          <p className="text-center text-sm text-gray-400 mt-4">
            Already have an account?{' '}
            <button type="button" onClick={() => go('/login')} className="text-blue-400 font-semibold hover:underline">Sign in</button>
          </p>
        </>
      )}
    </AuthShell>
  )
}