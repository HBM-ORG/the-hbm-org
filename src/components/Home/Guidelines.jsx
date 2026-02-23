import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { siteContent } from '../../data/content'
import { useI18n, t } from '../../i18n/context'
import { ChevronDown, User, Heart, Sparkles, MessageCircle, Shield, Star, Smile, CheckCircle } from 'lucide-react'

const Guidelines = () => {
  const { lang } = useI18n()
  const { home } = siteContent
  
  // Track open state for each accordion item (null = all closed)
  // Or we can allow multiple open at once. Let's do multiple for an accordion block.
  const [openItems, setOpenItems] = useState([])

  const toggleItem = (index) => {
    setOpenItems((prev) => 
      prev.includes(index) 
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    )
  }

  return (
    <section className="py-24 bg-hbm-cream">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Container matches the orange/peach background from the user's favorite design */}
        <div className="bg-[#FEF5ED] rounded-[40px] md:rounded-[60px] p-8 md:p-16 shadow-sm border border-[#FBD5C1]/30">
          
          {/* Header */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-black text-hbm-dark mb-4">
              {t({ en: 'HBM Tips:', he: 'טיפים ל-HBM:' }, lang)}
            </h2>
            <p className="text-lg md:text-xl font-bold text-gray-800 max-w-3xl mx-auto leading-relaxed">
              {t({ 
                en: 'Clear guidelines create a safe, respectful, and meaningful space - so every 8 minute conversation can really matter.', 
                he: 'כללים ברורים יוצרים מרחב בטוח, מכבד ומשמעותי - כך שכל שיחת 8 דקות תוכל להיות בעלת ערך אמיתי.' 
              }, lang)}
            </p>
          </motion.div>

          {/* Accordion List - 2 Columns */}
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-4">
            {home.guidelines.items.map((item, index) => {
              const isOpen = openItems.includes(index)
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="border-b border-[#FBD5C1]/60 last:border-0 md:last:border-b-0"
                >
                  <button
                    onClick={() => toggleItem(index)}
                    className="w-full flex items-center justify-between py-5 text-left group"
                  >
                    <div className="flex items-center gap-5">
                      {/* Icon Container with peach/orange bg */}
                      <div className="w-14 h-14 rounded-xl bg-[#FBD5C1]/40 flex items-center justify-center p-2.5 group-hover:scale-105 transition-transform">
                        {index === 0 && <User className="w-7 h-7 text-[#F07B3C]" />}
                        {index === 1 && <Heart className="w-7 h-7 text-[#F07B3C]" />}
                        {index === 2 && <Sparkles className="w-7 h-7 text-[#F07B3C]" />}
                        {index === 3 && <MessageCircle className="w-7 h-7 text-[#F07B3C]" />}
                        {index === 4 && <Shield className="w-7 h-7 text-[#F07B3C]" />}
                        {index === 5 && <Star className="w-7 h-7 text-[#F07B3C]" />}
                        {index === 6 && <Smile className="w-7 h-7 text-[#F07B3C]" />}
                        {index === 7 && <CheckCircle className="w-7 h-7 text-[#F07B3C]" />}
                      </div>
                      
                      {/* Title */}
                      <span className="text-sm md:text-base font-black text-hbm-dark tracking-wide uppercase">
                        {t(item.title, lang)}
                      </span>
                    </div>

                    {/* Chevron */}
                    <div className="flex-shrink-0 ml-4">
                      <ChevronDown 
                        className={`w-5 h-5 text-[#F07B3C] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                      />
                    </div>
                  </button>

                  {/* Accordion Content */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="pb-6 pl-20 pr-4 text-gray-700 font-medium leading-relaxed">
                          {t(item.text, lang)}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>

        </div>
      </div>
    </section>
  )
}

export default Guidelines
