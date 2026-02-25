import React, { useRef, useState } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { useI18n, t } from '../../i18n/context'

const MagneticText = ({ children }) => {
  const ref = useRef(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const handleMouse = (e) => {
    const { clientX, clientY } = e
    const { height, width, left, top } = ref.current.getBoundingClientRect()
    const middleX = clientX - (left + width / 2)
    const middleY = clientY - (top + height / 2)
    setPosition({ x: middleX * 0.15, y: middleY * 0.15 })
  }
  const reset = () => setPosition({ x: 0, y: 0 })
  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
    >
      {children}
    </motion.div>
  )
}

const DidYouKnowSection = () => {
  const { lang } = useI18n()
  const containerRef = useRef(null)
  
  // 450vh for very solid pinning
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  // Stiffer spring for immediate feedback
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 25,
    restDelta: 0.001
  })

  // THE SENTENCE
  const sentence = t({ 
    en: '95% of people hate small talk.', 
    he: '95% מהאנשים שונאים סמול טוק.' 
  }, lang);
  const words = sentence.split(' ');

  // Single section for mobile + desktop: scroll drives progress → sticky → words pop → "We fixed it."
  // Do not split into separate mobile/desktop blocks or mobile will lose the animation (bug: endless scroll + empty space).
  return (
    <section ref={containerRef} className="relative h-[320vh] md:h-[450vh] bg-hbm-cream z-10">
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden px-6 bg-hbm-cream z-50">
        <div className="relative w-full max-w-7xl flex flex-col items-center justify-center text-center">
          <motion.p 
            style={{ opacity: 1, fontFamily: "'Sora', sans-serif" }}
            className="text-[#F07B3C] font-black text-lg md:text-xl uppercase tracking-[0.2em] mb-6 md:mb-10"
          >
            {t({ en: 'DID YOU KNOW?', he: 'הידעת?' }, lang)}
          </motion.p>
          <div className="max-w-4xl mx-auto mb-6 md:mb-8" dir={lang === 'he' ? 'rtl' : 'ltr'}>
            <div className="flex flex-wrap justify-center items-center gap-x-1 md:gap-x-4">
              {words.map((word, i) => {
                const startThreshold = 0.08 + (i * (0.65 / words.length));
                const wordOpacity = useTransform(smoothProgress, [startThreshold - 0.01, startThreshold, 0.82, 0.9], [0.1, 1, 1, 0.2]);
                const isBreak = i === 2;
                return (
                  <React.Fragment key={i}>
                    <motion.span 
                      style={{ opacity: wordOpacity, color: useTransform(smoothProgress, [startThreshold - 0.01, startThreshold], ["#cbd5e1", "#1e293b"]) }} 
                      className="text-3xl sm:text-4xl md:text-7xl lg:text-[7.5rem] font-black tracking-tighter inline-block px-1 md:px-2 leading-[0.9]"
                    >
                      {word}
                    </motion.span>
                    {isBreak && <div className="w-full h-0" />}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
          <div className="relative h-20 md:h-40 w-full flex items-center justify-center pt-6 md:pt-8">
            <motion.div 
              style={{ 
                opacity: useTransform(smoothProgress, [0.77, 0.85], [0, 1]),
                scale: useTransform(smoothProgress, [0.8, 0.9], [0.8, 1]),
                y: useTransform(smoothProgress, [0.8, 0.9], [20, 0]),
                rotate: 0
              }}
              className="absolute z-60 w-full flex justify-center"
            >
              <MagneticText>
                <motion.p 
                  className="text-4xl sm:text-5xl md:text-8xl lg:text-[12rem] font-black bg-clip-text text-transparent bg-gradient-to-r from-[#F07B3C] via-[#6160AB] to-[#6160AB] leading-none whitespace-nowrap px-2 md:px-4 py-4 md:py-8"
                  animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                  style={{ backgroundSize: '200% auto' }}
                >
                  {t({ en: 'We fixed it.', he: 'אנחנו תיקנו את זה.' }, lang)}
                </motion.p>
              </MagneticText>
            </motion.div>
          </div>
        </div>
      </div>
      <motion.div 
        style={{ opacity: useTransform(smoothProgress, [0.96, 0.99], [0, 1]) }}
        className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2"
      >
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-1 h-10 md:h-12 bg-gradient-to-b from-hbm-purple/20 to-transparent rounded-full"
        />
      </motion.div>
    </section>
  )
}

export default DidYouKnowSection;
