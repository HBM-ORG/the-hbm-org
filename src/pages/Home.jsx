import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MacbookScroll } from '../components/ui/MacbookScroll'
import { siteContent } from '../data/content'
import { useI18n, t } from '../i18n/context'
import { ui } from '../i18n/translations'
import { getWhatsappUrl } from '../components/Layout'
import { ArrowRight } from 'lucide-react'
import { AnimatedHero, Why8Minutes, QuoteCarousel, InteractiveCard, PhilosophyQuote, ManifestoSection, Guidelines, HowItWorks } from '../components/Home'
import BubbleContainer from '../components/BubbleContainer'
import NextPageBridge from '../components/NextPageBridge'
import EyebrowBadge from '../components/EyebrowBadge'


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

const OpportunityWord = ({ lang }) => {
  const wordsEn = ['Opportunity', 'Partner', 'Deal', 'Friend', 'Mentor', 'Study Buddy', 'Coffee Mate', 'Venture', 'Community', 'Job', 'Date'];
  const wordsHe = ['הזדמנות', 'שותף', 'עסקה', 'חבר', 'מנטור', 'שותף ללימודים', 'שותף לקפה', 'מיזם', 'קהילה', 'עבודה', 'דייט'];
  const [idx, setIdx] = useState(0);
  const list = lang === 'he' || lang === 'ar' ? wordsHe : wordsEn;

  useEffect(() => {
    const timer = setInterval(() => setIdx(prev => (prev + 1) % list.length), 2000);
    return () => clearInterval(timer);
  }, [list.length]);

  return (
    <motion.p 
      key={idx}
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="text-7xl md:text-[10rem] font-black text-hbm-orange leading-none drop-shadow-2xl"
      style={{ letterSpacing: '-0.05em' }}
    >
      {list[idx]}
    </motion.p>
  );
}


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





      {/* ═══════════════════ OPPORTUNITY ROTATOR — 2X SIZE ═══════════════════ */}
      <section className="bg-hbm-cream py-32 overflow-hidden relative">
        {/* Smooth Transition Blur */}
        <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-[#fef5ed] to-hbm-cream z-0" />
        
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <h2 className="text-4xl md:text-6xl font-bold text-hbm-dark mb-4">
              {t({ en: 'Find your next...', he: '...מצאו את ה' }, lang)}
            </h2>
            <OpportunityWord lang={lang} />
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════ PHILOSOPHY QUOTE — ANIMATED ═══════════════════ */}
      <PhilosophyQuote />

      {/* ═══════════════════ CONVERSATION CARDS — SPLIT LAYOUT ═══════════════════ */}
      <section className="section-padding bg-hbm-cream">
        <div className="max-w-7xl mx-auto px-6">
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
        </div>
      </section>

      {/* ═══════════════════ WHY 8 MINUTES — INSTAGRAM CAROUSEL ═══════════════════ */}
      <Why8Minutes />


      {/* ═══════════════════ DAILY INSPIRATION — QUOTE CAROUSEL ═══════════════════ */}
      <QuoteCarousel />

      {/* ═══════════════════ WHAT MAKES THIS WORK — Guidelines ═══════════════════ */}
      <Guidelines />

      {/* ═══════════════════ TRUSTED PARTNERS ═══════════════════ */}
      <section id="partners" className="bg-hbm-cream py-12 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-gray-400 text-xs uppercase tracking-[0.2em] mb-10 font-bold">
            {t({ en: 'Trusted Partners', he: 'שותפים מהימנים' }, lang)}
          </p>
          
          <div className="relative w-full overflow-hidden mask-gradient-x">
            <div className="flex gap-20 items-center w-max animate-marquee" style={{ paddingLeft: '2rem' }}>
              {[...partnerLogos, ...partnerLogos, ...partnerLogos, ...partnerLogos].map((partner, i) => (
                <div key={i} className="flex-shrink-0 h-16 md:h-24 flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity duration-300">
                  <img 
                    src={partner.src} 
                    alt={partner.name}
                    className="h-full w-auto object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


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
