import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AuthContext } from './AuthContext'
import type { AuthContextValue, AuthUser } from './AuthContext'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080').replace(/\/$/, '')

function normalizeUser(value: unknown): AuthUser | null {
  if (!value || typeof value !== 'object') return null

  const candidate = value as Record<string, unknown>
  if (
    typeof candidate.userId !== 'number' ||
    typeof candidate.firstName !== 'string' ||
    typeof candidate.lastName !== 'string' ||
    typeof candidate.email !== 'string'
  ) {
    return null
  }

  const role = String(candidate.roleName ?? 'USER').replace(/^ROLE_/, '').toUpperCase()

  return {
    userId: candidate.userId,
    firstName: candidate.firstName,
    lastName: candidate.lastName,
    email: candidate.email,
    roleName: role === 'ADMIN' ? 'ADMIN' : 'USER',
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const userRef = useRef<AuthUser | null>(null)
  const authGenerationRef = useRef(0)
  const refreshRequestIdRef = useRef(0)

  const updateUser = useCallback((nextUser: AuthUser | null) => {
    userRef.current = nextUser
    setUser(nextUser)
  }, [])

  const refreshUser = useCallback(async () => {
    const generation = authGenerationRef.current
    const requestId = ++refreshRequestIdRef.current
    const isCurrentRequest = () => (
      generation === authGenerationRef.current && requestId === refreshRequestIdRef.current
    )

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        credentials: 'include',
        headers: { Accept: 'application/json' },
      })

      if (response.status === 401 || response.status === 403) {
        if (isCurrentRequest()) updateUser(null)
        return null
      }

      if (!response.ok) {
        return userRef.current
      }

      const authenticatedUser = normalizeUser(await response.json())
      if (isCurrentRequest()) updateUser(authenticatedUser)
      return isCurrentRequest() ? authenticatedUser : userRef.current
    } catch {
      // Keep the current session on network errors.
      return userRef.current
    } finally {
      setIsLoading(false)
    }
  }, [updateUser])

  const logout = useCallback(async () => {
    authGenerationRef.current += 1
    refreshRequestIdRef.current += 1

    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error('The server could not complete sign out.')
    }

    updateUser(null)
  }, [updateUser])

  useEffect(() => {
    const initialAuthCheck = window.setTimeout(() => {
      void refreshUser()
    }, 0)

    return () => window.clearTimeout(initialAuthCheck)
  }, [refreshUser])


  const value = useMemo<AuthContextValue>(() => ({
    user,
    isLoading,
    isAuthenticated: user !== null,
    isAdmin: user?.roleName === 'ADMIN',
    refreshUser,
    logout,
  }), [user, isLoading, refreshUser, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
