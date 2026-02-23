import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, ChevronDown } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
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
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  useEffect(() => { 
    setMobileOpen(false)
    setOpenDropdown(null) 
  }, [location.pathname, location.hash])

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
    <>
      {/* Spacer to prevent content jump due to fixed header */}
      <div className="h-16 md:h-20" />
      
      <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 w-full ${
        scrolled || mobileOpen ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100' : 'bg-white'
      }`}>
        <div className="max-w-7xl mx-auto px-6 h-16 md:h-20 flex items-center justify-between relative z-[101]">
          
          {/* Mobile Logo - Absolutely positioned on the entire container for guaranteed centering */}
          <Link 
            to="/" 
            className="md:hidden absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[110] flex items-center group" 
            onClick={() => setMobileOpen(false)}
          >
            <img src="/assets/logo.png" alt="The HBM" className="h-10 w-auto object-contain" />
          </Link>

          {/* Left Wing */}
          <div className="flex-1 flex items-center justify-start z-30">
            {/* Mobile Hamburger */}
            <div className="flex md:hidden mr-3">
               <button 
                className="p-2 -ml-2 text-hbm-dark focus:outline-none z-[120]" 
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
            
            {/* Desktop Logo */}
            <Link to="/" className="hidden md:flex items-center group">
              <img src="/assets/logo.png" alt="The HBM" className="h-14 w-auto object-contain" />
            </Link>
          </div>

          {/* Right Wing (Mobile Lang) */}
          <div className="flex-[2] flex items-center justify-center md:hidden pointer-events-none">
            {/* Logo is absolute, this flex box just provides space if needed, but we use absolute Link above */}
          </div>

          <div className="flex-1 flex items-center justify-end md:hidden z-[110]">
            <LanguageSwitcher />
          </div>

          {/* Desktop Layout (Hidden on Mobile) */}
          <div className="hidden md:flex items-center justify-between w-full">
            <div className="flex-1 flex items-center justify-start">
              <Link to="/" className="flex items-center group">
                <img src="/assets/logo.png" alt="The HBM" className="h-14 w-auto object-contain" />
              </Link>
            </div>

            {/* Center Area (Desktop only layout) */}
            <div className="flex-shrink-0 flex items-center justify-center pointer-events-none md:pointer-events-auto">
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

                      <AnimatePresence>
                        {openDropdown === item.key && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 py-2 min-w-[200px] z-[110] overflow-hidden"
                          >
                            {item.subs.map((sub) => (
                              <Link key={sub.id} to={sub.href || `${item.path}#${sub.id}`}
                                onClick={() => setOpenDropdown(null)}
                                className="block px-4 py-2.5 text-sm text-hbm-dark hover:bg-hbm-purple/5 hover:text-hbm-purple transition-colors">
                                {t(sub.label, lang)}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </div>
              ))}
            </nav>
          </div>

          </div>
          <div className="flex-1 flex items-center justify-end gap-3 z-30">
            <LanguageSwitcher />
            <Link to={global.ctaUrl} className="hidden md:inline-flex btn-primary text-sm py-3 px-7">
              {t(ui.cta.your8min, lang)}
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile menu - Fixed at top, sibling to header to ensure correct layering */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/20 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200, mass: 0.8 }}
              className="bg-white w-[85%] max-w-sm h-full shadow-2xl flex flex-col pt-24 px-8 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <nav className="flex flex-col gap-6 w-full">
                {navStructure.map((item, idx) => (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + idx * 0.05 }}
                    key={item.key}
                  >
                    <Link 
                      to={item.path} 
                      onClick={() => setMobileOpen(false)}
                      className={`block text-3xl font-bold border-b border-gray-50 pb-4 ${
                        isActive(item.path) ? 'text-hbm-purple' : 'text-hbm-dark'
                      }`}
                    >
                      {t(ui.nav[item.key], lang)}
                    </Link>
                  </motion.div>
                ))}
                
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mt-8 pt-8 border-t border-gray-100 flex flex-col gap-4"
                >
                  <Link to={global.ctaUrl} className="btn-primary text-center py-4 text-lg" onClick={() => setMobileOpen(false)}>
                    {t(ui.cta.your8min, lang)}
                  </Link>
                </motion.div>
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}


