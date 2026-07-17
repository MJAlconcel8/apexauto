import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { LogOut, ShieldCheck, ShoppingCart, UserRound, ZapIcon } from 'lucide-react'
import type { GoFn, ViewParams } from './types'
import { useAuth } from '../auth/AuthContext'

const signedInNavLinks = [
  { label: 'Home', view: '/home' },
  { label: 'Catalogue', view: '/catalogue' },
  { label: 'Compare', view: '/compare' },
  { label: 'Loan Calc', view: '/finance' },
]

const guestNavLinks = [
  { label: 'Home', view: '/' },
  { label: 'Catalogue', view: '/guest-catalogue' },
  { label: 'Compare', view: '/compare' },
  { label: 'Loan Calc', view: '/finance' },
]

const adminLinks = [
  { label: 'Dashboard', view: '/admin/dashboard' },
  { label: 'Users', view: '/admin/users' },
  { label: 'Listings', view: '/admin/listings' },
]

interface NavProps { onNavigate?: GoFn }

export default function Nav({ onNavigate }: NavProps) {
  const [adminOpen, setAdminOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [logoutError, setLogoutError] = useState<string | null>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const navLinks = isAuthenticated ? signedInNavLinks : guestNavLinks

  useEffect(() => {
    if (!isAuthenticated) return

    const fetchCartCount = () => {
      fetch('http://localhost:8080/users/me/carts/active', {
        credentials: 'include',
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => setCartCount(data?.totalItemsInCart ?? 0))
        .catch(() => setCartCount(0))
    }

    fetchCartCount()
    window.addEventListener('cart-updated', fetchCartCount)
    return () => window.removeEventListener('cart-updated', fetchCartCount)
  }, [isAuthenticated, location.pathname])

  const go: GoFn = (view: string, params?: ViewParams) => {
    setAdminOpen(false)
    setAccountOpen(false)
    setMobileOpen(false)
    if (typeof onNavigate === 'function') return onNavigate(view, params)
    navigate(view)
  }

  const handleLogout = async () => {
    setLogoutError(null)

    try {
      await logout()
      setAdminOpen(false)
      setAccountOpen(false)
      setMobileOpen(false)
      navigate('/login', { replace: true })
    } catch {
      setLogoutError('Could not log out. Check the backend connection and try again.')
    }
  }

  const isActive = (view: string) => location.pathname === view

  return (
    <nav
      className="fixed top-0 inset-x-0 h-16 z-50 border-b border-card-border text-muted-foreground"
      style={{ background: 'rgba(3,12,26,0.92)', backdropFilter: 'blur(20px)' }}
    >
      <div className="h-full px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <button onClick={() => go(isAuthenticated ? '/home' : '/')} className="group flex items-center gap-2.5">
            <div
              className="w-8 h-8 flex items-center justify-center bg-[#0066ff] shadow-[0_0_16px_rgba(0,102,255,0.5)] group-hover:shadow-[0_0_24px_rgba(0,102,255,0.7)] transition-shadow"
              style={{ borderRadius: '6px' }}
            >
              <ZapIcon size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-[0.15em] uppercase font-heading">
              <span className="text-foreground">Apex</span>
              <span className="text-[#0066ff]">Auto</span>
            </span>
          </button>

          <ul className="hidden lg:flex items-center gap-1 text-sm font-medium">
            {navLinks.map((link) => (
              <li key={link.label}>
                <button
                  onClick={() => go(link.view)}
                  className={`px-3 py-1.5 rounded transition-colors ${
                    isActive(link.view)
                      ? 'bg-[#0066ff]/10 text-[#7eb3ff]'
                      : 'hover:text-white'
                  }`}
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <button onClick={() => go('/chatbot')} className="hidden sm:block hover:text-white transition-colors" aria-label="Open chatbot">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
            </svg>
          </button>

          {isAdmin && (
            <div className="relative hidden md:block">
              <button
                onClick={() => { setAdminOpen((open) => !open); setAccountOpen(false) }}
                className="flex items-center gap-1.5 text-sm hover:text-white transition-colors"
              >
                <ShieldCheck size={16} strokeWidth={1.5} />
                Admin
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              {adminOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-card border border-card-border rounded shadow-lg z-50 text-sm">
                  {adminLinks.map((link) => (
                    <button
                      key={link.label}
                      onClick={() => go(link.view)}
                      className="block w-full text-left px-4 py-2 hover:bg-secondary"
                    >
                      {link.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {isAuthenticated && (
            <button onClick={() => go('/cart')} className="relative hover:text-white transition-colors" aria-label="Open cart">
              <ShoppingCart className="h-5 w-5" strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-0.5 rounded-full bg-[#0066ff] text-white text-[10px] font-bold leading-4 text-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>
          )}

          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => { setAccountOpen((open) => !open); setAdminOpen(false) }}
                className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center hover:bg-card-border transition-colors"
                aria-label="Open account menu"
              >
                <UserRound className="h-5 w-5" strokeWidth={1.5} />
              </button>
              {accountOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded border border-card-border bg-card p-2 shadow-lg z-50">
                  <div className="px-3 py-2 border-b border-card-border">
                    <p className="text-sm font-semibold text-foreground truncate">{user?.firstName} {user?.lastName}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground truncate">{user?.email}</p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-[#7eb3ff]">{user?.roleName}</p>
                  </div>
                  <button
                    onClick={() => void handleLogout()}
                    className="mt-1 flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm hover:bg-secondary hover:text-foreground"
                  >
                    <LogOut size={16} /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => go('/login')}
              className="rounded bg-[#0066ff] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#1d75ff] transition-colors"
            >
              Sign in
            </button>
          )}

          {isAuthenticated && (
            <button
              onClick={() => void handleLogout()}
              className="hidden sm:flex items-center gap-1.5 rounded border border-card-border px-3 py-1.5 text-sm font-medium hover:border-[#0066ff] hover:text-white transition-colors"
            >
              <LogOut size={15} /> Log out
            </button>
          )}

          <button
            onClick={() => setMobileOpen((open) => !open)}
            className="lg:hidden hover:text-white transition-colors ml-1"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div
          className="lg:hidden border-t border-card-border px-4 py-3 flex flex-col gap-1 text-sm"
          style={{ background: 'rgba(3,12,26,0.97)', backdropFilter: 'blur(20px)' }}
        >
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => go(link.view)}
              className={`py-2 px-2 rounded transition-colors text-left ${
                isActive(link.view)
                  ? 'bg-[#0066ff]/10 text-[#7eb3ff]'
                  : 'hover:bg-secondary hover:text-foreground'
              }`}
            >
              {link.label}
            </button>
          ))}

          {isAdmin && (
            <div className="border-t border-card-border mt-2 pt-2">
              <p className="px-2 py-1 text-xs text-muted-foreground uppercase tracking-widest">Admin</p>
              {adminLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => go(link.view)}
                  className="block w-full text-left py-2 px-2 rounded hover:bg-secondary hover:text-foreground transition-colors"
                >
                  {link.label}
                </button>
              ))}
            </div>
          )}

          {isAuthenticated ? (
            <button
              onClick={() => void handleLogout()}
              className="mt-2 flex items-center gap-2 border-t border-card-border pt-3 text-left px-2 text-[#7eb3ff] hover:text-white"
            >
              <LogOut size={16} /> Log out
            </button>
          ) : (
            <button
              onClick={() => go('/register')}
              className="mt-2 border-t border-card-border pt-3 text-left px-2 text-[#7eb3ff] hover:text-white"
            >
              Create account
            </button>
          )}
        </div>
      )}

      {logoutError && (
        <div
          role="alert"
          className="fixed right-4 top-20 max-w-sm rounded border border-red-400/40 bg-[#1a0710] px-4 py-3 text-sm text-red-200 shadow-lg"
        >
          {logoutError}
        </div>
      )}
    </nav>
  )
}
