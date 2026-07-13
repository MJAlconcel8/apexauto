const FOOTER_LINKS = ['Privacy', 'Terms', 'Support', 'Careers']

export function Footer() {
  return (
    <footer
      className="py-8"
      style={{ borderTop: '1px solid rgba(30,58,95,0.50)' }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span
          className="font-mono text-[12px]"
          style={{ color: 'rgba(74,96,128,0.8)' }}
        >
          © 2025 ApexAuto Inc. All rights reserved.
        </span>
        <div className="flex items-center gap-6">
          {FOOTER_LINKS.map((link) => (
            <button
              key={link}
              className="font-body text-[13px] transition-colors hover:text-white"
              style={{ color: 'rgba(74,96,128,0.8)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {link}
            </button>
          ))}
        </div>
      </div>
    </footer>
  )
}
