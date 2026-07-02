import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Registration() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const [message, setMessage] = useState('')

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
        const token = data.emailVerificationToken
        const verifyResponse = await fetch(`http://localhost:8080/auth/verify-email?token=${encodeURIComponent(token)}`)
        if (verifyResponse.ok) {
          setIsLoggedIn(true)
          setMessage('Registration successful! Your account is now active.')
        } else {
          setMessage('Registered, but email verification failed. Please try again.')
        }
      } else {
        setMessage(data.error || 'Registration failed. Please try again.')
      }
    } catch {
      setMessage('An error occurred. Please try again later.')
    }
  }


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0d1b2e] px-4">
      {isLoggedIn ? (
        <p className="text-green-400">You are already logged in.</p>
      ) : (
        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="flex flex-col items-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-1">Create Account</h1>
            <p className="text-sm text-[#7a9cc0]">Join the Apex community</p>
          </div>

          {/* Card */}
          <div className="bg-[#0f2035] border border-[#1e3a5f] rounded-xl p-6">
            <form onSubmit={handleSubmit}>
              {/* First Name + Last Name */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-[#7a9cc0] uppercase tracking-wider mb-1.5">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleFormChange}
                    className="w-full bg-[#1a2a3f] text-white placeholder-gray-500 px-3 py-2.5 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#7a9cc0] uppercase tracking-wider mb-1.5">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleFormChange}
                    className="w-full bg-[#1a2a3f] text-white placeholder-gray-500 px-3 py-2.5 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-[#7a9cc0] uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  className="w-full bg-[#1a2a3f] text-white placeholder-gray-500 px-3 py-2.5 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Password */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-[#7a9cc0] uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleFormChange}
                  className="w-full bg-[#1a2a3f] text-white placeholder-gray-500 px-3 py-2.5 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Confirm Password */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-[#7a9cc0] uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleFormChange}
                  className="w-full bg-[#1a2a3f] text-white placeholder-gray-500 px-3 py-2.5 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Message */}
              {message && (
                <p className="text-sm text-center mb-4 text-red-400">{message}</p>
              )}

              {/* Terms checkbox */}
              <div className="flex items-start gap-2 mb-5 text-sm text-gray-400">
                <input type="checkbox" className="mt-0.5 accent-blue-500" />
                <span>
                  I agree to ApexAuto's{' '}
                  <a href="/terms" className="text-blue-400 font-semibold hover:underline">Terms of Service</a>
                  {' '}and{' '}
                  <a href="/privacy" className="text-blue-400 font-semibold hover:underline">Privacy Policy</a>
                </span>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-md transition-colors"
              >
                Create Account
              </button>
            </form>
          </div>

          {/* Sign in link */}
          <p className="text-center text-sm text-gray-400 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      )}
    </div>
  )
}