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
    // subs removed as per simple home link request
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

  const [expandedItems, setExpandedItems] = useState(['meeter']) // Expand meeter by default on mobile

  const toggleExpand = (key) => {
    setExpandedItems(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  return (
    <>
      <div className="h-16 md:h-20" />
      
      <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 w-full ${
        scrolled || mobileOpen ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100' : 'bg-white'
      }`}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 grid grid-cols-3 items-center">
          
          {/* LEFT ZONE: Burger + Lang */}
          <div className="flex items-center justify-start gap-2 z-[120]">
            <button 
              className="lg:hidden p-2 -ml-2 text-hbm-dark focus:outline-none" 
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
            <div className="lg:hidden scale-75 origin-left">
              <LanguageSwitcher />
            </div>
            <div className="hidden lg:flex items-center gap-6 ml-4">
               <div className="h-6 w-px bg-gray-200" />
               <LanguageSwitcher />
            </div>
          </div>

          {/* CENTER ZONE: Logo */}
          <div className="flex justify-center z-[110]">
            <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center">
              <img src="/logos/theHBM%20LOGO@3x.png" alt="The HBM" className="h-8 md:h-12 w-auto object-contain" />
            </Link>
            
            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1 ml-8" ref={dropdownRef}>
              {navStructure.map((item) => (
                <div key={item.key} className="relative group">
                  {!item.subs ? (
                    <Link
                      to={item.path}
                      className={`flex items-center gap-1 px-3 py-2 text-[15px] font-bold transition-colors rounded-xl whitespace-nowrap ${
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
                        className={`flex items-center gap-1 px-3 py-2 text-[15px] font-bold transition-colors rounded-xl whitespace-nowrap ${
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
                            className="absolute top-full left-0 mt-1 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 min-w-[220px] z-[200]"
                          >
                            {item.subs.map((sub) => (
                              <Link key={sub.id} to={sub.href || `${item.path}#${sub.id}`}
                                onClick={() => setOpenDropdown(null)}
                                className="block px-5 py-3 text-sm font-bold text-hbm-dark hover:bg-hbm-purple/5 hover:text-hbm-purple transition-all">
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

          {/* RIGHT ZONE: CTA */}
          <div className="hidden lg:flex items-center justify-end z-[120]">
            <Link 
              to={global.ctaUrl} 
              className="btn-primary !text-[14px] !py-3.5 !px-8 !rounded-full whitespace-nowrap shadow-md hover:shadow-lg font-bold"
            >
              {t(ui.cta.your8min, lang)}
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Sliding Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-black/40 backdrop-blur-md lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", damping: 28, stiffness: 220, mass: 1 }}
              className="bg-white w-[85%] max-w-sm h-full shadow-2xl flex flex-col pt-24 px-8 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <nav className="flex flex-col gap-4 w-full">
                {navStructure.map((item, idx) => (
                  <div key={item.key} className="border-b border-gray-50 last:border-0 py-3">
                    {item.subs && item.key === 'meeter' ? (
                      <div>
                        <button 
                          onClick={() => toggleExpand(item.key)}
                          className={`flex items-center justify-between w-full text-2xl font-black py-2 ${
                            isActive(item.path) ? 'text-hbm-purple' : 'text-hbm-dark'
                          }`}
                        >
                          {t(ui.nav[item.key], lang)}
                          <ChevronDown size={24} className={`transition-transform duration-300 ${expandedItems.includes(item.key) ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                          {expandedItems.includes(item.key) && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden bg-hbm-purple/5 rounded-2xl mt-2"
                            >
                              <div className="flex flex-col p-2">
                                {item.subs.map(sub => (
                                  <Link
                                    key={sub.id}
                                    to={sub.href || `${item.path}#${sub.id}`}
                                    onClick={() => setMobileOpen(false)}
                                    className="px-4 py-3 text-lg font-bold text-gray-700 active:text-hbm-purple"
                                  >
                                    {t(sub.label, lang)}
                                  </Link>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <Link 
                        to={item.path} 
                        onClick={() => setMobileOpen(false)}
                        className={`block text-2xl font-black py-2 ${
                          isActive(item.path) ? 'text-hbm-purple' : 'text-hbm-dark'
                        }`}
                      >
                        {t(ui.nav[item.key], lang)}
                      </Link>
                    )}
                  </div>
                ))}
                
                <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col">
                  <Link to={global.ctaUrl} className="btn-primary !text-xl !py-5 !rounded-2xl shadow-xl active:scale-95" onClick={() => setMobileOpen(false)}>
                    {t(ui.cta.your8min, lang)}
                  </Link>
                </div>
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}


