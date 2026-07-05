import { useState } from 'react'
import { Link } from 'react-router-dom'
import Logo from '../components/Logo'

export default function VerifyEmail() {
  const [step, setStep] = useState<'verify' | 'done'>('verify')
  const [token, setToken] = useState('')
  const [message, setMessage] = useState('')

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">          <Logo />          <h1 className="text-3xl font-bold text-foreground mb-1">
            {step === 'done' ? 'Email Verified' : 'Verify Your Email'}
          </h1>
          <p className="text-sm text-muted-foreground text-center">
            {step === 'verify'
              ? 'Check your inbox and paste the verification token below'
              : 'Your email address has been confirmed'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-card border border-card-border rounded-2xl p-6">
          {step === 'done' ? (
            <div className="flex flex-col items-center py-4 gap-3">
              <div className="w-12 h-12 bg-green-600/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-foreground font-semibold text-center">All done!</p>
              <p className="text-sm text-muted-foreground text-center">You can now sign in to your account.</p>
              <Link
                to="/login"
                className="mt-2 w-full text-center bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
                  Verification Token
                </label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste token from your email"
                  required
                  className="w-full bg-secondary text-foreground placeholder-muted-foreground px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              {message && <p className="text-sm text-center mb-4 text-red-400">{message}</p>}
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Verify Email
              </button>
            </form>
          )}
        </div>

        {step !== 'done' && (
          <p className="text-center text-sm text-muted-foreground mt-5">
            Already verified?{' '}
            <Link to="/login" className="text-blue-400 font-bold hover:underline">Sign in</Link>
          </p>
        )}
      </div>
    </div>
  )
}
