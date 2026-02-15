import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Instagram } from 'lucide-react'
import { useI18n, t } from '../../i18n/context'
import BubbleContainer from '../BubbleContainer'

// Placeholder videos - will be replaced with Instagram API later


const featureCards = [
  {
    icon: '🧠',
    title: { en: 'Science-Backed', he: 'מבוסס מדע' },
    text: { en: '8 minutes is the optimal time for meaningful connection', he: '8 דקות זה הזמן האופטימלי לחיבור משמעותי' }
  },
  {
    icon: '⚡',
    title: { en: 'Quick & Effective', he: 'מהיר ויעיל' },
    text: { en: 'Short enough to fit your schedule, long enough to matter', he: 'קצר מספיק להתאים ללוח הזמנים, ארוך מספיק להשפיע' }
  },
  {
    icon: '💡',
    title: { en: 'Structured Flow', he: 'זרימה מובנית' },
    text: { en: 'Guided conversation that creates authentic moments', he: 'שיחה מונחית שיוצרת רגעים אותנטיים' }
  }
]

export default function Why8Minutes() {
  const { lang } = useI18n()
  // Load SociableKIT script
  useEffect(() => {
    // Check if script is already there
    if (document.querySelector('script[src*="sociablekit"]')) return

    const script = document.createElement('script')
    script.src = "https://widgets.sociablekit.com/instagram-reels/widget.js"
    script.async = true
    script.defer = true
    document.body.appendChild(script)
    
    return () => {
       const existingScript = document.querySelector('script[src*="sociablekit"]')
       if (existingScript) existingScript.remove()
    }
  }, [])

  return (
    <section className="section-padding bg-hbm-cream flex flex-col items-center justify-center min-h-[85vh] md:min-h-screen relative overflow-hidden">
      <BubbleContainer bgColor="#FAF9F5" className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center py-8 px-4 md:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-6 md:mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#F07B3C]/10 rounded-full mb-3"
          >
            <Instagram className="w-4 h-4 text-[#F07B3C]" />
            <span className="text-xs font-semibold text-[#F07B3C] uppercase tracking-wide">
              {t({ en: 'From Our Instagram', he: 'מהאינסטגרם שלנו' }, lang)}
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold text-hbm-purple mb-2 leading-tight"
          >
            Why 8 Minutes?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-hbm-gray max-w-lg mx-auto leading-relaxed"
          >
            {t({
              en: 'Discover the perfect balance between meaningful connection and your busy schedule',
              he: 'גלו את האיזון המושלם בין חיבור משמעותי ללוח הזמנים העמוס שלכם'
            }, lang)}
          </motion.p>
        </div>

        {/* Main Content - Centered Layout */}
        <div className="flex flex-col items-center relative w-full">
          
          {/* Phone Mockup - Scaled Down */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative w-full max-w-[280px] md:max-w-[320px] mx-auto z-10"
          >
            <div className="relative aspect-[9/16] bg-black rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl border-[6px] md:border-[8px] border-gray-900">
               {/* SociableKIT Widget */}
               <div 
                 className='sk-ww-instagram-reels w-full h-full' 
                 data-embed-id='25653662'
                 dangerouslySetInnerHTML={{ __html: `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#000;color:#fff;flex-direction:column;gap:10px"><svg width="40" height="40" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="animation:spin 1s linear infinite"><circle cx="12" cy="12" r="10" stroke="#fff" stroke-width="4" fill="none" stroke-opacity="0.3"></circle><path fill="#fff" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg><p style="font-family:sans-serif;font-size:14px;opacity:0.7">Loading Reels...</p><style>@keyframes spin { 100% { transform: rotate(360deg); } }</style></div>` }} 
               ></div>
            </div>
          </motion.div>

          {/* Follow Button - Directly Below */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-6 md:mt-8 z-20"
          >
            <a
              href="https://instagram.com/the__hbm"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#F07B3C] to-[#ff9b6b] text-white rounded-full px-6 py-2.5 text-sm md:text-base font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 transform active:scale-95"
            >
              <Instagram className="w-5 h-5" />
              <span>{t({ en: 'Follow Us @the__hbm', he: 'עקבו אחרינו @the__hbm' }, lang)}</span>
            </a>
          </motion.div>

          {/* Decorative Elements for Balance */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[80%] bg-gradient-to-b from-[#FFF0E5] to-transparent rounded-full blur-3xl -z-10 opacity-60 pointer-events-none"></div>

        </div>

      </BubbleContainer>
    </section>
  )
}
