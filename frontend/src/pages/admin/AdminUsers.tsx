import { useEffect, useMemo, useState } from 'react'
import { Loader2, ShieldCheck, ShieldOff, Trash2, Users as UsersIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Nav from '../../components/Nav'
import { ConfirmModal } from '../../components'
import { useAuth } from '../../auth/AuthContext'

interface UserData {
  userId: number
  firstName: string
  lastName: string
  email: string
  roleName: string
  emailVerified: boolean
  accountEnabled: boolean
  accountLocked: boolean
  restrictedUntil: string | null
  createdAt: string | null
}

const RESTRICTION_OPTIONS = [
  { label: 'Restrict for 1 Hour', ms: 60 * 60 * 1000 },
  { label: 'Restrict for 1 Day', ms: 24 * 60 * 60 * 1000 },
  { label: 'Restrict for 3 Days', ms: 3 * 24 * 60 * 60 * 1000 },
  { label: 'Restrict for 7 Days', ms: 7 * 24 * 60 * 60 * 1000 },
  { label: 'Restrict for 30 Days', ms: 30 * 24 * 60 * 60 * 1000 },
]

const fmtDate = (value: string | null) =>
  value
    ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—'

const fmtDateTime = (value: string | null) =>
  value
    ? new Date(value).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : '—'

export default function AdminUsers() {
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<UserData[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [busyUserId, setBusyUserId] = useState<number | null>(null)
  const [restrictResetKeys, setRestrictResetKeys] = useState<Record<number, number>>({})
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [pendingRoleChange, setPendingRoleChange] = useState<UserData | null>(null)
  const [pendingRestriction, setPendingRestriction] = useState<{ user: UserData; rawValue: string } | null>(null)

  useEffect(() => {
    fetch('http://localhost:8080/admin/users', { credentials: 'include' })
      .then((res) => {
        if (res.status === 401) {
          navigate('/login')
          return null
        }
        if (res.status === 403) {
          navigate('/forbidden')
          return null
        }
        if (!res.ok) throw new Error('Failed to load user accounts.')
        return res.json() as Promise<UserData[]>
      })
      .then((data) => {
        if (data) setUsers(data)
        setLoading(false)
      })
      .catch(() => {
        setError('Could not load user accounts. Please try again.')
        setLoading(false)
      })
  }, [navigate])

  const list = useMemo(
    () => (users ?? []).slice().sort((a, b) => a.userId - b.userId),
    [users]
  )

  const bumpResetKey = (userId: number) => {
    setRestrictResetKeys((prev) => ({ ...prev, [userId]: (prev[userId] ?? 0) + 1 }))
  }

  const restrictionLabel = (rawValue: string) =>
    rawValue === 'clear'
      ? 'Remove restriction'
      : RESTRICTION_OPTIONS.find((opt) => String(opt.ms) === rawValue)?.label ?? 'Update restriction'

  const handleRoleToggle = async (targetUser: UserData) => {
    const nextRole = targetUser.roleName === 'ADMIN' ? 'USER' : 'ADMIN'
    setBusyUserId(targetUser.userId)
    setActionError(null)

    try {
      const res = await fetch(`http://localhost:8080/admin/users/${targetUser.userId}/role`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleName: nextRole }),
      })

      if (res.status === 401) {
        navigate('/login')
        return
      }
      if (res.status === 403) {
        navigate('/forbidden')
        return
      }
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.message ?? 'Failed to update role.')
      }

      const updated = (await res.json()) as UserData
      setUsers((prev) => (prev ? prev.map((u) => (u.userId === updated.userId ? updated : u)) : prev))
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to update role.')
    } finally {
      setBusyUserId(null)
    }
  }

  const handleRestrictChange = async (targetUser: UserData, rawValue: string) => {
    if (!rawValue) return

    const restrictedUntil =
      rawValue === 'clear'
        ? null
        : new Date(Date.now() + Number(rawValue)).toISOString()

    setBusyUserId(targetUser.userId)
    setActionError(null)

    try {
      const res = await fetch(`http://localhost:8080/admin/users/${targetUser.userId}/restrict`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restrictedUntil }),
      })

      if (res.status === 401) {
        navigate('/login')
        return
      }
      if (res.status === 403) {
        navigate('/forbidden')
        return
      }
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.message ?? 'Failed to update restriction.')
      }

      const updated = (await res.json()) as UserData
      setUsers((prev) => (prev ? prev.map((u) => (u.userId === updated.userId ? updated : u)) : prev))
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to update restriction.')
    } finally {
      setBusyUserId(null)
      bumpResetKey(targetUser.userId)
    }
  }

  const confirmRoleChange = async () => {
    if (!pendingRoleChange) return
    const target = pendingRoleChange
    setPendingRoleChange(null)
    await handleRoleToggle(target)
  }

  const confirmRestriction = async () => {
    if (!pendingRestriction) return
    const { user, rawValue } = pendingRestriction
    setPendingRestriction(null)
    await handleRestrictChange(user, rawValue)
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return
    setDeleting(true)
    setActionError(null)

    try {
      const res = await fetch(`http://localhost:8080/admin/users/${userToDelete.userId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (res.status === 401) {
        navigate('/login')
        return
      }
      if (res.status === 403) {
        navigate('/forbidden')
        return
      }
      if (!res.ok && res.status !== 204) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.message ?? 'Failed to delete account.')
      }

      setUsers((prev) => (prev ? prev.filter((u) => u.userId !== userToDelete.userId) : prev))
      setUserToDelete(null)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete account.')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Nav />
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="animate-spin text-[#0066ff]" size={32} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />

      <main className="min-h-screen pt-16">
        <section className="border-b border-card-border bg-sub-header">
          <div className="mx-auto max-w-6xl px-6 py-6">
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-[#7eb3ff]">
              <ShieldCheck size={16} /> Admin only
            </div>
            <h1 className="mt-2 font-heading text-3xl font-bold">User Management</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {list.length} registered {list.length === 1 ? 'account' : 'accounts'}
            </p>
          </div>
        </section>

        {(error || actionError) && (
          <div className="mx-auto max-w-6xl px-6 pt-6">
            {error && <p className="text-sm text-red-400">{error}</p>}
            {actionError && <p className="text-sm text-red-400">{actionError}</p>}
          </div>
        )}

        {list.length === 0 ? (
          <section className="mx-auto flex min-h-[calc(100vh-9rem)] max-w-6xl items-start justify-center px-6 pt-28">
            <div className="flex flex-col items-center text-center">
              <UsersIcon aria-hidden="true" className="text-card-border" size={48} strokeWidth={1.4} />
              <p className="mt-5 text-sm text-muted-foreground">No accounts have registered yet.</p>
            </div>
          </section>
        ) : (
          <section className="mx-auto max-w-6xl px-6 py-8">
            <div className="overflow-x-auto rounded-xl border border-card-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-card-border text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-5 py-3">User</th>
                    <th className="px-5 py-3">Role</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Joined</th>
                    <th className="px-5 py-3">Restrict</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {list.map((u) => {
                    const isSelf = currentUser?.userId === u.userId
                    const isBusy = busyUserId === u.userId
                    const isRestricted = !!u.restrictedUntil && new Date(u.restrictedUntil) > new Date()

                    return (
                      <tr key={u.userId} className="border-b border-card-border last:border-b-0">
                        <td className="px-5 py-4">
                          <p className="font-medium text-foreground">
                            {u.firstName} {u.lastName} {isSelf && <span className="text-muted-foreground">(You)</span>}
                          </p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                              u.roleName === 'ADMIN'
                                ? 'border-[#0066ff]/30 bg-[#0066ff]/10 text-[#7eb3ff]'
                                : 'border-card-border bg-secondary text-muted-foreground'
                            }`}
                          >
                            {u.roleName}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            <span
                              className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                                u.emailVerified
                                  ? 'border-green-500/30 bg-green-500/10 text-green-400'
                                  : 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                              }`}
                            >
                              {u.emailVerified ? 'Verified' : 'Unverified'}
                            </span>
                            {u.accountLocked && (
                              <span className="rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-red-400">
                                Locked
                              </span>
                            )}
                            {isRestricted && (
                              <span className="rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-red-400">
                                Restricted until {fmtDateTime(u.restrictedUntil)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">{fmtDate(u.createdAt)}</td>
                        <td className="px-5 py-4">
                          <select
                            key={`restrict-${u.userId}-${restrictResetKeys[u.userId] ?? 0}`}
                            defaultValue=""
                            disabled={isSelf || isBusy}
                            onChange={(e) => {
                              const rawValue = e.target.value
                              if (!rawValue) return
                              bumpResetKey(u.userId)
                              setPendingRestriction({ user: u, rawValue })
                            }}
                            className="rounded-md border border-card-border bg-secondary px-2 py-1.5 text-xs text-foreground outline-none disabled:opacity-50"
                          >
                            <option value="" disabled>
                              {isRestricted ? 'Change restriction…' : 'Select duration…'}
                            </option>
                            {RESTRICTION_OPTIONS.map((opt) => (
                              <option key={opt.label} value={opt.ms}>
                                {opt.label}
                              </option>
                            ))}
                            {isRestricted && (
                              <option value="clear">Remove restriction</option>
                            )}
                          </select>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {isBusy && <Loader2 size={14} className="animate-spin text-muted-foreground" />}
                            <button
                              type="button"
                              disabled={isSelf || isBusy}
                              onClick={() => setPendingRoleChange(u)}
                              className="inline-flex items-center gap-1.5 rounded-md border border-card-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:border-[#0066ff]/50 hover:text-[#7eb3ff] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {u.roleName === 'ADMIN' ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
                              {u.roleName === 'ADMIN' ? 'Revoke Admin' : 'Make Admin'}
                            </button>
                            <button
                              type="button"
                              disabled={isSelf || isBusy}
                              onClick={() => setUserToDelete(u)}
                              className="inline-flex items-center gap-1.5 rounded-md border border-card-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:border-red-500/50 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      <ConfirmModal
        open={userToDelete != null}
        title="Delete this account?"
        message={
          userToDelete
            ? `This will permanently delete ${userToDelete.firstName} ${userToDelete.lastName}'s account. This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete Account"
        danger
        loading={deleting}
        onConfirm={() => void handleDeleteUser()}
        onCancel={() => setUserToDelete(null)}
      />

      <ConfirmModal
        open={pendingRoleChange != null}
        title={pendingRoleChange?.roleName === 'ADMIN' ? 'Revoke admin access?' : 'Grant admin access?'}
        message={
          pendingRoleChange
            ? pendingRoleChange.roleName === 'ADMIN'
              ? `This will revoke admin access from ${pendingRoleChange.firstName} ${pendingRoleChange.lastName}. They'll be downgraded to a regular user account.`
              : `This will grant admin access to ${pendingRoleChange.firstName} ${pendingRoleChange.lastName}, allowing them to manage users, orders, and inventory.`
            : ''
        }
        confirmLabel={pendingRoleChange?.roleName === 'ADMIN' ? 'Revoke Admin' : 'Make Admin'}
        danger={pendingRoleChange?.roleName === 'ADMIN'}
        loading={busyUserId === pendingRoleChange?.userId}
        onConfirm={() => void confirmRoleChange()}
        onCancel={() => setPendingRoleChange(null)}
      />

      <ConfirmModal
        open={pendingRestriction != null}
        title={pendingRestriction?.rawValue === 'clear' ? 'Remove restriction?' : 'Restrict this account?'}
        message={
          pendingRestriction
            ? pendingRestriction.rawValue === 'clear'
              ? `This will remove the active restriction on ${pendingRestriction.user.firstName} ${pendingRestriction.user.lastName}'s account, allowing them to sign in immediately.`
              : `This will restrict ${pendingRestriction.user.firstName} ${pendingRestriction.user.lastName}'s account (${restrictionLabel(pendingRestriction.rawValue)}). They won't be able to sign in until the restriction lifts.`
            : ''
        }
        confirmLabel={pendingRestriction ? restrictionLabel(pendingRestriction.rawValue) : 'Confirm'}
        danger={pendingRestriction?.rawValue !== 'clear'}
        loading={busyUserId === pendingRestriction?.user.userId}
        onConfirm={() => void confirmRestriction()}
        onCancel={() => setPendingRestriction(null)}
      />
    </div>
  )
}
