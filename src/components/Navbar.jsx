import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { navigation, siteConfig } from '../data/content'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-18">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-hbm-blue flex items-center justify-center group-hover:scale-105 transition-transform">
            <span className="text-white font-bold text-lg font-[var(--font-display)]">H</span>
          </div>
          <span className="text-xl font-bold text-hbm-dark font-[var(--font-display)]">
            The <span className="text-hbm-blue">HBM</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navigation.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`text-sm font-medium transition-colors hover:text-hbm-blue ${
                location.pathname === item.path
                  ? 'text-hbm-blue'
                  : 'text-hbm-gray'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* CTA Button */}
        <div className="hidden md:block">
          <a href={`mailto:${siteConfig.email}`} className="btn-primary text-sm py-2.5 px-6">
            Your 8 Min
          </a>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 text-hbm-dark"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-3">
          {navigation.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`block py-2 text-base font-medium ${
                location.pathname === item.path
                  ? 'text-hbm-blue'
                  : 'text-hbm-gray'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <a
            href={`mailto:${siteConfig.email}`}
            className="btn-primary block text-center mt-4 text-sm py-2.5"
          >
            Your 8 Min
          </a>
        </div>
      )}
    </header>
  )
}
