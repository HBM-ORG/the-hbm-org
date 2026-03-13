import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

export default function StatsSection() {
  const sectionRef = useRef(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const currentRef = sectionRef.current
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
        }
      },
      { threshold: 0.2 }
    )

    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [])

  const stats = [
    { 
      number: 10000, 
      suffix: '+', 
      label: { en: 'Conversations', he: 'שיחות' },
      icon: '💬',
      color: '#F07B3C'
    },
    { 
      number: 5000, 
      suffix: '+', 
      label: { en: 'Connections Made', he: 'חיבורים שנוצרו' },
      icon: '🤝',
      color: '#6160AB'
    },
    { 
      number: 8, 
      suffix: ' min', 
      label: { en: 'Average Session', he: 'משך ממוצע' },
      icon: '⏱️',
      color: '#73C154'
    },
    { 
      number: 95, 
      suffix: '%', 
      label: { en: 'Satisfaction Rate', he: 'שביעות רצון' },
      icon: '⭐',
      color: '#F07B3C'
    },
  ]

  return (
    <section 
      ref={sectionRef}
      className="section-padding bg-gradient-to-br from-[#6160AB]/5 via-white to-[#F07B3C]/5 relative overflow-hidden"
    >
      {/* Background decorative elements */}
      <motion.div
        className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-r from-[#6160AB]/10 to-[#F07B3C]/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-r from-[#73C154]/10 to-[#6160AB]/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-hbm-purple mb-4">
            The Impact We're Making
          </h2>
          <p className="text-lg text-hbm-gray max-w-2xl mx-auto">
            Real numbers from real connections happening every day
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <StatCard 
              key={index}
              stat={stat}
              index={index}
              isInView={isInView}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function StatCard({ stat, index, isInView }) {
  const [count, setCount] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    if (isInView && !hasAnimated) {
      setHasAnimated(true)
      const duration = 2000 // 2 seconds
      const steps = 60
      const increment = stat.number / steps
      const stepDuration = duration / steps

      let currentStep = 0
      const timer = setInterval(() => {
        currentStep++
        if (currentStep >= steps) {
          setCount(stat.number)
          clearInterval(timer)
        } else {
          setCount(Math.floor(increment * currentStep))
        }
      }, stepDuration)

      return () => clearInterval(timer)
    }
  }, [isInView, stat.number, hasAnimated])

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.1,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ 
        scale: 1.05,
        y: -10,
        transition: { duration: 0.2 }
      }}
      className="relative group"
    >
      {/* Card */}
      <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 relative overflow-hidden">
        {/* Gradient accent on hover */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
          style={{
            background: `linear-gradient(135deg, ${stat.color} 0%, transparent 100%)`
          }}
        />

        {/* Icon */}
        <motion.div 
          className="text-5xl mb-4 relative z-10"
          animate={{
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
            ease: "easeInOut"
          }}
        >
          {stat.icon}
        </motion.div>

        {/* Number */}
        <div className="relative z-10">
          <motion.div 
            className="text-5xl md:text-6xl font-bold mb-2"
            style={{ color: stat.color }}
          >
            {count.toLocaleString()}{stat.suffix}
          </motion.div>

          {/* Label */}
          <p className="text-hbm-gray font-medium text-lg">
            {stat.label.en}
          </p>
        </div>

        {/* Bottom accent line */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1"
          style={{ backgroundColor: stat.color }}
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
        />
      </div>
    </motion.div>
  )
}
