import React from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useI18n, t } from '../../i18n/context'

export default function AnimatedHero({ imagePairs, titlePrefix, rotatingWords, rotatingWordsHe, titleSuffix }) {
  const { lang } = useI18n()
  const isHe = lang === 'he' || lang === 'ar'
  const words = isHe ? rotatingWordsHe : rotatingWords
  
  const [wordIdx, setWordIdx] = React.useState(0)
  
  const marqueeContent = React.useMemo(() => {
    const speed = 120 // Slightly faster for more energy
    const direction = 1
    return (
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused] whitespace-nowrap px-0 h-32 md:h-44 items-center"
           style={{ animationDuration: `${speed}s`, animationDirection: direction === -1 ? 'reverse' : 'normal' }}>
        {[...imagePairs, ...imagePairs, ...imagePairs].map((pair, idx) => (
          <React.Fragment key={idx}>
            {pair.unit ? (
              <motion.div 
                className="h-28 md:h-40 flex-shrink-0 px-0 pr-8 md:pr-12"
                animate={{ 
                  scale: [1, 1.01, 1],
                  rotate: 0
                }}
                transition={{ 
                  duration: 6, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: idx * 0.5
                }}
              >
                <img src={pair.unit} alt="" className="h-full w-auto object-contain" />
              </motion.div>
            ) : (
                <div className="flex -space-x-8 md:-space-x-10">
                  <motion.div className="video-circle w-28 h-28 md:w-32 md:h-32 border-[6px]" style={{ borderColor: pair.leftBorder || '#bbc0ff' }}>
                    {pair.left?.endsWith('.mp4') ? <video src={pair.left} autoPlay muted loop playsInline poster={pair.leftPoster} className="w-full h-full object-cover" /> : <img src={pair.left} alt="" className="w-full h-full object-cover scale-[1.25] origin-center" />}
                  </motion.div>
                  <motion.div className="video-circle w-28 h-28 md:w-32 md:h-32 border-[6px] relative z-10" style={{ borderColor: pair.rightBorder || '#fdb586' }}>
                    {pair.right?.endsWith('.mp4') ? <video src={pair.right} autoPlay muted loop playsInline poster={pair.rightPoster} className="w-full h-full object-cover" /> : <img src={pair.right} alt="" className="w-full h-full object-cover scale-[1.25] origin-center" />}
                  </motion.div>
                </div>
            )}
          </React.Fragment>
        ))}
      </div>
    )
  }, [imagePairs])

  React.useEffect(() => {
    const interval = setInterval(() => setWordIdx(i => (i + 1) % words.length), 2000)
    return () => clearInterval(interval)
  }, [words.length])

  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, [0, 200], [1, 0])

  return (
    <section id="hero" className="relative min-h-screen flex items-start justify-center overflow-hidden w-full bg-[#FAF9F5] pt-2 md:pt-4">
      {/* Premium Aura Background Layers */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-[10%] -left-[10%] w-[70%] h-[70%] bg-[#6160AB]/15 rounded-full blur-[120px]"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-[10%] -right-[10%] w-[70%] h-[70%] bg-[#F07B3C]/10 rounded-full blur-[120px]"
          animate={{
            x: [0, -40, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-[#73C154]/10 rounded-full blur-[100px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div 
        className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-16 md:pt-20 pb-12 flex flex-col items-center justify-center min-h-[85vh]"
        style={{ opacity }}
      >
        {/* Eyebrow text animated down slightly */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 md:mb-12"
        >
          <span className="inline-block px-6 py-2 bg-[#6160AB]/10 text-[#6160AB] rounded-full text-sm font-semibold tracking-wide uppercase">
            {t({ en: 'The Human Being Movement', he: 'תנועת בני האדם' }, lang)}
          </span>
        </motion.div>

        {/* Infinite Marquee for Video Circles */}
        <div className="relative w-full overflow-hidden mask-gradient-x mb-8 md:mb-12">
          {/* Duplicate sets for infinite loop handled safely inside MarqueeTrack now */}
          {marqueeContent}
        </div>

        {/* Main headline - Grid layout for strict 2 lines */}
        <motion.h1
          className="text-[2.5rem] sm:text-5xl md:text-6xl lg:text-[6.2rem] font-bold mb-6 md:mb-10 leading-[1.1] tracking-tight"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          dir={isHe ? 'rtl' : 'ltr'}
        >
          {/* Line 1: Prefix + Rotating Word */}
          <div className="flex flex-nowrap justify-center items-center gap-x-2 md:gap-x-5 mb-2 md:mb-4 whitespace-nowrap overflow-hidden">
            <span className="text-hbm-purple shrink-0">
              {t(titlePrefix, lang)}
            </span>
            <motion.span
              className="bg-gradient-to-r from-[#6160AB] via-[#F07B3C] to-[#73C154] bg-clip-text text-transparent word-rotate"
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
          <div className="text-hbm-purple block mt-1">
            {t(titleSuffix, lang)}
          </div>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          className="text-sm md:text-lg lg:text-xl text-hbm-gray max-w-[90%] md:max-w-2xl mx-auto mb-10 md:mb-20 px-2 md:px-0 leading-relaxed"
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

        {/* Scroll indicator directly below CTA in main flow */}
        <motion.div
          className="mt-12 md:mt-16 flex flex-col items-center gap-1 text-[#6160AB]/60"
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-sm font-medium tracking-wide">
            {t({ en: 'Scroll to explore', he: 'גללו למטה' }, lang)}
          </span>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  )
}
