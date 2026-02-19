import React from 'react'
import { motion } from 'framer-motion'
import { Heart, Users, Sparkles } from 'lucide-react'
import ManifestoCard from './ManifestoCard'

const ManifestoSection = () => {
  const connections = [
    { text: 'themselves', color: '#6160AB', icon: Users },
    { text: 'others', color: '#F07B3C', icon: Heart },
    { text: 'nature', color: '#73C154', icon: Sparkles },
  ]

  return (
    <section className="section-padding bg-hbm-cream relative">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center py-4">
          {/* Eyebrow badge */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="eyebrow-badge">Our Mission</span>
          </motion.div>

          {/* Main headline */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="text-4xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              We have{' '}
              <span className="relative inline-block mx-2">
                <motion.span
                  className="absolute inset-0 rounded-full blur-3xl"
                  style={{ background: 'linear-gradient(135deg, #F07B3C, #ff9b6b)' }}
                  animate={{ 
                    opacity: [0.3, 0.6, 0.3], 
                    scale: [1, 1.3, 1],
                    rotate: [0, 180, 360]
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
                <span className="relative z-10 text-hbm-orange text-5xl md:text-8xl">ONE</span>
              </span>{' '}
              job.
            </h2>
            
            {/* Quote */}
            <p className="text-xl md:text-3xl text-gray-600 italic font-light max-w-4xl mx-auto leading-relaxed">
              "TO HELP PEOPLE CONNECT."
            </p>
          </motion.div>



          {/* Bottom statement */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <motion.p
              className="text-3xl md:text-5xl font-bold text-gray-900"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 1, type: "spring" }}
            >
              And we are the{' '}
              <motion.span
                className="bg-gradient-to-r from-hbm-orange via-hbm-purple to-hbm-orange bg-clip-text text-transparent inline-block"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{
                  backgroundSize: '200% 200%',
                }}
              >
                BEST
              </motion.span>{' '}
              at it.
            </motion.p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default ManifestoSection
