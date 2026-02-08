import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { siteContent } from '../data/content'
import { useI18n, t } from '../i18n/context'
import { ui } from '../i18n/translations'
import LanguageSwitcher from './LanguageSwitcher'

const { global } = siteContent

const navKeys = ['home', 'meeter', 'about', 'b2b', 'events', 'gallery', 'contact']

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const { lang } = useI18n()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  const navItems = global.nav.map((item, i) => ({
    ...item,
    label: t(ui.nav[navKeys[i]], lang),
  }))

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16 md:h-20">
        <Link to="/" className="flex items-center gap-2 group">
          <img src={global.logo} alt="The HBM" className="h-9 md:h-11 w-auto" />
          <span className="text-lg md:text-xl font-bold font-[var(--font-display)]">
            <span className="text-hbm-dark">The</span>{' '}
            <span className="text-hbm-blue">HBM</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-10">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path}
              className={`text-[15px] font-medium transition-colors relative pb-1 ${
                location.pathname === item.path
                  ? 'text-hbm-blue after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-hbm-coral after:rounded-full'
                  : 'text-hbm-dark hover:text-hbm-blue'
              }`}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher />
          <a href={global.ctaUrl} className="btn-primary text-sm py-3 px-7">
            {t(ui.cta.your8min, lang)}
          </a>
        </div>

        <div className="flex md:hidden items-center gap-2">
          <LanguageSwitcher />
          <button className="p-2 text-hbm-dark" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-6 space-y-4 shadow-lg">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path}
              className={`block py-2 text-lg font-medium ${
                location.pathname === item.path ? 'text-hbm-blue' : 'text-hbm-dark'
              }`}>
              {item.label}
            </Link>
          ))}
          <a href={global.ctaUrl} className="btn-primary block text-center mt-4">
            {t(ui.cta.your8min, lang)}
          </a>
        </div>
      )}
    </header>
  )
}
