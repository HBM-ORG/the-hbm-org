import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useI18n, t } from '../i18n/context'
import { getWhatsappUrl } from '../components/Layout'
import { ArrowRight, Users, BookOpen, Briefcase, Handshake, Coffee, GraduationCap, Timer, Shield, ChevronDown } from 'lucide-react'
import ComparisonSection from '../components/Meeter/ComparisonSection'
import Why8MinutesTimer from '../components/Meeter/Why8MinutesTimer'
import EyebrowBadge from '../components/EyebrowBadge'
import BubbleContainer from '../components/BubbleContainer'
import NextPageBridge from '../components/NextPageBridge'
import DidYouKnowSection from '../components/Meeter/DidYouKnowSection'


const words = [
  'Partner', 'Deal', 'Friend', 'Mentor', 'Study Buddy', 
  'Coffee Mate', 'Venture', 'Community', 'Job', 'Date', 'Opportunity'
];

const wordsHe = [
  'שותף', 'עסקה', 'חבר', 'מנטור', 'שותף ללימודים', 
  'שותף לקפה', 'מיזם', 'קהילה', 'עבודה', 'דייט', 'הזדמנות'
];

const opportunities = [
]

export default function MeeterWhat() {
  const { lang } = useI18n()
  const isHe = lang === 'he' || lang === 'ar'
  const [mode, setMode] = useState('virtual')
  const [isPlaying, setIsPlaying] = useState(false)
  const [wordIdx, setWordIdx] = useState(0)
  const wList = isHe ? wordsHe : words

  useEffect(() => {
    const i = setInterval(() => setWordIdx(p => (p + 1) % wList.length), 1800)
    return () => clearInterval(i)
  }, [wList.length])

  // Reset play state when mode changes
  useEffect(() => {
    setIsPlaying(false)
  }, [mode])

  return (
    <div className="min-h-screen bg-hbm-cream">

      {/* ── S1: HERO + VIDEO TOGGLE ── */}
      <section className="bg-hbm-cream pt-20 pb-12">
          <div className="max-w-4xl mx-auto text-center px-6">
            <div className="mb-8">
              <EyebrowBadge text="THE MEETER - WHAT IS IT?" />
            </div>
            <h1 className="text-4xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-[#6160AB] to-[#F07B3C] bg-clip-text text-transparent" style={{letterSpacing:'-2px'}}>
              {t({ en: 'Bringing Real Conversations to Life.', he: 'מביאים שיחות אמיתיות לחיים.' }, lang)}
            </h1>
            <p className="text-xl text-hbm-gray max-w-2xl mx-auto mb-10">
              {t({ en: 'Events bring people together, but HBM offers the platform that actually connects them.', he: 'אירועים מפגישים אנשים, אבל HBM מציעה את הפלטפורמה שבאמת מחברת אותם.' }, lang)}
            </p>
            {/* Toggle */}
            <div className="flex justify-center gap-3 mb-10">
              <button onClick={() => setMode('physical')} className={`px-6 py-3 rounded-full font-semibold text-sm transition-all ${mode==='physical'?'bg-hbm-orange text-white shadow-lg':'bg-white text-hbm-gray hover:bg-gray-100 border border-transparent hover:border-gray-200'}`}>
                🤝 {t({ en: 'In-Person', he: 'פיזי' }, lang)}
              </button>
              <button onClick={() => setMode('virtual')} className={`px-6 py-3 rounded-full font-semibold text-sm transition-all ${mode==='virtual'?'bg-hbm-purple text-white shadow-lg':'bg-white text-hbm-gray hover:bg-gray-100 border border-transparent hover:border-gray-200'}`}>
                🎥 {t({ en: 'Virtual', he: 'וירטואלי' }, lang)}
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-2xl max-w-3xl mx-auto ring-4 ring-white/50">
              <div className="aspect-video bg-hbm-purple/5 relative group">
                {!isPlaying && (
                  <div 
                    className="absolute inset-0 z-10 cursor-pointer"
                    onClick={() => setIsPlaying(true)}
                  >
                    <img 
                      src={mode === 'virtual' 
                        ? "https://img.youtube.com/vi/PaElS1jAVEo/maxresdefault.jpg" 
                        : "https://img.youtube.com/vi/Zkym_6Kd-lo/maxresdefault.jpg"}
                      alt="Video Thumbnail"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-all">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-hbm-orange border-b-[10px] border-b-transparent ml-1" />
                      </div>
                    </div>
                  </div>
                )}
                <iframe 
                  key={mode}
                  src={`${mode === 'virtual' ? "https://www.youtube.com/embed/PaElS1jAVEo" : "https://www.youtube.com/embed/Zkym_6Kd-lo"}?autoplay=${isPlaying ? 1 : 0}`} 
                  title="HBM" 
                  className="w-full h-full" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen 
                />
              </div>
            </div>
            <p className="text-hbm-gray mt-6 italic text-sm">{t({ en: 'See how 8 minutes change everything.', he: 'ראו איך 8 דקות משנות הכל.' }, lang)}</p>
          </div>
      </section>

      {/* ── S2: OPPORTUNITY — Word Rotator ── */}
      <section className="bg-hbm-cream section-padding">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center w-full">
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
        </div>
      </section>

      {/* ── S3: DID YOU KNOW — 95% Sticky Section ── */}
      <DidYouKnowSection />

      {/* ── S4: OLD vs NEW ── */}
      <ComparisonSection />

      {/* ── S5: WHY 8 MINUTES — Psychology ── */}
      <Why8MinutesTimer compact={true} />



      {/* Bridge to Who */}
      <NextPageBridge 
        to="/meeter/who"
        eyebrow={{ en: 'Next Step', he: 'השלב הבא' }}
        title={{ en: 'Find Your Place', he: 'מצאו את המקום שלכם' }}
        description={{ en: 'Discover who the Meeter is designed for and where you seek connection.', he: 'גלו עבור מי המיטר מיועד ואיפה אתם מחפשים חיבור.' }}
        buttonText={{ en: 'Find Your Place', he: 'מצאו את המקום שלכם' }}
      />

    </div>
  )
}
