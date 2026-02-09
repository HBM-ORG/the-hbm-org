import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { siteContent } from '../data/content'
import { useI18n, t } from '../i18n/context'
import { ui } from '../i18n/translations'
import { getWhatsappUrl } from '../components/Layout'
import { ArrowRight } from 'lucide-react'

const WP = 'https://www.thehbm.org/wp-content/uploads'
const { home, global } = siteContent

const partners = [
  'Dale Carnegie', 'Gav Yam', 'Reichman University', 'Redler Technologies',
  'Points of You', 'Herbert Samuel', 'Shamir Medical', 'IAC',
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

// Phone mockup screens for How It Works
const videoSteps = [
  { text: { en: 'Sign up to TheHBM platform.', he: 'הירשמו לפלטפורמת TheHBM.' }, image: `${WP}/2025/06/11.png`, active: true },
  { text: { en: 'Click "Let\'s Go!" and wait for a match', he: 'לחצו "בואו נתחיל!" וחכו לשידוך' }, image: `${WP}/2025/06/22.png` },
  { text: { en: 'Enter an 8-minute call with someone new!', he: 'היכנסו לשיחה של 8 דקות עם מישהו חדש!' }, image: `${WP}/2025/06/33.png` },
  { text: { en: "That's it! Simple right? Shocking!", he: 'זהו! פשוט, נכון? מדהים!' }, image: `${WP}/2025/06/44.png` },
]
const physicalSteps = [
  { text: { en: 'Scan & Enter — No downloads needed.', he: 'סרקו והיכנסו — בלי הורדות.' }, image: `${WP}/2025/06/11.png` },
  { text: { en: 'Get Matched — Smart algorithm finds your partner.', he: 'קבלו התאמה — אלגוריתם חכם מוצא שותף.' }, image: `${WP}/2025/06/22.png` },
  { text: { en: 'Connect — Guided 8-minute conversation.', he: 'התחברו — שיחה מונחית של 8 דקות.' }, image: `${WP}/2025/06/33.png` },
]

export default function Home() {
  const { lang } = useI18n()
  const isHe = lang === 'he' || lang === 'ar'
  const [wordIdx, setWordIdx] = useState(0)
  const words = isHe ? home.hero.rotatingWordsHe : home.hero.rotatingWords
  const dailyQuote = dailyQuotes[new Date().getDate() % dailyQuotes.length]
  const [howMode, setHowMode] = useState('video') // video or physical
  const [activeStep, setActiveStep] = useState(0)
  const steps = howMode === 'video' ? videoSteps : physicalSteps

  useEffect(() => {
    const interval = setInterval(() => setWordIdx(i => (i + 1) % words.length), 2000)
    return () => clearInterval(interval)
  }, [words.length])

  // Reset step when mode changes
  useEffect(() => { setActiveStep(0) }, [howMode])

  const whatsappUrl = getWhatsappUrl(lang)

  return (
    <div className="min-h-screen">

      {/* ═══════════════════ HERO ═══════════════════ */}
      <section id="hero" className="bg-gradient-hero section-padding text-center">
        <div className="max-w-5xl mx-auto">
          {/* Avatar pairs with videos */}
          <div className="flex items-center justify-center gap-4 md:gap-6 mb-8 flex-wrap">
            {home.hero.imagePairs.map((pair, i) => (
              <div key={i} className="flex items-center -space-x-3">
                <div className="video-circle" style={{ borderColor: '#bbc0ff' }}>
                  {pair.left?.endsWith('.mp4') ? (
                    <video src={pair.left} autoPlay muted loop playsInline poster={pair.poster} />
                  ) : <img src={pair.poster} alt="" />}
                </div>
                <div className="video-circle" style={{ borderColor: '#fdb586' }}>
                  {pair.right?.endsWith('.mp4') ? (
                    <video src={pair.right} autoPlay muted loop playsInline poster={pair.poster} />
                  ) : <img src={pair.poster} alt="" />}
                </div>
              </div>
            ))}
          </div>

          {/* Title — ALL PURPLE */}
          <h1 className="text-5xl md:text-8xl font-bold text-hbm-purple mb-6" dir={isHe ? 'rtl' : 'ltr'}>
            {t(home.hero.titlePrefix, lang)}
            <span className="word-rotate" key={wordIdx}>{words[wordIdx]}</span>
            {' '}{t(home.hero.titleSuffix, lang)}
          </h1>

          <p className="text-lg md:text-xl text-hbm-gray max-w-2xl mx-auto mb-8">
            {t({ en: 'Connection is not just a feeling. Connection is taking an action.', he: 'חיבור הוא לא רק תחושה. חיבור הוא פעולה.' }, lang)}
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/meeter" className="btn-orange text-lg px-10 py-4 rounded-full">
              {t({ en: 'Start Your 8 Min', he: 'התחילו 8 דקות' }, lang)}
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════ TRUSTED PARTNERS — RIGHT AFTER HERO ═══════════════════ */}
      <section id="partners" className="py-8 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-hbm-gray text-xs uppercase tracking-widest mb-5 font-semibold">
            {t({ en: 'Trusted Partners', he: 'שותפים מהימנים' }, lang)}
          </p>
          <div className="flex items-center justify-center gap-8 md:gap-12 flex-wrap opacity-40 grayscale">
            {partners.map((p, i) => (
              <span key={i} className="text-sm font-bold text-hbm-dark whitespace-nowrap">{p}</span>
            ))}
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

          {/* Right side — 3 floating cards with staggered animation */}
          <div className="md:w-3/5 relative space-y-4">
            {home.conversationCards.cards.map((card, i) => (
              <div key={i}
                className="rounded-2xl px-8 py-6 shadow-sm"
                style={{
                  backgroundColor: card.bgColor,
                  marginLeft: i === 0 ? '40px' : i === 1 ? '80px' : '0px',
                  animation: `slideInRight 0.6s ease-out ${i * 0.2}s both`,
                }}>
                <p className="font-bold text-hbm-dark text-lg leading-relaxed">
                  <span className="text-hbm-gray mr-2">●</span>
                  {t(card.title, lang)} {t(card.text, lang)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ PHILOSOPHY — "The Choice" ═══════════════════ */}
      <section id="vision" className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-2xl md:text-3xl font-bold text-hbm-dark leading-relaxed italic">
            {t({
              en: '"There are places that highlight the differences between people and create separation. There are places that highlight the similarities between people and create connection. Choose."',
              he: '"יש מקומות שמדגישים את ההבדלים בין אנשים ויוצרים הפרדה. יש מקומות שמדגישים את הדמיון בין אנשים ויוצרים חיבור. בחרו."',
            }, lang)}
          </p>
        </div>
      </section>

      {/* ═══════════════════ MANIFESTO — "ONE Job" ═══════════════════ */}
      <section className="bg-gradient-dark text-white py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            {t({ en: 'We have ONE job.', he: 'יש לנו עבודה אחת.' }, lang)}
          </h2>
          <p className="text-lg md:text-xl opacity-90 leading-relaxed whitespace-pre-line">
            {t({
              en: "We don't do Real Estate. We don't do Cyber. We don't do CRM or Medical Devices.\n\nWe help people connect. Connect with themselves. Connect with others. Connect with nature.\n\nBecause this is what we do best. We know how to do it. And we are the BEST at it.",
              he: "אנחנו לא עושים נדל\"ן. לא סייבר. לא CRM או מכשור רפואי.\n\nאנחנו עוזרים לאנשים להתחבר. להתחבר לעצמם. להתחבר לאחרים. להתחבר לטבע.\n\nכי זה מה שאנחנו עושים הכי טוב. אנחנו יודעים איך. ואנחנו הכי טובים בזה.",
            }, lang)}
          </p>
        </div>
      </section>

      {/* ═══════════════════ WHY 8 MINUTES + VIDEO ═══════════════════ */}
      <section className="section-padding bg-hbm-cream">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-5xl font-bold text-hbm-purple mb-4">{t(home.banner.title, lang)}</h2>
            <p className="text-xl text-hbm-dark font-semibold" dangerouslySetInnerHTML={{ __html: t(home.banner.textHtml, lang) }} />
            <p className="text-hbm-gray mt-3 max-w-2xl mx-auto">{t(home.banner.description, lang)}</p>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-lg">
            <div className="aspect-video">
              <iframe src="https://www.youtube.com/embed/R7smYF02Kjo" title="Why 8 Minutes" className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ HOW IT WORKS — PHONE MOCKUP ═══════════════════ */}
      <section className="section-padding bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-3xl md:text-5xl font-bold text-hbm-purple mb-3">{t(home.howItWorks.title, lang)}</h2>
            <p className="text-lg font-semibold text-hbm-dark mb-8">{t(home.howItWorks.subtitle, lang)}</p>

            {/* Mode toggle — Video / Physical */}
            <div className="flex justify-center gap-3 mb-12">
              <button onClick={() => setHowMode('video')}
                className={`px-6 py-3 rounded-full font-semibold text-sm transition-all ${
                  howMode === 'video'
                    ? 'bg-hbm-purple text-white shadow-lg'
                    : 'bg-gray-100 text-hbm-gray hover:bg-gray-200'
                }`}>
                {t({ en: '🎥 Meeter Video', he: '🎥 Meeter וידאו' }, lang)}
              </button>
              <button onClick={() => setHowMode('physical')}
                className={`px-6 py-3 rounded-full font-semibold text-sm transition-all ${
                  howMode === 'physical'
                    ? 'bg-hbm-orange text-white shadow-lg'
                    : 'bg-gray-100 text-hbm-gray hover:bg-gray-200'
                }`}>
                {t({ en: '🤝 Meeter F2F', he: '🤝 Meeter פיזי' }, lang)}
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-12">
            {/* Left — Steps */}
            <div className="md:w-1/2 space-y-2">
              {steps.map((step, i) => (
                <button key={i} onClick={() => setActiveStep(i)}
                  className={`w-full text-left p-5 rounded-xl transition-all ${
                    activeStep === i
                      ? 'bg-white shadow-md border-l-4 border-hbm-orange'
                      : 'bg-transparent border-l-4 border-transparent hover:bg-gray-50'
                  }`}>
                  <p className={`text-lg ${activeStep === i ? 'font-bold text-hbm-orange' : 'text-hbm-gray'}`}>
                    {i + 1}. {t(step.text, lang)}
                  </p>
                </button>
              ))}
            </div>

            {/* Right — Phone Mockup */}
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-[280px]">
                {/* Phone frame */}
                <div className="bg-hbm-purple rounded-[40px] p-3 shadow-2xl">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-hbm-purple rounded-b-2xl z-10" />
                  {/* Screen */}
                  <div className="bg-white rounded-[32px] overflow-hidden aspect-[9/19]">
                    <img
                      key={`${howMode}-${activeStep}`}
                      src={steps[activeStep]?.image || `${WP}/2025/05/Settings-3.png`}
                      alt={`Step ${activeStep + 1}`}
                      className="w-full h-full object-cover transition-opacity duration-500"
                      style={{ animation: 'fadeIn 0.5s ease-in-out' }}
                    />
                  </div>
                </div>
                {/* Home indicator */}
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-28 h-1 bg-white/60 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

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

      {/* ═══════════════════ DAILY INSPIRATION ═══════════════════ */}
      <section id="event-cta" className="section-padding bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="inspiration-card">
            <p className="text-sm uppercase tracking-widest opacity-70 mb-4">
              {t({ en: 'Daily Inspiration', he: 'השראה יומית' }, lang)}
            </p>
            <p className="text-2xl md:text-3xl font-bold leading-relaxed mb-6">"{dailyQuote.text}"</p>
            <p className="text-lg opacity-80">— {dailyQuote.author}</p>
          </div>
        </div>
      </section>

      {/* ═══════════════════ WHAT MAKES THIS WORK — Guidelines ═══════════════════ */}
      <section className="section-padding" style={{backgroundColor:'#fde8d8'}}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-hbm-purple mb-4">What Makes This Work:</h2>
            <p className="text-hbm-dark max-w-2xl mx-auto text-lg">Wherever people come together, clear guidelines help create a safe, respectful, and meaningful space, and the same applies here.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {home.guidelines.items.map((item, i) => (
              <div key={i} className="bg-white/50 backdrop-blur-sm rounded-xl p-5 border-b-2 border-hbm-orange/20 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-hbm-orange/10 flex items-center justify-center flex-shrink-0">
                  {item.icon ? <img src={item.icon} alt="" className="guideline-icon w-6 h-6" /> : <span className="text-hbm-orange text-lg">✦</span>}
                </div>
                <div>
                  <h4 className="font-bold text-hbm-dark mb-1 text-sm uppercase tracking-wider">{t(item.title, lang)}</h4>
                  <p className="text-hbm-gray text-sm">{t(item.text, lang)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
