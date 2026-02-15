import React from 'react'
import { motion } from 'framer-motion'
import { User, Eye, Heart, MessageCircle, Sparkles, Shield, Smile, Clock } from 'lucide-react'
import BubbleContainer from '../BubbleContainer'

const items = [
  {
    title: 'SHOW UP AS YOURSELF.',
    text: `Not your LinkedIn bio. Not your "I'm totally fine" voice. Just you.`,
    icon: User,
    color: '#6160AB',
  },
  {
    title: 'GIVE YOUR FULL ATTENTION.',
    text: `One screen. One person. One moment. Be all in — it's only 8 minutes.`,
    icon: Eye,
    color: '#F07B3C',
  },
  {
    title: 'LEAD WITH CURIOSITY.',
    text: 'Ask real questions. Listen like you mean it.',
    icon: Sparkles,
    color: '#73C154',
  },
  {
    title: 'BE GENEROUS.',
    text: 'With your words, your time, your kindness.',
    icon: Heart,
    color: '#F07B3C',
  },
  {
    title: 'RESPECT EVERY VIBE.',
    text: "Quiet? Loud? Awkward? It's all welcome here.",
    icon: Shield,
    color: '#6160AB',
  },
  {
    title: 'TALK LIGHT. TALK DEEP. TALK REAL.',
    text: 'You never know where 8 minutes will take you.',
    icon: MessageCircle,
    color: '#8b7fd9',
  },
  {
    title: 'CELEBRATE DIFFERENT PERSPECTIVES.',
    text: "Connection doesn't require agreement, just curiosity.",
    icon: Eye,
    color: '#73C154',
  },
  {
    title: 'END STRONG.',
    text: 'A kind word, a smile, a thank you.',
    icon: Smile,
    color: '#F07B3C',
  },
]

const Guidelines = () => {
  return (
    <section className="section-padding bg-hbm-cream">
      <BubbleContainer bgColor="#BBC0FF">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 px-5 py-2 bg-white rounded-full text-sm font-semibold text-gray-600 shadow-md border border-gray-200 mb-4">
            <Clock className="w-4 h-4 text-[#6160AB]" />
            Guidelines
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            HBM Tips:
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Clear guidelines create a safe, respectful, and meaningful space - so every 8 minute
            conversation can really matter.
          </p>
        </motion.div>

        {/* Grid of cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {items.map((item, index) => (
            <motion.div
              key={item.title}
              className="relative group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              whileHover={{ y: -6 }}
            >
              <div className="relative flex items-start gap-4 p-6 md:p-7 bg-white/90 rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                {/* Top color bar */}
                <span
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ background: `linear-gradient(90deg, ${item.color}, ${item.color}55)` }}
                />

                {/* Icon circle */}
                <motion.div
                  className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: `${item.color}1a` }}
                  whileHover={{ rotate: 8, scale: 1.05 }}
                  transition={{ duration: 0.25 }}
                >
                  <item.icon className="w-6 h-6" style={{ color: item.color }} />
                </motion.div>

                {/* Text */}
                <div>
                  <h3 className="text-sm md:text-base font-extrabold tracking-wide text-gray-900 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                    {item.text}
                  </p>
                </div>

                {/* Shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-0"
                  initial={{ x: '-120%' }}
                  whileHover={{
                    opacity: 1,
                    x: '120%',
                    transition: { duration: 0.7 },
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </BubbleContainer>
    </section>
  )
}

export default Guidelines
