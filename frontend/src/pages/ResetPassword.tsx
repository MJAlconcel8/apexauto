import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function ResetPassword() {
  const [step, setStep] = useState<'reset' | 'done'>('reset')
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0d1b2e] px-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">
            {step === 'done' ? 'Password Reset' : 'Reset Password'}
          </h1>
          <p className="text-sm text-[#7a9cc0] text-center">
            {step === 'reset'
              ? 'Enter the token from your email and choose a new password'
              : 'Your password has been updated'}
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
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-[#7a9cc0] uppercase tracking-wider mb-1.5">
                  Reset Token
                </label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste token from your email"
                  required
                  className="w-full bg-[#1a2a3f] text-white placeholder-gray-500 px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
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
