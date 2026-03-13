import { Outlet, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import Navbar from './Navbar'
import Footer from './Footer'
import CookieConsent from './CookieCompliance/CookieConsent'
import NewsletterSection from './NewsletterSection'
import PageErrorBoundary from './PageErrorBoundary'
import { useI18n, t } from '../i18n/context'

const isAdminPath = (pathname) => pathname.startsWith('/admin') || pathname.startsWith('/admin-dashboard')

const whatsappMessages = {
  en: "Hi! I'm ready to find my next opportunity. Can you help me get started with Meeter?",
  he: 'היי! אני מוכן למצוא את ההזדמנות הבאה שלי. תוכלו לעזור לי להתחיל עם Meeter?',
  es: '¡Hola! Estoy listo para encontrar mi próxima oportunidad. ¿Puedes ayudarme a empezar con Meeter?',
  fr: 'Bonjour ! Je suis prêt à trouver ma prochaine opportunité. Pouvez-vous m\'aider à démarrer avec Meeter?',
  de: 'Hallo! Ich bin bereit, meine nächste Gelegenheit zu finden. Können Sie mir helfen, mit Meeter zu beginnen?',
  ar: 'مرحبًا! أنا مستعد للعثور على فرصتي التالية. هل يمكنك مساعدتي في البدء مع Meeter?',
}

export function getWhatsappUrl(lang) {
  const msg = encodeURIComponent(whatsappMessages[lang] || whatsappMessages.en)
  return `https://wa.me/972587073136?text=${msg}`
}

export default function Layout() {
  const { pathname } = useLocation()
  const { lang } = useI18n()
  const whatsappUrl = getWhatsappUrl(lang)
  const [showTooltip, setShowTooltip] = useState(false)
  const isAdmin = isAdminPath(pathname)

  useEffect(() => {
    // Show tooltip after 4 seconds
    const showTimer = setTimeout(() => setShowTooltip(true), 4000)
    // Auto-hide after 12 seconds total (8s visible)
    const hideTimer = setTimeout(() => setShowTooltip(false), 12000)
    return () => { clearTimeout(showTimer); clearTimeout(hideTimer) }
  }, [])

  return (
    <div className="min-h-screen flex flex-col w-full bg-hbm-cream">
      <Navbar />
      <main className="flex-1 bg-hbm-cream">
        <PageErrorBoundary>
          <Outlet />
        </PageErrorBoundary>
      </main>
      <NewsletterSection />
      <Footer />
      {!isAdmin && <CookieConsent />}

      {/* WhatsApp Floating Button - hidden in admin (no need there) */}
      {!isAdmin && (
      <div className="whatsapp-float-container">

        {/* Tooltip Bubble */}
        {showTooltip && (
          <div
            className="absolute bottom-[72px] right-0 mb-2"
            style={{
              animation: 'tooltipBounceIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
            }}
          >
            <div className="relative bg-white rounded-2xl shadow-xl px-4 py-3 max-w-[200px] border border-gray-100">
              <button
                onClick={() => setShowTooltip(false)}
                className="absolute -top-2 -right-2 w-5 h-5 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors rtl:right-auto rtl:-left-2"
              >
                <X className="w-3 h-3 text-gray-500" />
              </button>
              <p className="text-xs font-semibold text-hbm-dark leading-snug" dir="auto">
                {t({
                  en: 'Is your next opportunity one click away?',
                  he: 'ההזדמנות הבאה שלך במרחק קליק אחד? 🌿'
                }, lang)}
              </p>
              {/* Speech bubble tail */}
              <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-r border-b border-gray-100 rotate-45 rtl:right-auto rtl:left-6" />
            </div>
          </div>
        )}

        <span className="whatsapp-label" dir="auto">{t({ en: 'Contact Us', he: 'צרו קשר', es: 'Contáctanos', fr: 'Contactez-nous', de: 'Kontakt', ar: 'اتصل بنا' }, lang)}</span>
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
          className="whatsapp-float" aria-label="Contact us on WhatsApp">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M3 21l1.65 -3.8a9 9 0 1 1 3.4 2.9l-5.05 .9" />
            <path d="M9 10a.5 .5 0 0 0 1 0v-1a.5 .5 0 0 0 -1 0v1a5 5 0 0 0 5 5h1a.5 .5 0 0 0 0 -1h-1a.5 .5 0 0 0 0 1" />
          </svg>
        </a>
      </div>
      )}
    </div>
  )
}
