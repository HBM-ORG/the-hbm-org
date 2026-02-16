import { useRef, useState } from 'react'
import { motion, useScroll, useTransform, useMotionTemplate, useSpring } from 'framer-motion'
import { useI18n, t } from '../../i18n/context'

const DidYouKnowSection = () => {
  const { lang } = useI18n()
  const containerRef = useRef(null)
  
  // Track scroll progress within this 150vh container (reduced height slightly)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"]
  })

  // Split sentence into words
  const sentence = t({ en: '95% of people hate small talk.', he: '95% מהאנשים שונאים שיחות חולין.' }, lang);
  const words = sentence.split(' ');

  return (
    <div ref={containerRef} className="relative h-[150vh] bg-hbm-cream">
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden px-6">
        
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center justify-center gap-12">
          
          {/* Eyebrow */}
          <motion.p 
            className="text-hbm-orange font-bold text-sm uppercase tracking-widest mb-4"
            style={{ opacity: useTransform(scrollYProgress, [0.1, 0.2], [0, 1]) }}
          >
            {t({ en: 'Did You Know?', he: 'הידעתם?' }, lang)}
          </motion.p>

          {/* Word-by-Word Reveal */}
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-2 md:gap-x-6">
            {words.map((word, i) => {
              // Calculate start/end range for each word based on index
              const step = 0.4 / words.length; // Spread animation over 0.2->0.6 scroll range
              const start = 0.2 + (i * step);
              const end = start + step;
              
              const opacity = useTransform(scrollYProgress, [start, end], [0.2, 1]); // Fade from faint to full
              const y = useTransform(scrollYProgress, [start, end], [20, 0]);      // Slide up slightly
              
              // Color transition: from gray to black
              const color = useTransform(scrollYProgress, [start, end], ["#9CA3AF", "#1F1F1F"]); 

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

          {/* Solution - "We fixed it" */}
          {/* Appears after all words are shown */}
          <motion.div 
            style={{ 
              opacity: useTransform(scrollYProgress, [0.6, 0.7], [0, 1]),
              scale: useTransform(scrollYProgress, [0.6, 0.8], [0.8, 1]),
              y: useTransform(scrollYProgress, [0.6, 0.8], [50, 0])
            }}
            className="mt-8"
          >
             <MagneticText>
                <p 
                  className="text-6xl md:text-9xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#F07B3C] to-[#6160AB] cursor-pointer no-bubble"
                  style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' }}
                >
                  {t({ en: 'We fixed it.', he: 'תיקנו את זה.' }, lang)}
                </p>
             </MagneticText>
          </motion.div>

        </div>
      </div>
    </div>
  )
}

// Magnetic Text Component
const MagneticText = ({ children }) => {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

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
  );
};

export default DidYouKnowSection
