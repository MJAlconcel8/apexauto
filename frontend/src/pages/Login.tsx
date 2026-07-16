import { useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Btn, AuthShell, AuthHeader, AuthCard, FormField } from '../components'
import type { GoFn, ViewParams } from '../components/types'

interface LoginProps { onNavigate?: GoFn }

export default function Login({ onNavigate }: LoginProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const [message, setMessage] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<number | undefined>(undefined)
  const navigate = useNavigate()
  const location = useLocation()
  const locationState = location.state as Record<string, unknown> | null
  const returnTo = locationState?.returnTo as string | undefined

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

    try {
      const response = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        await fetch(`http://localhost:8080/users/me/carts`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }).catch(() => {})

        if (returnTo) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { returnTo: _rt, hideNav: _hn, ...returnState } = locationState ?? {}
          navigate(returnTo, { state: returnState })
        } else {
          go('/home')
        }
      } else {
        setMessage(data.error || 'Login failed. Please try again.')
      }
    } catch {
      setMessage('An error occurred. Please try again later.')
    }
  }

  return (
    <AuthShell toast={toast}>
      <AuthHeader title="Sign In" subtitle="Welcome back to ApexAuto" />

      <AuthCard>
        <form onSubmit={handleSubmit}>
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
            wrapperClassName="mb-2"
          />

          <div className="flex justify-end mb-5">
            <button type="button" onClick={() => go('/forgot-password')} className="text-xs text-blue-400 hover:underline">
              Forgot password?
            </button>
          </div>

          {message && <p className="text-sm text-center mb-4 text-red-400">{message}</p>}

          <div className="mb-5">
            <Btn type="submit" fullWidth size="lg">Sign In</Btn>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-card-border" />
            <span className="text-xs text-muted-foreground">or continue with</span>
            <div className="flex-1 h-px bg-card-border" />
          </div>

          <div className="flex flex-col gap-3">
            <Btn variant="ghostDark" fullWidth>Continue with Google</Btn>
            <Btn variant="ghostDark" fullWidth>Continue with Apple</Btn>
          </div>
        </form>
      </AuthCard>

      <p className="text-center text-sm text-muted-foreground mt-5">
        New to ApexAuto?{' '}
        <button type="button" onClick={() => go('/register')} className="text-blue-400 font-bold hover:underline">Create account</button>
      </p>
    </AuthShell>
  )
}