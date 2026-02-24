import { useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
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
  
  // Track scroll progress within this sticky area
  // Reduced height to 135vh to tighten the gap to the next section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  // THE SENTENCE
  const sentence = t({ 
    en: '95% of people hate small talk.', 
    he: '95% מהאנשים שונאים סמול טוק.' 
  }, lang);
  const words = sentence.split(' ');

  return (
    <section ref={containerRef} className="relative h-[135vh] bg-hbm-cream">
      {/* Sticky centered viewport */}
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden px-6">
        
        <div className="relative w-full max-w-6xl flex flex-col items-center justify-center text-center">
          
          {/* Subtle Eyebrow */}
          <motion.p 
            style={{ opacity: useTransform(scrollYProgress, [0, 0.1], [0.6, 0]) }}
            className="text-hbm-gray font-bold text-[10px] md:text-xs uppercase tracking-[0.4em] mb-12"
          >
            {t({ en: 'DID YOU KNOW?', he: 'הידעת?' }, lang)}
          </motion.p>

          {/* Word-by-Word Reveal: 0% to 65% of scroll */}
          <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 md:gap-x-10 mb-12" dir={lang === 'he' ? 'rtl' : 'ltr'}>
            {words.map((word, i) => {
              const step = 0.55 / words.length; 
              const start = 0.05 + (i * step);
              const end = start + step;
              
              const opacity = useTransform(scrollYProgress, [start, end], [0.1, 1]); 
              const scale = useTransform(scrollYProgress, [start, end], [0.95, 1.05]);
              const color = useTransform(scrollYProgress, [start, end], ["#D1D5DB", "#000000"]); 
              const blur = useTransform(scrollYProgress, [start, end], ["blur(4px)", "blur(0px)"]);

              return (
                <motion.span 
                  key={i} 
                  style={{ opacity, color, scale, filter: blur }} 
                  className="text-4xl md:text-7xl lg:text-[10rem] font-black leading-[1.05] tracking-tighter inline-block px-2 transition-colors duration-200"
                >
                  {word}
                </motion.span>
              )
            })}
          </div>

          {/* Punchline Pop-up: 70% to 90% of scroll */}
          {/* We use an Absolute container for the punchline so it overlays perfectly */}
          <div className="relative h-20 md:h-32 w-full flex items-center justify-center mt-12">
            <motion.div 
              style={{ 
                opacity: useTransform(scrollYProgress, [0.7, 0.8], [0, 1]),
                scale: useTransform(scrollYProgress, [0.75, 0.85], [0.4, 1.1]),
                y: useTransform(scrollYProgress, [0.75, 0.85], [100, 0]),
                rotate: useTransform(scrollYProgress, [0.75, 0.85], [10, 0])
              }}
              className="absolute pointer-events-auto"
            >
               <MagneticText>
                  <motion.p 
                    className="text-6xl md:text-9xl lg:text-[12rem] font-black bg-clip-text text-transparent bg-gradient-to-r from-[#F07B3C] via-[#6160AB] to-[#73C154] leading-none drop-shadow-2xl cursor-pointer p-4 pb-8"
                    animate={{ 
                       backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                    }}
                    transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                    style={{ backgroundSize: '200% auto' }}
                  >
                    {t({ en: 'We fixed it.', he: 'אנחנו תיקנו את זה.' }, lang)}
                  </motion.p>
               </MagneticText>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  )
}

export default DidYouKnowSection;
