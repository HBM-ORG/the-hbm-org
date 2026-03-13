import React from 'react'
import { motion } from 'framer-motion'

const ManifestoCard = ({ text, color, Icon, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.15 + 0.4 }}
      whileHover={{ y: -12 }}
      className="relative group h-full"
    >
      {/* Animated Glow behind the card */}
      <div 
        className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-br opacity-0 group-hover:opacity-70 blur-xl transition-all duration-500"
        style={{ backgroundImage: `linear-gradient(135deg, ${color}40, transparent, ${color}20)` }}
      />
      
      {/* The Card */}
      <div className="relative h-full p-8 md:p-12 rounded-[2.5rem] bg-white/80 backdrop-blur-xl border border-white/60 shadow-lg shadow-purple-900/5 flex flex-col items-center justify-center overflow-hidden transition-colors duration-300">
        
        {/* Subtle decorative circle in background */}
        <div 
            className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20 transition-transform duration-700 group-hover:scale-150"
            style={{ backgroundColor: color }}
        />
        
        {/* Icon Circle */}
        <div className="mb-6 relative z-10">
          <motion.div 
            className="w-24 h-24 rounded-full flex items-center justify-center shadow-inner border border-white/50"
            style={{ backgroundColor: `${color}10` }}
            whileHover={{ rotate: 10, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Icon 
                size={42} 
                style={{ color: color }}
                strokeWidth={1.5} 
            />
          </motion.div>
        </div>

        {/* Text Content */}
        <div className="text-center relative z-10">
          <p className="text-xs font-bold tracking-[0.25em] text-gray-400 mb-3 uppercase opacity-70 group-hover:opacity-100 transition-opacity">
            Connect with
          </p>
          <h3 
            className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-gray-900 to-gray-600 group-hover:to-gray-800 transition-all duration-300"
            style={{ backgroundImage: `linear-gradient(135deg, ${color}, ${color}dd)` }}
          >
            {text}
          </h3>
        </div>
      </div>
    </motion.div>
  )
}

export default ManifestoCard
