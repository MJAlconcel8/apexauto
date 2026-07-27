const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '')

export interface AccountStatus {
  emailVerified: boolean
  accountEnabled: boolean
  accountLocked: boolean
}

// GET /auth/account-status?email= — check whether an account is enabled, verified, or locked
export async function getAccountStatus(email: string): Promise<AccountStatus> {
  const res = await fetch(`${API_BASE}/auth/account-status?email=${encodeURIComponent(email)}`, {
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Could not load account status.')
  return res.json() as Promise<AccountStatus>
}

// GET /auth/verify-email?token= — verify a user's email address
export async function verifyEmail(token: string): Promise<void> {
  const res = await fetch(`${API_BASE}/auth/verify-email?token=${encodeURIComponent(token)}`)
  if (!res.ok) throw new Error('Invalid or expired verification token.')
}

// POST /auth/forgot-password — generate a password reset token, emailed to the account
export async function requestPasswordReset(email: string): Promise<void> {
  const res = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  if (!res.ok) throw new Error('Could not send a reset code. Please try again.')
}

export interface UpdatedProfile {
  userId: number
  firstName: string
  lastName: string
  email: string
  roleName: string
}

// PATCH /auth/me — update the signed-in user's first name, last name, and/or email.
// Changing the email marks it unverified again and triggers a new verification email.
export async function updateProfile(
  firstName: string,
  lastName: string,
  email: string,
): Promise<UpdatedProfile> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ firstName, lastName, email }),
  })
  if (!res.ok) {
    if (res.status === 409) throw new Error('That email is already in use by another account.')
    throw new Error('Could not update your profile. Please check your details and try again.')
  }
  return res.json() as Promise<UpdatedProfile>
}

// POST /auth/reset-password — reset a password using a token
export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const res = await fetch(`${API_BASE}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword }),
  })
  if (!res.ok) throw new Error('Invalid or expired reset token.')
}
