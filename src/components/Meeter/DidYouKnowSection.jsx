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

const AnimatedWord = ({ word, index, totalWords, scrollYProgress }) => {
  // Calculate range for each word
  // Total reveals from 0.1 to 0.5
  const step = 0.4 / totalWords
  const start = 0.1 + (index * step)
  const end = start + 0.15 
  
  const opacity = useTransform(scrollYProgress, [start, end], [0.1, 1])
  const y = useTransform(scrollYProgress, [start, end], [50, 0]) // "Jump" effect
  
  return (
    <motion.span 
      style={{ opacity, y, color: '#1F1F1F' }} // Dark color for readability on cream
      className="inline-block mr-2"
    >
      {word}
    </motion.span>
  )
}

export default function DidYouKnowSection() {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  // 1. Text Reveal Logic: "95% of people hate small talk."
  const sentenceEn = "95% of people hate small talk.".split(" ")
  const sentenceHe = "95% מהאנשים שונאים סמול טוק.".split(" ")

  const { lang } = useI18n()
  const words = lang === 'he' ? sentenceHe : sentenceEn

  // 2. Punchline
  const punchlineScale = useTransform(scrollYProgress, [0.6, 0.8], [0, 1])
  const punchlineOpacity = useTransform(scrollYProgress, [0.6, 0.7], [0, 1])

  return (
    <div 
      ref={containerRef} 
      className="relative h-[300vh]"
    >
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden px-6">
        
        <div className="flex flex-col items-center text-center max-w-5xl mx-auto z-10 w-full">
          
          {/* Eyebrow - Fades out as we scroll deep */}
          <motion.p 
            style={{ opacity: useTransform(scrollYProgress, [0, 0.2], [1, 0]) }}
            className="text-hbm-orange font-bold tracking-[0.2em] uppercase mb-8 text-sm md:text-base"
          >
            {t({en: 'DID YOU KNOW?', he: 'הידעת?'}, lang)}
          </motion.p>

          {/* Reveal Text */}
          <h2 className="text-5xl md:text-8xl font-bold leading-tight flex flex-wrap justify-center gap-x-4 gap-y-2 mb-16" dir={lang === 'he' ? 'rtl' : 'ltr'}>
            {words.map((word, i) => (
              <AnimatedWord 
                key={i} 
                word={word} 
                index={i} 
                totalWords={words.length} 
                scrollYProgress={scrollYProgress} 
              />
            ))}
          </h2>

          {/* Punchline */}
          <motion.div 
            style={{ 
              scale: punchlineScale, 
              opacity: punchlineOpacity 
            }}
            className="mt-8"
          >
            <MagneticText>
              <p className="text-6xl md:text-9xl font-black bg-gradient-to-r from-hbm-orange to-hbm-purple bg-clip-text text-transparent drop-shadow-2xl pb-4">
                {t({en: "We fixed it.", he: "תיקנו את זה."}, lang)}
              </p>
            </MagneticText>
          </motion.div>

        </div>

      </div>
    </div>
  )
}
