import { useState, useEffect } from 'react'
import { Check, Info, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useI18n, t } from '../i18n/context'
import { siteContent } from '../data/content'

export default function CustomLocationsMockup() {
  const { lang } = useI18n()
  
  const locations = [
    { id: 'terrace', name: { en: 'The Terrace', he: 'המרפסת' }, image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80' },
    { id: 'bar', name: { en: 'Wine Stand', he: 'דוכן יין' }, image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80' },
    { id: 'lounge', name: { en: 'Networking Lounge', he: 'מתחם הנטוורקינג' }, image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80' },
    { id: 'lobby', name: { en: 'The Lobby', he: 'לובי הכניסה' }, image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80' },
    { id: 'coffee', name: { en: 'Barista Corner', he: 'עמדת הבריסטה' }, image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80' },
    { id: 'vip', name: { en: 'Executive Lounge', he: 'טרקלין VIP יוקרתי' }, image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80' },
    { id: 'hall', name: { en: 'The Hub', he: 'הספוט המרכזי' }, image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80' },
    { id: 'rooftop', name: { en: 'The Rooftop', he: 'הגג (Rooftop)' }, image: 'https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&w=800&q=80' }
  ]

  const [currentIndex, setCurrentIndex] = useState(0)
  const [tipIndex, setTipIndex] = useState(0)
  const [activeTab, setActiveTab] = useState('tip')
  const [direction, setDirection] = useState(0)

  const icebreakers = siteContent.home.features.iceBreakers.questions || []
  const tips = siteContent.home.features.iceBreakers.tips || []

  // Decoupled drag handlers
  const handleDragTipEnd = (event, info) => {
    const swipeThreshold = 50
    if (Math.abs(info.offset.x) > swipeThreshold) {
      if (info.offset.x > 0) {
        setDirection(1)
        setTipIndex((prev) => (prev + 1) % tips.length)
      } else {
        setDirection(-1)
        setTipIndex((prev) => (prev - 1 + tips.length) % tips.length)
      }
    }
  }

  const handleDragImageEnd = (event, info) => {
    const swipeThreshold = 50
    if (Math.abs(info.offset.x) > swipeThreshold) {
      if (info.offset.x > 0) {
        setDirection(1)
        setCurrentIndex((prev) => (prev + 1) % locations.length)
      } else {
        setDirection(-1)
        setCurrentIndex((prev) => (prev - 1 + locations.length) % locations.length)
      }
    }
  }

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
      scale: 0.9,
    }),
  }

  useEffect(() => {
    const timer = setInterval(() => {
      // Auto-cycle ONLY the images
      setDirection(1)
      setCurrentIndex((prev) => (prev + 1) % locations.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [locations.length])

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      className="relative w-full max-w-[340px] mx-auto overflow-hidden bg-white/50 backdrop-blur-xl rounded-[48px] border-8 border-white shadow-2xl p-7 flex flex-col items-center"
    >
      <h3 className="text-[32px] font-black text-[#6160AB] mb-8 font-['Sora'] tracking-tight">
        {t({ en: 'Go to:', he: 'לכו ל:' }, lang)}
      </h3>

      {/* Main Image Card */}
      <div className="relative w-full aspect-[4/3] rounded-[32px] overflow-hidden shadow-2xl mb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0"
          >
            <img 
              src={locations[currentIndex].image} 
              alt={t(locations[currentIndex].name, lang)}
              className="w-full h-full object-cover"
            />
            {/* Visual Overlay - Premium Dark Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent flex flex-col justify-end p-6">
               <h4 className="text-2xl font-black text-white font-['Sora'] tracking-tight">
                  {t(locations[currentIndex].name, lang)}
                </h4>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress Dots */}
      <div className="flex gap-2 mb-8">
        {locations.map((_, idx) => (
          <div 
            key={idx}
            className={`h-1.5 transition-all duration-700 rounded-full ${
              idx === currentIndex ? 'w-8 bg-[#6160AB]' : 'w-1.5 bg-[#6160AB]/10'
            }`}
          />
        ))}
      </div>

      {/* Tip Card - Decoupled with Manual Interaction Only */}
      <div className="relative w-full h-[220px] mb-8">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div 
            key={`${tipIndex}-${activeTab}`}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
              scale: { duration: 0.2 }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            onDragEnd={handleDragTipEnd}
            className="absolute w-full bg-white rounded-[32px] p-6 shadow-xl border-4 border-hbm-orange/10 flex flex-col cursor-grab active:cursor-grabbing"
          >
            {/* Card Tabs */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={(e) => { e.stopPropagation(); setActiveTab('icebreaker'); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black transition-all ${
                  activeTab === 'icebreaker'
                    ? 'bg-hbm-orange text-white shadow-md'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                <span>❄️</span>
                {t({ en: 'ICE-BREAKER', he: 'שוברי קרח' }, lang)}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setActiveTab('tip'); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black transition-all ${
                  activeTab === 'tip'
                    ? 'bg-hbm-purple text-white shadow-md'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                <span>💡</span>
                {t({ en: 'TIP', he: 'טיפ' }, lang)}
              </button>
            </div>

            {/* Content */}
            <div className="min-h-[60px] flex items-center">
              <p className="text-[14px] text-hbm-dark font-semibold font-['Sora'] leading-relaxed">
                {activeTab === 'tip' 
                  ? t(tips[tipIndex], lang) 
                  : t(icebreakers[tipIndex], lang)}
              </p>
            </div>

            {/* Swipe Hint */}
            <div className="mt-6 flex justify-center items-center gap-2 text-[10px] text-gray-300 font-bold uppercase tracking-widest font-['Sora']">
              <span className="opacity-50">←</span>
              <span>{t({ en: 'Swipe me', he: 'החליקו' }, lang)}</span>
              <span className="opacity-50">→</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Action Button */}
      <button className="w-full py-5 bg-[#6160AB] text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-lg hover:shadow-2xl transition-all duration-300 font-['Sora'] uppercase tracking-widest">
        <Check size={20} />
        <span>{t({ en: "I've arrived!", he: "הגעתי!" }, lang)}</span>
      </button>

      <button className="mt-5 text-[10px] font-black text-gray-400 uppercase tracking-widest font-['Sora']">
        {t({ en: 'Back', he: 'חזרה' }, lang)}
      </button>
    </motion.div>
  )
}
