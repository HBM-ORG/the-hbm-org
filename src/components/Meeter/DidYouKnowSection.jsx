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

  return (
    <section ref={containerRef} className="relative h-[450vh] bg-hbm-cream z-10">
      {/* Sticky centered viewport - force high Z and solid BG */}
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden px-6 bg-hbm-cream z-50">
        
        <div className="relative w-full max-w-7xl flex flex-col items-center justify-center text-center">
          
          {/* Subtle Eyebrow - Fixed Visibility and Increased Size */}
          <motion.p 
            style={{ 
              opacity: 1,
              fontFamily: "'Sora', sans-serif"
            }}
            className="text-[#F07B3C] font-black text-lg md:text-xl uppercase tracking-[0.2em] mb-8 md:mb-10"
          >
            {t({ en: 'DID YOU KNOW?', he: 'הידעת?' }, lang)}
          </motion.p>

          {/* Word-by-Word Stepped Reveal */}
          <div className="max-w-4xl mx-auto mb-8" dir={lang === 'he' ? 'rtl' : 'ltr'}>
            <div className="flex flex-wrap justify-center items-center gap-x-2 md:gap-x-4">
              {words.map((word, i) => {
                // Discrete thresholds: Entry (0.05) to End of words (0.75)
                const startThreshold = 0.08 + (i * (0.65 / words.length));
                
                // Each word pops at its threshold
                const wordOpacity = useTransform(smoothProgress, 
                  [startThreshold - 0.01, startThreshold, 0.82, 0.9], 
                  [0.1, 1, 1, 0.2]
                );
                
                // Add break after "people" to create 2 lines
                const isBreak = i === 2; // "95%", "of", "people"

                return (
                  <React.Fragment key={i}>
                    <motion.span 
                      style={{ opacity: wordOpacity, color: useTransform(smoothProgress, [startThreshold - 0.01, startThreshold], ["#cbd5e1", "#1e293b"]) }} 
                      className="text-4xl md:text-7xl lg:text-[7.5rem] font-black tracking-tighter inline-block px-2 leading-[0.9]"
                    >
                      {word}
                    </motion.span>
                    {isBreak && <div className="w-full h-0" />}
                  </React.Fragment>
                )
              })}
            </div>
          </div>

          {/* Punchline Pop-up (Triggered after all words) */}
          <div className="relative h-24 md:h-40 w-full flex items-center justify-center pt-8">
            <motion.div 
              style={{ 
                opacity: useTransform(smoothProgress, [0.77, 0.85], [0, 1]),
                scale: useTransform(smoothProgress, [0.8, 0.9], [0.8, 1]),
                y: useTransform(smoothProgress, [0.8, 0.9], [20, 0]),
                rotate: 0 // Explicitly straight as requested
              }}
              className="absolute z-60 w-full flex justify-center"
            >
               <MagneticText>
                  <motion.p 
                    className="text-5xl md:text-8xl lg:text-[12rem] font-black bg-clip-text text-transparent bg-gradient-to-r from-[#F07B3C] via-[#6160AB] to-[#6160AB] leading-none whitespace-nowrap px-4 py-8"
                    animate={{ 
                       backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                    }}
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
      
      {/* Scroll indicator */}
      <motion.div 
        style={{ opacity: useTransform(smoothProgress, [0.96, 0.99], [0, 1]) }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2"
      >
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-1 h-12 bg-gradient-to-b from-hbm-purple/20 to-transparent rounded-full"
        />
      </motion.div>
    </section>
  )
}

export default DidYouKnowSection;
