import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'
import { useI18n, t } from '../../i18n/context'
import { siteContent } from '../../data/content'
import BubbleContainer from '../BubbleContainer'
import { ChevronDown } from 'lucide-react'
import { getApiBase } from '../../utils/api'

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
      className="absolute inset-0 flex items-center justify-center perspective-1000"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative w-full h-full"
        style={{
          rotateX: mouseX,
          rotateY: mouseY,
          transformStyle: "preserve-3d",
        }}
      >
        <img 
          src={image} 
          alt="Connection Card" 
          className="w-full h-auto object-contain drop-shadow-2xl"
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
  const [cmsContent, setCmsContent] = useState(null)
  const containerRef = useRef(null)
  
  useEffect(() => {
    fetch(`${getApiBase()}/api/cms/how-it-works`)
      .then(res => (res.ok ? res.json() : {}))
      .then(data => {
        if (data && (data.videoSteps || data.physicalSteps)) {
          setCmsContent(data);
        }
      })
      .catch(() => { /* use static siteContent fallback */ });
  }, []);

  const { howItWorks } = siteContent.home
  const staticSteps = mode === 'video' ? howItWorks.videoSteps : howItWorks.physicalSteps
  const cmsSteps = cmsContent
    ? (mode === 'video' ? cmsContent.videoSteps : cmsContent.physicalSteps)
    : null
  const steps = Array.isArray(cmsSteps) && cmsSteps.length > 0 ? cmsSteps : staticSteps
  const currentStep = steps[activeStep] || steps[0] || null

  useEffect(() => {
    if (!steps.length) {
      setActiveStep(0)
      return
    }

    if (activeStep >= steps.length) {
      setActiveStep(0)
    }
  }, [activeStep, steps])

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
            How It Works
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
            className="inline-flex bg-gray-100/50 backdrop-blur-sm p-1 md:p-2 rounded-full shadow-inner border border-white/50"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <button 
              onClick={() => { setMode('video'); setActiveStep(0); }}
              className={`px-6 py-2 md:px-12 md:py-4 rounded-full font-bold text-sm md:text-lg transition-all duration-300 ${
                mode === 'video' 
                  ? 'bg-white text-hbm-purple shadow-lg scale-105' 
                  : 'text-gray-500 hover:text-hbm-purple/70'
              }`}
            >
              {t({ en: 'Meeter Video', he: 'Meeter וידאו' }, lang)}
            </button>
            <button 
              onClick={() => { setMode('physical'); setActiveStep(0); }}
              className={`px-6 py-2 md:px-12 md:py-4 rounded-full font-bold text-sm md:text-lg transition-all duration-300 ${
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
        <div className="flex flex-col md:flex-row-reverse items-start justify-between gap-8 md:gap-24 relative">
          
          {/* Right: Sticky Phone Mockup (Floating) - Now First in DOM for Mobile Sticky */}
          <div className="w-full md:w-5/12 sticky top-24 z-10 self-start flex justify-center md:justify-end mb-8 md:mb-0">
              <motion.div
                className="relative w-[180px] md:w-[320px]"
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="relative w-full">
                    
                    {/* Dynamic Screen Content */}
                    <AnimatePresence mode="wait">
                      {!currentStep ? (
                        <div className="w-full aspect-[9/19] rounded-[2rem] bg-white/70 border border-white/70 shadow-2xl" />
                      ) : mode === 'physical' && activeStep === 4 ? (
                        // Step 5 F2F: Connection Card Magic Tilt
                        <div className="w-full aspect-[9/19] relative">
                             <MagicCard key="magic-card" image={currentStep.image} />
                        </div>
                      ) : (
                         // Standard Image Fade
                        <motion.img
                          key={currentStep.image || `step-${activeStep}`}
                          src={currentStep.image}
                          alt={`Step ${activeStep + 1}`}
                          className="w-full h-auto object-contain drop-shadow-2xl"
                          initial={{ opacity: 0, scale: 1.05 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        />
                      )}
                    </AnimatePresence>
                </div>

                {/* Soft Glow Behind */}
                <div className="absolute -inset-4 bg-hbm-purple/20 blur-2xl rounded-full -z-10" />
              </motion.div>
          </div>

          {/* Left: Steps List (Scrollable) */}
          <div className="w-full md:w-1/2 space-y-3 md:space-y-4">
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
                  onClick={() => setActiveStep(i)}
                  className={`cursor-pointer group relative p-4 md:p-6 rounded-2xl transition-all duration-300 ${
                    isActive 
                      ? 'bg-white shadow-xl shadow-purple-900/5 scale-100 border border-purple-100' 
                      : 'bg-transparent hover:bg-white/50 scale-95 opacity-60 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center md:items-start gap-4 md:gap-5">
                    <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-base md:text-lg transition-colors duration-300 relative z-10 shrink-0" style={{
                      backgroundColor: isActive ? (mode === 'video' ? '#6160AB' : '#F07B3C') : '#e5e7eb',
                      color: isActive ? 'white' : '#6b7280'
                    }}>
                      {i + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className={`text-lg md:text-xl font-bold transition-colors duration-300 ${
                          isActive ? 'text-hbm-dark' : 'text-gray-600'
                        }`}>
                          {title}
                        </h3>
                        {/* Arrow for mobile visibility hint */}
                        <motion.div
                          animate={{ rotate: isActive ? 180 : 0 }}
                          className="md:hidden transition-colors"
                          style={{ color: isActive ? (mode === 'video' ? '#6160AB' : '#F07B3C') : '#9ca3af' }}
                        >
                          <ChevronDown size={20} strokeWidth={2.5} />
                        </motion.div>
                      </div>

                      {/* Desktop: Always Visible | Mobile: Accordion (Active Only) */}
                      <div className="hidden md:block mt-2">
                        <p className="text-gray-500 leading-relaxed text-sm md:text-base">
                          {formatDesc(desc)}
                        </p>
                      </div>

                      <AnimatePresence initial={false}>
                        {isActive && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="md:hidden overflow-hidden"
                          >
                            <p className="text-gray-500 leading-relaxed text-sm pt-2">
                              {formatDesc(desc)}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
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
        </div>
      </BubbleContainer>
    </section>
  )
}
