import { API_BASE_URL } from '../config/api'
import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Btn, AuthShell, AuthHeader, AuthCard, FormField, ConfirmationCard, InfoModal } from '../components'
import type { GoFn, ViewParams } from '../components/types'

interface RegistrationProps { onNavigate?: GoFn }

const LEGAL_CONTENT: Record<'terms' | 'privacy', { title: string; body: string[] }> = {
  terms: {
    title: 'Terms of Service',
    body: [
      'By creating an account with ApexAuto, you agree to use our marketplace responsibly and to provide accurate information when browsing, comparing, or ordering vehicles.',
      'Listings, pricing, and availability are provided for informational purposes and may change without notice. Any order placed through ApexAuto is subject to final confirmation and applicable financing terms.',
      'You are responsible for keeping your account credentials secure and for any activity that occurs under your account.',
      'ApexAuto reserves the right to suspend or terminate accounts that violate these terms or misuse the platform.',
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    body: [
      'ApexAuto collects the information you provide during registration, such as your name and email address, to create and manage your account.',
      'We use your data to process orders, provide customer support, and improve our marketplace experience. We do not sell your personal information to third parties.',
      'Your information is stored securely and access is limited to systems and personnel that need it to operate the service.',
      'You may request access to, correction of, or deletion of your personal data at any time by contacting support.',
    ],
  },
}

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
  const [legalModal, setLegalModal] = useState<'terms' | 'privacy' | null>(null)
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
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
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
                  <button
                    type="button"
                    onClick={() => setLegalModal('terms')}
                    className="text-blue-400 font-semibold hover:underline"
                  >
                    Terms of Service
                  </button>
                  {' '}and{' '}
                  <button
                    type="button"
                    onClick={() => setLegalModal('privacy')}
                    className="text-blue-400 font-semibold hover:underline"
                  >
                    Privacy Policy
                  </button>
                </span>
              </div>

              <Btn type="submit" fullWidth size="lg">Create Account</Btn>
            </form>
          </AuthCard>

          <p className="text-center text-sm text-gray-400 mt-4">
            Already have an account?{' '}
            <button type="button" onClick={() => go('/login')} className="text-blue-400 font-semibold hover:underline">Sign in</button>
          </p>

          <InfoModal
            open={legalModal !== null}
            title={legalModal ? LEGAL_CONTENT[legalModal].title : ''}
            onClose={() => setLegalModal(null)}
          >
            {legalModal &&
              LEGAL_CONTENT[legalModal].body.map((paragraph, i) => (
                <p key={i} className={i > 0 ? 'mt-3' : ''}>
                  {paragraph}
                </p>
              ))}
          </InfoModal>
        </>
      )}
    </AuthShell>
  )
}