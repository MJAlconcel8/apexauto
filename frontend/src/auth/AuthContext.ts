import { createContext, useContext } from 'react'

export type UserRole = 'USER' | 'ADMIN'

export interface AuthUser {
  userId: number
  firstName: string
  lastName: string
  email: string
  roleName: UserRole
}

export interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  refreshUser: () => Promise<AuthUser | null>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
