import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useI18n, t } from '../i18n/context'
import { siteContent } from '../data/content'

export default function IceBreakerCard() {
  const { lang } = useI18n()
  const questions = siteContent.home.features.iceBreakers.questions
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [activeTab, setActiveTab] = useState('icebreaker')

  const handleDragEnd = (event, info) => {
    const swipeThreshold = 100
    if (Math.abs(info.offset.x) > swipeThreshold) {
      if (info.offset.x > 0) {
        // Swiped right - go to previous
        setDirection(-1)
        setCurrentIndex((prev) => (prev - 1 + questions.length) % questions.length)
      } else {
        // Swiped left - go to next
        setDirection(1)
        setCurrentIndex((prev) => (prev + 1) % questions.length)
      }
    }
  }

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.8,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
      scale: 0.8,
    }),
  }

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Card Container */}
      <div className="relative h-[280px] flex items-center justify-center">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
              scale: { duration: 0.2 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            onDragEnd={handleDragEnd}
            className="absolute w-full cursor-grab active:cursor-grabbing"
          >
            <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-hbm-orange/20">
              {/* Tabs */}
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setActiveTab('icebreaker')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    activeTab === 'icebreaker'
                      ? 'bg-hbm-orange text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  <span className="text-lg">❄️</span>
                  ICE-BREAKER
                </button>
                <button
                  onClick={() => setActiveTab('tip')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    activeTab === 'tip'
                      ? 'bg-hbm-purple text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  <span className="text-lg">💡</span>
                  TIP
                </button>
              </div>

              {/* Question Content */}
              <div className="min-h-[120px] flex items-center justify-center">
                {activeTab === 'icebreaker' ? (
                  <p className="text-2xl font-medium text-hbm-dark italic text-center leading-relaxed">
                    "{t(questions[currentIndex], lang)}"
                  </p>
                ) : (
                  <p className="text-lg text-hbm-gray text-center leading-relaxed">
                    {t(
                      {
                        en: 'Take your time. Listen actively. Let the conversation flow naturally.',
                        he: 'קחו את הזמן שלכם. הקשיבו באופן פעיל. תנו לשיחה לזרום באופן טבעי.',
                      },
                      lang
                    )}
                  </p>
                )}
              </div>

              {/* Swipe Hint */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-400 flex items-center justify-center gap-2">
                  <span>←</span>
                  <span className="font-medium">Swipe me</span>
                  <span>→</span>
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-2 mt-6">
        {questions.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setDirection(idx > currentIndex ? 1 : -1)
              setCurrentIndex(idx)
            }}
            className={`transition-all rounded-full ${
              idx === currentIndex
                ? 'w-8 h-3 bg-hbm-orange'
                : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
