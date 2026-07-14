import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import { Btn } from '../components'
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('userId', String(data.userId))

        await fetch(`http://localhost:8080/users/${data.userId}/carts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${data.token}`,
          },
        }).catch(() => {})

        go('/home')
      } else {
        setMessage(data.error || 'Login failed. Please try again.')
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
            <h1 className="text-3xl font-bold text-foreground mt-4 mb-1">Sign In</h1>
            <p className="text-sm text-muted-foreground">Welcome back to ApexAuto</p>
          </div>

          {/* Card */}
          <div className="bg-card border border-card-border rounded-2xl p-6">
            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  className="w-full bg-secondary text-foreground placeholder-muted-foreground px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Password */}
              <div className="mb-2">
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleFormChange}
                  className="w-full bg-secondary text-foreground placeholder-muted-foreground px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Forgot password */}
              <div className="flex justify-end mb-5">
                <button type="button" onClick={() => go('/forgot-password')} className="text-xs text-blue-400 hover:underline">
                  Forgot password?
                </button>
              </div>

              {/* Message */}
              {message && (
                <p className="text-sm text-center mb-4 text-red-400">{message}</p>
              )}

              {/* Submit */}
              <div className="mb-5">
                <Btn type="submit" fullWidth size="lg">Sign In</Btn>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-card-border" />
                <span className="text-xs text-muted-foreground">or continue with</span>
                <div className="flex-1 h-px bg-card-border" />
              </div>

              {/* Social buttons */}
              <div className="flex flex-col gap-3">
                <Btn variant="ghostDark" fullWidth>Continue with Google</Btn>
                <Btn variant="ghostDark" fullWidth>Continue with Apple</Btn>
              </div>
            </form>
          </div>

          {/* Register link */}
          <p className="text-center text-sm text-muted-foreground mt-5">
            New to ApexAuto?{' '}
            <button type="button" onClick={() => go('/register')} className="text-blue-400 font-bold hover:underline">Create account</button>
          </p>
        </div>

      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-foreground text-background text-sm px-4 py-2 rounded-lg shadow-lg z-50 pointer-events-none">
          {toast}
        </div>
      )}
    </div>
  )
}