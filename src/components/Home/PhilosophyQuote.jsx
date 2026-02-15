import React from 'react'
import { motion } from 'framer-motion'
import { Quote } from 'lucide-react'
import BubbleContainer from '../BubbleContainer'

const PhilosophyQuote = () => {
  // Animation variants for word-by-word reveal
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.3
      }
    }
  }

  const wordVariants = {
    hidden: { 
      opacity: 0, 
      y: 10,
      filter: 'blur(4px)'
    },
    visible: { 
      opacity: 1, 
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.4,
        ease: [0.25, 0.4, 0.25, 1]
      }
    }
  }

  // Split text into words for animation
  const AnimatedText = ({ children, className = '' }) => {
    if (typeof children !== 'string') return children
    
    const words = children.split(' ')
    return (
      <span className={className}>
        {words.map((word, i) => (
          <motion.span
            key={i}
            variants={wordVariants}
            className="inline-block mr-[0.3em]"
          >
            {word}
          </motion.span>
        ))}
      </span>
    )
  }

  return (
    <section className="section-padding bg-hbm-cream">
      <BubbleContainer className="max-w-6xl">
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
                className="text-xl md:text-2xl font-normal text-gray-800 leading-relaxed"
                style={{ fontFamily: 'Sofia Sans, sans-serif' }}
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
              >
                <span className="block mb-6">
                  <AnimatedText>There are places that highlight the </AnimatedText>
                  <AnimatedText className="font-bold text-gray-900">differences</AnimatedText>
                  <br />
                  <AnimatedText>between people and create </AnimatedText>
                  <AnimatedText className="font-bold text-gray-900 border-b-2 border-gray-300">separation</AnimatedText>
                  <AnimatedText>.</AnimatedText>
                </span>
                
                <span className="block">
                  <AnimatedText>There are places that highlight the </AnimatedText>
                  <AnimatedText className="font-bold text-gray-900">similarities</AnimatedText>
                  <br />
                  <AnimatedText>between people and create </AnimatedText>
                  <AnimatedText className="font-bold text-hbm-purple border-b-2 border-hbm-purple/30">connection</AnimatedText>
                  <AnimatedText>.</AnimatedText>
                </span>
              </motion.p>

              {/* Choose emphasis */}
              <motion.div
                className="mt-8 text-center"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 1.5 }}
              >
                <motion.span 
                  className="block text-3xl md:text-4xl font-bold bg-gradient-to-r from-hbm-purple via-hbm-orange to-hbm-purple bg-clip-text text-transparent tracking-wide font-serif mb-6"
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
                  Choose.
                </motion.span>
                
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
      </BubbleContainer>
    </section>
  )
}

export default PhilosophyQuote
