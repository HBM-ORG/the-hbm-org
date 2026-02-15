import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'
import { useI18n, t } from '../../i18n/context'
import { siteContent } from '../../data/content'
import BubbleContainer from '../BubbleContainer'

// 3D Tilt Card Component
const MagicCard = ({ image }) => {
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseX = useSpring(x, { stiffness: 150, damping: 15 })
  const mouseY = useSpring(y, { stiffness: 150, damping: 15 })

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const midX = width / 2
    const midY = height / 2
    const clientX = e.clientX - rect.left
    const clientY = e.clientY - rect.top

    const offsetX = (clientX - midX) / midX
    const offsetY = (clientY - midY) / midY

    x.set(offsetY * 10) // Rotate X based on Y axis
    y.set(offsetX * -10) // Rotate Y based on X axis
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center p-4 bg-[#F5F5F7] perspective-1000"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative w-full h-full rounded-[32px] overflow-hidden shadow-2xl"
        style={{
          rotateX: mouseX,
          rotateY: mouseY,
          transformStyle: "preserve-3d",
        }}
      >
        <img 
          src={image} 
          alt="Connection Card" 
          className="w-full h-full object-cover"
        />
        {/* Shine Effect */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 pointer-events-none"
          style={{
            x: useTransform(mouseX, [-10, 10], ['100%', '-100%']),
            y: useTransform(mouseY, [-10, 10], ['100%', '-100%']),
          }}
        />
      </motion.div>
    </motion.div>
  )
}

export default function HowItWorks() {
  const { lang } = useI18n()
  const [mode, setMode] = useState('video') // 'video' | 'physical'
  const [activeStep, setActiveStep] = useState(0)
  const containerRef = useRef(null)
  
  const { howItWorks } = siteContent.home
  const steps = mode === 'video' ? howItWorks.videoSteps : howItWorks.physicalSteps

  const formatDesc = (text) => {
    // Highlight keywords logic
    const parts = text.split(/(Ice-breaker|Connection Card|שוברי קרח|כרטיס חיבור)/gi)
    return parts.map((part, i) => {
      if (part.match(/Ice-breaker|שוברי קרח/i)) {
        return <span key={i} className="font-bold text-hbm-orange">{part}</span>
      }
      if (part.match(/Connection Card|כרטיס חיבור/i)) {
        return <span key={i} className="font-bold text-hbm-purple">{part}</span>
      }
      return part
    })
  }

  return (
    <section className="section-padding bg-hbm-cream" ref={containerRef}>
      <BubbleContainer bgColor="#FAF9F5">
        
        {/* Header & Toggle */}
        <div className="text-center mb-16">
          <motion.h2 
            className="text-4xl md:text-5xl font-bold text-hbm-purple mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {t(howItWorks.title, lang)}
          </motion.h2>
          <motion.p 
            className="text-xl text-hbm-dark/80 mb-10 font-medium"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            {t(howItWorks.subtitle, lang)}
          </motion.p>

          {/* Floating Toggle */}
          {/* Floating Toggle - Resized 2x */}
          <motion.div 
            className="inline-flex bg-gray-100/50 backdrop-blur-sm p-2 rounded-full shadow-inner border border-white/50"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <button 
              onClick={() => { setMode('video'); setActiveStep(0); }}
              className={`px-12 md:px-16 py-4 md:py-5 rounded-full font-bold text-lg md:text-xl transition-all duration-300 ${
                mode === 'video' 
                  ? 'bg-white text-hbm-purple shadow-lg scale-105' 
                  : 'text-gray-500 hover:text-hbm-purple/70'
              }`}
            >
              {t({ en: 'Meeter Video', he: 'Meeter וידאו' }, lang)}
            </button>
            <button 
              onClick={() => { setMode('physical'); setActiveStep(0); }}
              className={`px-12 md:px-16 py-4 md:py-5 rounded-full font-bold text-lg md:text-xl transition-all duration-300 ${
                mode === 'physical' 
                  ? 'bg-white text-hbm-orange shadow-lg scale-105' 
                  : 'text-gray-500 hover:text-hbm-orange/70'
              }`}
            >
              {t({ en: 'Meeter F2F', he: 'Meeter פיזי' }, lang)}
            </button>
          </motion.div>
        </div>

        {/* Content Area */}
        <div className="flex flex-col-reverse md:flex-row items-start justify-between gap-12 md:gap-24 relative">
          
          {/* Left: Steps List (Scrollable) */}
          <div className="w-full md:w-1/2 space-y-4">
            {steps.map((step, i) => {
              const isActive = activeStep === i
              const title = t(step.title, lang)
              const desc = t(step.desc, lang)
              
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{  margin: "-10% 0px -10% 0px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  onViewportEnter={() => setActiveStep(i)} // Update active step on scroll
                  onClick={() => setActiveStep(i)}
                  className={`cursor-pointer group relative p-6 rounded-2xl transition-all duration-300 ${
                    isActive 
                      ? 'bg-white shadow-xl shadow-purple-900/5 scale-100 border border-purple-100' 
                      : 'bg-transparent hover:bg-white/50 scale-95 opacity-60 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-start gap-5">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-colors duration-300 ${
                      isActive 
                        ? (mode === 'video' ? 'bg-hbm-purple text-white' : 'bg-hbm-orange text-white')
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {i + 1}
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold mb-2 transition-colors duration-300 ${
                        isActive ? 'text-hbm-dark' : 'text-gray-600'
                      }`}>
                        {title}
                      </h3>
                      <p className="text-gray-500 leading-relaxed">
                        {formatDesc(desc)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Active Indicator Line */}
                  {isActive && (
                    <motion.div 
                      layoutId="active-indicator"
                      className={`absolute left-0 top-6 bottom-6 w-1 rounded-r-full ${
                        mode === 'video' ? 'bg-hbm-purple' : 'bg-hbm-orange'
                      }`}
                    />
                  )}
                </motion.div>
              )
            })}
          </div>

          {/* Right: Sticky Phone Mockup (Floating) */}
          <div className="w-full md:w-5/12 sticky top-24 self-start">
            <motion.div
              className="relative mx-auto w-[280px] md:w-[320px]"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* Phone Frame */}
              <div className="relative bg-hbm-dark/5 backdrop-blur-xl border border-white/20 rounded-[48px] p-2 shadow-2xl">
                <div className="relative bg-black rounded-[40px] overflow-hidden aspect-[9/19] border-[8px] border-black">
                  
                  {/* Dynamic Screen Content */}
                  <AnimatePresence mode="wait">
                    {mode === 'physical' && activeStep === 4 ? (
                      // Step 5 F2F: Connection Card Magic Tilt
                      <MagicCard key="magic-card" image={steps[activeStep].image} />
                    ) : (
                       // Standard Image Fade
                      <motion.img
                        key={steps[activeStep].image}
                        src={steps[activeStep].image}
                        alt={`Step ${activeStep + 1}`}
                        className="absolute inset-0 w-full h-full object-cover"
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                      />
                    )}
                  </AnimatePresence>

                  {/* UI Overlay (Time/Status) */}
                  <div className="absolute top-0 left-0 right-0 h-14 bg-gradient-to-b from-black/50 to-transparent z-20 pointer-events-none" />
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-6 bg-black rounded-b-2xl z-30" />
                </div>
              </div>

              {/* Float Shadow */}
              <motion.div 
                className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-40 h-4 bg-black/20 rounded-[100%] blur-md"
                animate={{ scale: [1, 0.9, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
          </div>
        </div>
      </BubbleContainer>
    </section>
  )
}
