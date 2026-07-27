import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

interface AuthShellProps {
  children: ReactNode
  toast?: string | null
}

export function AuthShell({ children, toast }: AuthShellProps) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4">
      <button
        type="button"
        onClick={() => navigate('/')}
        className="fixed top-6 left-4 sm:left-6 flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft size={16} /> Back to Landing Page
      </button>

      <div className="w-full max-w-sm">
        {children}
      </div>

      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-foreground text-background text-sm px-4 py-2 rounded-lg shadow-lg z-50 pointer-events-none">
          {toast}
        </div>
      )}
    </div>
  )
}
