import { ShieldX } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Btn } from '../components'
import Nav from '../components/Nav'
import { useAuth } from '../auth/AuthContext'

export default function Forbidden() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-[#030c1a] flex items-center justify-center px-6 pt-16 text-white">
        <section className="w-full max-w-lg rounded-2xl border border-card-border bg-card p-8 text-center shadow-2xl">
          <ShieldX className="mx-auto h-12 w-12 text-red-400" strokeWidth={1.5} />
          <p className="mt-5 font-mono text-xs uppercase tracking-[0.18em] text-red-300">Access denied</p>
          <h1 className="mt-2 font-heading text-3xl font-bold">You do not have permission to view this page.</h1>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            This area is restricted to an account with the required role.
          </p>
          <div className="mt-7 flex justify-center">
            <Btn onClick={() => navigate(isAuthenticated ? '/catalogue' : '/')}>Return to safety</Btn>
          </div>
        </section>
      </main>
    </>
  )
}
