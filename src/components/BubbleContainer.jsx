import React from 'react'
import { motion } from 'framer-motion'

/**
 * BubbleContainer - A reusable container component with bubble styling
 * Consistently applies the "Bubble Design System" across the site.
 * 
 * Specs:
 * - Background: Cream (#FAF9F5) or White.
 * - Size: min-height: 100vh.
 * - Centering: Flexbox centering.
 * - Glow: Subtle purple inner-glow.
 */
export default function BubbleContainer({ 
  children, 
  bgColor = '#FAF9F5', // Default: Cream
  className = '',
  fullHeight = true, // Default to min-h-screen for backwards compatibility
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.6 }}
      className={`
        w-full 
        ${fullHeight ? 'min-h-screen' : 'min-h-0'} 
        flex flex-col items-center justify-center 
        relative 
        rounded-[60px] 
        overflow-hidden
        py-12 px-6 md:px-12
        my-4 mx-auto
        max-w-[95%] md:max-w-[98%]
        bg-white 
        shadow-[inset_0_0_80px_rgba(187,192,255,0.2),0_10px_30px_rgba(0,0,0,0.02)]
        border border-[rgba(111,110,179,0.15)]
        ${className}
      `}
      style={{ 
        backgroundColor: bgColor,
        // Ensure shadow is always applied unless overridden, but the class above handles it.
        // The inline style for bgColor allows easy prop override.
      }}
    >
      {children}
    </motion.div>
  )
}
