import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { siteContent } from '../data/content'
import { useI18n, t } from '../i18n/context'
import { ui } from '../i18n/translations'
import { getWhatsappUrl } from '../components/Layout'
import { ArrowRight } from 'lucide-react'
import { AnimatedHero, Why8Minutes, QuoteCarousel, InteractiveCard, PhilosophyQuote, ManifestoSection, Guidelines, HowItWorks } from '../components/Home'

const WP = 'https://www.thehbm.org/wp-content/uploads'
const { home, global } = siteContent

const partnerLogos = [
  { name: 'IAC', src: '/partner-logos/iac.png' },
  { name: 'Dale Carnegie', src: '/partner-logos/dale-carnegie.png' },
  { name: 'Gav Yam', src: '/partner-logos/gav-yam.png' },
  { name: 'Redler Technologies', src: '/partner-logos/redler.png' },
  { name: 'Matam Park', src: '/partner-logos/matam-park.png' },
  { name: 'Haifa', src: '/partner-logos/haifa.png' },
  { name: 'HaMathana', src: '/partner-logos/hamathana.png' },
  { name: 'Reichman University', src: '/partner-logos/reichman.png' },
  { name: 'Herbert Samuel Hotels', src: '/partner-logos/herbert-samuel.png' },
  { name: 'Points of You', src: '/partner-logos/points-of-you.png' },
]

const dailyQuotes = [
  { text: "We cannot live only for ourselves. A thousand fibers connect us.", author: "Herman Melville" },
  { text: "The meeting of two personalities is like the contact of two chemical substances.", author: "Carl Jung" },
  { text: "Connection is why we're here. It gives purpose and meaning to our lives.", author: "Brené Brown" },
  { text: "Your thoughts create your reality.", author: "Bob Proctor" },
  { text: "Every achievement starts with a burning desire.", author: "Napoleon Hill" },
  { text: "What you think, you become.", author: "Buddha" },
  { text: "The best way to predict the future is to create it.", author: "Abraham Lincoln" },
  { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
]

export default function Home() {
  const { lang } = useI18n()
  const isHe = lang === 'he' || lang === 'ar'
  const dailyQuote = dailyQuotes[new Date().getDate() % dailyQuotes.length]

  const whatsappUrl = getWhatsappUrl(lang)

  return (
    <div className="min-h-screen">

      {/* ═══════════════════ HERO ═══════════════════ */}
      <AnimatedHero 
        imagePairs={home.hero.imagePairs}
        titlePrefix={home.hero.titlePrefix}
        rotatingWords={home.hero.rotatingWords}
        rotatingWordsHe={home.hero.rotatingWordsHe}
        titleSuffix={home.hero.titleSuffix}
      />

      {/* ═══════════════════ TRUSTED PARTNERS — RIGHT AFTER HERO ═══════════════════ */}
      <section id="partners" className="py-8 bg-white border-b border-gray-100 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-hbm-gray text-xs uppercase tracking-widest mb-5 font-semibold">
            {t({ en: 'Trusted Partners', he: 'שותפים מהימנים' }, lang)}
          </p>
          {/* Infinite scrolling carousel */}
          <div className="relative overflow-hidden group">
            <div 
              className="flex gap-16 animate-scroll"
              style={{ animationDuration: '4s' }}
            >
              {/* Duplicate the logos multiple times for seamless loop */}
              {[...partnerLogos, ...partnerLogos, ...partnerLogos, ...partnerLogos, ...partnerLogos].map((partner, i) => (
                <div key={i} className="flex-shrink-0 h-36 flex items-center justify-center grayscale-0 opacity-100 md:grayscale md:opacity-40 md:hover:opacity-100 md:hover:grayscale-0 transition-all duration-300">
                  <img 
                    src={partner.src} 
                    alt={partner.name}
                    className="h-full w-auto object-contain"
                    onError={(e) => {
                      // Fallback to text if image fails to load
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'block'
                    }}
                  />
                  <span className="text-sm font-bold text-hbm-dark whitespace-nowrap hidden">{partner.title}</span>
                </div>
              ))}
            </div>
            {/* Gradient masks for smooth edges */}
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent z-10" />
            <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent z-10" />
          </div>
        </div>
      </section>

      {/* ═══════════════════ CONVERSATION CARDS — SPLIT LAYOUT ═══════════════════ */}
      <section className="section-padding bg-hbm-cream">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
          {/* Left side — Headlines + CTA */}
          <div className="md:w-2/5">
            <h2 className="text-4xl md:text-5xl font-bold text-hbm-dark mb-1 leading-tight">
              {t(home.conversationCards.titleLines, lang)?.[0]}
            </h2>
            <h2 className="text-4xl md:text-5xl font-bold text-hbm-purple/60 mb-1 italic leading-tight">
              {t(home.conversationCards.titleLines, lang)?.[1]}
            </h2>
            <h2 className="text-4xl md:text-5xl font-bold text-hbm-dark mb-8 leading-tight">
              {t(home.conversationCards.titleLines, lang)?.[2]}
            </h2>
            <Link to="/events" className="btn-orange rounded-full px-8 py-3">
              {t(home.conversationCards.ctaText, lang)}
            </Link>
          </div>

          {/* Right side — 3 floating cards with 3D hover effects */}
          <div className="md:w-3/5 relative space-y-4">
            {home.conversationCards.cards.map((card, i) => (
              <InteractiveCard 
                key={i}
                card={card}
                index={i}
                lang={lang}
                t={t}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ PHILOSOPHY QUOTE — ANIMATED ═══════════════════ */}
      <PhilosophyQuote />

      {/* ═══════════════════ MANIFESTO — WE HAVE ONE JOB ═══════════════════ */}
      <ManifestoSection />

      {/* ═══════════════════ WHY 8 MINUTES — INSTAGRAM CAROUSEL ═══════════════════ */}
      <Why8Minutes />

      {/* ═══════════════════ HOW IT WORKS — ANTI-GRAVITY ═══════════════════ */}
      <HowItWorks />

      {/* ═══════════════════ MEETER TEASER ═══════════════════ */}
      <section id="meeter-teaser" className="section-padding bg-gradient-purple text-white">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm uppercase tracking-widest opacity-70 mb-3">The Product</p>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            {t({ en: 'Meet The Meeter App', he: 'הכירו את אפליקציית Meeter' }, lang)}
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            {t({ en: 'No downloads. No pre-registration. Just scan a QR code and start meeting people in the real world.', he: 'בלי הורדות. בלי הרשמה מראש. פשוט סרקו QR ותתחילו להכיר אנשים.' }, lang)}
          </p>
          <Link to="/meeter" className="btn-orange text-lg px-10 py-4 rounded-full">
            {t({ en: 'Learn More', he: 'למידע נוסף' }, lang)} <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* ═══════════════════ DAILY INSPIRATION — QUOTE CAROUSEL ═══════════════════ */}
      <QuoteCarousel />

      {/* ═══════════════════ WHAT MAKES THIS WORK — Guidelines ═══════════════════ */}
      {/* ═══════════════════ WHAT MAKES THIS WORK — Guidelines ═══════════════════ */}
      <Guidelines />

    </div>
  )
}
