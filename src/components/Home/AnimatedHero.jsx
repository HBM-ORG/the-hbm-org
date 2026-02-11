import React from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useI18n, t } from '../../i18n/context'

export default function AnimatedHero({ imagePairs, titlePrefix, rotatingWords, rotatingWordsHe, titleSuffix }) {
  const { lang } = useI18n()
  const isHe = lang === 'he' || lang === 'ar'
  const words = isHe ? rotatingWordsHe : rotatingWords
  
  const [wordIdx, setWordIdx] = React.useState(0)
  
  React.useEffect(() => {
    const interval = setInterval(() => setWordIdx(i => (i + 1) % words.length), 2000)
    return () => clearInterval(interval)
  }, [words.length])

  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, [0, 200], [1, 0])

  return (
    <section id="hero" className="relative min-h-screen flex items-start justify-center overflow-hidden bg-gradient-to-br from-[#f8f9fa] to-[#fef5ed] pt- md:pt-1
    ">
      {/* Animated background blobs */}
      <motion.div
        className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-[#6160AB]/20 to-[#8b7fd9]/20 rounded-full blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, -80, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-gradient-to-r from-[#F07B3C]/20 to-[#ff9b6b]/20 rounded-full blur-3xl"
        animate={{
          x: [0, -120, 0],
          y: [0, 100, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-[#73C154]/15 to-[#9bd986]/15 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.4, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* Main content */}
      <motion.div 
        className="relative z-10 max-w-5xl mx-auto px-6 text-center section-padding"
        style={{ opacity }}
      >
        {/* Eyebrow text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-3 -translate-y-[60px]"
        >
          <span className="inline-block px-6 py-2 bg-[#6160AB]/10 text-[#6160AB] rounded-full text-sm font-semibold tracking-wide uppercase">
            {t({ en: 'The Human Being Movement', he: 'תנועת vb' }, lang)}
          </span>
        </motion.div>

        {/* Avatar pairs with videos */}
        <div className="flex items-center justify-center gap-4 md:gap-6 mb-8 flex-wrap">
          {imagePairs.map((pair, i) => (
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

        {/* Main headline - Grid layout for strict 2 lines */}
        <motion.h1
          className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-[1.1]"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          dir={isHe ? 'rtl' : 'ltr'}
        >
          {/* Line 1: Prefix + Rotating Word */}
          <div className="flex flex-wrap justify-center gap-x-4 mb-2">
            <span className="text-hbm-purple whitespace-nowrap">
              {t(titlePrefix, lang)}
            </span>
            <motion.span
              className="bg-gradient-to-r from-[#6160AB] via-[#F07B3C] to-[#73C154] bg-clip-text text-transparent word-rotate whitespace-nowrap"
              key={wordIdx}
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
            >
              {words[wordIdx]}
            </motion.span>
          </div>
          
          {/* Line 2: Suffix */}
          <div className="text-hbm-purple">
            {t(titleSuffix, lang)}
          </div>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          className="text-lg md:text-xl text-hbm-gray max-w-2xl mx-auto mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          {t({ en: 'Connection is not just a feeling. Connection is taking an action.', he: 'חיבור הוא לא רק תחושה. חיבור הוא פעולה.' }, lang)}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          {/* Primary CTA */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
            <Link
              to="/meeter"
              className="group relative px-10 py-4 bg-[#F07B3C] text-white rounded-full text-lg font-semibold shadow-2xl overflow-hidden inline-flex items-center gap-3"
            >
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />
              <span className="relative z-10">
                {t({ en: 'Start Your 8 Min', he: 'התחילו 8 דקות' }, lang)}
              </span>
              <motion.svg 
                className="relative z-10 w-5 h-5"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </motion.svg>
            </Link>
          </motion.div>

          {/* Secondary CTA */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
            <Link
              to="/b2b"
              className="group px-10 py-4 bg-white border-2 border-[#6160AB] text-[#6160AB] rounded-full text-lg font-semibold shadow-lg hover:bg-[#6160AB] hover:text-white transition-all duration-300 inline-flex items-center gap-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {t({ en: 'Book Enterprise Demo', he: 'הזמינו הדגמה לארגון' }, lang)}
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <span className="text-sm font-medium tracking-wide">
              {t({ en: 'Scroll to explore', he: 'גללו למטה' }, lang)}
            </span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
