import React from 'react'
import { motion } from 'framer-motion'
import { Quote } from 'lucide-react'
import { Link } from 'react-router-dom'

const PhilosophyQuote = () => {
  return (
    <section className="relative py-32 overflow-hidden bg-gradient-to-br from-white via-purple-50 to-orange-50">
      {/* Animated background elements */}
      <motion.div
        className="absolute top-20 left-20 w-96 h-96 bg-[#6160AB]/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <motion.div
        className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-[#F07B3C]/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.4, 1],
          x: [0, -60, 0],
          y: [0, 40, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Decorative quote mark - top left */}
          <motion.div
            className="absolute -top-12 -left-4 md:-left-12"
            initial={{ scale: 0, rotate: -180 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Quote className="w-24 h-24 md:w-32 md:h-32 text-[#6160AB]/20" strokeWidth={1.5} />
          </motion.div>

          {/* Main quote card */}
          <div className="relative p-8 md:p-12 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 max-w-4xl mx-auto">
            {/* Quote text */}
            <blockquote className="relative z-10 text-center">
              <motion.p
                className="text-xl md:text-2xl font-medium text-gray-800 leading-relaxed font-serif"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.4 }}
              >
                <span className="block mb-6">
                  "There are places that highlight the{' '}
                  <span className="font-bold text-gray-900">differences</span>
                  {' '}between people and create{' '}
                  <span className="font-bold text-gray-900 border-b-2 border-gray-300">separation</span>.
                </span>
                
                <span className="block">
                  There are places that highlight the{' '}
                  <span className="font-bold text-gray-900">similarities</span>
                  {' '}between people and create{' '}
                  <span className="font-bold text-hbm-purple border-b-2 border-hbm-purple/30">connection</span>."
                </span>
              </motion.p>

              {/* Choose emphasis */}
              <motion.div
                className="mt-8 text-center"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 1.2 }}
              >
                <span className="block text-3xl md:text-4xl font-bold text-hbm-dark tracking-wide font-serif mb-6">
                  Choose.
                </span>
                
                <span className="block text-lg font-medium text-hbm-gray">
                  Elad Maor Hefets, CEO of The HBM
                </span>
              </motion.div>
            </blockquote>
          </div>

          {/* Decorative quote mark - bottom right */}
          <motion.div
            className="absolute -bottom-12 -right-4 md:-right-12 rotate-180"
            initial={{ scale: 0, rotate: 0 }}
            whileInView={{ scale: 1, rotate: 180 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Quote className="w-24 h-24 md:w-32 md:h-32 text-[#F07B3C]/20" strokeWidth={1.5} />
          </motion.div>
        </motion.div>

        {/* CTA below */}
        <motion.div
          className="text-center mt-24"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 2 }}
        >
          <Link
            to="/about"
            className="group inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-[#6160AB] to-[#F07B3C] text-white rounded-full font-semibold text-xl shadow-2xl hover:shadow-[0_0_50px_rgba(97,96,171,0.5)] hover:scale-105 transition-all duration-300"
          >
            Join Our Movement
            <motion.svg
              className="w-6 h-6"
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </motion.svg>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

export default PhilosophyQuote
