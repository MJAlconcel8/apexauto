import { useNavigate } from 'react-router-dom'
import { Btn } from '../components'
import Nav from '../components/Nav'
import { useAuth } from '../auth/AuthContext'

export default function NotFound() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-[#030c1a] flex items-center justify-center px-6 pt-16 text-white">
        <section className="w-full max-w-lg rounded-2xl border border-card-border bg-card p-8 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#7eb3ff]">404</p>
          <h1 className="mt-2 font-heading text-3xl font-bold">Page not found</h1>
          <p className="mt-4 text-sm text-muted-foreground">The address may be incorrect or the page may have moved.</p>
          <div className="mt-7 flex justify-center">
            <Btn onClick={() => navigate(isAuthenticated ? '/catalogue' : '/')}>Go to ApexAuto</Btn>
          </div>
        </section>
      </main>
    </>
  )
}
