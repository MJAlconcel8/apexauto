import { useState } from 'react'
import { Link } from 'react-router-dom'
import Logo from '../components/Logo'
import { Btn } from '../components'

export default function Registration() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4">
      <div className="w-full max-w-sm">
        {isSuccess ? (
          <>
            <div className="flex flex-col items-center mb-8">
              <Logo />
              <h1 className="text-3xl font-bold text-foreground mt-4 mb-1">Check Your Email</h1>
              <p className="text-sm text-muted-foreground text-center">A verification token has been sent to your inbox</p>
            </div>
            <div className="bg-card border border-card-border rounded-2xl p-6 flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-foreground font-semibold text-center">Account created!</p>
              <p className="text-sm text-muted-foreground text-center">Copy the token from your email and paste it into the verification page.</p>
              <Link
                to="/verify-email"
                className="mt-2 inline-flex w-full items-center justify-center gap-2 font-semibold font-body cursor-pointer whitespace-nowrap rounded-[10px] transition-all duration-150 py-3.5 px-6.5 text-[15px] bg-apex-voltage hover:bg-apex-voltage-ink text-white border border-transparent"
              >
                Verify Email
              </Link>
            </div>
          </>
        ) : (
          <>
          <div className="flex flex-col items-center mb-6">
            <Logo />
            <h1 className="text-3xl font-bold text-foreground mt-4 mb-1">Create Account</h1>
            <p className="text-sm text-muted-foreground">Join the Apex community</p>
          </div>

          {/* Card */}
          <div className="bg-card border border-card-border rounded-xl p-6">
            <form onSubmit={handleSubmit}>
              {/* First Name + Last Name */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleFormChange}
                    className="w-full bg-secondary text-foreground placeholder-muted-foreground px-3 py-2.5 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleFormChange}
                    className="w-full bg-secondary text-foreground placeholder-muted-foreground px-3 py-2.5 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

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
                  className="w-full bg-secondary text-foreground placeholder-muted-foreground px-3 py-2.5 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Password */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleFormChange}
                  className="w-full bg-secondary text-foreground placeholder-muted-foreground px-3 py-2.5 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Confirm Password */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleFormChange}
                  className="w-full bg-secondary text-foreground placeholder-muted-foreground px-3 py-2.5 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Message */}
              {message && (
                <p className="text-sm text-center mb-4 text-red-400">{message}</p>
              )}

              {/* Terms checkbox */}
              <div className="flex items-start gap-2 mb-5 text-sm text-muted-foreground">
                <input type="checkbox" className="mt-0.5 accent-blue-500" />
                <span>
                  I agree to ApexAuto's{' '}
                  <a href="/terms" className="text-blue-400 font-semibold hover:underline">Terms of Service</a>
                  {' '}and{' '}
                  <a href="/privacy" className="text-blue-400 font-semibold hover:underline">Privacy Policy</a>
                </span>
              </div>

              {/* Submit */}
              <Btn type="submit" fullWidth size="lg">Create Account</Btn>
            </form>
          </div>

          {/* Sign in link */}
          <p className="text-center text-sm text-gray-400 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 font-semibold hover:underline">Sign in</Link>
          </p>
        </>
        )}
      </div>
    </div>
  )
}