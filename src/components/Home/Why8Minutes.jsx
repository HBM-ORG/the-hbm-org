import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Instagram } from 'lucide-react'
import { useI18n, t } from '../../i18n/context'

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
       // Allow reuse if navigated back? Or remove?
       // Removing might break if other components use it.
       // But proper cleanup is good practice.
       // For now, let's keep it to avoid "spinner stuck" on re-mount if script serves as init trigger.
       const existingScript = document.querySelector('script[src*="sociablekit"]')
       if (existingScript) existingScript.remove()
    }
  }, [])

  return (
    <section className="section-padding bg-gradient-to-br from-[#fef5ed] via-white to-[#f8f9fa] relative overflow-hidden">
      {/* Decorative elements */}
      <motion.div
        className="absolute top-10 right-10 w-64 h-64 bg-[#F07B3C]/10 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#F07B3C]/10 rounded-full mb-4"
          >
            <Instagram className="w-5 h-5 text-[#F07B3C]" />
            <span className="text-sm font-semibold text-[#F07B3C] uppercase tracking-wide">
              {t({ en: 'From Our Instagram', he: 'מהאינסטגרם שלנו' }, lang)}
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-hbm-purple mb-4"
          >
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-hbm-gray max-w-2xl mx-auto"
          >
            {t({
              en: 'Discover the perfect balance between meaningful connection and your busy schedule',
              he: 'גלו את האיזון המושלם בין חיבור משמעותי ללוח הזמנים העמוס שלכם'
            }, lang)}
          </motion.p>
        </div>

        {/* Main Content - Video Carousel + Feature Cards */}
        <div className="flex flex-col lg:flex-row gap-8 items-center">
          {/* Left: Video Carousel */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:w-1/2"
          >
            <div className="relative">
              {/* SociableKIT Instagram Reels Widget */}
              <div className="relative aspect-[9/16] max-w-sm mx-auto bg-gradient-to-br from-[#6160AB] to-[#8b7fd9] rounded-3xl p-1 shadow-2xl">
                <div className="relative w-full h-full bg-black rounded-[22px] overflow-hidden">
                  <div 
                    className='sk-ww-instagram-reels w-full h-full' 
                    data-embed-id='25653662'
                    dangerouslySetInnerHTML={{ __html: `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#000;color:#fff;flex-direction:column;gap:10px"><svg width="40" height="40" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="animation:spin 1s linear infinite"><circle cx="12" cy="12" r="10" stroke="#fff" stroke-width="4" fill="none" stroke-opacity="0.3"></circle><path fill="#fff" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg><p style="font-family:sans-serif;font-size:14px;opacity:0.7">Loading Reels...</p><style>@keyframes spin { 100% { transform: rotate(360deg); } }</style></div>` }} 
                  ></div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Feature Cards */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:w-1/2 space-y-4"
          >
            {featureCards.map((card, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, x: 10 }}
                className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-[#F07B3C] hover:shadow-xl transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{card.icon}</div>
                  <div>
                    <h4 className="text-xl font-bold text-hbm-dark mb-2">
                      {t(card.title, lang)}
                    </h4>
                    <p className="text-hbm-gray">
                      {t(card.text, lang)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Follow CTA */}
            <motion.a
              href="https://instagram.com/the__hbm"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="block w-full bg-gradient-to-r from-[#F07B3C] to-[#ff9b6b] text-white rounded-2xl p-6 text-center font-bold text-lg shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-center justify-center gap-3">
                <Instagram className="w-6 h-6" />
                {t({ en: 'Follow Us on Instagram', he: 'עקבו אחרינו באינסטגרם' }, lang)}
              </div>
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
