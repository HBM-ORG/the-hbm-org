import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Quote } from 'lucide-react'
import { useI18n, t } from '../../i18n/context'

const quotes = [
  { text: "We cannot live only for ourselves. A thousand fibers connect us.", author: "Herman Melville" },
  { text: "The meeting of two personalities is like the contact of two chemical substances.", author: "Carl Jung" },
  { text: "Connection is why we're here. It gives purpose and meaning to our lives.", author: "Brené Brown" },
  { text: "Your thoughts create your reality.", author: "Bob Proctor" },
  { text: "Every achievement starts with a burning desire.", author: "Napoleon Hill" },
  { text: "What you think, you become.", author: "Buddha" },
  { text: "The best way to predict the future is to create it.", author: "Abraham Lincoln" },
  { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "The only way to have a friend is to be one.", author: "Ralph Waldo Emerson" },
  { text: "Social connection is a fundamental human need.", author: "Matthew Lieberman" },
  { text: "Loneliness is the poverty of self; solitude is the richness of self.", author: "May Sarton" },
  { text: "We are like islands in the sea, separate on the surface but connected in the deep.", author: "William James" },
  { text: "The greatness of a community is most accurately measured by the compassionate actions of its members.", author: "Coretta Scott King" },
  { text: "Happiness is only real when shared.", author: "Christopher McCandless" },
  { text: "A single conversation across the table with a wise man is better than ten years mere study of books.", author: "Henry Wadsworth Longfellow" },
  { text: "Communication leads to community, that is, to understanding, intimacy and mutual valuing.", author: "Rollo May" },
  { text: "The most important thing in communication is hearing what isn't said.", author: "Peter Drucker" },
  { text: "Unity is strength... when there is teamwork and collaboration, wonderful things can be achieved.", author: "Mattie Stepanek" },
  { text: "Individually, we are one drop. Together, we are an ocean.", author: "Ryunosuke Satoro" },
  { text: "There is no power for change greater than a community discovering what it cares about.", author: "Margaret J. Wheatley" },
  { text: "Be the change that you wish to see in the world.", author: "Mahatma Gandhi" },
  { text: "Everything you've ever wanted is on the other side of fear.", author: "George Addair" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "The quality of your life is the quality of your relationships.", author: "Tony Robbins" },
  { text: "Vulnerability is the birthplace of innovation, creativity and change.", author: "Brené Brown" },
  { text: "Deep human connection is the purpose and the result of a meaningful life.", author: "HBM Philosophy" },
]

export default function QuoteCarousel() {
  const { lang } = useI18n()
  
  // Daily logic: Seed based on date to ensure the same quote for everyone today, but different tomorrow
  const today = new Date()
  const dateStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`
  
  // Create a day-based index that won't repeat monthly (using total days since epoch)
  const totalDays = Math.floor(today.getTime() / (1000 * 60 * 60 * 24))
  const quoteIndex = totalDays % quotes.length
  const quote = quotes[quoteIndex]

  return (
    <section id="daily-inspiration" className="section-padding bg-hbm-cream relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-5xl mx-auto relative z-10 w-full">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#6160AB]/10 rounded-full mb-4">
            <Quote className="w-5 h-5 text-[#6160AB]" />
            <span className="text-sm font-semibold text-[#6160AB] uppercase tracking-wide">
              {t({ en: 'Daily Inspiration', he: 'השראה יומית' }, lang)}
            </span>
          </div>
        </motion.div>

        {/* Quote Card with 3D Border Effect */}
        <div className="relative max-w-4xl mx-auto">
          {/* Animated gradient border */}
          <motion.div
            className="absolute -inset-1 bg-gradient-to-r from-[#6160AB] via-[#F07B3C] to-[#73C154] rounded-3xl blur opacity-30"
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              backgroundSize: '200% auto',
            }}
          />

          {/* Main quote card */}
          <div className="relative bg-white rounded-3xl p-12 md:p-16 shadow-2xl overflow-hidden">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center flex flex-col items-center"
            >
              {/* Date Display - Centered above the quote icon */}
              <div className="mb-6 flex flex-col items-center gap-1.5">
                <span className="text-[10px] md:text-xs font-bold text-gray-400 tracking-[0.3em] uppercase">
                  {t({ en: 'Today', he: 'היום' }, lang)}
                </span>
                <span className="text-sm md:text-base font-bold text-hbm-dark/60 tracking-tight">
                  {dateStr}
                </span>
                <div className="w-8 h-0.5 bg-gradient-to-r from-[#6160AB] to-[#F07B3C] mt-1 opacity-40 rounded-full" />
              </div>

              {/* Decorative quote icon */}
              <div
                className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#6160AB] to-[#8b7fd9] rounded-full mb-8 shadow-lg shadow-purple-200"
              >
                <Quote className="w-8 h-8 text-white" />
              </div>

              {/* Quote text */}
              <p className="text-3xl md:text-5xl font-bold text-hbm-dark leading-tight md:leading-relaxed mb-10 max-w-2xl">
                "{quote.text}"
              </p>

              {/* Author */}
              <div className="flex items-center justify-center gap-4">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#F07B3C]" />
                <p className="text-xl md:text-2xl text-[#F07B3C] font-semibold italic">
                  {quote.author}
                </p>
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#F07B3C]" />
              </div>

              {/* Daily return nudge */}
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400"
              >
                {t({
                  en: 'Every day brings a new story. See you tomorrow?',
                  he: 'כל יום מביא סיפור חדש. נתראה מחר?'
                }, lang)}
              </motion.p>
            </motion.div>
          </div>
        </div>
      </div>
      </div>
    </section>
  )
}


