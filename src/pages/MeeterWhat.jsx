import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useI18n, t } from '../i18n/context'
import { getWhatsappUrl } from '../components/Layout'
import { ArrowRight, Users, BookOpen, Briefcase, Handshake, Coffee, GraduationCap, Timer, Shield, ChevronDown } from 'lucide-react'

const words = ['Partner', 'Deal', 'Friend', 'Mentor', 'Study Buddy', 'Coffee Mate']
const wordsHe = ['שותף', 'עסקה', 'חבר', 'מנטור', 'שותף ללימודים', 'שותף לקפה']

const opportunities = [
  { icon: Briefcase, label: { en: 'A Deal', he: 'עסקה' } },
  { icon: Users, label: { en: 'A Partner', he: 'שותף' } },
  { icon: GraduationCap, label: { en: 'A Mentor', he: 'מנטור' } },
  { icon: BookOpen, label: { en: 'A Study Buddy', he: 'שותף ללימודים' } },
  { icon: Handshake, label: { en: 'A Friend', he: 'חבר' } },
  { icon: Coffee, label: { en: 'A Coffee Mate', he: 'שותף לקפה' } },
]

export default function MeeterWhat() {
  const { lang } = useI18n()
  const isHe = lang === 'he' || lang === 'ar'
  const [mode, setMode] = useState('virtual')
  const [wordIdx, setWordIdx] = useState(0)
  const wList = isHe ? wordsHe : words

  useEffect(() => {
    const i = setInterval(() => setWordIdx(p => (p + 1) % wList.length), 1800)
    return () => clearInterval(i)
  }, [wList.length])

  return (
    <div className="min-h-screen">

      {/* ── S1: HERO + VIDEO TOGGLE ── */}
      <section className="bg-gradient-hero section-padding text-center">
        <div className="max-w-4xl mx-auto">
          <p className="text-hbm-purple font-semibold text-sm uppercase tracking-widest mb-3">The Meeter</p>
          <h1 className="text-4xl md:text-7xl font-bold text-hbm-dark mb-6" style={{letterSpacing:'-2px'}}>
            {t({ en: 'Bringing Real Conversations to Life.', he: 'מביאים שיחות אמיתיות לחיים.' }, lang)}
          </h1>
          <p className="text-xl text-hbm-gray max-w-2xl mx-auto mb-8">
            {t({ en: 'Events bring people together, but HBM offers the platform that actually connects them.', he: 'אירועים מפגישים אנשים, אבל HBM מציעה את הפלטפורמה שבאמת מחברת אותם.' }, lang)}
          </p>
          {/* Toggle */}
          <div className="flex justify-center gap-3 mb-8">
            <button onClick={() => setMode('physical')} className={`px-6 py-3 rounded-full font-semibold text-sm transition-all ${mode==='physical'?'bg-hbm-orange text-white shadow-lg':'bg-gray-100 text-hbm-gray hover:bg-gray-200'}`}>
              🤝 {t({ en: 'In-Person', he: 'פיזי' }, lang)}
            </button>
            <button onClick={() => setMode('virtual')} className={`px-6 py-3 rounded-full font-semibold text-sm transition-all ${mode==='virtual'?'bg-hbm-purple text-white shadow-lg':'bg-gray-100 text-hbm-gray hover:bg-gray-200'}`}>
              🎥 {t({ en: 'Virtual', he: 'וירטואלי' }, lang)}
            </button>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-xl max-w-3xl mx-auto">
            <div className="aspect-video bg-hbm-purple/5">
              <iframe src="https://www.youtube.com/embed/R7smYF02Kjo" title="HBM" className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            </div>
          </div>
          <p className="text-hbm-gray mt-4 italic text-sm">{t({ en: 'See how 8 minutes change everything.', he: 'ראו איך 8 דקות משנות הכל.' }, lang)}</p>
        </div>
      </section>

      {/* ── S2: OLD vs NEW ── */}
      <section className="section-padding bg-white">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          <div className="bg-gray-50 rounded-2xl p-8 border-2 border-gray-200 relative overflow-hidden">
            <span className="absolute top-4 right-4 text-xs font-bold text-red-400 bg-red-50 px-3 py-1 rounded-full">OLD WAY</span>
            <h3 className="text-2xl font-bold text-hbm-dark mb-4 mt-6">{t({ en: 'Awkward Networking', he: 'נטוורקינג מביך' }, lang)}</h3>
            <ul className="space-y-3 text-hbm-gray">
              <li>❌ {t({ en: 'Standing alone checking your phone', he: 'עומדים לבד ובודקים את הטלפון' }, lang)}</li>
              <li>❌ {t({ en: 'Forced small talk with strangers', he: 'שיחת חולין מאולצת עם זרים' }, lang)}</li>
              <li>❌ {t({ en: 'Exchanging cards you\'ll never use', he: 'מחליפים כרטיסי ביקור שלא תשתמשו בהם' }, lang)}</li>
              <li>❌ {t({ en: 'Leaving without real connections', he: 'עוזבים בלי חיבורים אמיתיים' }, lang)}</li>
            </ul>
          </div>
          <div className="bg-hbm-light rounded-2xl p-8 border-2 border-hbm-purple/30 relative overflow-hidden">
            <span className="absolute top-4 right-4 text-xs font-bold text-hbm-green bg-hbm-green/10 px-3 py-1 rounded-full">HBM WAY</span>
            <h3 className="text-2xl font-bold text-hbm-dark mb-4 mt-6">{t({ en: 'Guided Connection', he: 'חיבור מונחה' }, lang)}</h3>
            <ul className="space-y-3 text-hbm-dark">
              <li>✅ {t({ en: 'Instant smart matching', he: 'התאמה חכמה מיידית' }, lang)}</li>
              <li>✅ {t({ en: 'Curated ice-breakers', he: 'שוברי קרח מותאמים' }, lang)}</li>
              <li>✅ {t({ en: 'Structured 8-minute deep conversations', he: 'שיחות עמוקות מובנות של 8 דקות' }, lang)}</li>
              <li>✅ {t({ en: 'Real relationships that last', he: 'מערכות יחסים אמיתיות שנמשכות' }, lang)}</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── S3: WHY 8 MINUTES — Psychology ── */}
      <section className="section-padding bg-hbm-cream">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-hbm-purple mb-6">{t({ en: 'Why 8 Minutes?', he: 'למה 8 דקות?' }, lang)}</h2>
          <p className="text-xl text-hbm-dark leading-relaxed max-w-2xl mx-auto mb-10">
            {t({ en: "It's the psychological 'Sweet Spot'. Short enough to feel safe (low risk), but long enough to create a meaningful bond (high reward).", he: "זו נקודת ה'Sweet Spot' הפסיכולוגית. מספיק קצר כדי להרגיש בטוח (סיכון נמוך), אבל מספיק ארוך כדי ליצור קשר משמעותי (תגמול גבוה)." }, lang)}
          </p>
          {/* Timer visual */}
          <div className="relative w-48 h-48 mx-auto">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
              <circle cx="50" cy="50" r="45" fill="none" stroke="#6160AB" strokeWidth="8"
                strokeDasharray="283" strokeDashoffset="0" strokeLinecap="round"
                style={{ animation: 'timerFill 3s ease-out forwards' }} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-bold text-hbm-purple">8<span className="text-lg"> min</span></span>
            </div>
          </div>
        </div>
      </section>

      {/* ── S4: OPPORTUNITY — Word Rotator ── */}
      <section className="section-padding bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-hbm-dark mb-2">
            {t({ en: 'Find your next...', he: '...מצאו את ה' }, lang)}
          </h2>
          <p className="text-5xl md:text-7xl font-bold text-hbm-orange mb-10 word-rotate" key={wordIdx}>
            {wList[wordIdx]}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {opportunities.map((o, i) => (
              <div key={i} className="bg-hbm-cream rounded-xl p-5 card-hover text-center" style={{animation:`fadeIn 0.5s ease-out ${i*0.08}s both`}}>
                <div className="w-12 h-12 rounded-full bg-hbm-purple/10 flex items-center justify-center mx-auto mb-2">
                  <o.icon size={24} className="text-hbm-purple" />
                </div>
                <p className="font-bold text-hbm-dark text-sm">{t(o.label, lang)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── S5: DID YOU KNOW — Stats ── */}
      <section className="bg-gradient-dark text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-hbm-orange font-bold text-sm uppercase tracking-widest mb-4">{t({ en: 'Did You Know?', he: 'הידעתם?' }, lang)}</p>
          <h2 className="text-4xl md:text-6xl font-bold mb-6" style={{letterSpacing:'-2px'}}>
            {t({ en: '95% of people hate small talk.', he: '95% מהאנשים שונאים שיחות חולין.' }, lang)}
          </h2>
          <p className="text-2xl font-bold text-hbm-orange">{t({ en: 'We fixed it.', he: 'תיקנו את זה.' }, lang)}</p>
        </div>
      </section>

      {/* ── S6: CTA ── */}
      <section className="py-20 bg-gradient-purple text-white text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-6">{t({ en: 'So who is it for?', he: 'אז למי זה מתאים?' }, lang)}</h2>
          <Link to="/meeter/who" className="btn-orange text-lg px-10 py-4 rounded-full inline-flex items-center gap-2 hover:scale-105 transition-transform" style={{animation:'pulse 2s infinite'}}>
            {t({ en: 'See Who It\'s For', he: 'גלו למי זה מתאים' }, lang)} <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  )
}
