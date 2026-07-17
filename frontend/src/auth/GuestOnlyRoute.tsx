import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

interface GuestOnlyRouteProps {
  children: React.ReactNode
  redirectTo?: string
}

export default function GuestOnlyRoute({ children, redirectTo = '/catalogue' }: GuestOnlyRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#030c1a] flex items-center justify-center text-white">
        <div className="text-center">
          <div className="h-9 w-9 mx-auto rounded-full border-2 border-[#0066ff] border-t-transparent animate-spin" />
          <p className="mt-4 text-sm text-[rgba(126,179,255,0.75)]">Restoring your session…</p>
        </div>
      </main>
    )
  }

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  return children
}
