import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function ForgotPassword() {
  const [step, setStep] = useState<'email' | 'reset' | 'done'>('email')
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')

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
        const data = await response.json()
        setToken(data.token)
        setStep('reset')
      } else {
        setMessage('No account found with that email address.')
      }
    } catch {
      setMessage('An error occurred. Please try again later.')
    }
  }

  const handleResetSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
        setMessage('Password reset failed. Please try again.')
      }
    } catch {
      setMessage('An error occurred. Please try again later.')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0d1b2e] px-4">
      <div className="w-full max-w-sm">
        {/* Logo + Header */}
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">
            {step === 'done' ? 'Password Reset' : 'Forgot Password'}
          </h1>
          <p className="text-sm text-[#7a9cc0] text-center">
            {step === 'email' && 'Enter your email to get started'}
            {step === 'reset' && `Setting new password for ${email}`}
            {step === 'done' && 'Your password has been updated'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#0f2035] border border-[#1e3a5f] rounded-2xl p-6">
          {step === 'done' ? (
            <div className="flex flex-col items-center py-4 gap-3">
              <div className="w-12 h-12 bg-green-600/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-white font-semibold text-center">All done!</p>
              <p className="text-sm text-gray-400 text-center">You can now sign in with your new password.</p>
              <Link
                to="/login"
                className="mt-2 w-full text-center bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Sign In
              </Link>
            </div>
          ) : step === 'email' ? (
            <form onSubmit={handleEmailSubmit}>
              <div className="mb-5">
                <label className="block text-xs font-semibold text-[#7a9cc0] uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-[#1a2a3f] text-white placeholder-gray-500 px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              {message && <p className="text-sm text-center mb-4 text-red-400">{message}</p>}
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Continue
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetSubmit}>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-[#7a9cc0] uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full bg-[#1a2a3f] text-white placeholder-gray-500 px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="mb-5">
                <label className="block text-xs font-semibold text-[#7a9cc0] uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full bg-[#1a2a3f] text-white placeholder-gray-500 px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              {message && <p className="text-sm text-center mb-4 text-red-400">{message}</p>}
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Reset Password
              </button>
            </form>
          )}
        </div>

        {/* Back to login */}
        {step !== 'done' && (
          <p className="text-center text-sm text-[#7a9cc0] mt-5">
            Remember your password?{' '}
            <Link to="/login" className="text-blue-400 font-bold hover:underline">Sign in</Link>
          </p>
        )}
      </div>
    </div>
  )
}
