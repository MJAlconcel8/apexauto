import { useState} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ZapIcon } from 'lucide-react'
import type { GoFn, ViewParams } from './types'

const navLinks = [
  { label: 'Home', view: '/home' },
  { label: 'Catalogue', view: '/catalogue' },
  { label: 'Compare', view: '/compare' },
  { label: 'Loan Calc', view: '/loan-calc' },
]

const adminLinks = [
  { label: 'Dashboard', view: '/admin/dashboard' },
  { label: 'Users', view: '/admin/users' },
  { label: 'Listings', view: '/admin/listings' },
]

interface NavProps { onNavigate?: GoFn }

export default function Nav({ onNavigate }: NavProps) {
  const [adminOpen, setAdminOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()


  const go: GoFn = (view: string, params?: ViewParams) => {
    if (typeof onNavigate === 'function') return onNavigate(view, params)
    navigate(view)
  }

  const isActive = (view: string) => location.pathname === view

  return (
    <nav
      className="fixed top-0 inset-x-0 h-16 z-50 border-b border-card-border text-muted-foreground"
      style={{ background: 'rgba(3,12,26,0.92)', backdropFilter: 'blur(20px)' }}
    >
      {/* Main bar */}
      <div className="h-full px-4 sm:px-6 flex items-center justify-between">
        {/* Left: Logo + Desktop Links */}
        <div className="flex items-center gap-8">
          {/* Logo */}
          <button onClick={() => go('/')} className="group flex items-center gap-2.5">
            <div
              className="w-8 h-8 flex items-center justify-center bg-[#0066ff] shadow-[0_0_16px_rgba(0,102,255,0.5)] group-hover:shadow-[0_0_24px_rgba(0,102,255,0.7)] transition-shadow"
              style={{ borderRadius: '6px' }}
            >
              <ZapIcon size={16} className="text-white" />
            </div>
            <span
              className="text-lg font-bold tracking-[0.15em] uppercase font-heading"
            >
              <span className="text-foreground">Apex</span>
              <span className="text-[#0066ff]">Auto</span>
            </span>
          </button>

          {/* Desktop nav links */}
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

        {/* Right: Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Chat — hidden on smallest screens */}
          <button className="hidden sm:block hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
            </svg>
          </button>

          {/* Admin dropdown — hidden on mobile */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setAdminOpen((o) => !o)}
              className="flex items-center gap-1.5 text-sm hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
              </svg>
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
                    onClick={() => { go(link.view); setAdminOpen(false) }}
                    className="block w-full text-left px-4 py-2 hover:bg-secondary"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications */}
          <button className="relative hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
            </svg>
          </button>

          {/* User avatar */}
          <button className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center hover:bg-card-border transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
          </button>

          {/* Hamburger — visible on mobile/tablet */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
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

      {/* Mobile/Tablet dropdown menu */}
      {mobileOpen && (
        <div
          className="lg:hidden border-t border-card-border px-4 py-3 flex flex-col gap-1 text-sm"
          style={{ background: 'rgba(3,12,26,0.97)', backdropFilter: 'blur(20px)' }}
        >
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => { go(link.view); setMobileOpen(false) }}
              className={`py-2 px-2 rounded transition-colors text-left ${
                isActive(link.view)
                  ? 'bg-[#0066ff]/10 text-[#7eb3ff]'
                  : 'hover:bg-secondary hover:text-foreground'
              }`}
            >
              {link.label}
            </button>
          ))}
          {/* Admin section in mobile menu */}
          <div className="border-t border-card-border mt-2 pt-2">
            <p className="px-2 py-1 text-xs text-muted-foreground uppercase tracking-widest">Admin</p>
            {adminLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => { go(link.view); setMobileOpen(false) }}
                className="block w-full text-left py-2 px-2 rounded hover:bg-secondary hover:text-foreground transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
