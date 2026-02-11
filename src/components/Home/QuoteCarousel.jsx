import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Quote } from 'lucide-react'
import { useI18n, t } from '../../i18n/context'

const quotes = [
  { text: "We cannot live only for ourselves. A thousand fibers connect us.", author: "Herman Melville" },
  { text: "The meeting of two personalities is like the contact of two chemical substances.", author: "Carl Jung" },
  { text: "Connection is why we're here. It gives purpose and meaning to our lives.", author: "Brené Brown" },
  { text: "Your thoughts create your reality.", author: "Bob Proctor" },
  { text: "Every achievement starts with a burning desire.", author: "Napoleon Hill" },
  { text: "What you think, you become.", author: "Buddha" },
  { text: "The best way to predict the future is to create it.", author: "Abraham Lincoln" },
  { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
]

export default function QuoteCarousel() {
  const { lang } = useI18n()
  const [currentQuote, setCurrentQuote] = useState(0)

  // Auto-rotate quotes every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length)
    }, 6000)

    return () => clearInterval(interval)
  }, [])

  const handleDotClick = (index) => {
    setCurrentQuote(index)
  }

  const quote = quotes[currentQuote]

  return (
    <section id="daily-inspiration" className="section-padding bg-white relative overflow-hidden">
      {/* Animated gradient background blobs */}
      <motion.div
        className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-[#6160AB]/20 to-[#8b7fd9]/20 rounded-full blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <motion.div
        className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[#F07B3C]/15 to-[#ff9b6b]/15 rounded-full blur-3xl"
        animate={{
          x: [0, -80, 0],
          y: [0, 80, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#6160AB]/10 rounded-full mb-4">
            <Quote className="w-5 h-5 text-[#6160AB]" />
            <span className="text-sm font-semibold text-[#6160AB] uppercase tracking-wide">
              {t({ en: 'Daily Inspiration', he: 'השראה יומית' }, lang)}
            </span>
          </div>
        </motion.div>

        {/* Quote Card with 3D Border Effect */}
        <div className="relative max-w-4xl mx-auto">
          {/* Animated gradient border */}
          <motion.div
            className="absolute -inset-1 bg-gradient-to-r from-[#6160AB] via-[#F07B3C] to-[#73C154] rounded-3xl blur opacity-30"
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              backgroundSize: '200% auto',
            }}
          />

          {/* Main quote card */}
          <div className="relative bg-white rounded-3xl p-12 md:p-16 shadow-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuote}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -30, scale: 0.95 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="text-center"
              >
                {/* Decorative quote icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#6160AB] to-[#8b7fd9] rounded-full mb-6"
                >
                  <Quote className="w-8 h-8 text-white" />
                </motion.div>

                {/* Quote text */}
                <p className="text-3xl md:text-4xl font-bold text-hbm-dark leading-relaxed mb-8">
                  "{quote.text}"
                </p>

                {/* Author */}
                <div className="flex items-center justify-center gap-3">
                  <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#F07B3C]" />
                  <p className="text-xl text-[#F07B3C] font-semibold">
                    {quote.author}
                  </p>
                  <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#F07B3C]" />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation Dots */}
        <div className="flex justify-center gap-3 mt-8">
          {quotes.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentQuote
                  ? 'w-12 h-3 bg-gradient-to-r from-[#6160AB] to-[#F07B3C]'
                  : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to quote ${index + 1}`}
            />
          ))}
        </div>

        {/* Quote counter */}
        <motion.p
          key={currentQuote}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mt-6 text-sm text-gray-400 font-medium"
        >
          {currentQuote + 1} / {quotes.length}
        </motion.p>
      </div>
    </section>
  )
}
