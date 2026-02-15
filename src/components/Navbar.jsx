import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, ChevronDown } from 'lucide-react'
import { siteContent } from '../data/content'
import { useI18n, t } from '../i18n/context'
import { ui } from '../i18n/translations'
import LanguageSwitcher from './LanguageSwitcher'

const { global } = siteContent

const navStructure = [
  {
    key: 'home', path: '/',
    subs: [
      { id: 'hero', label: { en: 'Bringing...', he: 'מחברים...' } },
      { id: 'partners', label: { en: 'Partnerships & Logos', he: 'שותפויות ולוגואים' } },
      { id: 'vision', label: { en: 'Vision & Mission', he: 'חזון ומשימה' } },
      { id: 'meeter-teaser', label: { en: 'The Meeter Experience', he: 'חווית ה-Meeter' } },
      { id: 'event-cta', label: { en: 'Join the Next Event', he: 'הצטרפו לאירוע הבא' } },
    ],
  },
  {
    key: 'meeter', path: '/meeter',
    subs: [
      { id: 'what', label: { en: 'What is it?', he: 'מה זה?' }, href: '/meeter' },
      { id: 'who', label: { en: 'Who is it for?', he: 'למי זה?' }, href: '/meeter/who' },
      { id: 'features', label: { en: 'Features', he: 'יכולות' }, href: '/meeter/features' },
    ],
  },
  {
    key: 'events', path: '/events',
    // subs removed as per user request
  },
  {
    key: 'knowledge', path: '/knowledge',
    // subs removed as per user request
  },
  {
    key: 'about', path: '/about',
    // subs removed as per user request
  },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [openDropdown, setOpenDropdown] = useState(null)
  const location = useLocation()
  const { lang } = useI18n()
  const dropdownRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMobileOpen(false); setOpenDropdown(null) }, [location.pathname, location.hash])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpenDropdown(null)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const isActive = (path) => location.pathname === path || (path !== "/" && location.pathname.startsWith(path))

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <img src={global.logo} alt="The HBM" className="h-9 md:h-11 w-auto" />
          <span className="text-lg md:text-xl font-bold font-[var(--font-display)]">
            <span className="text-hbm-dark">The</span>{' '}
            <span className="text-hbm-purple">HBM</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1" ref={dropdownRef}>
          {navStructure.map((item) => (
            <div key={item.key} className="relative group">
              {item.key === 'home' || !item.subs ? (
                <Link
                  to={item.path}
                  className={`flex items-center gap-1 px-4 py-2 text-[15px] font-medium transition-colors rounded-lg ${
                    isActive(item.path)
                      ? 'text-hbm-purple bg-hbm-purple/5'
                      : 'text-hbm-dark hover:text-hbm-purple hover:bg-gray-50'
                  }`}
                >
                  {t(ui.nav[item.key], lang)}
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => setOpenDropdown(openDropdown === item.key ? null : item.key)}
                    className={`flex items-center gap-1 px-4 py-2 text-[15px] font-medium transition-colors rounded-lg ${
                      isActive(item.path)
                        ? 'text-hbm-purple bg-hbm-purple/5'
                        : 'text-hbm-dark hover:text-hbm-purple hover:bg-gray-50'
                    }`}
                  >
                    {t(ui.nav[item.key], lang)}
                    <ChevronDown size={14} className={`transition-transform ${openDropdown === item.key ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown */}
                  {openDropdown === item.key && (
                    <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 py-2 min-w-[200px] z-50 animate-in fade-in">
                      {item.subs.map((sub) => (
                        <Link key={sub.id} to={sub.href || `${item.path}#${sub.id}`}
                          onClick={() => setOpenDropdown(null)}
                          className="block px-4 py-2.5 text-sm text-hbm-dark hover:bg-hbm-purple/5 hover:text-hbm-purple transition-colors">
                          {t(sub.label, lang)}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </nav>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher />
          <a href={global.ctaUrl} className="btn-primary text-sm py-3 px-7">
            {t(ui.cta.your8min, lang)}
          </a>
        </div>

        {/* Mobile toggle */}
        <div className="flex md:hidden items-center gap-2">
          <LanguageSwitcher />
          <button className="p-2 text-hbm-dark" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 shadow-lg max-h-[70vh] overflow-y-auto">
          {navStructure.map((item) => (
            <div key={item.key} className="mb-4">
              <Link to={item.path} onClick={() => setMobileOpen(false)}
                className={`block text-lg font-bold mb-1 ${isActive(item.path) ? 'text-hbm-purple' : 'text-hbm-dark'}`}>
                {t(ui.nav[item.key], lang)}
              </Link>
              <div className="pl-4 space-y-1">
                {item.subs && item.subs.map((sub) => (
                  <Link key={sub.id} to={sub.href || `${item.path}#${sub.id}`}
                    onClick={() => setMobileOpen(false)}
                    className="block text-sm text-hbm-gray py-1 hover:text-hbm-purple">
                    {t(sub.label, lang)}
                  </Link>
                ))}
              </div>
            </div>
          ))}
          <a href={global.ctaUrl} className="btn-primary block text-center mt-4">
            {t(ui.cta.your8min, lang)}
          </a>
        </div>
      )}
    </header>
  )
}
