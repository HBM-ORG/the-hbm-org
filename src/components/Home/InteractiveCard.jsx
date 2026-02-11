import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'

export default function InteractiveCard({ card, index, lang, t }) {
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef(null)

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    
    const rotateXValue = ((y - centerY) / centerY) * -10
    const rotateYValue = ((x - centerX) / centerX) * 10
    
    setRotateX(rotateXValue)
    setRotateY(rotateYValue)
  }

  const handleMouseLeave = () => {
    setRotateX(0)
    setRotateY(0)
    setIsHovered(false)
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, x: 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15, duration: 0.5 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      className="relative rounded-2xl px-8 py-6 shadow-lg cursor-pointer overflow-hidden"
      style={{
        backgroundColor: card.bgColor,
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${isHovered ? 1.05 : 1})`,
        transition: 'transform 0.1s ease-out, box-shadow 0.3s ease',
        boxShadow: isHovered 
          ? '0 20px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.1)' 
          : '0 4px 6px rgba(0,0,0,0.1)',
      }}
    >
      {/* Shine effect overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isHovered
            ? `radial-gradient(circle at ${rotateY * 5 + 50}% ${rotateX * 5 + 50}%, rgba(255,255,255,0.3) 0%, transparent 60%)`
            : 'none',
          transition: 'background 0.1s ease-out',
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        <div className="flex flex-col gap-3 mb-3">
          <div>
            <h3 className="text-xl font-bold text-hbm-dark mb-1">
              {t(card.title, lang)}
            </h3>
            <p className="text-sm text-hbm-gray leading-relaxed">
              {t(card.text, lang)}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom gradient accent */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent"
        style={{
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      />
    </motion.div>
  )
}
