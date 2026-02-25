import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
import { HowItWorks } from '../components/Home'
import SEO from '../components/SEO'

export default function MeeterWhat() {
  const { lang } = useI18n()
  const isHe = lang === 'he' || lang === 'ar'
  const [mode, setMode] = useState('virtual')
  const [isPlaying, setIsPlaying] = useState(false)

  // Reset play state when mode changes
  useEffect(() => {
    setIsPlaying(false)
  }, [mode])

  return (
    <div className="min-h-screen bg-hbm-cream">
      <SEO />

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
                 {t({ en: 'Face2Face', he: 'פיזי' }, lang)}
              </button>
              <button onClick={() => setMode('virtual')} className={`px-6 py-3 rounded-full font-semibold text-sm transition-all ${mode==='virtual'?'bg-hbm-purple text-white shadow-lg':'bg-white text-hbm-gray hover:bg-gray-100 border border-transparent hover:border-gray-200'}`}>
                 {t({ en: 'Video', he: 'וירטואלי' }, lang)}
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

      {/* ── BRAND STATEMENT ── */}
      <section className="bg-hbm-cream pb-12 pt-4 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-5xl font-black font-['Sora'] text-hbm-purple italic leading-tight tracking-tight"
          >
            {lang === 'he' ? (
              <>
                "פלטפורמה דיגיטלית המיועדת לחבר בין אנשים בזמן אמת באירוע
                <br />
                לשיחות של אחד על אחד."
              </>
            ) : (
              <>
                "Digital platform designed to connect people live at the event
                <br />
                for 1 on 1 conversations."
              </>
            )}
          </motion.p>
        </div>
      </section>

      {/* ── S1.5: HOW IT WORKS — THE MEETER - WHAT IS IT? ── */}
      <HowItWorks />

      {/* ── S3: OLD vs NEW ── */}
      <ComparisonSection />

      {/* ── S4: WHY 8 MINUTES — Psychology ── */}
      <Why8MinutesTimer compact={true} />

      {/* ── S5: DID YOU KNOW — 95% Sticky Section — Fixed and Restored ── */}
      <DidYouKnowSection />

      {/* Bridge to Who */}
      <NextPageBridge 
        to="/meeter/who"
        eyebrow={{ en: 'Next Step', he: 'השלב הבא' }}
        title={{ en: 'Bring Meeter to your community', he: 'מצאו את המקום שלכם' }}
        description={{ en: 'Discover who the Meeter is designed for and where you seek connection.', he: 'גלו עבור מי המיטר מיועד ואיפה אתם מחפשים חיבור.' }}
        buttonText={{ en: 'Choose Your Experience', he: 'מצאו את המקום שלכם' }}
      />

    </div>
  )
}
