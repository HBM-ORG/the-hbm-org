import React from 'react'
import { motion } from 'framer-motion'
import { Target, Users, Heart, Sparkles, Zap, Globe } from 'lucide-react'
import { Link } from 'react-router-dom'

const ManifestoSection = () => {
  // Floating icons with animations
  const floatingIcons = [
    { Icon: Heart, color: '#F07B3C', delay: 0, x: '10%', y: '20%', size: 'w-16 h-16' },
    { Icon: Users, color: '#6160AB', delay: 0.5, x: '85%', y: '15%', size: 'w-20 h-20' },
    { Icon: Sparkles, color: '#73C154', delay: 1, x: '15%', y: '75%', size: 'w-12 h-12' },
    { Icon: Target, color: '#F07B3C', delay: 1.5, x: '80%', y: '80%', size: 'w-14 h-14' },
    { Icon: Zap, color: '#6160AB', delay: 2, x: '50%', y: '10%', size: 'w-16 h-16' },
    { Icon: Globe, color: '#73C154', delay: 2.5, x: '5%', y: '50%', size: 'w-18 h-18' },
  ]

  // Stats/numbers animation
  const stats = [
    { number: '1', label: 'Mission', icon: Target },
    { number: '8', label: 'Minutes', icon: Sparkles },
    { number: '∞', label: 'Connections', icon: Heart },
  ]

  return (
    <section className="relative py-24 overflow-hidden bg-hbm-dark">
      {/* Subtle animated gradient background */}
      <motion.div
        className="absolute inset-0 opacity-40"
        style={{
          background: 'radial-gradient(circle at 50% 50%, #2d2554 0%, #1a1d3a 80%)'
        }}
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* 2 Soft Gradient Blobs (Top-Left & Bottom-Right) */}
      <motion.div
        className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#6160AB]/10 rounded-full blur-[100px] pointer-events-none"
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#F07B3C]/10 rounded-full blur-[120px] pointer-events-none"
        animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
        {/* Eyebrow */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-1 border border-white/20 rounded-full text-white/60 text-sm uppercase tracking-widest">
            Our Mission
          </span>
        </motion.div>

        {/* Main headline */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-2 tracking-tight">
            We have{' '}
            <span className="relative inline-block mx-2">
              <motion.span
                className="absolute inset-0 rounded-full blur-2xl"
                style={{ background: 'linear-gradient(90deg, #F07B3C, #ff9b6b)' }}
                animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.2, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <span className="relative z-10 text-[#F07B3C]">ONE</span>
            </span>{' '}
            job.
          </h2>
        </motion.div>

        {/* Description paragraphs */}
        <div className="max-w-3xl mx-auto space-y-8">
          <motion.p
            className="text-xl text-gray-400 font-light"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            We don't do Real Estate. We don't do Cyber. We don't do CRM or Medical Devices.
          </motion.p>

          <motion.div
            className="relative py-8"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <p className="text-2xl md:text-4xl font-semibold text-white leading-normal">
              We help people{' '}
              <motion.span
                className="inline-block text-[#73C154] cursor-default"
                whileHover={{ scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                connect
              </motion.span>.
              <br className="hidden md:block" />
              Connect with{' '}
              <motion.span
                className="inline-block text-[#6160AB] cursor-default"
                whileHover={{ scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                themselves
              </motion.span>.{' '}
              Connect with{' '}
              <motion.span
                className="inline-block text-[#F07B3C] cursor-default"
                whileHover={{ scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                others
              </motion.span>.{' '}
              Connect with{' '}
              <motion.span
                className="inline-block text-[#73C154] cursor-default"
                whileHover={{ scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                nature
              </motion.span>.
            </p>
          </motion.div>

          <div className="space-y-6 max-w-2xl mx-auto mt-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <p className="text-lg md:text-xl text-gray-300 font-light">
                Because this is what we do best.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 1.4 }}
            >
              <p className="text-lg md:text-xl text-gray-300 font-light">
                We know how to do it.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 2.0, type: "spring" }}
            >
               <p className="text-xl md:text-3xl font-bold text-white">
                And we are the <span className="text-[#F07B3C]">BEST</span> at it.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ManifestoSection
