import { useRef } from 'react'
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion'
import { useI18n, t } from '../../i18n/context'

const MagneticText = ({ children }) => {
  const ref = useRef(null)
  const position = { x: useMotionValue(0), y: useMotionValue(0) }
  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 }
  const x = useSpring(position.x, springConfig)
  const y = useSpring(position.y, springConfig)

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e
    const { left, top, width, height } = ref.current.getBoundingClientRect()
    const centerX = left + width / 2
    const centerY = top + height / 2
    const distanceX = clientX - centerX
    const distanceY = clientY - centerY
    position.x.set(distanceX * 0.1)
    position.y.set(distanceY * 0.1)
  }

  const handleMouseLeave = () => {
    position.x.set(0)
    position.y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x, y }}
      className="inline-block cursor-grab active:cursor-grabbing"
    >
      {children}
    </motion.div>
  )
}

export default function DidYouKnowSection() {
  const containerRef = useRef(null)
  const { lang } = useI18n()
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  // Sequential word disclosure
  const sentenceEn = "95% of people hate small talk.".split(" ")
  const sentenceHe = "95% מהאנשים שונאים סמול טוק.".split(" ")
  const words = lang === 'he' ? sentenceHe : sentenceEn

  // Professional Animation: Color Reveal + Subtle Slide
  const AnimatedWord = ({ word, index, totalWords, progress }) => {
    // Reveal between 0% and 50% scroll
    const start = (index / totalWords) * 0.4
    const end = start + 0.1
    
    // TRANSFORMS: From faint grey/low-opacity to SOLID BLACK
    const color = useTransform(progress, [start, end], ["#E2E8F0", "#1A1A2E"])
    const opacity = useTransform(progress, [start, end], [0.3, 1])
    const y = useTransform(progress, [start, end], [20, 0])
    
    return (
      <motion.span 
        style={{ color, opacity, y }}
        className="inline-block mr-4 md:mr-8 transition-colors duration-200"
      >
        {word}
      </motion.span>
    )
  }

  // Punchline Pop-up logic (0.6 to 0.8 range)
  const punchlineScale = useTransform(scrollYProgress, [0.6, 0.75], [0.8, 1])
  const punchlineOpacity = useTransform(scrollYProgress, [0.6, 0.7], [0, 1])
  const punchlineY = useTransform(scrollYProgress, [0.6, 0.8], [60, 0])

  return (
    <section 
      ref={containerRef} 
      className="relative h-[180vh] bg-hbm-cream"
    >
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden px-6">
        
        <div className="relative flex flex-col items-center text-center max-w-7xl mx-auto z-10 w-full">
          
          {/* Subtle Eyebrow - Small text as requested */}
          <motion.div 
            style={{ opacity: useTransform(scrollYProgress, [0, 0.1], [1, 0]) }}
            className="mb-6"
          >
             <p className="text-hbm-gray/60 font-medium tracking-[0.4em] uppercase text-[10px] md:text-xs">
                {t({en: 'DID YOU KNOW?', he: 'הידעת?'}, lang)}
             </p>
          </motion.div>

          {/* Large Bold Reveal Text */}
          <h2 className="text-5xl md:text-8xl lg:text-[10rem] font-black leading-[1.1] flex flex-wrap justify-center items-center mb-12 tracking-tighter" dir={lang === 'he' ? 'rtl' : 'ltr'}>
            {words.map((word, i) => (
              <AnimatedWord 
                key={i} 
                word={word} 
                index={i} 
                totalWords={words.length} 
                progress={scrollYProgress} 
              />
            ))}
          </h2>

          {/* We Fixed It Punchline - Professional Pop-up */}
          <motion.div 
            style={{ 
              scale: punchlineScale, 
              opacity: punchlineOpacity,
              y: punchlineY
            }}
            className="mt-4"
          >
            <MagneticText>
              <div className="relative cursor-pointer">
                <p className="text-6xl md:text-9xl lg:text-[11rem] font-black bg-gradient-to-r from-hbm-orange to-hbm-purple bg-clip-text text-transparent pb-4 leading-none tracking-tighter drop-shadow-sm">
                  {t({en: "We fixed it.", he: "אנחנו תיקנו את זה."}, lang)}
                </p>
              </div>
            </MagneticText>
          </motion.div>

        </div>

        {/* Minimalist Background Aura */}
        <motion.div 
          className="absolute inset-0 z-0 pointer-events-none"
          style={{ opacity: useTransform(scrollYProgress, [0.4, 0.7], [0, 0.4]) }}
        >
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-hbm-purple/5 blur-[120px] rounded-full" />
        </motion.div>

      </div>
    </section>
  )
}
