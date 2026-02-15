import React from 'react'
import { motion } from 'framer-motion'
import BubbleContainer from '../BubbleContainer'

const PhilosophyQuote = () => {
  return (
    <section className="section-padding bg-hbm-cream">
      <BubbleContainer bgColor="#BBC0FF" className="max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Quote text */}
          <blockquote className="text-center">
            <motion.p
              className="text-xl md:text-2xl font-normal text-gray-800 leading-relaxed"
              style={{ fontFamily: 'Sofia Pro, sans-serif', fontWeight: 400 }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <span className="block mb-6">
                There are places that highlight the{' '}
                <span className="font-bold text-gray-900">differences</span>
                <br />
                between
                <br />
                people and create{' '}
                <span className="font-bold text-gray-900 border-b-2 border-gray-300">separation</span>.
              </span>
              
              <span className="block">
                There are places that highlight the{' '}
                <span className="font-bold text-gray-900">similarities</span>
                <br />
                between
                <br />
                people and create{' '}
                <span className="font-bold text-hbm-purple border-b-2 border-hbm-purple/30">connection</span>.
              </span>
            </motion.p>

            {/* Choose emphasis */}
            <motion.div
              className="mt-8 text-center"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <span className="block text-3xl md:text-4xl font-bold text-hbm-dark tracking-wide mb-6" style={{ fontFamily: 'Sofia Pro, sans-serif' }}>
                Choose.
              </span>
              
              <span className="block text-lg font-medium text-hbm-gray" style={{ fontFamily: 'Sofia Pro, sans-serif' }}>
                Elad Maor Hefets, CEO of The HBM
              </span>
            </motion.div>
          </blockquote>
        </motion.div>
      </BubbleContainer>
    </section>
  )
}

export default PhilosophyQuote
