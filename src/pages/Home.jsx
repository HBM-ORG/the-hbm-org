import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { siteContent } from '../data/content'
import { useI18n, t } from '../i18n/context'
import { ui } from '../i18n/translations'
import { getWhatsappUrl } from '../components/Layout'
import { ArrowRight } from 'lucide-react'
import { AnimatedHero, Why8Minutes, QuoteCarousel, InteractiveCard, PhilosophyQuote, ManifestoSection, Guidelines, HowItWorks } from '../components/Home'
import BubbleContainer from '../components/BubbleContainer'
import NextPageBridge from '../components/NextPageBridge'


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
      {/* ═══════════════════ TRUSTED PARTNERS — RIGHT AFTER HERO ═══════════════════ */}
      {/* ═══════════════════ TRUSTED PARTNERS — SIMPLE ROW ═══════════════════ */}
      <section id="partners" className="bg-hbm-cream py-12 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-gray-400 text-xs uppercase tracking-[0.2em] mb-10 font-bold">
            {t({ en: 'Trusted Partners', he: 'שותפים מהימנים' }, lang)}
          </p>
          
          <div className="relative w-full overflow-hidden mask-gradient-x">
            <div 
              className="flex gap-20 items-center w-max animate-scroll-fast"
              style={{ paddingLeft: '2rem' }}
            >
              {/* 5 Sets of logos to ensure smooth infinite loop */}
              {[...partnerLogos, ...partnerLogos, ...partnerLogos, ...partnerLogos, ...partnerLogos].map((partner, i) => (
                <div key={i} className="flex-shrink-0 h-16 md:h-24 flex items-center justify-center grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-500 transform hover:scale-110">
                  <img 
                    src={partner.src} 
                    alt={partner.name}
                    className="h-full w-auto object-contain mix-blend-multiply drop-shadow-none" 
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ MANIFESTO — WE HAVE ONE JOB ═══════════════════ */}
      <ManifestoSection />

      {/* ═══════════════════ PHILOSOPHY QUOTE — ANIMATED ═══════════════════ */}
      <PhilosophyQuote />

      {/* ═══════════════════ CONVERSATION CARDS — SPLIT LAYOUT ═══════════════════ */}
      <section className="section-padding bg-hbm-cream">
        <BubbleContainer bgColor="white">
          <div className="flex flex-col md:flex-row items-center gap-12">
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
        </BubbleContainer>
      </section>

      {/* ═══════════════════ WHY 8 MINUTES — INSTAGRAM CAROUSEL ═══════════════════ */}
      <Why8Minutes />

      {/* ═══════════════════ HOW IT WORKS — ANTI-GRAVITY ═══════════════════ */}
      <HowItWorks />





      {/* ═══════════════════ DAILY INSPIRATION — QUOTE CAROUSEL ═══════════════════ */}
      <QuoteCarousel />

      {/* ═══════════════════ WHAT MAKES THIS WORK — Guidelines ═══════════════════ */}
      <Guidelines />


      {/* ═══════════════════ MEETER TEASER — NEXT PAGE CARD ═══════════════════ */}
      <NextPageBridge 
        to="/meeter"
        eyebrow={{ en: 'Curious?', he: 'סקרנים?' }}
        title={{ en: 'More than an App, its a new way to connect.', he: 'יותר מאפליקציה. דרך חדשה להתחבר.' }}
        description={{ en: 'Imagine a social network where you don\'t scroll, you just meet. In real life. 8 minutes at a time.', he: 'תארו לעצמכם רשת חברתית שבה לא גוללים, אלא פשוט נפגשים. במציאות. 8 דקות בכל פעם.' }}
        buttonText={{ en: 'What Is It?', he: 'מה זה?' }}
      />


    </div>
  )
}
