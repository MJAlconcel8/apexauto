import { Navigate, useLocation } from 'react-router-dom'
import type { UserRole } from './AuthContext'
import { useAuth } from './AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#030c1a] flex items-center justify-center text-white">
        <div className="text-center">
          <div className="h-9 w-9 mx-auto rounded-full border-2 border-[#0066ff] border-t-transparent animate-spin" />
          <p className="mt-4 text-sm text-[rgba(126,179,255,0.75)]">Checking access…</p>
        </div>
      </main>
    )
  }

  if (!user) {
    const returnTo = `${location.pathname}${location.search}${location.hash}`
    return <Navigate to="/login" replace state={{ ...location.state, returnTo }} />
  }

  if (allowedRoles && !allowedRoles.includes(user.roleName)) {
    return <Navigate to="/forbidden" replace />
  }

  return children
}
