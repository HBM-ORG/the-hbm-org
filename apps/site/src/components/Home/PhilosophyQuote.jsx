import React from 'react'
import { motion } from 'framer-motion'
import { Quote } from 'lucide-react'

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
    <section className="py-20 bg-hbm-cream min-h-[60vh] flex items-center justify-center">
      <div className="max-w-6xl mx-auto">
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
          <div className="relative p-8 md:p-12 max-w-5xl mx-auto flex flex-col items-center justify-center">
            {/* Quote text */}
            <blockquote className="relative z-10 text-center">
              <motion.p
                className="text-center"
                style={{ fontFamily: 'Sora, sans-serif' }}
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
              >
                <span className="block mb-6 text-[10px] md:text-xs font-black text-[#F07B3C] uppercase tracking-[0.3em] opacity-80">
                  Did you know?
                </span>

                <span className="block mb-4 text-[16px] md:text-[22px] font-bold text-gray-400/80 leading-tight tracking-tight max-w-md mx-auto">
                  95% of people <br className="hidden md:block" /> hate small talk.
                </span>

                <span className="block text-[20px] md:text-[34px] font-black leading-none tracking-tighter whitespace-nowrap">
                   <span className="bg-gradient-to-r from-[#F07B3C] via-[#6160AB] to-[#6160AB] bg-clip-text text-transparent">
                    We fixed it.
                  </span>
                </span>
              </motion.p>


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
      </div>
    </section>
  )
}

export default PhilosophyQuote
