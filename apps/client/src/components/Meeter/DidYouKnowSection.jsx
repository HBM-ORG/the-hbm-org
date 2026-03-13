import React, { useRef, useState } from 'react'
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
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 })
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

  // progress 0 = סקשן נכנס (תחילת הסקשן במסך), 1 = סוף הסקשן – כך האפקט קורה בזמן שהמשתמש גולל בתוך הסקשן
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  const sentence = t(
    { en: '95% of people hate small talk.', he: '95% מהאנשים שונאים סמול טוק.' },
    lang
  )
  const words = sentence.split(' ')

  return (
    <section ref={containerRef} className="relative h-[150vh] min-h-[150vh] bg-transparent z-10">
      <div className="sticky top-0 left-0 right-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden px-6 bg-transparent z-50">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center justify-center gap-12">
          {/* Eyebrow */}
          <motion.p
            className="text-[#F07B3C] font-black text-sm uppercase tracking-[0.2em]"
            style={{ opacity: useTransform(scrollYProgress, [0.05, 0.15], [0, 1]) }}
          >
            {t({ en: 'DID YOU KNOW?', he: 'הידעת?' }, lang)}
          </motion.p>

          {/* Text Reveal – בהתחלה המילים לא נראות, גלילה חושפת מילה־אחרי־מילה והופכת לשחור */}
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-2 md:gap-x-6" dir={lang === 'he' ? 'rtl' : 'ltr'}>
            {words.map((word, i) => {
              const step = 0.45 / words.length
              const start = 0.1 + (i * step)
              const end = start + step
              const opacity = useTransform(scrollYProgress, [start, end], [0, 1])
              const y = useTransform(scrollYProgress, [start, end], [16, 0])
              const color = useTransform(scrollYProgress, [start, end], ["#9CA3AF", "#000000"])
              return (
                <motion.span
                  key={i}
                  style={{ opacity, y, color }}
                  className="text-5xl md:text-8xl font-bold leading-tight"
                >
                  {word}
                </motion.span>
              )
            })}
          </div>

          {/* "We fixed it." – בהתחלה לא קיים, אחרי שכל המילים נחשפו מופיע מקטן לגדול */}
          <motion.div
            style={{
              opacity: useTransform(scrollYProgress, [0.6, 0.78], [0, 1]),
              scale: useTransform(scrollYProgress, [0.6, 0.85], [0.25, 1]),
              y: useTransform(scrollYProgress, [0.6, 0.82], [24, 0]),
              transformOrigin: "center center"
            }}
            className="mt-8"
          >
            <MagneticText>
              <p
                className="text-6xl md:text-9xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#F07B3C] to-[#6160AB] cursor-pointer"
                style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' }}
              >
                {t({ en: 'We fixed it.', he: 'אנחנו תיקנו את זה.' }, lang)}
              </p>
            </MagneticText>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default DidYouKnowSection
