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

        {/* Infinite Marquee for Video Circles */}
        <div className="relative w-full overflow-hidden mask-gradient-x mb-12">
          <div className="flex gap-8 items-center w-max animate-marquee hover:[animation-play-state:paused]">
            {/* Duplicate sets for infinite loop */}
            {[...imagePairs, ...imagePairs, ...imagePairs].map((pair, i) => (
              <div key={i} className="flex items-center -space-x-4 shrink-0 transform hover:scale-105 transition-transform duration-300">
                <div className="video-circle w-20 h-20 md:w-28 md:h-28 border-4" style={{ borderColor: '#bbc0ff' }}>
                  {pair.left?.endsWith('.mp4') ? (
                    <video src={pair.left} autoPlay muted loop playsInline poster={pair.poster} className="w-full h-full object-cover" />
                  ) : <img src={pair.poster} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="video-circle w-20 h-20 md:w-28 md:h-28 border-4" style={{ borderColor: '#fdb586' }}>
                  {pair.right?.endsWith('.mp4') ? (
                    <video src={pair.right} autoPlay muted loop playsInline poster={pair.poster} className="w-full h-full object-cover" />
                  ) : <img src={pair.poster} alt="" className="w-full h-full object-cover" />}
                </div>
              </div>
            ))}
          </div>
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
          {/* WHAT IS IT? Button */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
            <Link
              to="/meeter"
              className="group px-10 py-4 bg-white border-2 border-[#6160AB] text-[#6160AB] rounded-full text-lg font-bold shadow-lg hover:bg-[#6160AB] hover:text-white transition-all duration-300 inline-flex items-center justify-center min-w-[200px]"
            >
              {t({ en: 'WHAT IS IT ?', he: 'מה זה?' }, lang)}
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="flex flex-col items-center gap text-gray-400">
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
