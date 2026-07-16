import type { ReactNode } from 'react'

interface AuthCardProps {
  children: ReactNode
}

export function AuthCard({ children }: AuthCardProps) {
  return (
    <div className="bg-card border border-card-border rounded-2xl p-6">
      {children}
    </div>
  )
}
