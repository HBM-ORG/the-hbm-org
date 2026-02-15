import React from 'react'
import { motion } from 'framer-motion'
import { Users, Zap, ArrowRight, Sparkles } from 'lucide-react'
import BubbleContainer from '../BubbleContainer'

const ManifestoSection = () => {
  return (
    <section className="section-padding bg-gradient-to-br from-orange-50 via-purple-50 to-orange-50 relative overflow-hidden">
      {/* Animated background blobs */}
      <motion.div
        className="absolute top-0 left-0 w-96 h-96 bg-hbm-orange/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          x: [0, 30, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-hbm-purple/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.4, 1],
          x: [0, -40, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />

      <BubbleContainer bgColor="rgba(255, 255, 255, 0.95)" className="max-w-6xl backdrop-blur-xl">
        <div className="text-center">
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

          {/* Main headline with giant ONE */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="text-4xl md:text-7xl font-bold text-gray-900 mb-4 leading-tight">
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
          </motion.div>

          {/* Hero quote */}
          <motion.p
            className="text-2xl md:text-3xl font-light text-gray-700 mb-12 italic"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            "We turn strangers into friends,
            <br className="hidden md:block" />
            and moments into memories."
          </motion.p>

          {/* Split Visual - Physical + Digital = Connection */}
          <motion.div
            className="relative mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              {/* Left: Physical World */}
              <motion.div
                className="relative group"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <div className="p-8 rounded-3xl bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 shadow-lg">
                  <motion.div
                    className="mb-4 flex justify-center"
                    animate={{ 
                      y: [0, -10, 0],
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <div className="w-20 h-20 rounded-full bg-hbm-purple/20 flex items-center justify-center">
                      <Users size={40} className="text-hbm-purple" strokeWidth={2} />
                    </div>
                  </motion.div>
                  <h3 className="text-2xl font-bold text-hbm-purple mb-2">Physical</h3>
                  <p className="text-sm text-gray-600">Real-world spaces & moments</p>
                </div>
              </motion.div>

              {/* Middle: Connecting Arrow */}
              <div className="flex flex-col items-center justify-center">
                <motion.div
                  animate={{ 
                    x: [0, 10, 0],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="hidden md:block"
                >
                  <ArrowRight size={48} className="text-hbm-orange" strokeWidth={2.5} />
                </motion.div>
                
                {/* Plus sign for mobile */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 90, 0]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="md:hidden text-4xl font-bold text-hbm-orange my-4"
                >
                  +
                </motion.div>

                <motion.div
                  className="mt-4 px-6 py-2 bg-gradient-to-r from-hbm-purple to-hbm-orange rounded-full"
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(97, 96, 171, 0.3)',
                      '0 0 40px rgba(240, 123, 60, 0.5)',
                      '0 0 20px rgba(97, 96, 171, 0.3)',
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <p className="text-white font-bold text-sm uppercase tracking-wider">
                    AI + Data
                  </p>
                </motion.div>
              </div>

              {/* Right: Digital Technology */}
              <motion.div
                className="relative group"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <div className="p-8 rounded-3xl bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 shadow-lg">
                  <motion.div
                    className="mb-4 flex justify-center"
                    animate={{ 
                      rotate: [0, 360],
                    }}
                    transition={{ 
                      duration: 8,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  >
                    <div className="w-20 h-20 rounded-full bg-hbm-orange/20 flex items-center justify-center">
                      <Zap size={40} className="text-hbm-orange" strokeWidth={2} />
                    </div>
                  </motion.div>
                  <h3 className="text-2xl font-bold text-hbm-orange mb-2">Digital</h3>
                  <p className="text-sm text-gray-600">Technology & intelligence</p>
                </div>
              </motion.div>
            </div>

            {/* Result: Meaningful Connections */}
            <motion.div
              className="mt-12"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              <div className="inline-block px-8 py-4 bg-gradient-to-r from-hbm-purple via-hbm-orange to-hbm-purple bg-[length:200%_100%] rounded-full relative">
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  style={{
                    background: 'linear-gradient(90deg, rgba(97,96,171,0.3), rgba(240,123,60,0.3), rgba(97,96,171,0.3))',
                    backgroundSize: '200% 100%',
                  }}
                />
                <div className="relative flex items-center gap-3">
                  <Sparkles className="text-white" size={24} />
                  <span className="text-2xl md:text-3xl font-bold text-white">
                    Meaningful Connections
                  </span>
                  <Sparkles className="text-white" size={24} />
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Bottom statement */}
          <motion.div
            className="space-y-4 border-t border-gray-200 pt-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <p className="text-xl md:text-2xl text-gray-700 font-light">
              Because this is what we do best.
            </p>
            <motion.p
              className="text-2xl md:text-4xl font-bold"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 1.4, type: "spring" }}
            >
              And we are the{' '}
              <motion.span
                className="bg-gradient-to-r from-hbm-orange via-hbm-purple to-hbm-orange bg-clip-text text-transparent"
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
      </BubbleContainer>
    </section>
  )
}

export default ManifestoSection
