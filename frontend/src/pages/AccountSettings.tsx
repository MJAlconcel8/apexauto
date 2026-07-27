import { useCallback, useEffect, useState } from 'react'
import { BadgeCheck, KeyRound, Loader2, Lock, Mail, ShieldAlert, ShieldCheck, UserRound } from 'lucide-react'
import Nav from '../components/Nav'
import { Btn, FormField } from '../components'
import { useAuth } from '../auth/AuthContext'
import { getAccountStatus, requestPasswordReset, resetPassword, updateProfile, verifyEmail } from '../services/accountApi'
import type { AccountStatus } from '../services/accountApi'

type Message = { type: 'success' | 'error'; text: string } | null

function StatusPill({ ok, trueLabel, falseLabel }: { ok: boolean; trueLabel: string; falseLabel: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
        ok
          ? 'border-green-500/30 bg-green-500/10 text-green-400'
          : 'border-amber-500/30 bg-amber-500/10 text-amber-400'
      }`}
    >
      {ok ? <BadgeCheck size={14} /> : <ShieldAlert size={14} />}
      {ok ? trueLabel : falseLabel}
    </span>
  )
}

export default function AccountSettings() {
  const { user, refreshUser } = useAuth()

  const [profileFirstName, setProfileFirstName] = useState(user?.firstName ?? '')
  const [profileLastName, setProfileLastName] = useState(user?.lastName ?? '')
  const [profileEmail, setProfileEmail] = useState(user?.email ?? '')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileMessage, setProfileMessage] = useState<Message>(null)

  const [status, setStatus] = useState<AccountStatus | null>(null)
  const [statusLoading, setStatusLoading] = useState(true)
  const [statusError, setStatusError] = useState<string | null>(null)

  const [verifyToken, setVerifyToken] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [verifyMessage, setVerifyMessage] = useState<Message>(null)

  const [resetStep, setResetStep] = useState<'idle' | 'sent'>('idle')
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [sendingCode, setSendingCode] = useState(false)
  const [updatingPassword, setUpdatingPassword] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<Message>(null)

  const loadStatus = useCallback(async () => {
    if (!user) return
    setStatusLoading(true)
    setStatusError(null)
    try {
      const result = await getAccountStatus(user.email)
      setStatus(result)
    } catch {
      setStatusError('Could not load account status.')
    } finally {
      setStatusLoading(false)
    }
  }, [user])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadStatus()
    }, 0)
    return () => window.clearTimeout(timeoutId)
  }, [loadStatus])

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setProfileMessage(null)
    setSavingProfile(true)
    try {
      const updated = await updateProfile(profileFirstName.trim(), profileLastName.trim(), profileEmail.trim())
      setProfileFirstName(updated.firstName)
      setProfileLastName(updated.lastName)
      setProfileEmail(updated.email)
      await refreshUser()
      try {
        setStatus(await getAccountStatus(updated.email))
      } catch {
        // Account status card has its own refresh control; ignore here.
      }
      setProfileMessage({ type: 'success', text: 'Your profile has been updated.' })
    } catch (err) {
      setProfileMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Could not update your profile.',
      })
    } finally {
      setSavingProfile(false)
    }
  }

  const handleVerifyEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setVerifyMessage(null)
    setVerifying(true)
    try {
      await verifyEmail(verifyToken)
      setVerifyMessage({ type: 'success', text: 'Your email has been verified.' })
      setVerifyToken('')
      await Promise.all([loadStatus(), refreshUser()])
    } catch {
      setVerifyMessage({ type: 'error', text: 'Invalid or expired verification token.' })
    } finally {
      setVerifying(false)
    }
  }

  const handleSendResetCode = async () => {
    if (!user) return
    setPasswordMessage(null)
    setSendingCode(true)
    try {
      await requestPasswordReset(user.email)
      setResetStep('sent')
      setPasswordMessage({ type: 'success', text: `A reset code was sent to ${user.email}.` })
    } catch {
      setPasswordMessage({ type: 'error', text: 'Could not send a reset code. Please try again.' })
    } finally {
      setSendingCode(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPasswordMessage(null)

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Passwords do not match.' })
      return
    }

    setUpdatingPassword(true)
    try {
      await resetPassword(resetToken, newPassword)
      setPasswordMessage({ type: 'success', text: 'Your password has been updated.' })
      setResetStep('idle')
      setResetToken('')
      setNewPassword('')
      setConfirmPassword('')
    } catch {
      setPasswordMessage({ type: 'error', text: 'Invalid or expired reset code. Please request a new one.' })
    } finally {
      setUpdatingPassword(false)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />

      <main className="min-h-screen pt-16">
        <section className="border-b border-card-border bg-sub-header">
          <div className="mx-auto max-w-3xl px-6 py-6">
            <h1 className="font-heading text-3xl font-bold">Account Settings</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage your profile, verification, and password.</p>
          </div>
        </section>

        <div className="mx-auto max-w-3xl px-6 py-8 space-y-6">
          {/* Profile */}
          <section className="rounded-lg border border-card-border bg-card p-6">
            <div className="mb-5 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
                <UserRound className="h-7 w-7 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-semibold">Profile</h2>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-[#7eb3ff]">{user.roleName}</p>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile}>
              <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                <FormField
                  label="First Name"
                  type="text"
                  value={profileFirstName}
                  onChange={(e) => setProfileFirstName(e.target.value)}
                  required
                />
                <FormField
                  label="Last Name"
                  type="text"
                  value={profileLastName}
                  onChange={(e) => setProfileLastName(e.target.value)}
                  required
                />
              </div>
              <FormField
                label="Email Address"
                type="email"
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                required
              />
              {profileEmail.trim().toLowerCase() !== user.email.toLowerCase() && (
                <p className="mb-4 text-xs text-amber-400">
                  Changing your email will require you to verify the new address again.
                </p>
              )}
              <Btn type="submit" disabled={savingProfile}>
                {savingProfile ? 'Saving…' : 'Save Changes'}
              </Btn>
            </form>

            {profileMessage && (
              <p className={`mt-4 text-sm ${profileMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                {profileMessage.text}
              </p>
            )}
          </section>

          {/* Account status */}
          <section className="rounded-lg border border-card-border bg-card p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold">Account Status</h2>
              <button
                type="button"
                onClick={() => void loadStatus()}
                className="text-xs font-semibold text-blue-400 hover:underline"
              >
                Refresh
              </button>
            </div>

            {statusLoading ? (
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading status…
              </div>
            ) : statusError ? (
              <p className="mt-4 text-sm text-red-400">{statusError}</p>
            ) : status ? (
              <div className="mt-4 flex flex-wrap gap-2">
                <StatusPill ok={status.emailVerified} trueLabel="Email Verified" falseLabel="Email Not Verified" />
                <StatusPill ok={status.accountEnabled} trueLabel="Account Enabled" falseLabel="Account Disabled" />
                <StatusPill ok={!status.accountLocked} trueLabel="Account Unlocked" falseLabel="Account Locked" />
              </div>
            ) : null}

            {status && !status.emailVerified && (
              <form onSubmit={handleVerifyEmail} className="mt-5 border-t border-card-border pt-5">
                <p className="mb-3 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Mail size={15} /> Paste the verification token from your email to confirm your address.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <FormField
                    label="Verification Token"
                    type="text"
                    value={verifyToken}
                    onChange={(e) => setVerifyToken(e.target.value)}
                    placeholder="Paste token from your email"
                    required
                    wrapperClassName="flex-1 mb-0"
                  />
                  <Btn type="submit" disabled={verifying}>
                    {verifying ? 'Verifying…' : 'Verify Email'}
                  </Btn>
                </div>
                {verifyMessage && (
                  <p className={`mt-3 text-sm ${verifyMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                    {verifyMessage.text}
                  </p>
                )}
              </form>
            )}
          </section>

          {/* Change password */}
          <section className="rounded-lg border border-card-border bg-card p-6">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <KeyRound size={17} /> Change Password
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              We will send a reset code to your email. Enter it below along with your new password.
            </p>

            {resetStep === 'idle' ? (
              <div className="mt-4">
                <Btn onClick={() => void handleSendResetCode()} disabled={sendingCode}>
                  {sendingCode ? 'Sending…' : 'Send Reset Code'}
                </Btn>
              </div>
            ) : (
              <form onSubmit={handleUpdatePassword} className="mt-4">
                <FormField
                  label="Reset Code"
                  type="text"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  placeholder="Paste the code from your email"
                  required
                />
                <FormField
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <FormField
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  wrapperClassName="mb-5"
                />
                <div className="flex flex-wrap items-center gap-3">
                  <Btn type="submit" disabled={updatingPassword}>
                    {updatingPassword ? 'Updating…' : 'Update Password'}
                  </Btn>
                  <button
                    type="button"
                    onClick={() => void handleSendResetCode()}
                    className="text-xs font-semibold text-blue-400 hover:underline"
                  >
                    Resend code
                  </button>
                </div>
              </form>
            )}

            {passwordMessage && (
              <p className={`mt-4 flex items-center gap-1.5 text-sm ${passwordMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                {passwordMessage.type === 'success' ? <ShieldCheck size={15} /> : <Lock size={15} />}
                {passwordMessage.text}
              </p>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
